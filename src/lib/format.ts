import type { Currency, Locale } from '@/types/content';

const INTL_LOCALE: Record<Locale, string> = {
  en: 'en-US',
  id: 'id-ID',
};

/**
 * Money formatting lives here and nowhere else.
 * `null` is "contact us", never "Free" and never "0" - AGENT.md §2a.
 * Prices are whole rupiah/dollar amounts; no fraction digits are shown.
 */
export function formatPrice(
  amount: number | null,
  currency: Currency,
  locale: Locale,
  fallback: string,
): string {
  if (amount === null) return fallback;
  return new Intl.NumberFormat(INTL_LOCALE[locale], {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(amount);
}

/** Compact form for cards: "Rp 45 jt" / "$45K" reads better than nine digits. */
export function formatPriceCompact(
  amount: number | null,
  currency: Currency,
  locale: Locale,
  fallback: string,
): string {
  if (amount === null) return fallback;
  return new Intl.NumberFormat(INTL_LOCALE[locale], {
    style: 'currency',
    currency,
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(amount);
}

export function formatDate(iso: string, locale: Locale): string {
  return new Intl.DateTimeFormat(INTL_LOCALE[locale], {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(iso));
}

export function formatDateShort(iso: string, locale: Locale): string {
  return new Intl.DateTimeFormat(INTL_LOCALE[locale], {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  }).format(new Date(iso));
}

export function formatNumber(value: number, locale: Locale): string {
  return new Intl.NumberFormat(INTL_LOCALE[locale]).format(value);
}

/** "3" → "03". Section indices and step numbers use two digits. */
export function pad2(value: number): string {
  return value.toString().padStart(2, '0');
}
