import type { Localized } from '@/types/content';

/** Terse localized literal for seed data. `L('Hello', 'Halo')`. */
export function L(en: string, id: string): Localized {
  return { en, id };
}

/** Fixed timestamps keep the seed deterministic - no "2 seconds ago" drift. */
export function stamps(created: string, updated: string, published: string | null = updated) {
  return {
    createdAt: `${created}T09:00:00.000Z`,
    updatedAt: `${updated}T09:00:00.000Z`,
    publishedAt: published ? `${published}T09:00:00.000Z` : null,
  };
}

/** Re-exported so seed data derives the price exactly as the repository does. */
export { deriveStartingPrice } from '@/lib/pricing';
