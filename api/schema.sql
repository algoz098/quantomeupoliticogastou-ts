-- Schema do Banco de Dados
-- Projeto: Quanto Meu Politico Gastou
-- Versao: 1.0
-- Data: 30/12/2025

-- Habilitar WAL mode para melhor performance
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

-- ============================================
-- TABELA: partidos
-- ============================================
CREATE TABLE IF NOT EXISTS partidos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sigla TEXT NOT NULL UNIQUE,
    nome TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- ============================================
-- TABELA: parlamentares
-- ============================================
CREATE TABLE IF NOT EXISTS parlamentares (
    id TEXT PRIMARY KEY,                    -- Formato: dep_XXXXX ou sen_XXXXX
    casa TEXT NOT NULL CHECK (casa IN ('camara', 'senado')),
    id_externo INTEGER NOT NULL,            -- numeroDeputadoID ou codSenador
    nome TEXT NOT NULL,
    nome_civil TEXT,
    cpf TEXT,                               -- Disponivel apenas para deputados
    uf TEXT,
    partido_id INTEGER REFERENCES partidos(id),
    sexo TEXT,
    data_nascimento TEXT,
    foto_url TEXT,
    email TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    UNIQUE(casa, id_externo)
);

-- ============================================
-- TABELA: despesas
-- ============================================
CREATE TABLE IF NOT EXISTS despesas (
    id TEXT PRIMARY KEY,                    -- Formato: dep_XXXXX_YYYYYYY ou sen_XXXXX
    parlamentar_id TEXT NOT NULL REFERENCES parlamentares(id),
    id_externo TEXT NOT NULL,               -- idDocumento (camara) ou id (senado)
    ano INTEGER NOT NULL,
    mes INTEGER NOT NULL,
    data TEXT,                              -- Data da despesa (YYYY-MM-DD)
    categoria TEXT NOT NULL,                -- descricao (camara) ou tipoDespesa (senado)
    valor_centavos INTEGER NOT NULL,        -- Valor em centavos para evitar float
    fornecedor_nome TEXT,
    fornecedor_documento TEXT,              -- CNPJ ou CPF
    documento_numero TEXT,
    documento_tipo TEXT,
    detalhamento TEXT,
    url_documento TEXT,                     -- URL do comprovante (apenas camara)
    fonte TEXT NOT NULL CHECK (fonte IN ('camara', 'senado')),
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    UNIQUE(fonte, id_externo)
);

-- ============================================
-- TABELA: sync_log (controle de sincronizacao)
-- ============================================
CREATE TABLE IF NOT EXISTS sync_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fonte TEXT NOT NULL,
    ano INTEGER NOT NULL,
    registros_processados INTEGER DEFAULT 0,
    registros_inseridos INTEGER DEFAULT 0,
    registros_atualizados INTEGER DEFAULT 0,
    status TEXT CHECK (status IN ('running', 'success', 'error')),
    erro TEXT,
    iniciado_em TEXT DEFAULT (datetime('now')),
    finalizado_em TEXT,
    UNIQUE(fonte, ano, iniciado_em)
);

-- ============================================
-- INDICES
-- ============================================

-- Indices para parlamentares
CREATE INDEX IF NOT EXISTS idx_parlamentares_casa ON parlamentares(casa);
CREATE INDEX IF NOT EXISTS idx_parlamentares_uf ON parlamentares(uf);
CREATE INDEX IF NOT EXISTS idx_parlamentares_partido ON parlamentares(partido_id);
CREATE INDEX IF NOT EXISTS idx_parlamentares_nome ON parlamentares(nome);

-- Indice para busca por sigla do partido
CREATE INDEX IF NOT EXISTS idx_partidos_sigla ON partidos(sigla);

-- Indices para despesas (consultas frequentes)
CREATE INDEX IF NOT EXISTS idx_despesas_parlamentar ON despesas(parlamentar_id);
CREATE INDEX IF NOT EXISTS idx_despesas_ano_mes ON despesas(ano, mes);
CREATE INDEX IF NOT EXISTS idx_despesas_categoria ON despesas(categoria);
CREATE INDEX IF NOT EXISTS idx_despesas_fornecedor_doc ON despesas(fornecedor_documento);
CREATE INDEX IF NOT EXISTS idx_despesas_fornecedor_nome ON despesas(fornecedor_nome);
CREATE INDEX IF NOT EXISTS idx_despesas_data ON despesas(data);
CREATE INDEX IF NOT EXISTS idx_despesas_fonte ON despesas(fonte);

-- Indice composto para consultas de ranking
CREATE INDEX IF NOT EXISTS idx_despesas_parlamentar_ano ON despesas(parlamentar_id, ano);

-- Indice composto para consultas de despesas por parlamentar, ano e mes
CREATE INDEX IF NOT EXISTS idx_despesas_parlamentar_ano_mes ON despesas(parlamentar_id, ano, mes);

-- Indice para ordenacao por valor (ranking de maiores/menores gastadores)
CREATE INDEX IF NOT EXISTS idx_despesas_valor ON despesas(valor_centavos);

-- Indice composto para consultas de despesas por ano e categoria
CREATE INDEX IF NOT EXISTS idx_despesas_ano_categoria ON despesas(ano, categoria);

-- Indice para busca por nome de parlamentar (LIKE)
CREATE INDEX IF NOT EXISTS idx_parlamentares_nome_collate ON parlamentares(nome COLLATE NOCASE);

-- ============================================
-- VIEWS (consultas prontas)
-- ============================================

-- View: Total de gastos por parlamentar no ano
CREATE VIEW IF NOT EXISTS vw_gastos_por_parlamentar AS
SELECT 
    p.id,
    p.nome,
    p.casa,
    p.uf,
    pa.sigla as partido,
    d.ano,
    SUM(d.valor_centavos) / 100.0 as total_gasto,
    COUNT(*) as total_despesas
FROM parlamentares p
JOIN despesas d ON d.parlamentar_id = p.id
LEFT JOIN partidos pa ON pa.id = p.partido_id
GROUP BY p.id, d.ano;

-- View: Total de gastos por categoria
CREATE VIEW IF NOT EXISTS vw_gastos_por_categoria AS
SELECT 
    d.categoria,
    d.ano,
    SUM(d.valor_centavos) / 100.0 as total_gasto,
    COUNT(*) as total_despesas,
    COUNT(DISTINCT d.parlamentar_id) as total_parlamentares
FROM despesas d
GROUP BY d.categoria, d.ano;

