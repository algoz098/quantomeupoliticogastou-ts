/**
 * Interfaces base para repositorios
 */

/**
 * Interface base para repositorios com operacoes CRUD
 */
export interface IRepository<T, ID = string> {
  findById?(id: ID): T | undefined;
  findAll?(): T[];
  count?(): number;
}

/**
 * Interface para repositorios com paginacao
 */
export interface IPaginatedRepository<T, F = Record<string, unknown>> {
  findPaginated?(filters: F): { data: T[]; total: number };
}

/**
 * Interface para repositorios com upsert
 */
export interface IUpsertRepository<T> {
  upsert(entity: T): void;
}

