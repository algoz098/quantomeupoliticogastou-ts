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
  
  // Ler e executar o schema
  const schemaPath = path.join(__dirname, '../../../database/schema.sql');
  
  if (fs.existsSync(schemaPath)) {
    const schema = fs.readFileSync(schemaPath, 'utf-8');
    database.exec(schema);
    logger.info('Schema do banco de dados inicializado');
  } else {
    logger.warn('Arquivo schema.sql nao encontrado em:', { path: schemaPath });
  }
}

