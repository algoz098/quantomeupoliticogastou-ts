# Questoes em Aberto

Este documento lista as questoes que precisam ser investigadas antes ou durante o desenvolvimento.

**Ultima atualizacao**: 30/12/2025

## Fontes de Dados

### Camara dos Deputados

- [x] Confirmar estrutura exata dos campos no JSON/CSV atual - **CONFIRMADO** (ver FONTES_DADOS.md)
- [x] Verificar se existe limite de requisicoes na API - Nao documentado, usar 5 req/seg
- [x] Testar download dos arquivos em lote - **FUNCIONA** (Ano-2025.json.zip disponivel)
- [ ] Verificar se URL do documento (comprovante) ainda esta acessivel

### Senado Federal

- [x] Verificar se dados de 2023, 2024 e 2025 estao disponiveis - **CONFIRMADO** (2008-2025)
- [x] Confirmar campos do CSV/JSON atual - **CONFIRMADO** (ver FONTES_DADOS.md)
- [x] Testar API legislativa para obter dados de senadores - **FUNCIONA** (legis.senado.leg.br)
- [x] Verificar se existe API para despesas (alem do download CSV) - **SIM** (adm.senado.gov.br)

### Portal da Transparencia (FUTURO - fora do MVP)

- [ ] Verificar se precisa de cadastro/token para API
- [ ] Testar endpoint de emendas parlamentares
- [ ] Mapear campos disponiveis
- [ ] Verificar limites de paginacao

### Fontes Adicionais (FUTURO - fora do MVP)

- [ ] Dados de deputados estaduais (cada assembleia legislativa)
- [ ] Dados de vereadores (cada camara municipal)
- [ ] Declaracao de bens dos politicos (TSE?)
- [ ] Financiamento de campanha (TSE)

## Modelo de Dados

- [x] Como identificar univocamente um politico - **DEFINIDO**: usar ID interno de cada casa com prefixo (dep_XXX, sen_XXX)
- [ ] Como relacionar mandatos em diferentes casas legislativas
- [ ] Como tratar politicos que mudam de partido
- [ ] Como tratar suplentes que assumem mandato

## Questoes Tecnicas

### Sincronizacao

- [x] Qual frequencia ideal de atualizacao? - **DEFINIDO**: Semanal
- [ ] Como detectar registros novos vs atualizados?
- [ ] Como lidar com registros deletados/corrigidos na fonte?
- [ ] Estrategia de retry em caso de falha

### Performance

- [x] Volume estimado de dados (registros por ano) - **~254.000/ano** (ver ANALISE_VOLUME.md)
- [x] SQLite suporta o volume esperado? - **SIM**, volume trivial (ver ANALISE_VOLUME.md)
- [x] Indices necessarios para consultas comuns - **DEFINIDOS** (ver database/schema.sql)
- [ ] Estrategia de cache para consultas frequentes

### Armazenamento

- [ ] Guardar documento original (nota fiscal) localmente?
- [x] Compressao de dados historicos - N/A (apenas ano corrente)
- [ ] Backup e recuperacao

## Questoes de Negocio

### Escopo Inicial - DEFINIDO

- [x] Comecar apenas com deputados federais? - **NAO**, incluir todos
- [x] Incluir senadores desde o inicio? - **SIM**
- [x] Qual periodo historico incluir? - **Apenas 2025** (ano mais recente)

### Funcionalidades (a definir prioridades)

- [ ] Sistema de alertas (gastos atipicos)
- [ ] Comparativos entre politicos
- [ ] Rankings por categoria
- [ ] Exportacao de dados

### Legais

- [ ] Quais dados podem ser exibidos publicamente?
- [ ] Restricoes sobre exibicao de CPF
- [ ] Termos de uso das APIs oficiais
- [ ] LGPD e dados de fornecedores

## Infraestrutura

- [ ] Onde hospedar o sistema?
- [ ] Custo estimado de operacao
- [ ] Monitoramento e alertas
- [ ] CI/CD pipeline

## Decisoes Tomadas

| Decisao | Valor | Data |
|---------|-------|------|
| Escopo de politicos | Deputados + Senadores | 30/12/2025 |
| Periodo de dados | Apenas 2025 | 30/12/2025 |
| Arquitetura | Backend API + Frontend separados | 30/12/2025 |
| Frequencia sync | Semanal | 30/12/2025 |
| Identificacao | ID interno com prefixo (dep_/sen_) | 30/12/2025 |

## Proximas Acoes

1. ~~Baixar amostra de cada fonte para validar estrutura~~ - FEITO
2. ~~Criar script de teste para cada API~~ - FEITO (testes manuais)
3. ~~Estimar volume de dados~~ - FEITO (ver ANALISE_VOLUME.md)
4. ~~Definir escopo do MVP~~ - FEITO
5. ~~Criar schema do banco de dados~~ - FEITO (ver database/schema.sql)
6. ~~Inicializar projeto backend~~ - FEITO (ver api/)
7. [ ] Inicializar projeto frontend
8. [ ] Implementar coletores de dados

