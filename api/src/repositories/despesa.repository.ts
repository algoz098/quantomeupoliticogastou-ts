import { getDatabase } from '../config/database';
import type { Despesa, DespesaDTO, GastosPorCategoriaDTO, RankingParlamentarDTO, Casa } from '../models/types';
import { estatisticasCache } from '../utils/cache';

/**
 * Repositorio para operacoes de despesas parlamentares
 */
export class DespesaRepository {
  /**
   * Busca despesas de um parlamentar especifico com filtros opcionais
   * @param parlamentarId - ID do parlamentar (formato: camara_123 ou senado_456)
   * @param filters - Filtros opcionais (ano, mes, categoria, limit, offset)
   * @returns Dados paginados e total de registros
   */
  findByParlamentar(parlamentarId: string, filters?: { ano?: number; mes?: number; categoria?: string; limit?: number; offset?: number }): { data: DespesaDTO[]; total: number } {
    const db = getDatabase();
    const limit = filters?.limit ?? 100;
    const offset = filters?.offset ?? 0;

    let whereSql = ' WHERE d.parlamentar_id = ?';
    const whereParams: (string | number)[] = [parlamentarId];

    if (filters?.ano) {
      whereSql += ' AND d.ano = ?';
      whereParams.push(filters.ano);
    }

    if (filters?.mes) {
      whereSql += ' AND d.mes = ?';
      whereParams.push(filters.mes);
    }

    if (filters?.categoria) {
      whereSql += ' AND d.categoria = ?';
      whereParams.push(filters.categoria);
    }

    // Usar CTE para contar e paginar em uma unica passada
    const sql = `
      WITH filtered AS (
        SELECT
          d.id, d.parlamentar_id, d.ano, d.mes, d.data, d.categoria,
          d.valor_centavos / 100.0 as valor,
          d.fornecedor_nome, d.fornecedor_documento
        FROM despesas d
        ${whereSql}
      ),
      counted AS (
        SELECT COUNT(*) as total FROM filtered
      )
      SELECT f.*, c.total
      FROM filtered f, counted c
      ORDER BY f.data DESC, f.id DESC
      LIMIT ? OFFSET ?
    `;

    const results = db.prepare(sql).all(...whereParams, limit, offset) as (DespesaDTO & { total: number })[];
    const total = results.length > 0 ? results[0].total : 0;
    const data = results.map(({ total: _total, ...rest }) => rest);

    return { data, total };
  }

  /**
   * Busca despesas por ano com paginacao
   * @param ano - Ano das despesas
   * @param limit - Limite de registros (default: 100)
   * @param offset - Offset para paginacao (default: 0)
   * @returns Dados paginados e total de registros
   */
  findByAno(ano: number, limit = 100, offset = 0): { data: DespesaDTO[]; total: number } {
    const db = getDatabase();

    const countResult = db.prepare('SELECT COUNT(*) as total FROM despesas WHERE ano = ?').get(ano) as { total: number };

    const sql = `
      SELECT
        d.id, d.parlamentar_id, p.nome as parlamentar_nome,
        d.ano, d.mes, d.data, d.categoria,
        d.valor_centavos / 100.0 as valor,
        d.fornecedor_nome, d.fornecedor_documento
      FROM despesas d
      JOIN parlamentares p ON p.id = d.parlamentar_id
      WHERE d.ano = ?
      ORDER BY d.valor_centavos DESC
      LIMIT ? OFFSET ?
    `;

    const data = db.prepare(sql).all(ano, limit, offset) as DespesaDTO[];
    return { data, total: countResult.total };
  }

  /**
   * Retorna gastos agrupados por categoria
   * @param ano - Ano das despesas
   * @param casa - Filtro opcional por casa (camara/senado)
   * @returns Lista de categorias com totais
   */
  getGastosPorCategoria(ano: number, casa?: Casa): GastosPorCategoriaDTO[] {
    const db = getDatabase();

    let sql = `
      SELECT
        d.categoria,
        SUM(d.valor_centavos) / 100.0 as total,
        COUNT(*) as quantidade
      FROM despesas d
    `;
    const params: (string | number)[] = [];

    if (casa) {
      sql += ' JOIN parlamentares p ON p.id = d.parlamentar_id WHERE d.ano = ? AND p.casa = ?';
      params.push(ano, casa);
    } else {
      sql += ' WHERE d.ano = ?';
      params.push(ano);
    }

    sql += ' GROUP BY d.categoria ORDER BY total DESC';

    return db.prepare(sql).all(...params) as GastosPorCategoriaDTO[];
  }

