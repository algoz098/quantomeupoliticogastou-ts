import app from './app';
import { env } from './config/env';
import { initializeDatabase, closeDatabase } from './config/database';
import { logger } from './utils/logger';
import { destroyAllCaches } from './utils/cache';

// Inicializar banco de dados
initializeDatabase();

// Iniciar servidor
const server = app.listen(env.PORT, () => {
  logger.info(`Servidor rodando em http://localhost:${env.PORT}`);
  logger.info(`Ambiente: ${env.NODE_ENV}`);
});

/**
 * Funcao de cleanup para graceful shutdown
 */
function gracefulShutdown(signal: string): void {
  logger.info(`${signal} recebido. Encerrando servidor...`);
  server.close(() => {
    destroyAllCaches();
    closeDatabase();
    logger.info('Servidor encerrado.');
    process.exit(0);
  });
}

// Graceful shutdown
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

