import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema, ZodError } from 'zod';
import { ValidationError } from './error.middleware';

/**
 * Formatar erros do Zod para mensagem legivel
 */
function formatZodError(error: ZodError): string {
  return error.issues
    .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
    .join('; ');
}

/**
 * Middleware que valida query params usando schema zod
 */
export function validateQuery<T extends ZodSchema>(schema: T) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      return next(new ValidationError(formatZodError(result.error)));
    }
    // Substituir query pelos valores parseados/transformados
    req.query = result.data as typeof req.query;
    next();
  };
}

/**
 * Middleware que valida params de rota usando schema zod
 */
export function validateParams<T extends ZodSchema>(schema: T) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.params);
    if (!result.success) {
      return next(new ValidationError(formatZodError(result.error)));
    }
    req.params = result.data as typeof req.params;
    next();
  };
}

// Schemas reutilizaveis
export const paginationSchema = z.object({
  page: z.string().optional().transform((v) => (v ? Math.max(1, parseInt(v, 10) || 1) : 1)),
  limit: z.string().optional().transform((v) => {
    const num = v ? parseInt(v, 10) : 20;
    return Math.min(Math.max(1, num || 20), 100); // Entre 1 e 100
  }),
});

export const casaSchema = z.enum(['camara', 'senado']).optional();

export const ufSchema = z.string().length(2).toUpperCase().optional();

export const anoSchema = z.string().optional().transform((v) => {
  if (!v) return undefined;
  const num = parseInt(v, 10);
  return isNaN(num) ? undefined : num;
});