  /**
   * Retorna ranking de parlamentares por gasto
   * @param ano - Ano das despesas
   * @param filters - Filtros opcionais (casa, uf, limit, ordem)
   * @returns Lista de parlamentares ordenados por gasto
   */
  getRanking(ano: number, filters?: { casa?: Casa; uf?: string; limit?: number; ordem?: 'ASC' | 'DESC' }): RankingParlamentarDTO[] {
    const db = getDatabase();
    const limit = filters?.limit ?? 20;
    const ordem = filters?.ordem ?? 'DESC';

    let sql = `
      SELECT
        p.id, p.nome, p.casa, p.uf, p.foto_url,
        pa.sigla as partido,
        SUM(d.valor_centavos) / 100.0 as total_gasto,
        COUNT(*) as total_despesas
      FROM parlamentares p
      JOIN despesas d ON d.parlamentar_id = p.id
      LEFT JOIN partidos pa ON pa.id = p.partido_id
      WHERE d.ano = ?
    `;
    const params: (string | number)[] = [ano];

    if (filters?.casa) {
      sql += ' AND p.casa = ?';
      params.push(filters.casa);
    }

    if (filters?.uf) {
      sql += ' AND p.uf = ?';
      params.push(filters.uf);
    }

    const orderDirection = ordem === 'ASC' ? 'ASC' : 'DESC';
    sql += `
      GROUP BY p.id
      ORDER BY total_gasto ${orderDirection}
      LIMIT ?
    `;
    params.push(limit);

    const results = db.prepare(sql).all(...params) as Array<{
      id: string;
      nome: string;
      casa: Casa;
      uf: string | null;
      foto_url: string | null;
      partido: string | null;
      total_gasto: number;
      total_despesas: number;
    }>;

    return results.map((row, index) => ({
      posicao: index + 1,
      parlamentar: {
        id: row.id,
        nome: row.nome,
        casa: row.casa,
        uf: row.uf,
        partido: row.partido,
        foto_url: row.foto_url,
      },
      total_gasto: row.total_gasto,
      total_despesas: row.total_despesas,
    }));
  }

  /**
   * Insere ou atualiza uma despesa
   * @param despesa - Dados da despesa (sem timestamps)
   */
  upsert(despesa: Omit<Despesa, 'created_at' | 'updated_at'>): void {
    const db = getDatabase();
    
    const sql = `
      INSERT INTO despesas (
        id, parlamentar_id, id_externo, ano, mes, data, categoria,
        valor_centavos, fornecedor_nome, fornecedor_documento,
        documento_numero, documento_tipo, detalhamento, url_documento, fonte
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(fonte, id_externo) DO UPDATE SET
        valor_centavos = excluded.valor_centavos,
        fornecedor_nome = excluded.fornecedor_nome,
        detalhamento = excluded.detalhamento,
        updated_at = datetime('now')
    `;

    db.prepare(sql).run(
      despesa.id,
      despesa.parlamentar_id,
      despesa.id_externo,
      despesa.ano,
      despesa.mes,
      despesa.data,
      despesa.categoria,
      despesa.valor_centavos,
      despesa.fornecedor_nome,
      despesa.fornecedor_documento,
      despesa.documento_numero,
      despesa.documento_tipo,
      despesa.detalhamento,
      despesa.url_documento,
      despesa.fonte
    );
  }

  /**
   * Conta total de despesas
   * @param ano - Filtro opcional por ano
   * @returns Total de despesas
   */
  count(ano?: number): number {
    const db = getDatabase();
    if (ano) {
      const result = db.prepare('SELECT COUNT(*) as total FROM despesas WHERE ano = ?').get(ano) as { total: number };
      return result.total;
    }
    const result = db.prepare('SELECT COUNT(*) as total FROM despesas').get() as { total: number };
    return result.total;
  }

  /**
   * Retorna estatisticas gerais de despesas
   * @param casa - Filtro opcional por casa (camara/senado)
   * @returns Total de despesas, valor total e anos disponiveis
   */
  getEstatisticas(casa?: Casa): { total_despesas: number; valor_total: number; anos_disponiveis: number[] } {
    const cacheKey = `stats:${casa || 'all'}`;

    return estatisticasCache.getOrSet(cacheKey, () => {
      const db = getDatabase();

      let statsQuery = `
        SELECT
          COUNT(*) as total_despesas,
          SUM(d.valor_centavos) / 100.0 as valor_total
        FROM despesas d
      `;
      let anosQuery = 'SELECT DISTINCT d.ano FROM despesas d';

      if (casa) {
        statsQuery += ' JOIN parlamentares p ON p.id = d.parlamentar_id WHERE p.casa = ?';
        anosQuery += ' JOIN parlamentares p ON p.id = d.parlamentar_id WHERE p.casa = ?';
      }

      anosQuery += ' ORDER BY d.ano DESC';

      const statsResult = casa
        ? db.prepare(statsQuery).get(casa) as { total_despesas: number; valor_total: number }
        : db.prepare(statsQuery).get() as { total_despesas: number; valor_total: number };

      const anosResult = casa
        ? db.prepare(anosQuery).all(casa) as { ano: number }[]
        : db.prepare(anosQuery).all() as { ano: number }[];

      return {
        total_despesas: statsResult.total_despesas || 0,
        valor_total: statsResult.valor_total || 0,
        anos_disponiveis: anosResult.map(r => r.ano),
      };
    }, 120) as { total_despesas: number; valor_total: number; anos_disponiveis: number[] }; // Cache por 2 minutos
  }

  /**
   * Retorna gastos mensais agregados
   * @param ano - Ano das despesas
   * @param casa - Filtro opcional por casa (camara/senado)
   * @returns Lista de gastos por mes
   */
  getGastosMensais(ano: number, casa?: Casa): { ano: number; mes: number; total: number; quantidade: number }[] {
    const db = getDatabase();

    let sql = `
      SELECT
        d.ano,
        d.mes,
        SUM(d.valor_centavos) / 100.0 as total,
        COUNT(*) as quantidade
      FROM despesas d
    `;
    const params: (string | number)[] = [];

    if (casa) {
      sql += ' JOIN parlamentares p ON p.id = d.parlamentar_id WHERE d.ano = ? AND p.casa = ?';
      params.push(ano, casa);
    } else {
      sql += ' WHERE d.ano = ?';
      params.push(ano);
    }

    sql += ' GROUP BY d.ano, d.mes ORDER BY d.ano DESC, d.mes DESC';

    return db.prepare(sql).all(...params) as { ano: number; mes: number; total: number; quantidade: number }[];
  }
}

