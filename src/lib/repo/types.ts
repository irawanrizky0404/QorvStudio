import type { Localized } from '@/types/content';

export interface ListQuery {
  search?: string;
  category?: string;
  status?: string;
  sort?: 'recent' | 'oldest' | 'title' | 'manual';
  page?: number;
  perPage?: number;
  featured?: boolean;
  /** Admin-only: include drafts. Public callers must never set this. */
  includeDrafts?: boolean;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  perPage: number;
  hasMore: boolean;
}

/**
 * The seam between the UI and the data layer.
 *
 * Phase 1 implements this in memory; Phase 5 implements it over Vercel KV.
 * Components import from `@/lib/repo` and never from `mock/` or `kv/` - that is
 * what makes the backend a backend-only diff. See ARCHITECTURE.md §3 and ADR-004.
 */
export interface Repository<T, TInput> {
  list(query?: ListQuery): Promise<Paginated<T>>;
  getBySlug(slug: string): Promise<T | null>;
  getById(id: string): Promise<T | null>;
  create(input: TInput): Promise<T>;
  update(id: string, input: Partial<TInput>): Promise<T>;
  remove(id: string): Promise<void>;
  reorder(ids: string[]): Promise<void>;
}

export const DEFAULT_PER_PAGE = 12;
export const MAX_PER_PAGE = 50;

/** Thrown by every implementation so callers handle one error shape. */
export class RepositoryError extends Error {
  constructor(
    message: string,
    readonly code: 'NOT_FOUND' | 'CONFLICT' | 'VALIDATION' | 'INTERNAL',
  ) {
    super(message);
    this.name = 'RepositoryError';
  }
}

/** Localized helper used by mock search - kept here so both impls agree. */
export function localizedMatches(field: Localized | undefined, term: string): boolean {
  if (!field) return false;
  const needle = term.toLowerCase();
  return field.en.toLowerCase().includes(needle) || field.id.toLowerCase().includes(needle);
}
