import { BaseCollector, CollectorResult } from './base.collector';
import { getDatabase } from '../config/database';
import { env } from '../config/env';
import fs from 'fs';
import path from 'path';
import { pipeline } from 'stream/promises';
import { createWriteStream } from 'fs';
import yauzl from 'yauzl';

// Estrutura real do JSON da Camara (arquivo ZIP)
interface DespesaCamara {
  idDocumento: number;
  numeroDeputadoID: number;
  nomeParlamentar: string;
  cpf: string;
  siglaPartido: string;
  siglaUF: string;
  descricao: string;
  ano: number;
  mes: number;
  dataEmissao: string;
  valorDocumento: string;
  valorGlosa: string;
  valorLiquido: string;
  fornecedor: string;
  cnpjCPF: string;
  numero: string;
  tipoDocumento: string;
  urlDocumento: string;
}

interface DeputadoInfo {
  id: number;
  nome: string;
  urlFoto: string;
}

export class CamaraCollector extends BaseCollector {
  private tempDir: string;

  constructor() {
    super('camara');
    this.tempDir = path.join(process.cwd(), 'data', 'temp');
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
      // Garantir diretorio temp
      if (!fs.existsSync(this.tempDir)) {
        fs.mkdirSync(this.tempDir, { recursive: true });
      }

      // Buscar deputados da API para obter fotos
      const deputadosMap = await this.fetchDeputados();
      this.log(`${deputadosMap.size} deputados mapeados para fotos`);

      // Download do arquivo
      const zipPath = path.join(this.tempDir, `camara-${ano}.json.zip`);
      const jsonPath = path.join(this.tempDir, `camara-${ano}.json`);

      await this.downloadFile(ano, zipPath);
      await this.extractZip(zipPath, jsonPath);

      // Processar JSON em streaming
      const data = await this.parseJsonFile(jsonPath);
      this.log(`${data.length} registros encontrados`);

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
        INSERT INTO parlamentares (id, casa, id_externo, nome, cpf, uf, partido_id, foto_url)
        VALUES (?, 'camara', ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          nome = excluded.nome,
          uf = excluded.uf,
          partido_id = excluded.partido_id,
          foto_url = excluded.foto_url,
          updated_at = datetime('now')
      `);

      // Cache de parlamentares ja processados
      const parlamentaresProcessados = new Set<number>();

      const transaction = db.transaction((items: DespesaCamara[]) => {
        for (const item of items) {
          registros_processados++;

          // Upsert parlamentar (apenas uma vez)
          if (!parlamentaresProcessados.has(item.numeroDeputadoID)) {
            const partidoId = item.siglaPartido ? this.ensurePartido(item.siglaPartido) : null;
            const parlamentarId = `dep_${item.numeroDeputadoID}`;
            // Buscar foto pelo nome do parlamentar (normalizado)
            const nomeNormalizado = this.normalizarNome(item.nomeParlamentar || '');
            const deputadoInfo = deputadosMap.get(nomeNormalizado);
            const fotoUrl = deputadoInfo?.urlFoto || null;

            upsertParlamentar.run(
              parlamentarId,
              item.numeroDeputadoID,
              item.nomeParlamentar || 'Sem nome',
              item.cpf || null,
              item.siglaUF || null,
              partidoId,
              fotoUrl
            );
            parlamentaresProcessados.add(item.numeroDeputadoID);
          }

          // Insert despesa
          const despesaId = `dep_${item.numeroDeputadoID}_${item.idDocumento}`;
          const parlamentarId = `dep_${item.numeroDeputadoID}`;
          const valorLiquido = parseFloat(item.valorLiquido) || 0;
          const valorCentavos = Math.round(valorLiquido * 100);

          insertDespesa.run(
            despesaId,
            parlamentarId,
            String(item.idDocumento),
            item.ano,
            item.mes,
            item.dataEmissao || null,
            item.descricao || 'Nao especificado',
            valorCentavos,
            item.fornecedor || null,
            item.cnpjCPF || null,
            item.numero || null,
            item.tipoDocumento || null,
            null,
            item.urlDocumento || null,
            'camara'
          );
          registros_inseridos++;
        }
      });

      // Processar em batches
      const BATCH_SIZE = 5000;
      for (let i = 0; i < data.length; i += BATCH_SIZE) {
        const batch = data.slice(i, i + BATCH_SIZE);
        transaction(batch);
        this.log(`Processados ${Math.min(i + BATCH_SIZE, data.length)}/${data.length}`);
      }

      // Limpar arquivos temporarios
      fs.unlinkSync(zipPath);
      fs.unlinkSync(jsonPath);

      const duracao_ms = Date.now() - startTime;
      this.log(`Coleta finalizada em ${duracao_ms}ms`);

      this.logSync(ano, 'success', { registros_processados, registros_inseridos, registros_atualizados: 0 });

      return { fonte: 'camara', ano, registros_processados, registros_inseridos, registros_atualizados: 0, duracao_ms };
    } catch (error) {
      const erro = error instanceof Error ? error.message : String(error);
      this.log(`Erro: ${erro}`);
      this.logSync(ano, 'error', { registros_processados, registros_inseridos, registros_atualizados: 0 }, erro);
      throw error;
    }
  }

  private async downloadFile(ano: number, destPath: string): Promise<void> {
    const url = `${env.CAMARA_COTAS_URL}/Ano-${ano}.json.zip`;
    this.log(`Baixando ${url}`);

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Erro ao baixar: ${response.status} ${response.statusText}`);
    }

