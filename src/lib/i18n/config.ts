export const LOCALES = ['en', 'id'] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'en';

export const LOCALE_COOKIE = 'qorv_locale';

/** Human labels for the locale toggle. Not translated - a language always names itself. */
export const LOCALE_LABELS: Record<Locale, string> = {
  en: 'EN',
  id: 'ID',
};

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}
