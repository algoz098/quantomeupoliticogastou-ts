// Tipos base do dominio

export type Casa = 'camara' | 'senado';

export interface Partido {
  id: number;
  sigla: string;
  nome: string | null;
  created_at: string;
  updated_at: string;
}

export interface Parlamentar {
  id: string; // dep_XXXXX ou sen_XXXXX
  casa: Casa;
  id_externo: number;
  nome: string;
  nome_civil: string | null;
  cpf: string | null;
  uf: string | null;
  partido_id: number | null;
  sexo: string | null;
  data_nascimento: string | null;
  foto_url: string | null;
  email: string | null;
  created_at: string;
  updated_at: string;
}

export interface Despesa {
  id: string;
  parlamentar_id: string;
  id_externo: string;
  ano: number;
  mes: number;
  data: string | null;
  categoria: string;
  valor_centavos: number;
  fornecedor_nome: string | null;
  fornecedor_documento: string | null;
  documento_numero: string | null;
  documento_tipo: string | null;
  detalhamento: string | null;
  url_documento: string | null;
  fonte: Casa;
  created_at: string;
  updated_at: string;
}

export interface SyncLog {
  id: number;
  fonte: string;
  ano: number;
  registros_processados: number;
  registros_inseridos: number;
  registros_atualizados: number;
  status: 'running' | 'success' | 'error';
  erro: string | null;
  iniciado_em: string;
  finalizado_em: string | null;
}

// DTOs para API

export interface ParlamentarDTO {
  id: string;
  nome: string;
  casa: Casa;
  uf: string | null;
  partido: string | null;
  foto_url: string | null;
  total_despesas?: number;
  total_gasto?: number;
}

export interface DespesaDTO {
  id: string;
  parlamentar_id: string;
  parlamentar_nome?: string;
  ano: number;
  mes: number;
  data: string | null;
  categoria: string;
  valor: number; // Em reais
  fornecedor_nome: string | null;
  fornecedor_documento: string | null;
}

export interface GastosPorCategoriaDTO {
  categoria: string;
  total: number;
  quantidade: number;
}

export interface GastoMensalDTO {
  ano: number;
  mes: number;
  total: number;
  quantidade: number;
}

export interface ParlamentarDetalhadoDTO {
  id: string;
  nome: string;
  nome_civil: string | null;
  casa: Casa;
  uf: string | null;
  partido: string | null;
  foto_url: string | null;
  email: string | null;
  sexo: string | null;
  data_nascimento: string | null;
  total_despesas: number;
  total_gasto: number;
}

export interface RankingParlamentarDTO {
  posicao: number;
  parlamentar: ParlamentarDTO;
  total_gasto: number;
  total_despesas: number;
}

// Tipos para filtros de request
export interface ParlamentarFilters {
  nome?: string;
  casa?: Casa;
  uf?: string;
  partido?: string;
  limit?: number;
  offset?: number;
}

export interface DespesaFilters {
  ano?: number;
  mes?: number;
  categoria?: string;
  limit?: number;
  offset?: number;
}

export interface RankingFilters {
  casa?: Casa;
  uf?: string;
  limit?: number;
  ordem?: 'ASC' | 'DESC';
}

// Tipos para respostas paginadas
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page?: number;
  limit?: number;
}

