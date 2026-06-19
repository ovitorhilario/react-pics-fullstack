require('dotenv').config();
const express = require('express');
const cors = require('cors');
const compression = require('compression');
const morgan = require('morgan');
const sanitizer = require('perfect-express-sanitizer');
const path = require('path');
const logger = require('./src/config/logger');

// Inicialização do App
const app = express();

// 1. Logs de Requisições HTTP (Morgan)
app.use(morgan('dev'));

// 2. Otimização de Performance (Compression)
app.use(compression());

// 3. Parser de JSON e URL Encoded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 4. Configuração estrita de CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token']
}));

// 5. Sanitização Global contra Injeção SQL/NoSQL e XSS básico no payload
app.use(sanitizer.clean({
  xss: true,
  noSql: true,
  sql: true
}));

// Servir arquivos estáticos (se necessário)
app.use('/public', express.static(path.join(__dirname, 'public')));

// Inicializar Conexão do Banco de Dados
require('./src/config/database');

// 6. Rotas da Aplicação
const authRoutes = require('./src/routes/authRoutes');
const pictureRoutes = require('./src/routes/pictureRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/pictures', pictureRoutes);

// Rota padrão/Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Middleware de Tratamento de Erros Global
app.use((err, req, res, next) => {
  logger.error(`Erro não tratado: ${err.message}\nStack: ${err.stack}`);
  res.status(500).json({ error: 'Ocorreu um erro interno no servidor.' });
});

// 7. Inicialização Condicional HTTPS / HTTP
const PORT = process.env.PORT || 3001;
const useHttps = process.env.USE_HTTPS === 'true';

if (useHttps) {
  const https = require('https');
  const fs = require('fs');
  try {
    const options = {
      key: fs.readFileSync(process.env.SSL_KEY_PATH || 'key.pem'),
      cert: fs.readFileSync(process.env.SSL_CERT_PATH || 'cert.pem')
    };
    https.createServer(options, app).listen(PORT, () => {
      logger.info(`Servidor Express rodando com HTTPS na porta ${PORT}`);
    });
  } catch (error) {
    logger.error(`Erro ao carregar chaves SSL para HTTPS: ${error.message}. Iniciando em HTTP como fallback.`);
    app.listen(PORT, () => {
      logger.info(`Servidor Express rodando com HTTP na porta ${PORT}`);
    });
  }
} else {
  app.listen(PORT, () => {
    logger.info(`Servidor Express rodando com HTTP na porta ${PORT}`);
  });
}
