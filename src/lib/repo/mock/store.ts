import 'server-only';

import { customAlphabet } from 'nanoid';
import type { ListQuery, Paginated } from '../types';
import { DEFAULT_PER_PAGE, MAX_PER_PAGE, RepositoryError } from '../types';

/**
 * In-memory mock store - Phase 1 only.
 *
 * Server-side by design. If this lived in the client, the admin panel would
 * mutate browser memory while public Server Components read server memory, and
 * the two would never agree. Mutations go through Server Actions instead, which
 * is also the shape Phase 5 uses.
 *
 * ponytail: module-level state, single process. Survives navigation, resets on
 * server restart and does not span serverless instances - acceptable because
 * Phase 5 replaces it with Vercel KV. See PROJECT_MEMORY.md.
 */

const nanoid = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 12);

export function makeId(prefix: string): string {
  return `${prefix}_${nanoid()}`;
}

export function nowIso(): string {
  return new Date().toISOString();
}

/* ── Network simulation ───────────────────────────────────────────────────── */

const MIN_LATENCY_MS = 500;
const MAX_LATENCY_MS = 1500;

/**
 * Set to a path fragment to force the next matching read to fail - this is how
 * error states get demonstrated without breaking the app. Example:
 *   forceFailure('projects')  → the next projects list rejects once.
 */
let failureTarget: string | null = null;

export function forceFailure(target: string | null): void {
  failureTarget = target;
}

export async function simulateNetwork(label: string): Promise<void> {
  const delay = MIN_LATENCY_MS + Math.random() * (MAX_LATENCY_MS - MIN_LATENCY_MS);
  await new Promise((resolve) => setTimeout(resolve, delay));

  if (failureTarget && label.includes(failureTarget)) {
    failureTarget = null;
    throw new RepositoryError(`Simulated failure for "${label}"`, 'INTERNAL');
  }
}

/* ── Collection ───────────────────────────────────────────────────────────── */

interface Sortable {
  id: string;
  slug: string;
  order: number;
  status: 'draft' | 'published';
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

interface CollectionConfig<T extends Sortable> {
  label: string;
  seed: T[];
  /** Free-text search across the fields that matter for this entity. */
  matchesSearch(item: T, term: string): boolean;
  /** Category / type filter. Return true when the item passes. */
  matchesCategory?(item: T, category: string): boolean;
  /** Value used by the `title` sort. */
  sortTitle(item: T): string;
}

export class MockCollection<T extends Sortable> {
  private items: T[];

  constructor(private readonly config: CollectionConfig<T>) {
    // Deep clone so mutations never write back into the seed module.
    this.items = structuredClone(config.seed);
  }

  /** Direct, un-delayed access for internal cross-entity work. */
  raw(): T[] {
    return this.items;
  }

  async list(query: ListQuery = {}): Promise<Paginated<T>> {
    await simulateNetwork(this.config.label);
    return this.listSync(query);
  }

  /** Same filtering without the artificial delay - used by composed reads. */
  listSync(query: ListQuery = {}): Paginated<T> {
    const {
      search,
      category,
      status,
      sort = 'manual',
      page = 1,
      perPage = DEFAULT_PER_PAGE,
      featured,
      includeDrafts = false,
    } = query;

    let result = [...this.items];

    if (!includeDrafts) {
      result = result.filter((item) => item.status === 'published');
    }

    if (status) {
      result = result.filter((item) => item.status === status);
    }

    if (featured !== undefined) {
      result = result.filter((item) => (item as unknown as { featured: boolean }).featured === featured);
    }

    if (category && category !== 'all' && this.config.matchesCategory) {
      result = result.filter((item) => this.config.matchesCategory!(item, category));
    }

    if (search && search.trim().length > 0) {
      const term = search.trim().toLowerCase();
      result = result.filter((item) => this.config.matchesSearch(item, term));
    }

    result.sort((a, b) => {
      switch (sort) {
        case 'recent':
          return b.updatedAt.localeCompare(a.updatedAt);
        case 'oldest':
          return a.updatedAt.localeCompare(b.updatedAt);
        case 'title':
          return this.config.sortTitle(a).localeCompare(this.config.sortTitle(b));
        case 'manual':
        default:
          return a.order - b.order;
      }
    });

    const total = result.length;
    const safePerPage = Math.min(Math.max(perPage, 1), MAX_PER_PAGE);
    const safePage = Math.max(page, 1);
    const start = (safePage - 1) * safePerPage;
    const items = result.slice(start, start + safePerPage);

    return {
      items,
      total,
      page: safePage,
      perPage: safePerPage,
      hasMore: start + items.length < total,
    };
  }

  async getBySlug(slug: string): Promise<T | null> {
    await simulateNetwork(`${this.config.label}:${slug}`);
    return this.items.find((item) => item.slug === slug) ?? null;
  }

  async getById(id: string): Promise<T | null> {
    await simulateNetwork(`${this.config.label}:${id}`);
    return this.items.find((item) => item.id === id) ?? null;
  }

  getByIdSync(id: string): T | null {
    return this.items.find((item) => item.id === id) ?? null;
  }

  getManySync(ids: string[]): T[] {
    return ids
      .map((id) => this.items.find((item) => item.id === id))
      .filter((item): item is T => item !== undefined);
  }

  /** Rejects a slug already taken by a different record. */
  assertSlugFree(slug: string, exceptId?: string): void {
    const clash = this.items.find((item) => item.slug === slug && item.id !== exceptId);
    if (clash) {
      throw new RepositoryError(`Slug "${slug}" is already in use`, 'CONFLICT');
    }
  }

  insert(item: T): T {
    this.assertSlugFree(item.slug);
    this.items.push(item);
    return item;
  }

  replace(id: string, next: T): T {
    const index = this.items.findIndex((item) => item.id === id);
    if (index === -1) {
      throw new RepositoryError(`No ${this.config.label} with id "${id}"`, 'NOT_FOUND');
    }
    this.assertSlugFree(next.slug, id);
    this.items[index] = next;
    return next;
  }

  delete(id: string): T {
    const index = this.items.findIndex((item) => item.id === id);
    if (index === -1) {
      throw new RepositoryError(`No ${this.config.label} with id "${id}"`, 'NOT_FOUND');
    }
    const [removed] = this.items.splice(index, 1);
    return removed as T;
  }

  /** Rewrites `order` to match the given id sequence. */
  reorder(ids: string[]): void {
    ids.forEach((id, index) => {
      const item = this.items.find((entry) => entry.id === id);
      if (item) item.order = index;
    });
  }

  nextOrder(): number {
    return this.items.length === 0 ? 0 : Math.max(...this.items.map((item) => item.order)) + 1;
  }
}
