/**
 * Constantes compartilhadas da API
 */

// Valores padrao de paginacao
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;
export const DEFAULT_RANKING_LIMIT = 20;

// Casas legislativas validas
export const CASAS_VALIDAS = ['camara', 'senado'] as const;

// UFs validas
export const UFS_VALIDAS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
] as const;

// Limites de validacao
export const ANO_MINIMO = 2000;
export const ANO_MAXIMO = new Date().getFullYear() + 1;
export const MES_MINIMO = 1;
export const MES_MAXIMO = 12;

// Limites de tamanho de string
export const MAX_NOME_LENGTH = 200;
export const MAX_CATEGORIA_LENGTH = 150;
export const MAX_PARTIDO_LENGTH = 50;

// Cache TTL em segundos
export const CACHE_TTL_PARTIDOS = 300; // 5 minutos
export const CACHE_TTL_ESTATISTICAS = 120; // 2 minutos

