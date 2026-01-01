import { Router, Request, Response } from 'express';
import { partidoRepository } from '../repositories';
import { asyncHandler, ValidationError, NotFoundError } from '../middleware';
import { partidosCache } from '../utils/cache';

const router = Router();

// GET /api/partidos
router.get('/', asyncHandler(async (_req: Request, res: Response) => {
  const cacheKey = 'partidos:all';
  const cached = partidosCache.get(cacheKey) as { data: ReturnType<typeof partidoRepository.findAll>; total: number } | undefined;

  if (cached) {
    res.json(cached);
    return;
  }

  const partidos = partidoRepository.findAll();
  const result = {
    data: partidos,
    total: partidos.length,
  };

  partidosCache.set(cacheKey, result);
  res.json(result);
}));

// GET /api/partidos/:id
router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const idNum = Number(id);

  // Validar que o ID e um numero inteiro valido
  if (isNaN(idNum) || !Number.isInteger(idNum) || idNum <= 0) {
    throw new ValidationError('ID de partido invalido');
  }

  const partido = partidoRepository.findById(idNum);

  if (!partido) {
    throw new NotFoundError('Partido');
  }

  res.json({ data: partido });
}));

export default router;

