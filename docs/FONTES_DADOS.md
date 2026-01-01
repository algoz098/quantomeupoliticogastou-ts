# Fontes de Dados - Detalhamento Tecnico

**Status**: Estrutura de dados CONFIRMADA em 30/12/2025

## 1. Camara dos Deputados - CEAP

### API RESTful

**Base URL**: `https://dadosabertos.camara.leg.br/api/v2`

#### Endpoints de Deputados

```
GET /deputados
GET /deputados/{id}
GET /deputados/{id}/despesas
GET /deputados/{id}/eventos
GET /deputados/{id}/frentes
GET /deputados/{id}/orgaos
```

#### Parametros de despesas

- `idLegislatura`: Numero da legislatura
- `ano`: Ano da despesa
- `mes`: Mes da despesa
- `cnpjCpfFornecedor`: CNPJ ou CPF do fornecedor
- `ordem`: ASC ou DESC
- `ordenarPor`: Campo para ordenacao

### Download de Arquivos (Bulk) - RECOMENDADO

**URL Pattern**: `https://www.camara.leg.br/cotas/Ano-{ano}.{formato}[.zip]`

**Formatos disponiveis**:
- `json` (comprimido em .zip) - RECOMENDADO
- `csv` (comprimido em .zip)
- `xml` (comprimido em .zip)
- `xlsx` (Excel)
- `ods` (OpenOffice)

**Anos disponiveis**: 2008 a 2025

### Estrutura de Dados CONFIRMADA (CEAP)

Campos extraidos do arquivo `Ano-2024.json` (verificado em 30/12/2025, dados 2025 disponiveis):

| Campo | Tipo | Exemplo | Descricao |
|-------|------|---------|-----------|
| nomeParlamentar | string | "CARLOS VIANA" | Nome do parlamentar |
| cpf | string | "" | CPF (pode estar vazio) |
| numeroCarteiraParlamentar | string | "" | Numero da carteira |
| legislatura | number | 2023 | Ano da legislatura |
| siglaUF | string | "NA", "SP" | Sigla do estado |
| siglaPartido | string | "PT", "PL" | Sigla do partido |
| codigoLegislatura | number | 57 | Codigo da legislatura |
| numeroSubCota | number | 1 | Codigo da categoria |
| descricao | string | "MANUTENCAO DE ESCRITORIO..." | Descricao da categoria |
| numeroEspecificacaoSubCota | number | 0 | Subcategoria |
| descricaoEspecificacao | string | "" | Descricao subcategoria |
| fornecedor | string | "AUTO POSTO XYZ" | Nome do fornecedor |
| cnpjCPF | string | "04.392.497/0001-91" | CNPJ/CPF do fornecedor |
| numero | string | "102697" | Numero do documento |
| tipoDocumento | string | "0" | Tipo do documento |
| dataEmissao | string | "2024-02-07T00:00:00" | Data de emissao (ISO) |
| valorDocumento | string | "1148.7" | Valor do documento |
| valorGlosa | string | "0" | Valor glosado |
| valorLiquido | string | "1148.7" | Valor liquido |
| mes | number | 2 | Mes da despesa |
| ano | number | 2024 | Ano da despesa |
| parcela | number | 0 | Numero da parcela |
| passageiro | string | "" | Nome do passageiro |
| trecho | string | "" | Trecho da viagem |
| lote | string | "2018065" | Numero do lote |
| ressarcimento | string | "" | Numero do ressarcimento |
| datPagamentoRestituicao | string | "" | Data pagamento restituicao |
| restituicao | string | "" | Valor de restituicao |
| numeroDeputadoID | number | 2812 | ID do deputado |
| idDocumento | number | 7696122 | ID do documento |
| urlDocumento | string | "https://..." | URL do comprovante PDF |

**Observacoes**:
- Valores monetarios vem como string, precisam ser convertidos
- Data vem em formato ISO com timezone
- Alguns campos podem estar vazios (cpf, passageiro, trecho)

## 2. Senado Federal - CEAPS

### API de Dados Abertos - CONFIRMADA

**Base URL**: `https://adm.senado.gov.br/adm-dadosabertos`

**Swagger**: `https://adm.senado.gov.br/adm-dadosabertos/swagger-ui/index.html`

#### Endpoints CEAPS

```
GET /api/v1/senadores/despesas_ceaps/{ano}        # JSON
GET /api/v1/senadores/despesas_ceaps/{ano}/csv    # CSV
```

**Anos disponiveis**: 2008 a 2025 (confirmado)

### Estrutura de Dados CONFIRMADA (CEAPS)

Campos extraidos da API em 30/12/2025 (dados 2025 disponiveis):

| Campo | Tipo | Exemplo | Descricao |
|-------|------|---------|-----------|
| id | number | 2233118 | ID unico da despesa |
| tipoDocumento | string | "Nota Fiscal Eletronica" | Tipo do documento |
| ano | number | 2024 | Ano da despesa |
| mes | number | 6 | Mes da despesa |
| codSenador | number | 5990 | Codigo do senador |
| nomeSenador | string | "CARLOS VIANA" | Nome do senador |
| tipoDespesa | string | "Locomocao, hospedagem..." | Categoria da despesa |
| cpfCnpj | string | "04.392.497/0001-91" | CNPJ/CPF do fornecedor |
| fornecedor | string | "AUTO POSTO XYZ" | Nome do fornecedor |
| documento | string | "102697" | Numero do documento |
| data | string | "2024-06-27" | Data da despesa (YYYY-MM-DD) |
| detalhamento | string/null | "Abastecimento..." | Detalhes adicionais |
| valorReembolsado | number | 135.62 | Valor reembolsado |

