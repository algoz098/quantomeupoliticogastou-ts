#!/usr/bin/env ts-node
/**
 * Script para importar dados da Camara e Senado
 * 
 * Uso:
 *   npm run import -- --ano 2024
 *   npm run import -- --ano 2024 --fonte camara
 *   npm run import -- --ano 2024 --fonte senado
 */

import { initializeDatabase } from '../config/database';
import { CamaraCollector } from '../collectors/camara.collector';
import { SenadoCollector } from '../collectors/senado.collector';

interface ImportArgs {
  ano: number;
  fonte?: 'camara' | 'senado' | 'ambos';
}

function parseArgs(): ImportArgs {
  const args = process.argv.slice(2);
  const result: ImportArgs = {
    ano: new Date().getFullYear(),
    fonte: 'ambos',
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--ano' && args[i + 1]) {
      result.ano = parseInt(args[i + 1], 10);
      i++;
    } else if (args[i] === '--fonte' && args[i + 1]) {
      result.fonte = args[i + 1] as 'camara' | 'senado' | 'ambos';
      i++;
    }
  }

  return result;
}

async function main() {
  const args = parseArgs();
  
  console.log('='.repeat(50));
  console.log('IMPORTADOR DE DADOS - QUANTO MEU POLITICO GASTOU');
  console.log('='.repeat(50));
  console.log(`Ano: ${args.ano}`);
  console.log(`Fonte: ${args.fonte}`);
  console.log('='.repeat(50));
  console.log();

  // Inicializar banco
  initializeDatabase();

  const results = [];

  // Importar Camara
  if (args.fonte === 'camara' || args.fonte === 'ambos') {
    console.log('\n>>> CAMARA DOS DEPUTADOS <<<\n');
    const collector = new CamaraCollector();
    try {
      const result = await collector.collect(args.ano);
      results.push(result);
      console.log(`\nCamara: ${result.registros_processados} registros em ${result.duracao_ms}ms\n`);
    } catch (error) {
      console.error('Erro ao importar Camara:', error);
    }
  }

  // Importar Senado
  if (args.fonte === 'senado' || args.fonte === 'ambos') {
    console.log('\n>>> SENADO FEDERAL <<<\n');
    const collector = new SenadoCollector();
    try {
      const result = await collector.collect(args.ano);
      results.push(result);
      console.log(`\nSenado: ${result.registros_processados} registros em ${result.duracao_ms}ms\n`);
    } catch (error) {
      console.error('Erro ao importar Senado:', error);
    }
  }

  // Resumo
  console.log('\n' + '='.repeat(50));
  console.log('RESUMO');
  console.log('='.repeat(50));
  
  let totalRegistros = 0;
  let totalDuracao = 0;

  for (const result of results) {
    console.log(`${result.fonte.toUpperCase()}: ${result.registros_processados} registros`);
    totalRegistros += result.registros_processados;
    totalDuracao += result.duracao_ms;
  }

  console.log('-'.repeat(50));
  console.log(`TOTAL: ${totalRegistros} registros em ${(totalDuracao / 1000).toFixed(1)}s`);
  console.log('='.repeat(50));
}

main().catch(console.error);

