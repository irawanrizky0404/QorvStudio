'use client';

import { useSyncExternalStore } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

function subscribe(onChange: () => void): () => void {
  const media = window.matchMedia(QUERY);
  media.addEventListener('change', onChange);
  return () => media.removeEventListener('change', onChange);
}

function getSnapshot(): boolean {
  return window.matchMedia(QUERY).matches;
}

/**
 * The switch every motion component reads.
 *
 * `useSyncExternalStore` is the right primitive here: matchMedia *is* an external
 * store, and this avoids the setState-inside-effect cascade that a useState +
 * useEffect version causes.
 *
 * The server snapshot is `true` - the first paint is the static, safe one, so a
 * reduced-motion visitor never sees a frame of animation before hydration.
 */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, () => true);
}
