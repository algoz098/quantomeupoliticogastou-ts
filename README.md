# Quanto Meu Politico Gastou

Sistema para monitoramento e visualizacao de gastos de politicos brasileiros, tornando os dados de transparencia fiscal mais acessiveis ao cidadao.

## Objetivo

Transformar dados publicos de gastos parlamentares em informacoes claras e pesquisaveis, permitindo que qualquer pessoa possa:

- Pesquisar gastos por politico, partido, estado ou categoria
- Visualizar tendencias e padroes de gastos ao longo do tempo
- Comparar gastos entre diferentes politicos
- Receber alertas sobre gastos atipicos

## Stack Tecnologica

- **Backend**: TypeScript + Node.js
- **Banco de Dados**: SQLite
- **API**: REST
- **Frontend**: Quasar.js (Vue.js)

## Fontes de Dados

### O que sabemos

#### 1. Camara dos Deputados - CEAP (Cota para Exercicio da Atividade Parlamentar)

- **URL Base**: `https://dadosabertos.camara.leg.br`
- **Documentacao**: https://dadosabertos.camara.leg.br/swagger/api.html
- **Dados disponiveis desde**: 2008
- **Atualizacao**: Diaria
- **Formatos**: JSON, XML, CSV, XLSX, ODS

**Endpoints principais**:
- `GET /deputados` - Lista de deputados
- `GET /deputados/{id}` - Detalhes de um deputado
- `GET /deputados/{id}/despesas` - Despesas de um deputado

**Download em lote**:
- URL: `https://www.camara.leg.br/cotas/Ano-{ano}.{formato}[.zip]`
- Anos disponiveis: 2008 a 2025

**Categorias de despesas (CEAP)**:
- Passagens aereas
- Telefonia
- Servicos postais
- Manutencao de escritorio
- Combustiveis e lubrificantes
- Consultoria e assessoria
- Divulgacao da atividade parlamentar
- Hospedagem
- Alimentacao
- Locacao de veiculos
- Seguranca
- Entre outras

#### 2. Senado Federal - CEAPS (Cota para Exercicio da Atividade Parlamentar dos Senadores)

- **URL Base**: `https://www12.senado.leg.br/transparencia/dados-abertos-transparencia/dados-abertos-ceaps`
- **Dados disponiveis desde**: 2008
- **Atualizacao**: Periodica
- **Formatos**: CSV

**API Legislativa**:
- URL: `https://legis.senado.leg.br/dadosabertos/`
- Limite: 10 requisicoes por segundo

#### 3. Portal da Transparencia - Emendas Parlamentares

- **URL Base**: `https://api.portaldatransparencia.gov.br`
- **Documentacao**: https://api.portaldatransparencia.gov.br
- **Endpoint**: `GET /api-de-dados/emendas`

## Escopo do MVP

- **Politicos**: Deputados Federais + Senadores
- **Periodo**: Apenas 2025 (ano corrente)
- **Atualizacao**: Semanal
- **Fontes**: CEAP (Camara) + CEAPS (Senado)

## Arquitetura

Dois projetos separados:

```
quantomeupoliticogastou-api/      # Backend REST API (TypeScript + Node.js)
├── src/
│   ├── controllers/
│   ├── services/
│   ├── repositories/
│   ├── models/
│   ├── collectors/               # Coletores de dados
│   └── jobs/                     # Jobs de sincronizacao
├── database/
│   ├── migrations/
│   └── schema.sql
├── data/                         # Arquivos SQLite
└── package.json

quantomeupoliticogastou-web/      # Frontend (Quasar.js/Vue.js)
├── src/
│   ├── components/
│   ├── pages/
│   ├── stores/
│   └── services/
└── package.json
```

## Modelo de Dados

### Entidades principais

- **Parlamentar**: id (dep_XXX/sen_XXX), nome, cpf, partido, uf, casa, foto_url
- **Despesa**: id, parlamentar_id, data, valor, categoria, fornecedor_nome, fornecedor_documento, documento_url
- **Partido**: id, sigla, nome

### Identificacao de Parlamentares

| Casa | ID Origem | ID Sistema |
|------|-----------|------------|
| Camara | numeroDeputadoID | dep_{id} |
| Senado | codSenador | sen_{id} |

## Status do Projeto

- [x] Estrutura de dados das fontes confirmada
- [x] APIs testadas e funcionando
- [x] Escopo definido
- [ ] Schema do banco de dados
- [ ] Implementar backend
- [ ] Implementar frontend

## Referencias

- [Dados Abertos Camara](https://dadosabertos.camara.leg.br)
- [Transparencia Senado](https://www12.senado.leg.br/transparencia)
- [Portal da Transparencia](https://portaldatransparencia.gov.br)
- [Operacao Serenata de Amor](https://serenata.ai) - Projeto similar de referencia

