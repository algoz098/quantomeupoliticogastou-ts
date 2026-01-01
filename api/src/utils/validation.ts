/**
 * Limites de ano para consultas
 */
const ANO_MINIMO = 2000;
const ANO_MAXIMO = new Date().getFullYear() + 1;

/**
 * Valida e converte um parametro para numero inteiro positivo
 * Retorna undefined se invalido ou nao fornecido
 */
export function parsePositiveInt(value: unknown, defaultValue?: number): number | undefined {
  if (value === undefined || value === null || value === '') {
    return defaultValue;
  }
  const num = Number(value);
  if (isNaN(num) || !Number.isInteger(num) || num < 0) {
    return defaultValue;
  }
  return num;
}

/**
 * Valida e converte um parametro de ano
 * Retorna undefined se invalido ou fora do range permitido
 */
export function parseAno(value: unknown, defaultValue?: number): number | undefined {
  const num = parsePositiveInt(value, defaultValue);
  if (num === undefined) return defaultValue;
  if (num < ANO_MINIMO || num > ANO_MAXIMO) {
    return defaultValue;
  }
  return num;
}

/**
 * Valida e converte um parametro para numero inteiro positivo
 * Retorna o defaultValue se invalido
 */
export function parsePositiveIntRequired(value: unknown, defaultValue: number): number {
  const result = parsePositiveInt(value, defaultValue);
  return result ?? defaultValue;
}

/**
 * Valida se o valor esta em um conjunto permitido
 */
export function parseEnum<T extends string>(value: unknown, allowedValues: readonly T[], defaultValue?: T): T | undefined {
  if (value === undefined || value === null || value === '') {
    return defaultValue;
  }
  if (typeof value === 'string' && allowedValues.includes(value as T)) {
    return value as T;
  }
  return defaultValue;
}

/**
 * Valida e converte um parametro de mes (1-12)
 * Retorna undefined se invalido ou fora do range permitido
 */
export function parseMes(value: unknown, defaultValue?: number): number | undefined {
  const num = parsePositiveInt(value, defaultValue);
  if (num === undefined) return defaultValue;
  if (num < 1 || num > 12) {
    return defaultValue;
  }
  return num;
}

/**
 * Valida ID de parlamentar (dep_XXXXX ou sen_XXXXX)
 * Retorna o ID sanitizado ou lanca erro se invalido
 */
export function validateParlamentarId(id: string): string {
  if (!id || typeof id !== 'string') {
    throw new Error('ID de parlamentar invalido');
  }
  // IDs validos: dep_XXXXX ou sen_XXXXX (X = digitos)
  const pattern = /^(dep|sen)_\d+$/;
  if (!pattern.test(id)) {
    throw new Error('ID de parlamentar invalido');
  }
  // Limitar tamanho maximo
  if (id.length > 20) {
    throw new Error('ID de parlamentar invalido');
  }
  return id;
}

/**
 * Limite maximo para paginacao para evitar sobrecarga
 */
export const MAX_LIMIT = 500;

/**
 * Valida parametros de paginacao
 */
export function parsePagination(query: { page?: unknown; limit?: unknown }, defaults = { page: 1, limit: 20 }): { page: number; limit: number; offset: number } {
  const page = parsePositiveIntRequired(query.page, defaults.page);
  let limit = parsePositiveIntRequired(query.limit, defaults.limit);
  // Aplicar limite maximo para evitar sobrecarga
  limit = Math.min(limit, MAX_LIMIT);
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

/**
 * Lista de UFs validas
 */
const UF_LIST = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG',
  'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
] as const;

export type UF = typeof UF_LIST[number];

/**
 * Valida se o valor e uma UF valida
 */
export function parseUF(value: unknown): UF | undefined {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }
  const upper = String(value).toUpperCase();
  if (UF_LIST.includes(upper as UF)) {
    return upper as UF;
  }
  return undefined;
}

/**
 * Escapa caracteres especiais do LIKE para evitar SQL injection
 * Caracteres % e _ tem significado especial no LIKE
 */
export function escapeLikePattern(value: string): string {
  return value
    .replace(/\\/g, '\\\\')  // Escape backslash first
    .replace(/%/g, '\\%')    // Escape %
    .replace(/_/g, '\\_');   // Escape _
}

/**
 * Sanitiza string para uso seguro em queries
 */
export function sanitizeString(value: unknown, maxLength = 200): string | undefined {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }
  // Remover caracteres de controle e limitar tamanho
  // eslint-disable-next-line no-control-regex
  const controlCharsRegex = /[\x00-\x1F\x7F]/g;
  return String(value)
    .replace(controlCharsRegex, '')
    .slice(0, maxLength)
    .trim() || undefined;
}

/**
 * Sanitiza categoria de despesa para uso seguro
 * Limita tamanho e remove caracteres especiais
 */
export function sanitizeCategoria(value: unknown, maxLength = 150): string | undefined {
  return sanitizeString(value, maxLength);
}

/**
 * Mascara CPF para exibicao publica
 * Ex: 123.456.789-00 -> ***.456.789-**
 */
export function maskCpf(cpf: string | null | undefined): string | null {
  if (!cpf) return null;

  // Remove caracteres nao numericos
  const numbers = cpf.replace(/\D/g, '');

  if (numbers.length !== 11) {
    // CPF invalido, retornar completamente mascarado
    return '***.***.***-**';
  }

  // Mascara primeiros 3 e ultimos 2 digitos
  return `***.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-**`;
}

/**
 * Remove campos sensiveis de um objeto
 */
export function removeSensitiveFields<T extends object, K extends keyof T>(
  obj: T,
  fields: K[]
): Omit<T, K> {
  const result = { ...obj } as Omit<T, K>;
  for (const field of fields) {
    delete (result as Record<string, unknown>)[field as string];
  }
  return result;
}

