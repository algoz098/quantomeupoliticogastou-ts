import Database from 'better-sqlite3';
import { env } from './env';
import fs from 'fs';
import path from 'path';
import { logger } from '../utils/logger';

let db: Database.Database | null = null;

export function getDatabase(): Database.Database {
  if (!db) {
    // Garantir que o diretorio existe
    const dbDir = path.dirname(env.DATABASE_PATH);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    db = new Database(env.DATABASE_PATH);
    
    // Configuracoes de performance
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    db.pragma('busy_timeout = 5000');
  }
  
  return db;
}

export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
  }
}

export function initializeDatabase(): void {
  const database = getDatabase();

  // Possiveis locais do schema.sql
  const possiblePaths = [
    // Docker: montado em /app/database
    '/app/database/schema.sql',
    // Docker: variavel de ambiente customizada
    process.env.SCHEMA_PATH,
    // Desenvolvimento: relativo ao codigo fonte
    path.join(__dirname, '../../../database/schema.sql'),
    // Desenvolvimento: relativo ao dist
    path.join(__dirname, '../../database/schema.sql'),
    // Raiz do projeto
    path.join(process.cwd(), 'database/schema.sql'),
  ].filter(Boolean) as string[];

  let schemaPath: string | null = null;
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      schemaPath = p;
      break;
    }
  }

  if (schemaPath) {
    const schema = fs.readFileSync(schemaPath, 'utf-8');
    database.exec(schema);
    logger.info('Schema do banco de dados inicializado', { path: schemaPath });
  } else {
    logger.warn('Arquivo schema.sql nao encontrado. Locais verificados:', { paths: possiblePaths });
  }
}

