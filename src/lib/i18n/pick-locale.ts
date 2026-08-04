import type { Locale } from './config';
import { DEFAULT_LOCALE } from './config';

/**
 * Translatable content field. `en` is required; `id` may be empty and falls back.
 * See DATABASE_SCHEMA.md §2 and ADR-006.
 */
export type Localized = { en: string; id: string };

/**
 * Read a localized field for the active locale, falling back to `en` when the
 * translation is missing or blank. This is the ONLY place that fallback lives -
 * components must never reach into `.en` / `.id` directly.
 */
export function pickLocale(field: Localized | undefined, locale: Locale): string {
  if (!field) return '';
  const value = field[locale];
  if (value && value.trim().length > 0) return value;
  return field[DEFAULT_LOCALE] ?? '';
}

/** Same fallback rule, applied across a list of localized strings. */
export function pickLocaleList(fields: Localized[] | undefined, locale: Locale): string[] {
  if (!fields) return [];
  return fields.map((field) => pickLocale(field, locale)).filter((value) => value.length > 0);
}

/** True when the `id` translation is missing - drives the admin "untranslated" badge. */
export function isMissingTranslation(field: Localized | undefined, locale: Locale): boolean {
  if (!field) return true;
  if (locale === DEFAULT_LOCALE) return false;
  return !field[locale] || field[locale].trim().length === 0;
}
