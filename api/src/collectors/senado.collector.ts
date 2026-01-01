import { BaseCollector, CollectorResult } from './base.collector';
import { getDatabase } from '../config/database';
import { env } from '../config/env';
import type Database from 'better-sqlite3';

// Estrutura do JSON do Senado (API atual)
interface DespesaSenado {
  id: number;
  tipoDocumento: string;
  ano: number;
  mes: number;
  codSenador: number;
  nomeSenador: string;
  tipoDespesa: string;
  cpfCnpj: string;
  fornecedor: string;
  documento: string;
  data: string;
  detalhamento: string | null;
  valorReembolsado: number;
}

interface SenadorInfo {
  codSenador: number;
  nome: string;
  partido: string;
  uf: string;
  fotoUrl: string;
}

export class SenadoCollector extends BaseCollector {
  constructor() {
    super('senado');
  }

  async collect(ano: number): Promise<CollectorResult> {
    const startTime = Date.now();
    let registros_processados = 0;
    // Nota: Com UPSERT do SQLite, nao e possivel distinguir inserts de updates facilmente
    // registros_inseridos representa o total de operacoes de upsert realizadas
    let registros_inseridos = 0;

    this.log(`Iniciando coleta para o ano ${ano}`);
    this.logSync(ano, 'running');

    try {
      // Buscar lista de senadores primeiro
      const senadores = await this.fetchSenadores();
      this.log(`${senadores.size} senadores encontrados`);

      // Buscar despesas
      const despesas = await this.fetchDespesas(ano);
      this.log(`${despesas.length} despesas encontradas`);

      const db = getDatabase();
      const insertDespesa = db.prepare(`
        INSERT INTO despesas (
          id, parlamentar_id, id_externo, ano, mes, data, categoria,
          valor_centavos, fornecedor_nome, fornecedor_documento,
          documento_numero, documento_tipo, detalhamento, url_documento, fonte
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(fonte, id_externo) DO UPDATE SET
          valor_centavos = excluded.valor_centavos,
          updated_at = datetime('now')
      `);

      const upsertParlamentar = db.prepare(`
        INSERT INTO parlamentares (id, casa, id_externo, nome, uf, partido_id, foto_url)
        VALUES (?, 'senado', ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          nome = excluded.nome,
          uf = excluded.uf,
          partido_id = excluded.partido_id,
          foto_url = excluded.foto_url,
          updated_at = datetime('now')
      `);

      // Cache de parlamentares ja processados
      const parlamentaresProcessados = new Set<string>();

      const transaction = db.transaction((items: DespesaSenado[]) => {
        for (const item of items) {
          registros_processados++;

          // Usar codSenador diretamente da despesa (nova API)
          const parlamentarId = `sen_${item.codSenador}`;

          // Buscar info adicional do senador (partido, uf) pelo codigo
          const senadorInfo = senadores.get(item.codSenador);

          // Upsert parlamentar
          if (!parlamentaresProcessados.has(parlamentarId)) {
            const partidoId = senadorInfo?.partido ? this.ensurePartido(senadorInfo.partido) : null;
            upsertParlamentar.run(
              parlamentarId,
              item.codSenador,
              senadorInfo?.nome || item.nomeSenador,
              senadorInfo?.uf || null,
              partidoId,
              senadorInfo?.fotoUrl || null
            );
            parlamentaresProcessados.add(parlamentarId);
          }

          this.insertDespesa(insertDespesa, item, parlamentarId);
          registros_inseridos++;
        }
      });

      // Processar em batches
      const BATCH_SIZE = 2000;
      for (let i = 0; i < despesas.length; i += BATCH_SIZE) {
        const batch = despesas.slice(i, i + BATCH_SIZE);
        transaction(batch);
        this.log(`Processados ${Math.min(i + BATCH_SIZE, despesas.length)}/${despesas.length}`);
      }

      const duracao_ms = Date.now() - startTime;
      this.log(`Coleta finalizada em ${duracao_ms}ms`);

      this.logSync(ano, 'success', { registros_processados, registros_inseridos, registros_atualizados: 0 });

      return { fonte: 'senado', ano, registros_processados, registros_inseridos, registros_atualizados: 0, duracao_ms };
    } catch (error) {
      const erro = error instanceof Error ? error.message : String(error);
      this.log(`Erro: ${erro}`);
      this.logSync(ano, 'error', { registros_processados, registros_inseridos, registros_atualizados: 0 }, erro);
      throw error;
    }
  }

  private insertDespesa(stmt: Database.Statement, item: DespesaSenado, parlamentarId: string): void {
    const despesaId = `sen_${item.id}`;
    const valorCentavos = Math.round(item.valorReembolsado * 100);

    stmt.run(
      despesaId,
      parlamentarId,
      String(item.id),
      item.ano,
      item.mes,
      item.data || null,
      item.tipoDespesa || 'Nao especificado',
      valorCentavos,
      item.fornecedor || null,
      item.cpfCnpj || null,
      item.documento || null,
      item.tipoDocumento || null,
      item.detalhamento || null,
      null,
      'senado'
    );
  }

  private async fetchSenadores(): Promise<Map<number, SenadorInfo>> {
    const url = `${env.SENADO_LEGIS_URL}/senador/lista/atual`;
    this.log(`Buscando lista de senadores...`);

    const response = await fetch(url, {
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`Erro ao buscar senadores: ${response.status}`);
    }

    const data = await response.json() as {
      ListaParlamentarEmExercicio: {
        Parlamentares: {
          Parlamentar: Array<{
            IdentificacaoParlamentar: {
              CodigoParlamentar: string;
              NomeParlamentar: string;
              SiglaPartidoParlamentar: string;
              UfParlamentar: string;
              UrlFotoParlamentar: string;
            };
          }>;
        };
      };
    };

    const senadores = new Map<number, SenadorInfo>();
    const parlamentares = data.ListaParlamentarEmExercicio?.Parlamentares?.Parlamentar || [];

    for (const p of parlamentares) {
      const info = p.IdentificacaoParlamentar;
      const codSenador = parseInt(info.CodigoParlamentar, 10);
      // URL correta das fotos do Senado (a URL da API redireciona)
      const fotoUrl = `https://www.senado.leg.br/senadores/img/fotos-oficiais/senador${codSenador}.jpg`;
      senadores.set(codSenador, {
        codSenador,
        nome: info.NomeParlamentar,
        partido: info.SiglaPartidoParlamentar,
        uf: info.UfParlamentar,
        fotoUrl,
      });
    }

    return senadores;
  }

  private async fetchDespesas(ano: number): Promise<DespesaSenado[]> {
    const url = `${env.SENADO_API_URL}/senadores/despesas_ceaps/${ano}`;
    this.log(`Buscando despesas de ${ano}...`);

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Erro ao buscar despesas: ${response.status}`);
    }

    const data = await response.json() as DespesaSenado[];
    return data;
  }
}

