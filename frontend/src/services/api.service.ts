import { api } from 'src/boot/axios';
import type { AxiosRequestConfig } from 'axios';
import type {
  Casa,
  Parlamentar,
  ParlamentarDetalhado,
  Despesa,
  RankingItem,
  CategoriaGasto,
  GastoMensal,
  Estatisticas,
  Partido,
  PaginatedResponse,
} from 'src/types/api';

export interface ParlamentaresParams {
  casa?: Casa | undefined;
  uf?: string | undefined;
  partido?: string | undefined;
  nome?: string | undefined;
  page?: number | undefined;
  limit?: number | undefined;
}

export interface DespesasParams {
  parlamentar_id?: string | undefined;
  ano?: number | undefined;
  mes?: number | undefined;
  categoria?: string | undefined;
  page?: number | undefined;
  limit?: number | undefined;
}

export interface RankingParams {
  ano?: number | undefined;
  casa?: Casa | undefined;
  uf?: string | undefined;
  limit?: number | undefined;
  ordem?: 'ASC' | 'DESC' | undefined;
}

export const apiService = {
  // Parlamentares
  async getParlamentares(params?: ParlamentaresParams, config?: AxiosRequestConfig): Promise<PaginatedResponse<Parlamentar>> {
    const { data } = await api.get('/parlamentares', { params, ...config });
    return data;
  },

  async getParlamentar(id: string, config?: AxiosRequestConfig): Promise<{ data: ParlamentarDetalhado }> {
    const response = await api.get(`/parlamentares/${id}`, config);
    return response.data;
  },

  async getParlamentarCategorias(id: string, ano?: number, config?: AxiosRequestConfig): Promise<PaginatedResponse<CategoriaGasto>> {
    const { data } = await api.get(`/parlamentares/${id}/categorias`, { params: { ano }, ...config });
    return data;
  },

  async getParlamentarGastosMensais(id: string, ano?: number, config?: AxiosRequestConfig): Promise<PaginatedResponse<GastoMensal>> {
    const { data } = await api.get(`/parlamentares/${id}/mensal`, { params: { ano }, ...config });
    return data;
  },

  async getParlamentarDespesas(id: string, filters?: { ano?: number; mes?: number; categoria?: string; page?: number; limit?: number }, config?: AxiosRequestConfig): Promise<PaginatedResponse<Despesa>> {
    const { data } = await api.get(`/parlamentares/${id}/despesas`, { params: filters, ...config });
    return data;
  },

  // Despesas
  async getDespesas(params?: DespesasParams): Promise<PaginatedResponse<Despesa>> {
    const { data } = await api.get('/despesas', { params });
    return data;
  },

  async getRanking(params?: RankingParams, config?: AxiosRequestConfig): Promise<PaginatedResponse<RankingItem>> {
    const { data } = await api.get('/despesas/ranking', { params, ...config });
    return data;
  },

  async getCategorias(ano?: number, casa?: Casa, config?: AxiosRequestConfig): Promise<PaginatedResponse<CategoriaGasto>> {
    const { data } = await api.get('/despesas/categorias', { params: { ano, casa }, ...config });
    return data;
  },

  async getGastosMensais(ano?: number, casa?: Casa, config?: AxiosRequestConfig): Promise<PaginatedResponse<GastoMensal>> {
    const { data } = await api.get('/despesas/mensal', { params: { ano, casa }, ...config });
    return data;
  },

  async getEstatisticas(casa?: Casa, config?: AxiosRequestConfig): Promise<Estatisticas> {
    const { data } = await api.get('/despesas/stats', { params: { casa }, ...config });
    return data;
  },

  // Partidos
  async getPartidos(config?: AxiosRequestConfig): Promise<PaginatedResponse<Partido>> {
    const { data } = await api.get('/partidos', config);
    return data;
  },
};

