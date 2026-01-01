/**
 * Cache simples em memoria com TTL
 * Inclui limpeza periodica de entradas expiradas para evitar memory leak
 */
export class SimpleCache<T> {
  private cache = new Map<string, { value: T; expiresAt: number }>();
  private defaultTtlMs: number;
  private cleanupInterval: ReturnType<typeof setInterval> | null = null;

  /**
   * Cria uma nova instancia de cache
   * @param defaultTtlSeconds - Tempo de vida padrao em segundos (default: 300)
   * @param cleanupIntervalSeconds - Intervalo de limpeza em segundos (default: 60)
   */
  constructor(defaultTtlSeconds = 300, cleanupIntervalSeconds = 60) {
    this.defaultTtlMs = defaultTtlSeconds * 1000;
    // Iniciar limpeza periodica
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, cleanupIntervalSeconds * 1000);
  }

  /**
   * Remove entradas expiradas do cache
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Para a limpeza periodica (chamar ao encerrar aplicacao)
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.cache.clear();
  }

  /**
   * Obter valor do cache
   */
  get(key: string): T | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return undefined;
    }

    return entry.value;
  }

  /**
   * Armazenar valor no cache
   */
  set(key: string, value: T, ttlSeconds?: number): void {
    const ttlMs = ttlSeconds ? ttlSeconds * 1000 : this.defaultTtlMs;
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + ttlMs,
    });
  }

  /**
   * Verificar se chave existe e nao expirou
   */
  has(key: string): boolean {
    return this.get(key) !== undefined;
  }

  /**
   * Remover chave do cache
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Limpar todo o cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Verifica se a chave existe no cache (mesmo que o valor seja undefined)
   */
  exists(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Obter ou computar valor
   * Se nao existir no cache, executa fn e armazena resultado
   * Usa exists() para diferenciar "nao existe" de "valor e undefined"
   */
  getOrSet(key: string, fn: () => T, ttlSeconds?: number): T {
    if (this.exists(key)) {
      return this.cache.get(key)!.value;
    }

    const value = fn();
    this.set(key, value, ttlSeconds);
    return value;
  }
}

// Instancias de cache por tipo de dado
export const partidosCache = new SimpleCache<unknown>(1800); // 30 minutos - partidos raramente mudam
export const estatisticasCache = new SimpleCache<unknown>(120); // 2 minutos
export const parlamentarStatsCache = new SimpleCache<unknown>(120); // 2 minutos - categorias e gastos mensais

// Lista de todos os caches para destruir no shutdown
const allCaches: SimpleCache<unknown>[] = [partidosCache, estatisticasCache, parlamentarStatsCache];

/**
 * Destroi todos os caches (chamar no graceful shutdown)
 */
export function destroyAllCaches(): void {
  for (const cache of allCaches) {
    cache.destroy();
  }
}