    const fileStream = createWriteStream(destPath);
    // @ts-expect-error - Node fetch body is compatible
    await pipeline(response.body, fileStream);

    const stats = fs.statSync(destPath);
    this.log(`Download concluido: ${(stats.size / 1024 / 1024).toFixed(1)} MB`);
  }

  private async extractZip(zipPath: string, destPath: string): Promise<void> {
    this.log('Extraindo arquivo...');

    return new Promise((resolve, reject) => {
      yauzl.open(zipPath, { lazyEntries: true }, (err, zipfile) => {
        if (err) {
          reject(err);
          return;
        }
        if (!zipfile) {
          reject(new Error('Arquivo ZIP invalido'));
          return;
        }

        zipfile.readEntry();
        zipfile.on('entry', (entry) => {
          // Pegar o primeiro arquivo do ZIP (deve ser o JSON)
          if (/\/$/.test(entry.fileName)) {
            // Diretorio, pular
            zipfile.readEntry();
          } else {
            zipfile.openReadStream(entry, (streamErr, readStream) => {
              if (streamErr) {
                reject(streamErr);
                return;
              }
              if (!readStream) {
                reject(new Error('Nao foi possivel ler o arquivo do ZIP'));
                return;
              }

              const writeStream = createWriteStream(destPath);
              readStream.pipe(writeStream);
              writeStream.on('close', () => {
                const stats = fs.statSync(destPath);
                this.log(`Extraido: ${(stats.size / 1024 / 1024).toFixed(1)} MB`);
                resolve();
              });
              writeStream.on('error', reject);
            });
          }
        });

        zipfile.on('error', reject);
        zipfile.on('end', () => {
          // Se chegou aqui sem extrair nada, o ZIP esta vazio
          if (!fs.existsSync(destPath)) {
            reject(new Error('ZIP vazio ou sem arquivos'));
          }
        });
      });
    });
  }

  private async parseJsonFile(jsonPath: string): Promise<DespesaCamara[]> {
    this.log('Parseando JSON...');
    const content = fs.readFileSync(jsonPath, 'utf-8');
    const data = JSON.parse(content) as { dados: DespesaCamara[] };
    return data.dados;
  }

  private async fetchDeputados(): Promise<Map<string, DeputadoInfo>> {
    this.log('Buscando deputados da API para fotos...');
    const deputados = new Map<string, DeputadoInfo>();

    // Buscar deputados da legislatura atual (57)
    const url = `${env.CAMARA_API_URL}/deputados?idLegislatura=57&itens=1000`;
    const response = await fetch(url);

    if (!response.ok) {
      this.log(`Aviso: nao foi possivel buscar deputados da API: ${response.status}`);
      return deputados;
    }

    const data = await response.json() as {
      dados: Array<{
        id: number;
        nome: string;
        urlFoto: string;
      }>;
    };

    for (const dep of data.dados) {
      const nomeNormalizado = this.normalizarNome(dep.nome);
      deputados.set(nomeNormalizado, {
        id: dep.id,
        nome: dep.nome,
        urlFoto: dep.urlFoto,
      });
    }

    return deputados;
  }

  private normalizarNome(nome: string): string {
    return nome
      .toUpperCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^A-Z\s]/g, '') // Remove caracteres especiais
      .trim();
  }
}

