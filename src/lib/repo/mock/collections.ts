import 'server-only';

import type { Inquiry, Product, Project, Service, Settings } from '@/types/content';
import { mockProjects } from '@/lib/mock-data/projects';
import { mockServices } from '@/lib/mock-data/services';
import { mockProducts } from '@/lib/mock-data/products';
import { mockInquiries, mockSettings } from '@/lib/mock-data/inquiries';
import { MockCollection } from './store';

/**
 * Singletons. Next.js re-evaluates modules on HMR in development, so we pin the
 * instances to globalThis - otherwise every edit would silently reset the data
 * you were just editing in the admin panel.
 *
 * The pin is keyed by a signature of the seed. Editing a seed file therefore
 * rebuilds the collection on the next request, while edits made in the admin
 * panel survive HMR because they never change the seed. Without this, adding a
 * service to the seed left the running dev server showing the old count until
 * someone restarted it.
 */
const globalStore = globalThis as unknown as {
  __qorvProjects?: MockCollection<Project>;
  __qorvServices?: MockCollection<Service>;
  __qorvProducts?: MockCollection<Product>;
  __qorvSeedSignatures?: Record<string, string>;
  __qorvInquiries?: Inquiry[];
  __qorvSettings?: Settings;
};

/**
 * True when the pinned instance cannot be proven to match the current seed.
 *
 * An unknown previous signature counts as a mismatch, not as a match. A store
 * pinned before this check existed carries no signature, so trusting it would
 * leave the running dev server serving the old seed forever - which is exactly
 * the bug this function was added to fix.
 */
function seedChanged(key: string, seed: ReadonlyArray<{ id: string }>): boolean {
  const signature = `${seed.length}:${seed.map((item) => item.id).join(',')}`;
  const signatures = (globalStore.__qorvSeedSignatures ??= {});
  const previous = signatures[key];
  signatures[key] = signature;
  return previous !== signature;
}

export const projectsCollection =
  (seedChanged('projects', mockProjects) ? undefined : globalStore.__qorvProjects) ??
  (globalStore.__qorvProjects = new MockCollection<Project>({
    label: 'projects',
    seed: mockProjects,
    matchesSearch: (item, term) =>
      item.title.en.toLowerCase().includes(term) ||
      item.title.id.toLowerCase().includes(term) ||
      item.client.toLowerCase().includes(term) ||
      item.summary.en.toLowerCase().includes(term) ||
      item.summary.id.toLowerCase().includes(term) ||
      item.stack.some((tech) => tech.toLowerCase().includes(term)),
    matchesCategory: (item, category) => item.category === category,
    sortTitle: (item) => item.title.en,
  }));

export const servicesCollection =
  (seedChanged('services', mockServices) ? undefined : globalStore.__qorvServices) ??
  (globalStore.__qorvServices = new MockCollection<Service>({
    label: 'services',
    seed: mockServices,
    matchesSearch: (item, term) =>
      item.name.en.toLowerCase().includes(term) ||
      item.name.id.toLowerCase().includes(term) ||
      item.tagline.en.toLowerCase().includes(term) ||
      item.tagline.id.toLowerCase().includes(term) ||
      item.tools.some((tool) => tool.toLowerCase().includes(term)),
    sortTitle: (item) => item.name.en,
  }));

export const productsCollection =
  (seedChanged('products', mockProducts) ? undefined : globalStore.__qorvProducts) ??
  (globalStore.__qorvProducts = new MockCollection<Product>({
    label: 'products',
    seed: mockProducts,
    matchesSearch: (item, term) =>
      item.name.en.toLowerCase().includes(term) ||
      item.name.id.toLowerCase().includes(term) ||
      item.tagline.en.toLowerCase().includes(term) ||
      item.tagline.id.toLowerCase().includes(term) ||
      item.techStack.some((tech) => tech.toLowerCase().includes(term)),
    matchesCategory: (item, category) =>
      item.type === category || item.productStatus === category,
    sortTitle: (item) => item.name.en,
  }));

export function getInquiryStore(): Inquiry[] {
  if (!globalStore.__qorvInquiries) {
    globalStore.__qorvInquiries = structuredClone(mockInquiries);
  }
  return globalStore.__qorvInquiries;
}

export function getSettingsStore(): Settings {
  if (!globalStore.__qorvSettings) {
    globalStore.__qorvSettings = structuredClone(mockSettings);
  }
  return globalStore.__qorvSettings;
}

export function setSettingsStore(next: Settings): Settings {
  globalStore.__qorvSettings = next;
  return next;
}
