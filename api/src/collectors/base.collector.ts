import { getDatabase } from '../config/database';
import type { Casa } from '../models/types';
import { Logger } from '../utils/logger';

export interface CollectorResult {
  fonte: Casa;
  ano: number;
  registros_processados: number;
  registros_inseridos: number;
  registros_atualizados: number;
  duracao_ms: number;
  erro?: string;
}

export abstract class BaseCollector {
  protected fonte: Casa;
  protected logger: Logger;

  constructor(fonte: Casa) {
    this.fonte = fonte;
    this.logger = new Logger(`Collector:${fonte.toUpperCase()}`);
  }

  abstract collect(ano: number): Promise<CollectorResult>;

  protected logSync(
    ano: number,
    status: 'running' | 'success' | 'error',
    stats?: Partial<CollectorResult>,
    erro?: string
  ): number {
    const db = getDatabase();

    if (status === 'running') {
      const result = db
        .prepare(
          `INSERT INTO sync_log (fonte, ano, status) VALUES (?, ?, ?) RETURNING id`
        )
        .get(this.fonte, ano, status) as { id: number };
      return result.id;
    }

    db.prepare(
      `UPDATE sync_log SET
        status = ?,
        registros_processados = ?,
        registros_inseridos = ?,
        registros_atualizados = ?,
        erro = ?,
        finalizado_em = datetime('now')
      WHERE fonte = ? AND ano = ? AND status = 'running'
      ORDER BY iniciado_em DESC LIMIT 1`
    ).run(
      status,
      stats?.registros_processados || 0,
      stats?.registros_inseridos || 0,
      stats?.registros_atualizados || 0,
      erro || null,
      this.fonte,
      ano
    );

    return 0;
  }

  protected ensurePartido(sigla: string): number {
    const db = getDatabase();
    const result = db
      .prepare(
        `INSERT INTO partidos (sigla) VALUES (?)
         ON CONFLICT(sigla) DO UPDATE SET updated_at = datetime('now')
         RETURNING id`
      )
      .get(sigla) as { id: number };
    return result.id;
  }

  protected log(message: string): void {
    this.logger.info(message);
  }
}

