import type { AxiosRequestConfig } from 'axios';

/**
 * Gerencia requisicoes que podem ser canceladas
 * Util para evitar race conditions quando usuario muda filtros rapidamente
 */
export class AbortableRequest {
  private controller: AbortController | null = null;

  /**
   * Cancela requisicao anterior se existir
   */
  abort(): void {
    if (this.controller) {
      this.controller.abort();
      this.controller = null;
    }
  }

  /**
   * Retorna config do axios com signal para cancelamento
   * Automaticamente cancela requisicao anterior
   */
  getConfig(): AxiosRequestConfig {
    this.abort();
    this.controller = new AbortController();
    return { signal: this.controller.signal };
  }

  /**
   * Verifica se o erro foi causado por cancelamento
   */
  static isAbortError(error: unknown): boolean {
    return error instanceof Error && error.name === 'CanceledError';
  }
}

