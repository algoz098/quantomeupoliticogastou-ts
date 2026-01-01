import { getDatabase } from '../config/database';
import type { Partido } from '../models/types';
import { partidosCache } from '../utils/cache';

const CACHE_KEY_ALL = 'partidos:all';

export class PartidoRepository {
  findAll(): Partido[] {
    return partidosCache.getOrSet(CACHE_KEY_ALL, () => {
      const db = getDatabase();
      return db.prepare('SELECT * FROM partidos ORDER BY sigla').all() as Partido[];
    }, 600) as Partido[]; // Cache por 10 minutos
  }

  findById(id: number): Partido | null {
    const db = getDatabase();
    const result = db.prepare('SELECT * FROM partidos WHERE id = ?').get(id);
    return (result as Partido) || null;
  }

  findBySigla(sigla: string): Partido | null {
    const db = getDatabase();
    const result = db.prepare('SELECT * FROM partidos WHERE sigla = ?').get(sigla);
    return (result as Partido) || null;
  }

  upsert(sigla: string, nome?: string): number {
    const db = getDatabase();

    const sql = `
      INSERT INTO partidos (sigla, nome)
      VALUES (?, ?)
      ON CONFLICT(sigla) DO UPDATE SET
        nome = COALESCE(excluded.nome, partidos.nome),
        updated_at = datetime('now')
      RETURNING id
    `;

    const result = db.prepare(sql).get(sigla, nome || null) as { id: number };
    // Invalidar cache ao inserir/atualizar
    partidosCache.delete(CACHE_KEY_ALL);
    return result.id;
  }

  count(): number {
    const db = getDatabase();
    const result = db.prepare('SELECT COUNT(*) as total FROM partidos').get() as { total: number };
    return result.total;
  }
}

