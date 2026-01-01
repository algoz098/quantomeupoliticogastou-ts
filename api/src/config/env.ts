import { config } from 'dotenv';
import { z } from 'zod';

config();

const envSchema = z.object({
  PORT: z.string().default('3000').transform(Number),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_PATH: z.string().default('./data/politicos.db'),
  // CORS: em desenvolvimento permite qualquer origem, em producao deve ser configurado
  CORS_ORIGIN: z.string().optional(),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).optional(),
  CAMARA_API_URL: z.string().default('https://dadosabertos.camara.leg.br/api/v2'),
  CAMARA_COTAS_URL: z.string().default('https://www.camara.leg.br/cotas'),
  SENADO_API_URL: z.string().default('https://adm.senado.gov.br/adm-dadosabertos/api/v1'),
  SENADO_LEGIS_URL: z.string().default('https://legis.senado.leg.br/dadosabertos'),
  // Rate limit configuravel
  RATE_LIMIT_WINDOW_MS: z.string().default('60000').transform(Number), // 1 minuto
  RATE_LIMIT_MAX_REQUESTS: z.string().default('100').transform(Number), // 100 por minuto
  RATE_LIMIT_SEARCH_MAX: z.string().default('30').transform(Number), // 30 buscas por minuto
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Erro nas variaveis de ambiente:', parsed.error.format());
  process.exit(1);
}

// Define CORS_ORIGIN default baseado no ambiente
const corsOrigin = parsed.data.CORS_ORIGIN ?? (parsed.data.NODE_ENV === 'production' ? '' : '*');

export const env = {
  ...parsed.data,
  CORS_ORIGIN: corsOrigin,
};

