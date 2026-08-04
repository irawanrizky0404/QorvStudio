import { z } from 'zod';

import {
  PRODUCT_STATUSES,
  PRODUCT_TYPES,
  PROJECT_CATEGORIES,
  TIERS,
} from '@/types/content';
import type { ProductStatus, ProductType, ProjectCategory, Tier } from '@/types/content';

/** The shared constants are `readonly T[]`; z.enum needs a non-empty tuple. */
const tuple = <T extends string>(values: readonly T[]) => values as unknown as readonly [T, ...T[]];

/**
 * Write schemas for the admin panel.
 *
 * One schema per entity, shared by the client form (via zodResolver) and the
 * server action, so a field can never validate differently on the two sides.
 * These mirror `@/types/inputs` - server-owned fields (id, timestamps, order,
 * derived startingPrice) are absent, never optional.
 */

/* ── Shared shapes ────────────────────────────────────────────────────────── */

const localized = (max = 4000) =>
  z.object({
    en: z.string().min(1, 'English text is required').max(max),
    id: z.string().min(1, 'Indonesian text is required').max(max),
  });

/** Optional pair: either both languages carry text or neither does. */
const localizedOptional = (max = 4000) =>
  z.object({
    en: z.string().max(max).default(''),
    id: z.string().max(max).default(''),
  });

const slug = z
  .string()
  .min(2)
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Lowercase letters, numbers, and single hyphens only');

/** Site-relative path or absolute http(s) URL. Blocks javascript: and data:. */
const assetUrl = z
  .string()
  .min(1, 'An image path is required')
  .refine(
    (value) => value.startsWith('/') || /^https?:\/\//i.test(value),
    'Use a path starting with / or a full http(s) URL',
  );

