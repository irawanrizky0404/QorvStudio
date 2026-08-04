import 'server-only';

/**
 * The only module the app imports for data access.
 *
 * Where the data actually lives is decided in `./driver` — Upstash Redis when
 * its credentials are present, process memory otherwise. Nothing outside this
 * file may import from `./mock` or `./driver` directly; that rule is what keeps
 * a backend change a backend-only diff. See ARCHITECTURE.md §3.
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
  countProjectsByService,
} from './mock/entities';

export type { PricingView } from './mock/entities';
export { userRepo } from './mock/users';
export type { UserInput } from './mock/users';
export { forceFailure } from './mock/store';
export { getDriver } from './driver';
export * from './types';
