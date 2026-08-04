import type { Locale } from '@/lib/i18n/config';
import type { Localized } from '@/lib/i18n/pick-locale';

export type { Localized, Locale };

export type PublishStatus = 'draft' | 'published';

/* ── Admin users ──────────────────────────────────────────────────────────── */

/**
 * Peran operator panel.
 *
 *   dev    Akses penuh, termasuk mengelola pengguna lain.
 *   admin  Mengelola konten saja — proyek, layanan, produk, pertanyaan masuk,
 *          pengaturan. Tidak bisa melihat atau mengubah daftar pengguna.
 *
 * Pembagiannya sengaja begitu: kalau `admin` boleh mengelola pengguna, ia bisa
 * menaikkan perannya sendiri jadi `dev`, dan pembatasannya tidak berarti apa-apa.
 */
export type UserRole = 'dev' | 'admin';

export const USER_ROLES: readonly UserRole[] = ['dev', 'admin'];

/*
 * Tidak memperluas `Timestamps`: bentuk itu membawa `publishedAt`, dan pengguna
 * panel tidak pernah diterbitkan — ia dibuat lalu dinonaktifkan.
 */
export interface User {
  id: string;
  createdAt: string;
  updatedAt: string;
  email: string;
  name: string;
  role: UserRole;
  /**
   * `salt:hash` dari scrypt. Tidak pernah dikirim ke klien — `userRepo` selalu
   * mengembalikan bentuk `SafeUser` untuk apapun yang dirender.
   */
  passwordHash: string;
  active: boolean;
}

/** Pengguna tanpa hash password. Satu-satunya bentuk yang boleh keluar server. */
export type SafeUser = Omit<User, 'passwordHash'>;

export interface MediaRef {
  url: string;
  alt: Localized;
  width: number;
  height: number;
  caption?: Localized;
}

