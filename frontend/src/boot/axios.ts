import { defineBoot } from '#q-app/wrappers';
import axios, { type AxiosInstance, type AxiosError } from 'axios';

declare module 'vue' {
  interface ComponentCustomProperties {
    $axios: AxiosInstance;
    $api: AxiosInstance;
  }
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 15000, // 15 segundos - timeout mais razoavel
});

// Interceptor de resposta para tratamento global de erros
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Nao logar erros de cancelamento
    if (axios.isCancel(error)) {
      return Promise.reject(error);
    }

    const status = error.response?.status;

    // Log do erro (em producao, pode enviar para servico de monitoramento)
    console.error(`[API Error] ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
      status,
      message: error.message,
    });

    // Tratar erros especificos
    if (status === 401) {
      // Token expirado ou nao autorizado - pode redirecionar para login
      console.warn('Sessao expirada ou nao autorizada');
    } else if (status === 403) {
      console.warn('Acesso negado');
    } else if (status === 429) {
      console.warn('Muitas requisicoes - rate limit atingido');
    } else if (status && status >= 500) {
      console.error('Erro interno do servidor');
    }

    return Promise.reject(error);
  }
);

export default defineBoot(({ app }) => {
  app.config.globalProperties.$axios = axios;
  app.config.globalProperties.$api = api;
});

export { api };
