import { Router, Request, Response } from 'express';
import { parlamentarRepository, despesaRepository } from '../repositories';
import { parseAno, parseMes, parseEnum, parsePagination, parseUF, sanitizeString, sanitizeCategoria, validateParlamentarId, parsePositiveInt } from '../utils/validation';
import { asyncHandler, ValidationError, NotFoundError } from '../middleware';

const router = Router();
const CASAS = ['camara', 'senado'] as const;

/**
 * Wrapper para validateParlamentarId que lanca ValidationError
 */
function validateId(id: string): string {
  try {
    return validateParlamentarId(id);
  } catch {
    throw new ValidationError('ID de parlamentar invalido');
  }
}

// GET /api/parlamentares
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, offset } = parsePagination(req.query);
  const casa = parseEnum(req.query.casa, CASAS);
  const uf = parseUF(req.query.uf);

  const result = parlamentarRepository.findAll({
    casa,
    uf,
    partido_id: parsePositiveInt(req.query.partido_id),
    partido: sanitizeString(req.query.partido, 20),
    nome: sanitizeString(req.query.nome, 100),
    limit,
    offset,
  });

  res.json({
    data: result.data,
    total: result.total,
    page,
    limit,
  });
}));

// GET /api/parlamentares/:id/categorias
router.get('/:id/categorias', asyncHandler(async (req: Request, res: Response) => {
  const id = validateId(req.params.id);
  const ano = parseAno(req.query.ano);

  const parlamentar = parlamentarRepository.findById(id);
  if (!parlamentar) {
    throw new NotFoundError('Parlamentar');
  }

  const categorias = parlamentarRepository.getGastosPorCategoria(id, ano);

  res.json({
    data: categorias,
    total: categorias.length,
  });
}));

// GET /api/parlamentares/:id/mensal
router.get('/:id/mensal', asyncHandler(async (req: Request, res: Response) => {
  const id = validateId(req.params.id);
  const ano = parseAno(req.query.ano);

  const parlamentar = parlamentarRepository.findById(id);
  if (!parlamentar) {
    throw new NotFoundError('Parlamentar');
  }

  const gastosMensais = parlamentarRepository.getGastosMensais(id, ano);

  res.json({
    data: gastosMensais,
    total: gastosMensais.length,
  });
}));

// GET /api/parlamentares/:id/despesas
router.get('/:id/despesas', asyncHandler(async (req: Request, res: Response) => {
  const id = validateId(req.params.id);
  const { page, limit, offset } = parsePagination(req.query, { page: 1, limit: 50 });
  const ano = parseAno(req.query.ano);
  const mes = parseMes(req.query.mes);

  const parlamentar = parlamentarRepository.findById(id);
  if (!parlamentar) {
    throw new NotFoundError('Parlamentar');
  }

  const result = despesaRepository.findByParlamentar(id, {
    ano,
    mes,
    categoria: sanitizeCategoria(req.query.categoria),
    limit,
    offset,
  });

  res.json({
    data: result.data,
    total: result.total,
    page,
    limit,
  });
}));

// GET /api/parlamentares/:id (deve ficar por ultimo pois captura qualquer :id)
router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const id = validateId(req.params.id);
  const parlamentar = parlamentarRepository.findByIdDetalhado(id);

  if (!parlamentar) {
    throw new NotFoundError('Parlamentar');
  }

  res.json({ data: parlamentar });
}));

export default router;

