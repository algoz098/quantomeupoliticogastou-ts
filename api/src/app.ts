import express from 'express';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import routes from './routes';
import { env } from './config/env';
import { errorHandler } from './middleware/error.middleware';

const app = express();

// Compressao de respostas (gzip)
app.use(compression());

// Rate limiting geral - configuravel via variaveis de ambiente
const generalLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_REQUESTS,
  message: { error: 'Muitas requisicoes. Tente novamente em alguns minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting mais restritivo para buscas (evitar abuso)
const searchLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_SEARCH_MAX,
  message: { error: 'Muitas buscas. Tente novamente em alguns minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting especifico para health check (evitar DDoS via health endpoint)
const healthLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 30, // 30 requisicoes por minuto
  message: { error: 'Muitas requisicoes ao health check.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting mais permissivo para partidos (dados cacheados)
const cachedDataLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_REQUESTS * 2, // 2x mais permissivo
  message: { error: 'Muitas requisicoes. Tente novamente em alguns minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api', generalLimiter);
// Aplicar rate limit mais restritivo para endpoints de busca/ranking
app.use('/api/parlamentares', searchLimiter);
app.use('/api/despesas/ranking', searchLimiter);
// Rate limit especifico para health check
app.use('/api/health', healthLimiter);
// Rate limit mais permissivo para dados cacheados
app.use('/api/partidos', cachedDataLimiter);

// Middlewares
app.use(express.json());

// CORS configuravel via variavel de ambiente
// Em producao sem CORS_ORIGIN configurado, nenhuma origem externa e permitida
app.use((req, res, next) => {
  const allowedOrigin = env.CORS_ORIGIN;
  const origin = req.headers.origin;

  // Se CORS_ORIGIN nao estiver configurado ou vazio, nao permite CORS
  if (!allowedOrigin) {
    // Em producao, bloquear requisicoes cross-origin
    if (origin && env.NODE_ENV === 'production') {
      res.status(403).json({ error: 'Origem nao permitida' });
      return;
    }
  } else if (allowedOrigin === '*') {
    // Se CORS_ORIGIN for '*', permite qualquer origem (apenas para desenvolvimento)
    res.header('Access-Control-Allow-Origin', '*');
  } else if (origin) {
    // Valida se a origem esta na lista (separada por virgula)
    const allowedOrigins = allowedOrigin.split(',').map(o => o.trim().toLowerCase());
    if (allowedOrigins.includes(origin.toLowerCase())) {
      res.header('Access-Control-Allow-Origin', origin);
      res.header('Vary', 'Origin');
    }
  }

  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }

  next();
});

// Rotas da API
app.use('/api', routes);

// Rota raiz
app.get('/', (_req, res) => {
  res.json({
    nome: 'Quanto Meu Politico Gastou API',
    versao: '1.0.0',
    endpoints: {
      health: '/api/health',
      parlamentares: '/api/parlamentares',
      despesas: '/api/despesas',
      ranking: '/api/despesas/ranking',
      categorias: '/api/despesas/categorias',
      partidos: '/api/partidos',
    },
  });
});

// Middleware de erro centralizado (deve ser o ultimo)
app.use(errorHandler);

export default app;

