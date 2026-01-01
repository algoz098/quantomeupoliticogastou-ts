/**
 * Formata valor monetario em BRL
 */
export function formatCurrency(value: number, compact = false): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    ...(compact ? { notation: 'compact' } : {}),
  }).format(value);
}

/**
 * Formata numero com separadores de milhar
 */
export function formatNumber(value: number, compact = false): string {
  return new Intl.NumberFormat('pt-BR', {
    ...(compact ? { notation: 'compact' } : {}),
  }).format(value);
}

/**
 * Formata data ISO para formato brasileiro
 */
export function formatDate(date: string | null | undefined): string {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('pt-BR');
}

/**
 * Retorna nome abreviado do mes
 */
export function getMesNome(mes: number): string {
  const meses = ['', 'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  return meses[mes] || '';
}

/**
 * Handler para erro de carregamento de imagem
 * Esconde a imagem quando falha ao carregar
 */
export function handleImageError(event: Event): void {
  const img = event.target as HTMLImageElement;
  img.style.display = 'none';
}

interface FilterValues {
  nome?: string | null;
  ano?: number | null;
  casa?: string | null;
  uf?: string | null;
  partido?: string | null;
}

/**
 * Gera mensagem de filtros vazios para exibicao
 */
export function buildEmptyMessage(filters: FilterValues): string {
  const parts: string[] = [];

  if (filters.nome) parts.push(`nome "${filters.nome}"`);
  if (filters.ano) parts.push(`ano ${String(filters.ano)}`);
  if (filters.casa) parts.push(filters.casa === 'camara' ? 'Camara' : 'Senado');
  if (filters.uf) parts.push(`UF ${filters.uf}`);
  if (filters.partido) parts.push(`partido ${filters.partido}`);

  return parts.length > 0 ? ` para ${parts.join(', ')}` : '';
}

/**
 * Calcula informacoes de paginacao
 */
export function getPaginationInfo(page: number, limit: number, total: number): { start: number; end: number; totalPages: number } {
  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);
  const totalPages = Math.ceil(total / limit);
  return { start, end, totalPages };
}

/**
 * Converte page/limit para offset
 */
export function pageToOffset(page: number, limit: number): number {
  return (page - 1) * limit;
}

