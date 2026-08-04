import type { Locale } from '@/types/content';

/**
 * Every public href is built here, so a locale prefix can never be forgotten.
 * Admin routes are deliberately unprefixed - the panel is English-only.
 */
export const routes = {
  home: (locale: Locale) => `/${locale}`,
  work: (locale: Locale) => `/${locale}/work`,
  project: (locale: Locale, slug: string) => `/${locale}/work/${slug}`,
  services: (locale: Locale) => `/${locale}/services`,
  service: (locale: Locale, slug: string) => `/${locale}/services/${slug}`,
  products: (locale: Locale) => `/${locale}/products`,
  product: (locale: Locale, slug: string) => `/${locale}/products/${slug}`,
  pricing: (locale: Locale) => `/${locale}/pricing`,
  about: (locale: Locale) => `/${locale}/about`,
  contact: (locale: Locale) => `/${locale}/contact`,
} as const;

export const adminRoutes = {
  dashboard: '/admin',
  login: '/admin/login',
  projects: '/admin/projects',
  projectNew: '/admin/projects/new',
  projectEdit: (id: string) => `/admin/projects/${id}/edit`,
  services: '/admin/services',
  serviceNew: '/admin/services/new',
  serviceEdit: (id: string) => `/admin/services/${id}/edit`,
  products: '/admin/products',
  productNew: '/admin/products/new',
  productEdit: (id: string) => `/admin/products/${id}/edit`,
  inquiries: '/admin/inquiries',
  inquiry: (id: string) => `/admin/inquiries/${id}`,
  settings: '/admin/settings',
} as const;

/**
 * Swaps the locale segment while preserving the rest of the path.
 * The toggle must never dump the visitor on the home page - AGENT.md §3a.
 */
export function swapLocale(pathname: string, next: Locale): string {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length === 0) return `/${next}`;
  segments[0] = next;
  return `/${segments.join('/')}`;
}
