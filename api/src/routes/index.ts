import { Router } from 'express';
import parlamentaresRoutes from './parlamentares.routes';
import despesasRoutes from './despesas.routes';
import partidosRoutes from './partidos.routes';
import { getDatabase } from '../config/database';
import { asyncHandler } from '../middleware';

const router = Router();

router.use('/parlamentares', parlamentaresRoutes);
router.use('/despesas', despesasRoutes);
router.use('/partidos', partidosRoutes);

// Health check
router.get('/health', asyncHandler(async (_req, res) => {
  const db = getDatabase();
  const result = db.prepare('SELECT 1 as ok').get() as { ok: number };
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: result.ok === 1 ? 'connected' : 'error',
  });
}));

export default router;

