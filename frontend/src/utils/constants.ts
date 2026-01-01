/**
 * Ano atual - centralizado para consistencia
 */
export const ANO_ATUAL = new Date().getFullYear();

/**
 * Lista de UFs brasileiras
 */
export const UF_LIST = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG',
  'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
] as const;

export type UF = typeof UF_LIST[number];

/**
 * Opcoes de UF para selects
 */
export const UF_OPTIONS = UF_LIST.map(uf => ({ label: uf, value: uf }));

/**
 * Opcoes de Casa legislativa (sem opcao nula)
 */
export const CASA_OPTIONS = [
  { label: 'Camara', value: 'camara' },
  { label: 'Senado', value: 'senado' },
] as const;

export type CasaOptionValue = (typeof CASA_OPTIONS)[number]['value'];

/**
 * Opcoes de Casa legislativa com opcao "Todas"
 */
export const CASA_OPTIONS_WITH_ALL = [
  { label: 'Todas', value: null },
  { label: 'Camara dos Deputados', value: 'camara' },
  { label: 'Senado Federal', value: 'senado' },
] as const;

export type CasaOptionWithAllValue = (typeof CASA_OPTIONS_WITH_ALL)[number]['value'];

/**
 * Gera lista de anos a partir do ano atual
 */
export function getAnoOptions(count = 6): { label: string; value: number }[] {
  const anoAtual = new Date().getFullYear();
  return Array.from({ length: count }, (_, i) => anoAtual - i)
    .map(a => ({ label: String(a), value: a }));
}

