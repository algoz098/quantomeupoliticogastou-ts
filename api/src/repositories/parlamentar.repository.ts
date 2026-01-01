import { getDatabase } from '../config/database';
import type { Parlamentar, ParlamentarDTO, ParlamentarDetalhadoDTO, GastosPorCategoriaDTO, GastoMensalDTO, Casa } from '../models/types';
import { escapeLikePattern, removeSensitiveFields } from '../utils/validation';
import { parlamentarStatsCache } from '../utils/cache';

export class ParlamentarRepository {
  findAll(filters?: { casa?: Casa; uf?: string; partido_id?: number; partido?: string; nome?: string; limit?: number; offset?: number }): { data: ParlamentarDTO[]; total: number } {
    const db = getDatabase();

    let whereSql = ' WHERE 1=1';
    const whereParams: (string | number)[] = [];

    if (filters?.nome) {
      whereSql += " AND p.nome LIKE ? ESCAPE '\\'";
      whereParams.push(`%${escapeLikePattern(filters.nome)}%`);
    }
    if (filters?.casa) {
      whereSql += ' AND p.casa = ?';
      whereParams.push(filters.casa);
    }
    if (filters?.uf) {
      whereSql += ' AND p.uf = ?';
      whereParams.push(filters.uf);
    }
    if (filters?.partido_id) {
      whereSql += ' AND p.partido_id = ?';
      whereParams.push(filters.partido_id);
    }
    if (filters?.partido) {
      whereSql += ' AND pa.sigla = ?';
      whereParams.push(filters.partido);
    }

    // Usar CTE para contar e paginar em uma unica passada
    const limit = filters?.limit ?? 1000;
    const offset = filters?.offset ?? 0;

    const sql = `
      WITH filtered AS (
        SELECT
          p.id, p.nome, p.casa, p.uf, p.foto_url,
          pa.sigla as partido
        FROM parlamentares p
        LEFT JOIN partidos pa ON pa.id = p.partido_id
        ${whereSql}
      ),
      counted AS (
        SELECT COUNT(*) as total FROM filtered
      )
      SELECT f.*, c.total
      FROM filtered f, counted c
      ORDER BY f.nome
      LIMIT ? OFFSET ?
    `;

    const results = db.prepare(sql).all(...whereParams, limit, offset) as (ParlamentarDTO & { total: number })[];
    const total = results.length > 0 ? results[0].total : 0;
    const data = results.map(({ total: _total, ...rest }) => rest);

    return { data, total };
  }

  findById(id: string): Omit<Parlamentar, 'cpf'> | null {
    const db = getDatabase();
    const result = db.prepare('SELECT * FROM parlamentares WHERE id = ?').get(id) as Parlamentar | undefined;
    if (!result) return null;
    // Remove CPF para nao expor dados sensiveis
    return removeSensitiveFields(result, ['cpf']);
  }

  findByIdDetalhado(id: string): ParlamentarDetalhadoDTO | null {
    const cacheKey = `parlamentar:detalhado:${id}`;

    // Cache de 2 minutos para detalhes do parlamentar
    const cached = parlamentarStatsCache.get(cacheKey) as ParlamentarDetalhadoDTO | null | undefined;
    if (cached !== undefined) {
      return cached;
    }

    const db = getDatabase();

    // Otimizado: calcula stats apenas para o parlamentar especifico
    const sql = `
      SELECT
        p.id, p.nome, p.nome_civil, p.casa, p.uf, p.foto_url,
        p.email, p.sexo, p.data_nascimento,
        pa.sigla as partido,
        COALESCE((SELECT COUNT(*) FROM despesas WHERE parlamentar_id = p.id), 0) as total_despesas,
        COALESCE((SELECT SUM(valor_centavos) / 100.0 FROM despesas WHERE parlamentar_id = p.id), 0) as total_gasto
      FROM parlamentares p
      LEFT JOIN partidos pa ON pa.id = p.partido_id
      WHERE p.id = ?
    `;

    const result = db.prepare(sql).get(id);
    const parlamentar = (result as ParlamentarDetalhadoDTO) || null;

    parlamentarStatsCache.set(cacheKey, parlamentar, 120);
    return parlamentar;
  }

  getGastosPorCategoria(parlamentarId: string, ano?: number): GastosPorCategoriaDTO[] {
    const cacheKey = `categorias:${parlamentarId}:${ano || 'all'}`;

    return parlamentarStatsCache.getOrSet(cacheKey, () => {
      const db = getDatabase();

      let sql = `
        SELECT
          categoria,
          SUM(valor_centavos) / 100.0 as total,
          COUNT(*) as quantidade
        FROM despesas
        WHERE parlamentar_id = ?
      `;
      const params: (string | number)[] = [parlamentarId];

      if (ano) {
        sql += ' AND ano = ?';
        params.push(ano);
      }

      sql += ' GROUP BY categoria ORDER BY total DESC';

      return db.prepare(sql).all(...params) as GastosPorCategoriaDTO[];
    }, 120) as GastosPorCategoriaDTO[];
  }

  getGastosMensais(parlamentarId: string, ano?: number): GastoMensalDTO[] {
    const cacheKey = `gastosMensais:${parlamentarId}:${ano || 'all'}`;

    return parlamentarStatsCache.getOrSet(cacheKey, () => {
      const db = getDatabase();

      let sql = `
        SELECT
          ano,
          mes,
          SUM(valor_centavos) / 100.0 as total,
          COUNT(*) as quantidade
        FROM despesas
        WHERE parlamentar_id = ?
      `;
      const params: (string | number)[] = [parlamentarId];

      if (ano) {
        sql += ' AND ano = ?';
        params.push(ano);
      }

      sql += ' GROUP BY ano, mes ORDER BY ano DESC, mes DESC';

      return db.prepare(sql).all(...params) as GastoMensalDTO[];
    }, 120) as GastoMensalDTO[];
  }

  findByIdExterno(casa: Casa, idExterno: number): Parlamentar | null {
    const db = getDatabase();
    const result = db
      .prepare('SELECT * FROM parlamentares WHERE casa = ? AND id_externo = ?')
      .get(casa, idExterno);
    return (result as Parlamentar) || null;
  }

  upsert(parlamentar: Omit<Parlamentar, 'created_at' | 'updated_at'>): void {
    const db = getDatabase();
    
    const sql = `
      INSERT INTO parlamentares (
        id, casa, id_externo, nome, nome_civil, cpf, uf, 
        partido_id, sexo, data_nascimento, foto_url, email
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        nome = excluded.nome,
        nome_civil = excluded.nome_civil,
        cpf = excluded.cpf,
        uf = excluded.uf,
        partido_id = excluded.partido_id,
        sexo = excluded.sexo,
        data_nascimento = excluded.data_nascimento,
        foto_url = excluded.foto_url,
        email = excluded.email,
        updated_at = datetime('now')
    `;

    db.prepare(sql).run(
      parlamentar.id,
      parlamentar.casa,
      parlamentar.id_externo,
      parlamentar.nome,
      parlamentar.nome_civil,
      parlamentar.cpf,
      parlamentar.uf,
      parlamentar.partido_id,
      parlamentar.sexo,
      parlamentar.data_nascimento,
      parlamentar.foto_url,
      parlamentar.email
    );
  }

  count(casa?: Casa): number {
    const db = getDatabase();
    if (casa) {
      const result = db.prepare('SELECT COUNT(*) as total FROM parlamentares WHERE casa = ?').get(casa) as { total: number };
      return result.total;
    }
    const result = db.prepare('SELECT COUNT(*) as total FROM parlamentares').get() as { total: number };
    return result.total;
  }
}

