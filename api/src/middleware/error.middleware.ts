import { Request, Response, NextFunction } from 'express';
import { Logger } from '../utils/logger';

const logger = new Logger('ErrorMiddleware');

/**
 * Erro de aplicacao com status HTTP
 */
export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/**
 * Erro de recurso nao encontrado
 */
export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(404, `${resource} nao encontrado`);
  }
}

/**
 * Erro de validacao
 */
export class ValidationError extends AppError {
  constructor(message: string) {
    super(400, message);
  }
}

/**
 * Wrapper para handlers async que captura erros
 */
export function asyncHandler<T>(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<T>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Middleware de erro centralizado
 * Deve ser registrado por ultimo na cadeia de middlewares
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Se for erro operacional (esperado)
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  // Erro inesperado - logar e retornar 500
  logger.error('Erro inesperado:', err);
  res.status(500).json({ error: 'Erro interno do servidor' });
}

