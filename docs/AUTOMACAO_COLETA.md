# Automacao da Coleta de Dados

Este documento descreve as opcoes para automatizar a coleta e atualizacao de dados de gastos de politicos.

## Visao Geral

O sistema precisa:

1. **Carga inicial**: Baixar todo historico de dados (desde 2008)
2. **Atualizacao incremental**: Sincronizar novos dados periodicamente
3. **Reprocessamento**: Capacidade de reprocessar dados em caso de correcoes

## Opcoes de Agendamento

### Opcao 1: BullMQ (Recomendado)

**Descricao**: Biblioteca robusta para filas e agendamento de jobs usando Redis.

**Pros**:
- Persistencia de jobs em Redis (jobs nao se perdem se o servidor reiniciar)
- Suporte a jobs repetitivos com cron expressions
- Prioridades, retries automaticos, rate limiting
- Interface web para monitoramento (Bull Board)
- Escala horizontalmente com multiplos workers
- Escrito em TypeScript

**Contras**:
- Requer Redis como dependencia adicional
- Maior complexidade de setup

**Quando usar**: Producao, sistemas que precisam de alta confiabilidade.

```typescript
import { Queue, Worker } from 'bullmq';

const syncQueue = new Queue('data-sync', { connection: redisOptions });

// Agendar sincronizacao diaria as 3h da manha
await syncQueue.add('sync-camara', {}, {
  repeat: { pattern: '0 3 * * *' }
});

// Worker que processa os jobs
const worker = new Worker('data-sync', async (job) => {
  if (job.name === 'sync-camara') {
    await syncCamaraData();
  }
}, { connection: redisOptions });
```

### Opcao 2: node-cron

**Descricao**: Agendador simples baseado em cron para Node.js.

**Pros**:
- Zero dependencias externas
- Sintaxe cron familiar
- Facil de configurar
- Leve

**Contras**:
- Jobs nao persistem (perdidos se servidor reiniciar)
- Sem suporte a filas ou prioridades
- Sem interface de monitoramento
- Nao escala horizontalmente

**Quando usar**: Desenvolvimento, projetos pequenos, tarefas simples.

```typescript
import cron from 'node-cron';

// Executar todo dia as 3h da manha
cron.schedule('0 3 * * *', async () => {
  await syncCamaraData();
});
```

### Opcao 3: Agenda

**Descricao**: Agendador com persistencia em MongoDB.

**Pros**:
- Persistencia em MongoDB
- Interface web disponivel (Agendash)
- Suporte a jobs repetitivos
- Prioridades e concorrencia

**Contras**:
- Requer MongoDB
- Menos popular que BullMQ

**Quando usar**: Se ja usar MongoDB no projeto.

### Opcao 4: Bree

**Descricao**: Agendador moderno com workers isolados.

**Pros**:
- Workers em processos separados (sandboxed)
- Suporte a TypeScript nativo
- Leve, sem dependencias de banco
- Jobs persistem em arquivo

**Contras**:
- Menos recursos que BullMQ
- Comunidade menor

**Quando usar**: Projetos que precisam de isolamento de processos.

### Opcao 5: Cron do Sistema Operacional

**Descricao**: Usar o crontab do Linux/macOS para executar scripts.

**Pros**:
- Nativo do sistema, sem dependencias
- Simples e confiavel
- Funciona mesmo se aplicacao Node nao estiver rodando

**Contras**:
- Dificil de versionar e manter
- Nao integrado com a aplicacao
- Logs separados
- Nao funciona em ambientes serverless

**Quando usar**: Scripts simples, ambientes tradicionais.

```bash
# Editar crontab
crontab -e

# Adicionar job (todo dia as 3h)
0 3 * * * cd /app && node dist/jobs/sync.js >> /var/log/sync.log 2>&1
```

## Comparativo

| Caracteristica | BullMQ | node-cron | Agenda | Bree | Cron SO |
|----------------|--------|-----------|--------|------|---------|
| Persistencia | Redis | Nao | MongoDB | Arquivo | N/A |
| Retries | Sim | Nao | Sim | Sim | Nao |
| Prioridades | Sim | Nao | Sim | Nao | Nao |
| UI Monitoramento | Sim | Nao | Sim | Sim | Nao |
| Escalabilidade | Alta | Baixa | Media | Media | Baixa |
| Complexidade | Media | Baixa | Media | Baixa | Baixa |
| TypeScript | Nativo | Tipos | Tipos | Nativo | N/A |

## Recomendacao

Para este projeto, recomendamos **BullMQ** pelos seguintes motivos:

1. **Confiabilidade**: Jobs persistem em Redis, nao se perdem em reinicializacoes
2. **Escalabilidade**: Podemos adicionar mais workers conforme necessidade
3. **Monitoramento**: Bull Board permite visualizar status dos jobs
4. **Retries**: Falhas de rede sao tratadas automaticamente
5. **TypeScript**: Suporte nativo, alinhado com o stack do projeto

## Arquitetura Proposta

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│   Scheduler     │────▶│     Redis       │◀────│    Workers      │
│   (API Server)  │     │   (Job Queue)   │     │  (Processamento)│
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                        │
                                                        ▼
                                                ┌─────────────────┐
                                                │                 │
                                                │    SQLite DB    │
                                                │                 │
                                                └─────────────────┘
```

## Estrategia de Coleta

### Carga Inicial

Para a carga inicial, baixar arquivos em lote (bulk) e nao usar a API:

```typescript
// Baixar todos os anos de 2008 ate o atual
const anos = range(2008, new Date().getFullYear() + 1);

for (const ano of anos) {
  await queue.add('download-camara-bulk', { ano }, {
    priority: 10, // baixa prioridade
    attempts: 3,
    backoff: { type: 'exponential', delay: 60000 }
  });
}
```

### Atualizacao Incremental

Apos carga inicial, usar API para buscar apenas novos registros:

```typescript
// Sincronizar dados do ano atual diariamente
await queue.add('sync-camara-incremental', {
  ano: new Date().getFullYear(),
  dataInicio: ultimaSincronizacao
}, {
  repeat: { pattern: '0 4 * * *' } // 4h da manha
});
```

### Frequencia Sugerida

| Fonte | Frequencia | Horario | Justificativa |
|-------|------------|---------|---------------|
| Camara (CEAP) | Diaria | 04:00 | Dados atualizados diariamente |
| Senado (CEAPS) | Semanal | Dom 04:00 | Atualizacao menos frequente |
| Portal Transparencia | Semanal | Seg 04:00 | Emendas nao mudam frequentemente |

### Tratamento de Erros

```typescript
const worker = new Worker('data-sync', processor, {
  connection: redisOptions,
  limiter: {
    max: 5,        // max 5 jobs simultaneos
    duration: 1000 // por segundo
  }
});

worker.on('failed', async (job, error) => {
  // Logar erro
  logger.error('Job failed', { jobId: job.id, error: error.message });

  // Notificar se muitas falhas
  if (job.attemptsMade >= job.opts.attempts) {
    await notifyAdmins('Sync job failed permanently', job);
  }
});
```

## Proximos Passos

1. [ ] Definir frequencia de atualizacao para cada fonte
2. [ ] Definir estrategia de retry e tratamento de erros
3. [ ] Definir metricas de monitoramento
4. [ ] Implementar logging estruturado para jobs

