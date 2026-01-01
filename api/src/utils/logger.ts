import { env } from '../config/env';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

/**
 * Logger estruturado simples
 * Em producao, pode ser substituido por winston, pino, etc.
 */
export class Logger {
  private context: string;
  private minLevel: number;

  constructor(context: string) {
    this.context = context;
    // Em producao, log apenas warn e error; em dev, log tudo
    const configLevel = (env.LOG_LEVEL || (env.NODE_ENV === 'production' ? 'warn' : 'debug')) as LogLevel;
    this.minLevel = LOG_LEVELS[configLevel] ?? LOG_LEVELS.debug;
  }

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= this.minLevel;
  }

  /**
   * Serializa objetos para JSON, tratando Error corretamente
   */
  private serializeMeta(meta: unknown): string {
    if (meta instanceof Error) {
      const errorObj: Record<string, unknown> = {
        name: meta.name,
        message: meta.message,
        stack: meta.stack,
      };
      // Copiar propriedades adicionais do erro
      for (const key of Object.keys(meta)) {
        if (!(key in errorObj)) {
          errorObj[key] = (meta as unknown as Record<string, unknown>)[key];
        }
      }
      return JSON.stringify(errorObj);
    }
    return JSON.stringify(meta, (_key, value: unknown) => {
      // Tratar Errors aninhados em objetos
      if (value instanceof Error) {
        return {
          name: value.name,
          message: value.message,
          stack: value.stack,
        };
      }
      return value;
    });
  }

  private formatMessage(level: LogLevel, message: string, meta?: unknown): string {
    const timestamp = new Date().toISOString();
    const base = `[${timestamp}] [${level.toUpperCase()}] [${this.context}] ${message}`;
    if (meta !== undefined) {
      return `${base} ${this.serializeMeta(meta)}`;
    }
    return base;
  }

  debug(message: string, meta?: unknown): void {
    if (this.shouldLog('debug')) {
      console.debug(this.formatMessage('debug', message, meta));
    }
  }

  info(message: string, meta?: unknown): void {
    if (this.shouldLog('info')) {
      console.info(this.formatMessage('info', message, meta));
    }
  }

  warn(message: string, meta?: unknown): void {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message, meta));
    }
  }

  error(message: string, meta?: unknown): void {
    if (this.shouldLog('error')) {
      console.error(this.formatMessage('error', message, meta));
    }
  }
}

// Logger global para uso geral
export const logger = new Logger('App');

