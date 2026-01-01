# Analise de Volume de Dados

**Data da analise**: 30/12/2025

## Dados Coletados (Fontes Reais)

### Camara dos Deputados (CEAP)

| Ano | Registros | Tamanho JSON | Observacao |
|-----|-----------|--------------|------------|
| 2024 | 231.764 | 246 MB | Ano completo |
| 2025 | 198.819 | 213 MB | Ano incompleto |

**Media**: ~232.000 registros/ano
**Tamanho medio por registro**: ~1.06 KB (JSON)

### Senado Federal (CEAPS)

| Ano | Registros | Tamanho JSON | Observacao |
|-----|-----------|--------------|------------|
| 2022 | 16.805 | - | Ano completo |
| 2023 | 18.824 | - | Ano completo |
| 2024 | 21.446 | 9.1 MB | Ano completo |
| 2025 | 22.362 | - | Ano incompleto |

**Media**: ~20.000 registros/ano (crescimento de ~15% ao ano)
**Tamanho medio por registro**: ~0.42 KB (JSON)

## Volume Total Estimado

### Por Ano

| Fonte | Registros | % do Total |
|-------|-----------|------------|
| Camara | ~232.000 | 92% |
| Senado | ~22.000 | 8% |
| **Total** | **~254.000** | 100% |

### Tamanho no Banco de Dados

Considerando normalizacao e remocao de overhead JSON:

| Metrica | Valor |
|---------|-------|
| Tamanho medio por registro | ~400 bytes |
| Registros por ano | ~254.000 |
| **Tamanho por ano** | **~100 MB** |

## Projecoes

| Periodo | Registros | Tamanho DB | Tamanho com Indices |
|---------|-----------|------------|---------------------|
| 1 ano | 254.000 | ~100 MB | ~150 MB |
| 5 anos | 1.270.000 | ~500 MB | ~750 MB |
| 10 anos | 2.540.000 | ~1 GB | ~1.5 GB |

## Comparacao com Limites do SQLite

| Limite SQLite | Valor | Nosso Uso (10 anos) | Margem |
|---------------|-------|---------------------|--------|
| Tamanho maximo | 281 TB | ~1.5 GB | 99.99% |
| Linhas maximas | 2^64 | 2.5M | 99.99% |
| Performance otima | 10-50 GB | ~1.5 GB | OK |

## Conclusao

**SQLite e perfeitamente adequado para este projeto.**

Razoes:
1. Volume anual de ~254.000 registros e trivial
2. Mesmo com 10 anos de historico, o banco ficaria em ~1.5 GB
3. Indices simples sao suficientes para as consultas esperadas
4. Nao ha necessidade de banco distribuido ou mais complexo

### Recomendacoes

1. Criar indices para campos frequentemente consultados:
   - `parlamentar_id`
   - `ano`, `mes`
   - `categoria`
   - `fornecedor_documento`

2. Usar WAL mode para melhor performance de escrita

3. Considerar VACUUM periodico para manter performance

## Metodologia

Dados obtidos em 30/12/2025 via:
- Camara: `https://www.camara.leg.br/cotas/Ano-{ano}.json.zip`
- Senado: `https://adm.senado.gov.br/adm-dadosabertos/api/v1/senadores/despesas_ceaps/{ano}`

