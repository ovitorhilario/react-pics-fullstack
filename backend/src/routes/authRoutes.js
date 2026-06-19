const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const Tokens = require('csrf');
const rateLimit = require('express-rate-limit');
const userModel = require('../models/userModel');
const cache = require('../config/cache');
const logger = require('../config/logger');

const csrfTokens = new Tokens();

// Middleware de rate limit para tentativas de login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // Limite de 5 requisições por IP
  message: { error: 'Muitas tentativas de login. Tente novamente mais tarde.' },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * POST /api/auth/login
 * Autentica o usuário e gera o token de sessão e o token CSRF.
 */
router.post('/login', loginLimiter, async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Usuário e senha são obrigatórios.' });
  }

  try {
    const user = await userModel.findByUsername(username);

    if (!user) {
      logger.warn(`Tentativa de login falha: usuário '${username}' não encontrado. IP: ${req.ip}`);
      return res.status(401).json({ error: 'Usuário ou senha incorretos.' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      logger.warn(`Tentativa de login falha: senha incorreta para o usuário '${username}'. IP: ${req.ip}`);
      return res.status(401).json({ error: 'Usuário ou senha incorretos.' });
    }

    // Gerar token de sessão e segredo CSRF único
    const sessionToken = crypto.randomBytes(32).toString('hex');
    const csrfSecret = csrfTokens.secretSync();
    const csrfToken = csrfTokens.create(csrfSecret);

    // Salvar sessão no cache manual por 1 hora
    cache.set(`session:${sessionToken}`, {
      userId: user.id,
      username: user.username,
      csrfSecret: csrfSecret
    }, 3600);

    logger.info(`Usuário '${username}' logado com sucesso. IP: ${req.ip}`);

    res.json({
      token: sessionToken,
      csrfToken,
      user: {
        id: user.id,
        username: user.username
      }
    });
  } catch (error) {
    logger.error(`Erro interno durante a autenticação: ${error.message}`);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

/**
 * GET /api/auth/me
 * Valida a sessão ativa e retorna dados do usuário logado junto com um token CSRF novo.
 */
router.get('/me', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Sessão inválida ou expirada.' });
  }

  const token = authHeader.split(' ')[1];
  const session = cache.get(`session:${token}`);

  if (!session) {
    return res.status(401).json({ error: 'Sessão inválida ou expirada.' });
  }

  const csrfToken = csrfTokens.create(session.csrfSecret);

  res.json({
    user: {
      id: session.userId,
      username: session.username
    },
    csrfToken
  });
});

module.exports = router;
