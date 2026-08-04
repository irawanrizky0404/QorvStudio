import type { PricingTier } from '@/types/content';
import { TIER_RANK } from '@/types/content';

/**
 * The two pricing rules that must never diverge, in one place.
 *
 * They were previously duplicated across the repository, the admin form preview,
 * and the seed helper - three copies of a rule is three chances for the card and
 * the detail page to disagree about the same service.
 */

/** Cheapest non-null package price, or null when every tier is quote-only. */
export function deriveStartingPrice(
  packages: ReadonlyArray<{ price: number | null }>,
): number | null {
  const prices = packages
    .map((pkg) => pkg.price)
    .filter((price): price is number => price !== null);
  return prices.length === 0 ? null : Math.min(...prices);
}

/** Ladder order - basic → gold → premium - regardless of submitted order. */
export function sortPackagesByTier<T extends Pick<PricingTier, 'tier'>>(
  packages: readonly T[],
): T[] {
  return [...packages].sort((a, b) => TIER_RANK[a.tier] - TIER_RANK[b.tier]);
}
