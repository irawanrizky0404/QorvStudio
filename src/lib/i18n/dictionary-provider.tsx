'use client';

import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import type { Locale } from './config';
import type { Dictionary } from './dictionaries/en';

interface DictionaryContextValue {
  dictionary: Dictionary;
  locale: Locale;
}

const DictionaryContext = createContext<DictionaryContextValue | null>(null);

interface DictionaryProviderProps {
  dictionary: Dictionary;
  locale: Locale;
  children: ReactNode;
}

/**
 * Mounted once in the locale layout. The dictionary is resolved on the server
 * and handed down, so client components never import a dictionary file.
 */
export function DictionaryProvider({
  dictionary,
  locale,
  children,
}: DictionaryProviderProps): ReactNode {
  return (
    <DictionaryContext.Provider value={{ dictionary, locale }}>
      {children}
    </DictionaryContext.Provider>
  );
}

/** Client-side copy lookup. Throws loudly rather than rendering untranslated UI. */
export function useDictionary(): DictionaryContextValue {
  const context = useContext(DictionaryContext);
  if (!context) {
    throw new Error(
      'useDictionary must be used inside <DictionaryProvider>. ' +
        'Client components under app/admin are English-only and should not call it.',
    );
  }
  return context;
}
