import 'server-only';

/**
 * The only module the app imports for data access.
 *
 * Phase 1 resolves to the in-memory mock. Phase 5 adds `./kv` and switches on
 * NEXT_PUBLIC_DATA_SOURCE. Nothing outside this file may import from `./mock`
 * or `./kv` directly - that rule is what keeps the backend a backend-only diff.
 * See ARCHITECTURE.md §3.
 */

export {
  projectRepo,
  serviceRepo,
  productRepo,
  inquiryRepo,
  settingsRepo,
  getPricingView,
  getProjectsForService,
  getServicesByIds,
  getProductsByIds,
  countProjectsUsingService,
} from './mock/entities';

export type { PricingView } from './mock/entities';
export { userRepo } from './mock/users';
export type { UserInput } from './mock/users';
export { forceFailure } from './mock/store';
export * from './types';

const source = process.env.NEXT_PUBLIC_DATA_SOURCE ?? 'mock';

if (source !== 'mock') {
  // Fail loudly rather than silently serving mock data in production.
  throw new Error(
    `NEXT_PUBLIC_DATA_SOURCE="${source}" but the KV implementation does not exist yet (Phase 5). ` +
      'Set it to "mock" or implement src/lib/repo/kv.',
  );
}