export interface Timestamps {
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

export interface Seo {
  title: Localized;
  description: Localized;
  ogImage: string | null;
}

/* ── Pricing ──────────────────────────────────────────────────────────────── */

/** Fixed ladder. Display order derives from this rank - never sorted by hand. */
export const TIER_RANK = { basic: 0, gold: 1, premium: 2 } as const;
export type Tier = keyof typeof TIER_RANK;
export const TIERS: readonly Tier[] = ['basic', 'gold', 'premium'];

/** The tier that always renders emphasized. One constant, not a stored flag. */
export const EMPHASIZED_TIER: Tier = 'gold';

export type PricePeriod = 'one-time' | 'monthly' | 'yearly' | 'project';
export type PriceUnit = 'project' | 'month' | 'year' | 'license' | 'day';
export type Currency = 'IDR' | 'USD';

/**
 * SERVICE ONLY. `tier` is the identity - no id, no stored name.
 * Labels come from the dictionary (`t.pricing.tier[tier]`). See ADR-011.
 */
export interface PricingTier {
  tier: Tier;
  price: number | null;
  currency: Currency;
  period: PricePeriod;
  description: Localized;
  includes: Localized[];
}

/** PRODUCT ONLY. One indicative figure - products are not sold in tiers. */
export interface PriceInfo {
  startingPrice: number | null;
  currency: Currency;
  unit: PriceUnit;
  note: Localized;
}

export interface FaqItem {
  id: string;
  question: Localized;
  answer: Localized;
}

/* ── Project ──────────────────────────────────────────────────────────────── */

export type ProjectCategory =
  | 'web-app'
  | 'mobile-app'
  | '3d-animation'
  | 'packaging'
  | 'branding';

export const PROJECT_CATEGORIES: readonly ProjectCategory[] = [
  'web-app',
  'mobile-app',
  '3d-animation',
  'packaging',
  'branding',
];

export interface ProjectResult {
  label: Localized;
  value: string;
}

export interface Project extends Timestamps {
  id: string;
  slug: string;
  title: Localized;
  client: string;
  category: ProjectCategory;
  year: number;
  summary: Localized;
  cover: MediaRef;
  gallery: MediaRef[];
  challenge: Localized;
  solution: Localized;
  outcome: Localized;
  results: ProjectResult[];
  serviceIds: string[];
  stack: string[];
  role: Localized;
  durationMonths: number | null;
  liveUrl: string | null;
  status: PublishStatus;
  featured: boolean;
  order: number;
  seo: Seo;
}

/* ── Service ──────────────────────────────────────────────────────────────── */

export interface ProcessStep {
  id: string;
  step: number;
  title: Localized;
  description: Localized;
  durationLabel: Localized;
}

export interface Service extends Timestamps {
  id: string;
  slug: string;
  name: Localized;
  tagline: Localized;
  icon: string;
  cover: MediaRef;
  gallery: MediaRef[];
  description: Localized;
  deliverables: Localized[];
  process: ProcessStep[];
  tools: string[];
  packages: PricingTier[];
  /** Derived from `packages` on write - read-only everywhere else. */
  startingPrice: number | null;
  currency: Currency;
  timelineLabel: Localized;
  faqs: FaqItem[];
  relatedServiceIds: string[];
  status: PublishStatus;
  featured: boolean;
  order: number;
  seo: Seo;
}

/* ── Product ──────────────────────────────────────────────────────────────── */

export type ProductType = 'web-app' | 'mobile-app' | 'desktop-app' | 'tool' | 'template';
export type ProductStatus = 'available' | 'beta' | 'coming-soon';

export const PRODUCT_TYPES: readonly ProductType[] = [
  'web-app',
  'mobile-app',
  'desktop-app',
  'tool',
  'template',
];

export const PRODUCT_STATUSES: readonly ProductStatus[] = ['available', 'beta', 'coming-soon'];

export interface ProductFeature {
  id: string;
  icon: string;
  title: Localized;
  description: Localized;
}

export interface ChangelogEntry {
  version: string;
  date: string;
  notes: Localized;
}

export interface Product extends Timestamps {
  id: string;
  slug: string;
  name: Localized;
  tagline: Localized;
  type: ProductType;
  productStatus: ProductStatus;
  cover: MediaRef;
  gallery: MediaRef[];
  demoVideoUrl: string | null;
  description: Localized;
  features: ProductFeature[];
  platforms: string[];
  techStack: string[];
  integrations: string[];
  requirements: Localized[];
  price: PriceInfo;
  faqs: FaqItem[];
  changelog: ChangelogEntry[];
  currentVersion: string | null;
  demoUrl: string | null;
  docsUrl: string | null;
  relatedProductIds: string[];
  status: PublishStatus;
  featured: boolean;
  order: number;
  seo: Seo;
}

/* ── Inquiry ──────────────────────────────────────────────────────────────── */

export type InquiryStatus = 'new' | 'read' | 'replied' | 'archived';
export type InquirySource = 'contact' | 'project' | 'product' | 'service' | 'pricing';
export type BudgetRange = '<10m' | '10-50m' | '50-200m' | '200m+' | 'undecided';

export interface Inquiry {
  id: string;
  name: string;
  email: string;
  company: string | null;
  phone: string | null;
  subject: string;
  message: string;
  budgetRange: BudgetRange | null;
  sourceType: InquirySource;
  sourceId: string | null;
  sourceTier: Tier | null;
  locale: Locale;
  status: InquiryStatus;
  createdAt: string;
  readAt: string | null;
  repliedAt: string | null;
  meta: {
    ip: string | null;
    userAgent: string | null;
    referrer: string | null;
  };
}

/* ── Settings ─────────────────────────────────────────────────────────────── */

export interface Settings {
  studioName: string;
  tagline: Localized;
  /**
   * Tahun berdiri dan lokasi.
   *
   * Keduanya muncul di pita meta beranda, di kaki footer, dan di angka statistik
   * "Bekerja sejak". Sebelumnya ketiganya menulis "Indonesia — Est. 2018" sebagai
   * literal, jadi mengubah satu tahun berarti menyunting tiga berkas dan mudah
   * meninggalkan satu yang tertinggal.
   */
  foundedYear: number;
  location: Localized;
  email: string;
  whatsapp: string;
  address: Localized | null;
  socials: Array<{ platform: string; url: string }>;
  seoDefaults: Seo;
  updatedAt: string;
}