const externalUrl = z
  .string()
  .trim()
  .refine((value) => value === '' || /^https?:\/\//i.test(value), 'Must be a full http(s) URL')
  .transform((value) => (value === '' ? null : value))
  .nullable();

const media = z.object({
  url: assetUrl,
  alt: localized(200),
  width: z.coerce.number().int().min(1).max(10000),
  height: z.coerce.number().int().min(1).max(10000),
  caption: localizedOptional(300).optional(),
});

const seo = z.object({
  title: localized(120),
  description: localized(320),
  ogImage: z
    .string()
    .trim()
    .transform((value) => (value === '' ? null : value))
    .nullable(),
});

const status = z.enum(['draft', 'published']);
const currency = z.enum(['IDR', 'USD']);

/** Blank-tolerant integer: an emptied number input yields null, not NaN. */
const nullableInt = (min: number, max: number) =>
  z
    .union([z.coerce.number().int().min(min).max(max), z.literal('')])
    .transform((value) => (value === '' ? null : value))
    .nullable();

const stringList = z.array(z.string().trim().min(1).max(120)).max(40);
const localizedList = (max = 400) => z.array(localized(max)).max(40);

const faqs = z
  .array(
    z.object({
      id: z.string().min(1),
      question: localized(300),
      answer: localized(2000),
    }),
  )
  .max(20);

/* ── Project ──────────────────────────────────────────────────────────────── */

export const projectSchema = z.object({
  slug,
  title: localized(160),
  client: z.string().min(1).max(120),
  category: z.enum(tuple<ProjectCategory>(PROJECT_CATEGORIES)),
  year: z.coerce.number().int().min(2000).max(2100),
  summary: localized(600),
  cover: media,
  gallery: z.array(media).max(20),
  challenge: localized(4000),
  solution: localized(4000),
  outcome: localized(4000),
  results: z
    .array(z.object({ label: localized(120), value: z.string().min(1).max(40) }))
    .max(12),
  serviceIds: z.array(z.string()).max(12),
  stack: stringList,
  role: localized(200),
  durationMonths: nullableInt(1, 120),
  liveUrl: externalUrl,
  status,
  featured: z.boolean(),
  seo,
});

/* ── Service ──────────────────────────────────────────────────────────────── */

const pricingTier = z.object({
  tier: z.enum(tuple<Tier>(TIERS)),
  price: nullableInt(0, 100_000_000_000),
  currency,
  period: z.enum(['one-time', 'monthly', 'yearly', 'project']),
  description: localized(600),
  includes: localizedList(200),
});

export const serviceSchema = z.object({
  slug,
  name: localized(120),
  tagline: localized(240),
  icon: z.string().min(1).max(60),
  cover: media,
  gallery: z.array(media).max(20),
  description: localized(6000),
  deliverables: localizedList(300),
  process: z
    .array(
      z.object({
        id: z.string().min(1),
        step: z.coerce.number().int().min(1).max(20),
        title: localized(160),
        description: localized(1200),
        durationLabel: localized(80),
      }),
    )
    .max(12),
  tools: stringList,
  /* At most one entry per tier: the ladder is fixed, not a free list. */
  packages: z
    .array(pricingTier)
    .max(3)
    .refine(
      (list) => new Set(list.map((item) => item.tier)).size === list.length,
      'Each tier may appear only once',
    ),
  currency,
  timelineLabel: localized(120),
  faqs,
  relatedServiceIds: z.array(z.string()).max(12),
  status,
  featured: z.boolean(),
  seo,
});

/* ── Product ──────────────────────────────────────────────────────────────── */

export const productSchema = z.object({
  slug,
  name: localized(120),
  tagline: localized(240),
  type: z.enum(tuple<ProductType>(PRODUCT_TYPES)),
  productStatus: z.enum(tuple<ProductStatus>(PRODUCT_STATUSES)),
  cover: media,
  gallery: z.array(media).max(20),
  demoVideoUrl: externalUrl,
  description: localized(6000),
  features: z
    .array(
      z.object({
        id: z.string().min(1),
        icon: z.string().min(1).max(60),
        title: localized(160),
        description: localized(1200),
      }),
    )
    .max(20),
  platforms: stringList,
  techStack: stringList,
  integrations: stringList,
  requirements: localizedList(300),
  price: z.object({
    startingPrice: nullableInt(0, 100_000_000_000),
    currency,
    unit: z.enum(['project', 'month', 'year', 'license', 'day']),
    note: localizedOptional(300),
  }),
  faqs,
  changelog: z
    .array(
      z.object({
        version: z.string().min(1).max(30),
        date: z.string().min(1).max(40),
        notes: localized(1200),
      }),
    )
    .max(40),
  currentVersion: z
    .string()
    .trim()
    .max(30)
    .transform((value) => (value === '' ? null : value))
    .nullable(),
  demoUrl: externalUrl,
  docsUrl: externalUrl,
  relatedProductIds: z.array(z.string()).max(12),
  status,
  featured: z.boolean(),
  seo,
});

/* ── Settings ─────────────────────────────────────────────────────────────── */

export const settingsSchema = z.object({
  studioName: z.string().min(1).max(80),
  tagline: localized(240),
  foundedYear: z.coerce.number().int().min(1900).max(2100),
  location: localized(80),
  email: z.email(),
  whatsapp: z.string().regex(/^[0-9]{8,16}$/, 'Digits only, including country code'),
  address: localizedOptional(300),
  socials: z
    .array(
      z.object({
        platform: z.string().min(1).max(40),
        url: z.string().regex(/^https?:\/\//i, 'Must be a full http(s) URL'),
      }),
    )
    .max(12),
  seoDefaults: seo,
});

/* ── Inferred form value types ────────────────────────────────────────────── */

export type ProjectFormValues = z.input<typeof projectSchema>;
export type ServiceFormValues = z.input<typeof serviceSchema>;
export type ProductFormValues = z.input<typeof productSchema>;
export type SettingsFormValues = z.input<typeof settingsSchema>;
