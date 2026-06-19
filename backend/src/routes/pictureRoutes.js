const express = require('express');
const router = express.Router();
const Tokens = require('csrf');
const xss = require('xss');
const pictureModel = require('../models/pictureModel');
const cache = require('../config/cache');
const logger = require('../config/logger');

const csrfTokens = new Tokens();

/**
 * Middleware para exigir autenticação baseada no header Authorization.
 */
const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Não autorizado. Faça login primeiro.' });
  }

  const token = authHeader.split(' ')[1];
  const session = cache.get(`session:${token}`);

  if (!session) {
    return res.status(401).json({ error: 'Sessão inválida ou expirada. Faça login novamente.' });
  }

  req.user = session;
  next();
};

/**
 * Middleware para validar o token CSRF enviado pelo frontend.
 */
const validateCsrf = (req, res, next) => {
  const csrfToken = req.headers['x-csrf-token'];
  if (!csrfToken) {
    logger.warn(`Tentativa de POST bloqueada: Token CSRF ausente. Usuário: ${req.user.username}`);
    return res.status(403).json({ error: 'Token CSRF ausente ou inválido.' });
  }

  const secret = req.user.csrfSecret;
  if (!csrfTokens.verify(secret, csrfToken)) {
    logger.warn(`Tentativa de POST bloqueada: Token CSRF inválido. Usuário: ${req.user.username}`);
    return res.status(403).json({ error: 'Token CSRF ausente ou inválido.' });
  }

  next();
};

/**
 * GET /api/pictures
 * Retorna as imagens cadastradas, suporta paginação e busca,
 * e cacheia os resultados em memória usando a classe SimpleCache.
 */
router.get('/', async (req, res) => {
  const search = req.query.search || '';
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 12;

  // Filtros de renderização de imagem
  const width = parseInt(req.query.width, 10) || 300;
  const height = parseInt(req.query.height, 10) || 300;
  const blur = parseInt(req.query.blur, 10) || 0;
  const grayscale = req.query.grayscale === 'true';

  // Gerar chave de cache baseada em todos os query params
  const cacheKey = `pictures:${JSON.stringify(req.query)}`;
  const cached = cache.get(cacheKey);

  if (cached) {
    logger.info(`Busca retornada do cache: '${search}' (Página ${page}, Limite ${limit}, Filtros: W:${width} H:${height} B:${blur} G:${grayscale})`);
    return res.json(cached);
  }

  try {
    const offset = (page - 1) * limit;
    const total = await pictureModel.countAll({ search });
    const rows = await pictureModel.findAll({ search, limit, offset });

    const formattedImages = rows.map(img => {
      let displayUrl = img.url;

      // Se for uma imagem vinda do picsum, geramos a URL dinâmica com os filtros
      const picsumMatch = img.url.match(/picsum\.photos\/id\/(\d+)/);
      if (picsumMatch) {
        const picsumId = picsumMatch[1];
        displayUrl = `https://picsum.photos/id/${picsumId}/${width}/${height}`;
        
        const params = [];
        if (grayscale) params.push('grayscale');
        if (blur > 0) params.push(`blur=${blur}`);
        
        if (params.length > 0) {
          displayUrl += `?${params.join('&')}`;
        }
      }

      return {
        id: img.id,
        author: img.author,
        title: img.title,
        url: img.url,
        width: img.width,
        height: img.height,
        displayUrl,
        renderWidth: width,
        renderHeight: height,
        aspectRatio: width > 0 && height > 0 ? width / height : 1
      };
    });

    const result = {
      images: formattedImages,
      total,
      page,
      limit
    };

    // Cacheia o resultado por 60 segundos
    cache.set(cacheKey, result, 60);

    logger.info(`Busca realizada no banco de dados: '${search}' (Página ${page}, Limite ${limit})`);
    res.json(result);
  } catch (error) {
    logger.error(`Erro ao buscar imagens no SQLite: ${error.message}`);
    res.status(500).json({ error: 'Erro ao carregar as imagens no momento.' });
  }
});

/**
 * POST /api/pictures
 * Insere uma nova imagem no banco de dados.
 * Protegido contra CSRF e higienizado com XSS.
 */
router.post('/', requireAuth, validateCsrf, async (req, res) => {
  const { title, url, width, height } = req.body;

  if (!title || !url) {
    return res.status(400).json({ error: 'Título e URL são obrigatórios.' });
  }

  // Sanitização de entradas contra XSS
  const cleanTitle = xss(title.trim());
  const cleanUrl = xss(url.trim());
  const cleanWidth = parseInt(width, 10) || 300;
  const cleanHeight = parseInt(height, 10) || 300;

  if (cleanTitle === '' || cleanUrl === '') {
    return res.status(400).json({ error: 'Título e URL não podem ser compostos apenas por espaços.' });
  }

  try {
    const newPic = await pictureModel.create({
      title: cleanTitle,
      url: cleanUrl,
      width: cleanWidth,
      height: cleanHeight,
      user_id: req.user.userId
    });

    // Invalida os caches de busca pois um novo registro foi criado
    cache.clearByPrefix('pictures:');

    logger.info(`Nova postagem inserida por '${req.user.username}': '${cleanTitle}' (URL: ${cleanUrl})`);

    res.status(201).json({
      ...newPic,
      author: req.user.username
    });
  } catch (error) {
    logger.error(`Erro ao inserir nova imagem no SQLite: ${error.message}`);
    res.status(500).json({ error: 'Erro ao salvar a imagem no banco de dados.' });
  }
});

module.exports = router;
