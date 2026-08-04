import 'server-only';

import { customAlphabet } from 'nanoid';
import type { ListQuery, Paginated } from '../types';
import { DEFAULT_PER_PAGE, MAX_PER_PAGE, RepositoryError } from '../types';
import { getDriver, seededKey } from '../driver';

/**
 * Koleksi terurut dengan penyaringan, paginasi, dan penyimpanan.
 *
 * Setiap operasi membaca koleksinya dari driver lebih dulu, bukan menyimpan
 * salinan di memori proses. Terdengar boros, tapi itulah yang membuatnya benar
 * di serverless: dua permintaan berurutan bisa mendarat di instance berbeda,
 * jadi salinan yang dipegang instance mana pun langsung basi begitu instance
 * lain menulis.
 *
 * Semua metode mutasi berbentuk baca → ubah → tulis penuh. Lihat catatan
 * concurrency di `../driver.ts`.
 */

const nanoid = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 12);

export function makeId(prefix: string): string {
  return `${prefix}_${nanoid()}`;
}

export function nowIso(): string {
  return new Date().toISOString();
}

/* ── Simulasi kegagalan ───────────────────────────────────────────────────── */

/**
 * Memaksa pembacaan berikutnya gagal sekali — dipakai untuk mendemokan keadaan
 * error tanpa merusak aplikasi.
 *
 * Dulu di sini juga ada penundaan buatan 500–1500 ms untuk meniru latensi
 * jaringan. Itu dicabut: dengan penyimpanan sungguhan latensinya sudah nyata,
 * dan menambahkan satu detik lagi ke setiap pembacaan hanya membuat situs
 * terasa rusak.
 */
let failureTarget: string | null = null;

export function forceFailure(target: string | null): void {
  failureTarget = target;
}

export function checkFailure(label: string): void {
  if (failureTarget && label.includes(failureTarget)) {
    failureTarget = null;
    throw new RepositoryError(`Simulated failure for "${label}"`, 'INTERNAL');
  }
}

/* ── Koleksi ──────────────────────────────────────────────────────────────── */

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
  /** Pencarian teks bebas pada kolom yang relevan untuk entitas ini. */
  matchesSearch(item: T, term: string): boolean;
  /** Penyaring kategori/tipe. Kembalikan true bila item lolos. */
  matchesCategory?(item: T, category: string): boolean;
  /** Nilai yang dipakai oleh pengurutan `title`. */
  sortTitle(item: T): string;
}

export class Collection<T extends Sortable> {
  private cachedKey: string | null = null;

  constructor(private readonly config: CollectionConfig<T>) {}

  /* Ditunda sampai dipakai: `seededKey` menanyai driver, dan driver tidak boleh
   * dipilih saat modul dievaluasi. Lihat catatan di `getDriver`. */
  private get key(): string {
    return (this.cachedKey ??= seededKey(this.config.label, this.config.seed));
  }

  /** Snapshot seluruh koleksi. Titik masuk semua operasi lain. */
  async read(): Promise<T[]> {
    checkFailure(this.config.label);
    return getDriver().loadOrSeed<T[]>(this.key, () => structuredClone(this.config.seed));
  }

  private async write(items: T[]): Promise<void> {
    await getDriver().save(this.key, items);
  }

  async list(query: ListQuery = {}): Promise<Paginated<T>> {
    return this.filter(await this.read(), query);
  }

  /** Penyaringan yang sama di atas snapshot yang sudah dibaca pemanggil. */
  filter(source: T[], query: ListQuery = {}): Paginated<T> {
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

    let result = [...source];

    if (!includeDrafts) {
      result = result.filter((item) => item.status === 'published');
    }

    if (status) {
      result = result.filter((item) => item.status === status);
    }

    if (featured !== undefined) {
      result = result.filter(
        (item) => (item as unknown as { featured: boolean }).featured === featured,
      );
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
    const items = await this.read();
    return items.find((item) => item.slug === slug) ?? null;
  }

  async getById(id: string): Promise<T | null> {
    const items = await this.read();
    return items.find((item) => item.id === id) ?? null;
  }

  async getMany(ids: string[]): Promise<T[]> {
    const items = await this.read();
    return ids
      .map((id) => items.find((item) => item.id === id))
      .filter((item): item is T => item !== undefined);
  }

  /** Menolak slug yang sudah dipakai record lain. */
  private assertSlugFree(items: T[], slug: string, exceptId?: string): void {
    const clash = items.find((item) => item.slug === slug && item.id !== exceptId);
    if (clash) {
      throw new RepositoryError(`Slug "${slug}" is already in use`, 'CONFLICT');
    }
  }

  async nextOrder(): Promise<number> {
    const items = await this.read();
    return items.length === 0 ? 0 : Math.max(...items.map((item) => item.order)) + 1;
  }

  async insert(item: T): Promise<T> {
    const items = await this.read();
    this.assertSlugFree(items, item.slug);
    await this.write([...items, item]);
    return item;
  }

  async replace(id: string, next: T): Promise<T> {
    const items = await this.read();
    const index = items.findIndex((item) => item.id === id);
    if (index === -1) {
      throw new RepositoryError(`No ${this.config.label} with id "${id}"`, 'NOT_FOUND');
    }
    this.assertSlugFree(items, next.slug, id);
    await this.write(items.map((item, i) => (i === index ? next : item)));
    return next;
  }

  async delete(id: string): Promise<T> {
    const items = await this.read();
    const removed = items.find((item) => item.id === id);
    if (!removed) {
      throw new RepositoryError(`No ${this.config.label} with id "${id}"`, 'NOT_FOUND');
    }
    await this.write(items.filter((item) => item.id !== id));
    return removed;
  }

  /** Menulis ulang `order` mengikuti urutan id yang diberikan. */
  async reorder(ids: string[]): Promise<void> {
    const items = await this.read();
    const position = new Map(ids.map((id, index) => [id, index]));
    await this.write(
      items.map((item) => {
        const next = position.get(item.id);
        return next === undefined ? item : { ...item, order: next };
      }),
    );
  }

  /** Menulis kembali seluruh koleksi — dipakai penulisan lintas entitas. */
  async writeAll(items: T[]): Promise<void> {
    await this.write(items);
  }
}
