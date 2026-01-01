import { Notify } from 'quasar';

export function notifyError(message: string): void {
  Notify.create({
    type: 'negative',
    message,
    position: 'top',
    timeout: 5000,
    actions: [{ icon: 'close', color: 'white' }],
  });
}

export function notifySuccess(message: string): void {
  Notify.create({
    type: 'positive',
    message,
    position: 'top',
    timeout: 3000,
  });
}

export function notifyWarning(message: string): void {
  Notify.create({
    type: 'warning',
    message,
    position: 'top',
    timeout: 4000,
  });
}

export function notifyInfo(message: string): void {
  Notify.create({
    type: 'info',
    message,
    position: 'top',
    timeout: 2000,
  });
}

/**
 * Extrai mensagem de erro de resposta da API ou excecao
 */
export function extractErrorMessage(error: unknown, fallback: string): string {
  if (!error) return fallback;

  // Axios error com resposta da API
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = (error as { response?: { data?: { error?: string; message?: string }; status?: number } }).response;
    if (response?.data?.error) {
      return response.data.error;
    }
    if (response?.data?.message) {
      return response.data.message;
    }
    // Mensagem baseada no status HTTP
    if (response?.status === 404) {
      return 'Recurso nao encontrado';
    }
    if (response?.status === 429) {
      return 'Muitas requisicoes. Aguarde um momento.';
    }
    if (response?.status && response.status >= 500) {
      return 'Erro no servidor. Tente novamente mais tarde.';
    }
  }

  // Error padrao
  if (error instanceof Error) {
    return error.message || fallback;
  }

  return fallback;
}

/**
 * Wrapper para chamadas de API com tratamento de erro
 */
export async function withErrorHandling<T>(
  fn: () => Promise<T>,
  errorMessage = 'Erro ao carregar dados'
): Promise<T | null> {
  try {
    return await fn();
  } catch (error) {
    const message = extractErrorMessage(error, errorMessage);
    console.error(errorMessage, error);
    notifyError(message);
    return null;
  }
}