**Observacoes**:
- Valores ja vem como number
- Data em formato simples YYYY-MM-DD
- `detalhamento` pode ser null
- API bem documentada com Swagger

### Outros Endpoints Uteis do Senado (adm-dadosabertos)

```
GET /api/v1/senadores/escritorios           # Escritorios de apoio
GET /api/v1/senadores/auxilio-moradia       # Auxilio moradia
GET /api/v1/senadores/aposentados           # Senadores aposentados
```

## 3. APIs de Dados de Parlamentares - CONFIRMADAS

### Camara - API de Deputados

**Base URL**: `https://dadosabertos.camara.leg.br/api/v2`

**Endpoints**:
```
GET /deputados                    # Lista deputados em exercicio
GET /deputados/{id}               # Detalhes completos do deputado
```

**Estrutura do Deputado** (GET /deputados/{id}):

| Campo | Tipo | Exemplo | Descricao |
|-------|------|---------|-----------|
| id | number | 204379 | ID unico (= numeroDeputadoID das despesas) |
| nomeCivil | string | "ACACIO DA SILVA..." | Nome civil completo |
| cpf | string | "74287028287" | CPF do deputado |
| sexo | string | "M" | Sexo |
| dataNascimento | string | "1983-09-28" | Data de nascimento |
| ufNascimento | string | "AP" | UF de nascimento |
| ultimoStatus.nome | string | "Acacio Favacho" | Nome parlamentar |
| ultimoStatus.siglaPartido | string | "MDB" | Partido atual |
| ultimoStatus.siglaUf | string | "AP" | UF do mandato |
| ultimoStatus.urlFoto | string | "https://..." | URL da foto |
| ultimoStatus.email | string | "dep.xxx@camara..." | Email |
| ultimoStatus.gabinete | object | {...} | Dados do gabinete |

### Senado - API Legislativa

**Base URL**: `https://legis.senado.leg.br/dadosabertos`

**Endpoints**:
```
GET /senador/lista/atual          # Lista senadores em exercicio
GET /senador/{codigo}             # Detalhes completos do senador
```

**Estrutura do Senador** (GET /senador/{codigo}):

| Campo | Tipo | Exemplo | Descricao |
|-------|------|---------|-----------|
| CodigoParlamentar | string | "5672" | ID unico (= codSenador das despesas) |
| NomeParlamentar | string | "Alan Rick" | Nome parlamentar |
| NomeCompletoParlamentar | string | "Alan Rick Miranda" | Nome completo |
| SexoParlamentar | string | "Masculino" | Sexo |
| UrlFotoParlamentar | string | "http://..." | URL da foto |
| EmailParlamentar | string | "sen.xxx@senado..." | Email |
| SiglaPartidoParlamentar | string | "REPUBLICANOS" | Partido atual |
| UfParlamentar | string | "AC" | UF do mandato |
| DataNascimento | string | "1976-10-23" | Data de nascimento |

**Observacao**: CPF dos senadores NAO esta disponivel na API publica.

## 4. Identificacao Unica de Parlamentares - DEFINIDA

| Casa | ID Primario | CPF Disponivel | Estrategia |
|------|-------------|----------------|------------|
| Camara | `id` (API) = `numeroDeputadoID` (despesas) | Sim | Usar ID como PK |
| Senado | `CodigoParlamentar` (API) = `codSenador` (despesas) | Nao | Usar ID como PK |

**Formato unificado recomendado**: `{casa}_{id}` (ex: `dep_204379`, `sen_5672`)

## 5. Portal da Transparencia (Futuro)

### API de Emendas Parlamentares

**Base URL**: `https://api.portaldatransparencia.gov.br`

**Endpoint**: `GET /api-de-dados/emendas`

**Autenticacao**: Requer cadastro e chave de API

**Status**: A ser implementado em fase posterior

## Consideracoes de Implementacao

### Rate Limiting

- Camara: Nao documentado explicitamente (usar 5 req/seg como seguranca)
- Senado: 10 req/seg (documentado)
- Portal Transparencia: Verificar documentacao

### Estrategia de Coleta Recomendada

1. **Carga inicial**:
   - Camara: Download JSON em lote (Ano-{ano}.json.zip)
   - Senado: API `/api/v1/senadores/despesas_ceaps/{ano}`

2. **Atualizacao incremental**:
   - Usar API para buscar novos registros do mes corrente
   - Comparar IDs para evitar duplicatas

3. **Validacao**:
   - Comparar totais com fonte oficial
   - Verificar integridade dos dados

### Tratamento de Dados

- Normalizar nomes (remover acentos, caixa alta)
- Validar CNPJ/CPF (formato e digitos verificadores)
- Converter valores monetarios para centavos (evitar float)
- Padronizar datas para ISO 8601 (YYYY-MM-DD)
- Tratar campos nulos/vazios

### Mapeamento Unificado

Para unificar dados de Camara e Senado:

| Campo Unificado | Camara | Senado |
|-----------------|--------|--------|
| id | idDocumento | id |
| parlamentar_id | numeroDeputadoID | codSenador |
| parlamentar_nome | nomeParlamentar | nomeSenador |
| partido | siglaPartido | (buscar via API) |
| uf | siglaUF | (buscar via API) |
| ano | ano | ano |
| mes | mes | mes |
| categoria | descricao | tipoDespesa |
| fornecedor_nome | fornecedor | fornecedor |
| fornecedor_documento | cnpjCPF | cpfCnpj |
| documento_numero | numero | documento |
| documento_tipo | tipoDocumento | tipoDocumento |
| data | dataEmissao | data |
| valor | valorLiquido | valorReembolsado |
| detalhamento | - | detalhamento |
| url_comprovante | urlDocumento | - |
