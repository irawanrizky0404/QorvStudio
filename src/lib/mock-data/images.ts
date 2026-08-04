import type { Localized, MediaRef } from '@/types/content';

/**
 * Mock imagery - the single place image URLs are produced.
 *
 * Photography is real, curated per subject, and stored locally in
 * `public/images/`. It replaces seeded picsum, which returned a random subject
 * per seed and put a forest portrait beside a logistics case study and a parked
 * van behind the hero. Each slot below was searched for what it actually depicts.
 *
 * Files are committed rather than hotlinked so a slot cannot change subject or
 * 404 because a remote source moved, and so next/image can optimise them.
 *
 * Phase 5 swaps this module for Vercel Blob URLs. Nothing else in the codebase
 * constructs an image path. See PROJECT_MEMORY.md D-25.
 */

/**
 * Seed base -> available files, cover first.
 *
 * Galleries cycle through the variants, so a detail page never shows the same
 * photograph twice in a row.
 */
const SLOT_FILES: Record<string, readonly string[]> = {
  // Projects
  meridian: ['proj-meridian', 'proj-meridian-2', 'proj-meridian-3'],
  nocturne: ['proj-nocturne', 'proj-nocturne-2', 'proj-nocturne-3'],
  vantage: ['proj-vantage', 'proj-vantage-2', 'proj-vantage-3'],
  halden: ['proj-halden', 'proj-halden-2', 'proj-halden-3'],
  tessera: ['proj-tessera', 'proj-tessera-2', 'proj-tessera-3'],
  kiln: ['proj-kiln', 'proj-kiln-2', 'proj-kiln-3'],
  orbit: ['proj-orbit', 'proj-orbit-2', 'proj-orbit-3'],
  atlas: ['proj-atlas', 'proj-atlas-2', 'proj-atlas-3'],

  // Services
  'svc-web': ['svc-web', 'svc-web-2'],
  'svc-3d': ['svc-3d', 'svc-3d-2'],
  'svc-pack': ['svc-packaging', 'svc-packaging-2'],
  'svc-brand': ['svc-brand', 'svc-brand-2'],
  'svc-uiux': ['svc-uiux', 'svc-uiux-2'],
  'svc-consult': ['svc-consult', 'svc-consult-2'],

  // Products
  forge: ['prod-forge', 'prod-forge-2'],
  strata: ['prod-strata', 'prod-strata-2'],
  relay: ['prod-relay', 'prod-relay-2'],
  quarry: ['prod-quarry', 'prod-quarry-2'],
  ledger: ['prod-ledger', 'prod-ledger-2'],

  // Page-level art
  hero: ['hero'],
};

/** Full-bleed hero plate, used directly by the home page. */
export const HERO_IMAGE = '/images/hero.jpg';

/**
 * Resolves a seed to a local file.
 *
 * Seeds look like `qorv-meridian` (cover) or `qorv-meridian-g-2` (gallery item).
 * An unknown seed returns an empty string, which makes `MediaFrame` fall back to
 * its labelled placeholder rather than render a broken image.
 */
function resolveSeed(seed: string): string {
  const match = /^qorv-(.+?)(?:-g-(\d+))?$/.exec(seed);
  if (!match) return '';

  const base = match[1] ?? '';
  const galleryIndex = match[2] ? Number(match[2]) : 0;

  const files = SLOT_FILES[base];
  if (!files || files.length === 0) return '';

  const file = files[galleryIndex % files.length];
  return file ? `/images/${file}.jpg` : '';
}

interface MockImageOptions {
  seed: string;
  width: number;
  height: number;
  alt: Localized;
  caption?: Localized;
  /** Retained for call-site compatibility; treatment is handled in CSS. */
  color?: boolean;
}

export function mockImage({ seed, width, height, alt, caption }: MockImageOptions): MediaRef {
  return {
    url: resolveSeed(seed),
    alt,
    width,
    height,
    ...(caption ? { caption } : {}),
  };
}

/** 16:10 hero/cover plate. */
export function mockCover(seed: string, alt: Localized, color = false): MediaRef {
  return mockImage({ seed, width: 1600, height: 1000, alt, color });
}

/** 4:3 gallery plate. */
export function mockGalleryImage(
  seed: string,
  alt: Localized,
  caption?: Localized,
  color = false,
): MediaRef {
  return mockImage({ seed, width: 1200, height: 900, alt, caption, color });
}

/** 9:16 portrait plate - packaging and mobile shots. */
export function mockPortrait(seed: string, alt: Localized, color = false): MediaRef {
  return mockImage({ seed, width: 900, height: 1600, alt, color });
}

/** Builds a numbered gallery so every entity ships with real imagery. */
export function mockGallery(
  seedPrefix: string,
  count: number,
  alt: Localized,
  color = false,
): MediaRef[] {
  return Array.from({ length: count }, (_, index) =>
    mockGalleryImage(`${seedPrefix}-${index + 1}`, alt, undefined, color),
  );
}

/**
 * Tiny blurred placeholder so images fade in instead of popping.
 * Inline SVG data URI - no network request, works under a strict CSP.
 */
export const BLUR_DATA_URL =
  'data:image/svg+xml;base64,' +
  Buffer.from(
    '<svg xmlns="http://www.w3.org/2000/svg" width="8" height="5"><rect width="8" height="5" fill="#1a1a1a"/></svg>',
  ).toString('base64');
