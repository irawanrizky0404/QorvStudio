import 'server-only';

import type { Locale } from './config';
import type { Dictionary } from './dictionaries/en';
import { en } from './dictionaries/en';
import { id } from './dictionaries/id';

const dictionaries: Record<Locale, Dictionary> = { en, id };

/**
 * Server-side copy lookup. Components must call this rather than importing a
 * dictionary file directly - see AGENT.md §3a.
 *
 * Both dictionaries are static objects, so this is synchronous by design. It
 * returns a Promise only to keep the call site stable if we ever switch to
 * dynamic imports for a larger locale set.
 */
export async function getDictionary(locale: Locale): Promise<Dictionary> {
  return dictionaries[locale];
}

export type { Dictionary };
