import { test } from 'node:test';
import assert from 'node:assert/strict';

import { pickLocale, pickLocaleList, isMissingTranslation } from '../src/lib/i18n/pick-locale.ts';
import { deriveStartingPrice, sortPackagesByTier } from '../src/lib/pricing.ts';
import { formatPrice, pad2 } from '../src/lib/format.ts';
import { slugify } from '../src/lib/utils.ts';

/*
 * The smallest set of checks that fail if the non-obvious logic breaks.
 * No framework: Node's built-in runner with native TypeScript stripping.
 *   npm test
 */

/* ── Localized fallback (ADR-006) ─────────────────────────────────────────── */

test('pickLocale returns the requested locale when present', () => {
  assert.equal(pickLocale({ en: 'Work', id: 'Karya' }, 'id'), 'Karya');
});

test('pickLocale falls back to English when the translation is empty', () => {
  assert.equal(pickLocale({ en: 'Work', id: '' }, 'id'), 'Work');
});

test('pickLocale treats whitespace-only translations as missing', () => {
  assert.equal(pickLocale({ en: 'Work', id: '   ' }, 'id'), 'Work');
});

test('pickLocale never throws on an undefined field', () => {
  assert.equal(pickLocale(undefined, 'en'), '');
});

test('pickLocaleList drops entries that resolve to nothing', () => {
  const result = pickLocaleList([{ en: 'A', id: '' }, { en: '', id: '' }], 'id');
  assert.deepEqual(result, ['A']);
});

test('isMissingTranslation only flags the non-default locale', () => {
  assert.equal(isMissingTranslation({ en: 'A', id: '' }, 'id'), true);
  assert.equal(isMissingTranslation({ en: 'A', id: '' }, 'en'), false);
});

/* ── Pricing derivation (ADR-010, D-17) ───────────────────────────────────── */

test('deriveStartingPrice picks the cheapest package', () => {
  const packages = [{ price: 120_000_000 }, { price: 45_000_000 }, { price: null }];
  assert.equal(deriveStartingPrice(packages), 45_000_000);
});

test('deriveStartingPrice returns null when every package is quote-only', () => {
  assert.equal(deriveStartingPrice([{ price: null }, { price: null }]), null);
});

test('deriveStartingPrice returns null for a service with no packages', () => {
  assert.equal(deriveStartingPrice([]), null);
});

test('deriveStartingPrice does not treat zero as missing', () => {
  assert.equal(deriveStartingPrice([{ price: 0 }, { price: 500 }]), 0);
});

/* ── Tier ordering (ADR-011) ──────────────────────────────────────────────── */

test('sortPackagesByTier enforces basic → gold → premium', () => {
  const input = [
    { tier: 'premium' as const },
    { tier: 'basic' as const },
    { tier: 'gold' as const },
  ];
  assert.deepEqual(
    sortPackagesByTier(input).map((p) => p.tier),
    ['basic', 'gold', 'premium'],
  );
});

test('sortPackagesByTier does not mutate its input', () => {
  const input = [{ tier: 'gold' as const }, { tier: 'basic' as const }];
  sortPackagesByTier(input);
  assert.equal(input[0]?.tier, 'gold');
});

/* ── Money formatting (AGENT.md §2a) ──────────────────────────────────────── */

test('formatPrice renders the fallback for null, never zero or "free"', () => {
  assert.equal(formatPrice(null, 'IDR', 'en', 'Contact us'), 'Contact us');
});

test('formatPrice renders a real zero as a currency amount, not the fallback', () => {
  const result = formatPrice(0, 'IDR', 'en', 'Contact us');
  assert.notEqual(result, 'Contact us');
  assert.match(result, /0/);
});

test('formatPrice shows no fraction digits', () => {
  assert.doesNotMatch(formatPrice(45_000_000, 'IDR', 'id', '—'), /,\d{2}$|\.\d{2}$/);
});

/* ── Slugs ────────────────────────────────────────────────────────────────── */

test('slugify produces a url-safe kebab slug', () => {
  assert.equal(slugify('Meridian Logistics Platform'), 'meridian-logistics-platform');
});

test('slugify strips punctuation and collapses separators', () => {
  assert.equal(slugify('3D & Animation — Studio!'), '3d-animation-studio');
});

test('slugify never leaves leading or trailing hyphens', () => {
  const result = slugify('  ...Hello World...  ');
  assert.equal(result, 'hello-world');
});

/* ── Misc ─────────────────────────────────────────────────────────────────── */

test('pad2 pads single digits only', () => {
  assert.equal(pad2(3), '03');
  assert.equal(pad2(12), '12');
});
