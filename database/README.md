# Banco de Dados

## Visao Geral

O projeto utiliza SQLite como banco de dados. A escolha foi validada pela analise de volume que mostrou ~254.000 registros/ano, volume trivial para SQLite.

## Arquivos

- `schema.sql` - Definicao das tabelas, indices e views

## Diagrama ER

```
┌─────────────────┐       ┌─────────────────┐
│    partidos     │       │  parlamentares  │
├─────────────────┤       ├─────────────────┤
│ id (PK)         │◄──────│ partido_id (FK) │
│ sigla           │       │ id (PK)         │
│ nome            │       │ casa            │
└─────────────────┘       │ id_externo      │
                          │ nome            │
                          │ uf              │
                          │ cpf             │
                          │ foto_url        │
                          └────────┬────────┘
                                   │
                                   │ 1:N
                                   ▼
                          ┌─────────────────┐
                          │    despesas     │
                          ├─────────────────┤
                          │ id (PK)         │
                          │ parlamentar_id  │
                          │ ano, mes        │
                          │ categoria       │
                          │ valor_centavos  │
                          │ fornecedor_*    │
                          │ documento_*     │
                          └─────────────────┘

                          ┌─────────────────┐
                          │    sync_log     │
                          ├─────────────────┤
                          │ fonte           │
                          │ ano             │
                          │ status          │
                          │ registros_*     │
                          └─────────────────┘
```

## Tabelas

### partidos
Cadastro de partidos politicos.

| Coluna | Tipo | Descricao |
|--------|------|-----------|
| id | INTEGER | PK auto-increment |
| sigla | TEXT | Sigla do partido (ex: PT, PL) |
| nome | TEXT | Nome completo |

### parlamentares
Deputados e senadores.

| Coluna | Tipo | Descricao |
|--------|------|-----------|
| id | TEXT | PK no formato `dep_XXXXX` ou `sen_XXXXX` |
| casa | TEXT | `camara` ou `senado` |
| id_externo | INTEGER | ID original da fonte |
| nome | TEXT | Nome parlamentar |
| cpf | TEXT | CPF (apenas deputados) |
| uf | TEXT | Estado |
| partido_id | INTEGER | FK para partidos |

### despesas
Registro de cada despesa (CEAP/CEAPS).

| Coluna | Tipo | Descricao |
|--------|------|-----------|
| id | TEXT | PK unico |
| parlamentar_id | TEXT | FK para parlamentares |
| ano, mes | INTEGER | Periodo da despesa |
| categoria | TEXT | Tipo de despesa |
| valor_centavos | INTEGER | Valor em centavos |
| fornecedor_nome | TEXT | Nome do fornecedor |
| fornecedor_documento | TEXT | CNPJ/CPF |
| url_documento | TEXT | Link do comprovante |

### sync_log
Controle de sincronizacao para auditoria.

## Indices

Indices criados para consultas frequentes:
- `idx_despesas_parlamentar` - Busca por parlamentar
- `idx_despesas_ano_mes` - Filtro por periodo
- `idx_despesas_categoria` - Filtro por categoria
- `idx_despesas_fornecedor_doc` - Busca por CNPJ/CPF

## Views

### vw_gastos_por_parlamentar
Total de gastos agrupado por parlamentar e ano.

### vw_gastos_por_categoria
Total de gastos agrupado por categoria e ano.

## Uso

```bash
# Criar banco
sqlite3 data/politicos.db < database/schema.sql

# Verificar estrutura
sqlite3 data/politicos.db ".schema"
```

## Decisoes de Design

1. **Valores em centavos**: Evita problemas de precisao com float
2. **IDs com prefixo**: Permite identificar a casa legislativa facilmente
3. **WAL mode**: Melhor performance para leitura concorrente
4. **Indices compostos**: Otimiza consultas de ranking

