/**
 * Tipo para casa legislativa
 */
export type Casa = 'camara' | 'senado';

export interface Partido {
  id: number;
  sigla: string;
  nome: string | null;
}

export interface Parlamentar {
  id: string;
  nome: string;
  casa: Casa;
  uf: string | null;
  foto_url: string | null;
  partido: string | null;
}

export interface ParlamentarDetalhado extends Parlamentar {
  nome_civil: string | null;
  email: string | null;
  sexo: string | null;
  data_nascimento: string | null;
  total_despesas: number;
  total_gasto: number;
}

export interface Despesa {
  id: string;
  parlamentar_id: string;
  ano: number;
  mes: number;
  data: string | null;
  categoria: string;
  valor: number;
  fornecedor_nome: string | null;
  fornecedor_documento: string | null;
}

export interface RankingItem {
  posicao: number;
  parlamentar: Parlamentar;
  total_despesas: number;
  total_gasto: number;
}

export interface CategoriaGasto {
  categoria: string;
  total: number;
  quantidade: number;
}

export interface GastoMensal {
  ano: number;
  mes: number;
  total: number;
  quantidade: number;
}

export interface Estatisticas {
  total_parlamentares: number;
  total_despesas: number;
  valor_total: number;
  anos_disponiveis: number[];
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page?: number;
  limit?: number;
}

