import { Router, Request, Response } from 'express';
import { despesaRepository, parlamentarRepository } from '../repositories';
import { parsePositiveIntRequired, parseAno, parseEnum, parseUF } from '../utils/validation';
import { asyncHandler } from '../middleware';

const router = Router();
const CASAS = ['camara', 'senado'] as const;

// GET /api/despesas
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const anoNum = parseAno(req.query.ano, new Date().getFullYear()) ?? new Date().getFullYear();
  const limitNum = parsePositiveIntRequired(req.query.limit, 100);
  const offsetNum = parsePositiveIntRequired(req.query.offset, 0);

  const result = despesaRepository.findByAno(anoNum, limitNum, offsetNum);

  res.json({
    data: result.data,
    total: result.total,
    ano: anoNum,
  });
}));

// GET /api/despesas/categorias
router.get('/categorias', asyncHandler(async (req: Request, res: Response) => {
  const anoNum = parseAno(req.query.ano, new Date().getFullYear()) ?? new Date().getFullYear();
  const casa = parseEnum(req.query.casa, CASAS);

  const categorias = despesaRepository.getGastosPorCategoria(anoNum, casa);

  res.json({
    data: categorias,
    ano: anoNum,
  });
}));

// GET /api/despesas/ranking
router.get('/ranking', asyncHandler(async (req: Request, res: Response) => {
  const anoNum = parseAno(req.query.ano, new Date().getFullYear()) ?? new Date().getFullYear();
  const casa = parseEnum(req.query.casa, CASAS);
  const uf = parseUF(req.query.uf);
  const limitNum = parsePositiveIntRequired(req.query.limit, 20);
  const ordem = parseEnum(req.query.ordem, ['ASC', 'DESC'] as const, 'DESC');

  const ranking = despesaRepository.getRanking(anoNum, {
    casa,
    uf,
    limit: limitNum,
    ordem,
  });

  res.json({
    data: ranking,
    ano: anoNum,
  });
}));

// GET /api/despesas/stats
router.get('/stats', asyncHandler(async (req: Request, res: Response) => {
  const casa = parseEnum(req.query.casa, CASAS);
  const stats = despesaRepository.getEstatisticas(casa);
  const totalParlamentares = parlamentarRepository.count(casa);

  res.json({
    total_parlamentares: totalParlamentares,
    total_despesas: stats.total_despesas,
    valor_total: stats.valor_total,
    anos_disponiveis: stats.anos_disponiveis,
  });
}));

// GET /api/despesas/mensal
router.get('/mensal', asyncHandler(async (req: Request, res: Response) => {
  const anoNum = parseAno(req.query.ano, new Date().getFullYear()) ?? new Date().getFullYear();
  const casa = parseEnum(req.query.casa, CASAS);

  const gastosMensais = despesaRepository.getGastosMensais(anoNum, casa);

  res.json({
    data: gastosMensais,
    ano: anoNum,
  });
}));

export default router;

