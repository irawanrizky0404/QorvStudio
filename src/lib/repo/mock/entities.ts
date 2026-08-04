import 'server-only';

import type { Inquiry, Product, Project, Service, Settings } from '@/types/content';
import type { InquiryInput, ProductInput, ProjectInput, ServiceInput } from '@/types/inputs';
import type { ListQuery, Paginated, Repository } from '../types';
import { RepositoryError } from '../types';
import {
  getInquiryStore,
  getSettingsStore,
  productsCollection,
  projectsCollection,
  servicesCollection,
  setSettingsStore,
} from './collections';
import { makeId, nowIso, simulateNetwork } from './store';
import { deriveStartingPrice, sortPackagesByTier } from '@/lib/pricing';

/* ── Derived values ───────────────────────────────────────────────────────── */

function publishStamp(
  status: 'draft' | 'published',
  existing: string | null = null,
): string | null {
  if (status !== 'published') return null;
  return existing ?? nowIso();
}

/* ── Projects ─────────────────────────────────────────────────────────────── */

export const projectRepo: Repository<Project, ProjectInput> = {
  async list(query?: ListQuery): Promise<Paginated<Project>> {
    return projectsCollection.list(query);
  },

  async getBySlug(slug: string): Promise<Project | null> {
    return projectsCollection.getBySlug(slug);
  },

  async getById(id: string): Promise<Project | null> {
    return projectsCollection.getById(id);
  },

  async create(input: ProjectInput): Promise<Project> {
    await simulateNetwork('projects:create');
    const timestamp = nowIso();
    const project: Project = {
      ...input,
      serviceIds: validateServiceIds(input.serviceIds),
      id: makeId('proj'),
      order: projectsCollection.nextOrder(),
      createdAt: timestamp,
      updatedAt: timestamp,
      publishedAt: publishStamp(input.status),
    };
    return projectsCollection.insert(project);
  },

  async update(id: string, input: Partial<ProjectInput>): Promise<Project> {
    await simulateNetwork('projects:update');
    const existing = projectsCollection.getByIdSync(id);
    if (!existing) throw new RepositoryError(`No project with id "${id}"`, 'NOT_FOUND');

    const status = input.status ?? existing.status;
    const next: Project = {
      ...existing,
      ...input,
      serviceIds: validateServiceIds(input.serviceIds ?? existing.serviceIds),
      id: existing.id,
      order: existing.order,
      createdAt: existing.createdAt,
      updatedAt: nowIso(),
      publishedAt: publishStamp(status, existing.publishedAt),
    };
    return projectsCollection.replace(id, next);
  },

  async remove(id: string): Promise<void> {
    await simulateNetwork('projects:delete');
    projectsCollection.delete(id);
  },

  async reorder(ids: string[]): Promise<void> {
    await simulateNetwork('projects:reorder');
    projectsCollection.reorder(ids);
  },
};

/** Drops ids that no longer resolve, rather than rendering a dangling reference. */
function validateServiceIds(ids: string[]): string[] {
  const known = new Set(servicesCollection.raw().map((service) => service.id));
  return ids.filter((id) => known.has(id));
}

/* ── Services ─────────────────────────────────────────────────────────────── */

export const serviceRepo: Repository<Service, ServiceInput> = {
  async list(query?: ListQuery): Promise<Paginated<Service>> {
    return servicesCollection.list(query);
  },

  async getBySlug(slug: string): Promise<Service | null> {
    return servicesCollection.getBySlug(slug);
  },

  async getById(id: string): Promise<Service | null> {
    return servicesCollection.getById(id);
  },

  async create(input: ServiceInput): Promise<Service> {
    await simulateNetwork('services:create');
    const timestamp = nowIso();
    const service: Service = {
      ...input,
      id: makeId('svc'),
      packages: sortPackagesByTier(input.packages),
      startingPrice: deriveStartingPrice(input.packages),
      order: servicesCollection.nextOrder(),
      createdAt: timestamp,
      updatedAt: timestamp,
      publishedAt: publishStamp(input.status),
    };
    return servicesCollection.insert(service);
  },

  async update(id: string, input: Partial<ServiceInput>): Promise<Service> {
    await simulateNetwork('services:update');
    const existing = servicesCollection.getByIdSync(id);
    if (!existing) throw new RepositoryError(`No service with id "${id}"`, 'NOT_FOUND');

    const packages = sortPackagesByTier(input.packages ?? existing.packages);
    const status = input.status ?? existing.status;
    const next: Service = {
      ...existing,
      ...input,
      id: existing.id,
      packages,
      startingPrice: deriveStartingPrice(packages),
      order: existing.order,
      createdAt: existing.createdAt,
      updatedAt: nowIso(),
      publishedAt: publishStamp(status, existing.publishedAt),
    };
    return servicesCollection.replace(id, next);
  },

  /**
   * Deleting a service must strip its id from every referencing project.
   * KV has no foreign keys, so this cleanup is the repository's job - doing it
   * at a call site is how dangling references get shipped.
   * See DATABASE_SCHEMA.md §7 "Cross-entity writes".
   */
  async remove(id: string): Promise<void> {
    await simulateNetwork('services:delete');
    servicesCollection.delete(id);
    for (const project of projectsCollection.raw()) {
      if (project.serviceIds.includes(id)) {
        project.serviceIds = project.serviceIds.filter((serviceId) => serviceId !== id);
        project.updatedAt = nowIso();
      }
    }
    for (const service of servicesCollection.raw()) {
      service.relatedServiceIds = service.relatedServiceIds.filter(
        (relatedId) => relatedId !== id,
      );
    }
  },

  async reorder(ids: string[]): Promise<void> {
    await simulateNetwork('services:reorder');
    servicesCollection.reorder(ids);
  },
};

/** How many projects a service delete would unlink - shown in the confirm dialog. */
export function countProjectsUsingService(serviceId: string): number {
  return projectsCollection.raw().filter((project) => project.serviceIds.includes(serviceId))
    .length;
}

/** Reverse lookup: published projects delivered under a service. */
export function getProjectsForService(serviceId: string): Project[] {
  return projectsCollection
    .raw()
    .filter(
      (project) => project.status === 'published' && project.serviceIds.includes(serviceId),
    )
    .sort((a, b) => a.order - b.order);
}

export function getServicesByIds(ids: string[]): Service[] {
  return servicesCollection.getManySync(ids);
}

/* ── Products ─────────────────────────────────────────────────────────────── */

export const productRepo: Repository<Product, ProductInput> = {
  async list(query?: ListQuery): Promise<Paginated<Product>> {
    return productsCollection.list(query);
  },

  async getBySlug(slug: string): Promise<Product | null> {
    return productsCollection.getBySlug(slug);
  },

  async getById(id: string): Promise<Product | null> {
    return productsCollection.getById(id);
  },

  async create(input: ProductInput): Promise<Product> {
    await simulateNetwork('products:create');
    const timestamp = nowIso();
    const product: Product = {
      ...input,
      id: makeId('prod'),
      order: productsCollection.nextOrder(),
      createdAt: timestamp,
      updatedAt: timestamp,
      publishedAt: publishStamp(input.status),
    };
    return productsCollection.insert(product);
  },

  async update(id: string, input: Partial<ProductInput>): Promise<Product> {
    await simulateNetwork('products:update');
    const existing = productsCollection.getByIdSync(id);
    if (!existing) throw new RepositoryError(`No product with id "${id}"`, 'NOT_FOUND');

    const status = input.status ?? existing.status;
    const next: Product = {
      ...existing,
      ...input,
      id: existing.id,
      order: existing.order,
      createdAt: existing.createdAt,
      updatedAt: nowIso(),
      publishedAt: publishStamp(status, existing.publishedAt),
    };
    return productsCollection.replace(id, next);
  },

  async remove(id: string): Promise<void> {
    await simulateNetwork('products:delete');
    productsCollection.delete(id);
    for (const product of productsCollection.raw()) {
      product.relatedProductIds = product.relatedProductIds.filter(
        (relatedId) => relatedId !== id,
      );
    }
  },

  async reorder(ids: string[]): Promise<void> {
    await simulateNetwork('products:reorder');
    productsCollection.reorder(ids);
  },
};

export function getProductsByIds(ids: string[]): Product[] {
  return productsCollection.getManySync(ids);
}

/* ── Pricing (composed view - owns no data) ───────────────────────────────── */

export interface PricingView {
  services: Service[];
  products: Product[];
}

export async function getPricingView(): Promise<PricingView> {
  await simulateNetwork('pricing');
  return {
    services: servicesCollection.listSync({ perPage: 50, sort: 'manual' }).items,
    products: productsCollection.listSync({ perPage: 50, sort: 'manual' }).items,
  };
}

/* ── Inquiries ────────────────────────────────────────────────────────────── */

export const inquiryRepo = {
  async list(query: ListQuery = {}): Promise<Paginated<Inquiry>> {
    await simulateNetwork('inquiries');
    const { search, status, page = 1, perPage = 20 } = query;
    let result = [...getInquiryStore()];

    if (status && status !== 'all') {
      result = result.filter((item) => item.status === status);
    }
    if (search && search.trim().length > 0) {
      const term = search.trim().toLowerCase();
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(term) ||
          item.email.toLowerCase().includes(term) ||
          item.subject.toLowerCase().includes(term) ||
          (item.company ?? '').toLowerCase().includes(term),
      );
    }

    result.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    const start = (page - 1) * perPage;
    const items = result.slice(start, start + perPage);
    return {
      items,
      total: result.length,
      page,
      perPage,
      hasMore: start + items.length < result.length,
    };
  },

  async getById(id: string): Promise<Inquiry | null> {
    await simulateNetwork(`inquiries:${id}`);
    return getInquiryStore().find((item) => item.id === id) ?? null;
  },

  async create(input: InquiryInput): Promise<Inquiry> {
    await simulateNetwork('inquiries:create');
    const inquiry: Inquiry = {
      ...input,
      id: makeId('inq'),
      status: 'new',
      createdAt: nowIso(),
      readAt: null,
      repliedAt: null,
      meta: {
        ip: input.meta?.ip ?? null,
        userAgent: input.meta?.userAgent ?? null,
        referrer: input.meta?.referrer ?? null,
      },
    };
    getInquiryStore().unshift(inquiry);
    return inquiry;
  },

  async setStatus(id: string, status: Inquiry['status']): Promise<Inquiry> {
    await simulateNetwork('inquiries:status');
    const inquiry = getInquiryStore().find((item) => item.id === id);
    if (!inquiry) throw new RepositoryError(`No inquiry with id "${id}"`, 'NOT_FOUND');

    inquiry.status = status;
    if (status === 'read' && !inquiry.readAt) inquiry.readAt = nowIso();
    if (status === 'replied') {
      inquiry.readAt = inquiry.readAt ?? nowIso();
      inquiry.repliedAt = nowIso();
    }
    return inquiry;
  },

  async remove(id: string): Promise<void> {
    await simulateNetwork('inquiries:delete');
    const store = getInquiryStore();
    const index = store.findIndex((item) => item.id === id);
    if (index === -1) throw new RepositoryError(`No inquiry with id "${id}"`, 'NOT_FOUND');
    store.splice(index, 1);
  },

  async countByStatus(): Promise<Record<Inquiry['status'], number>> {
    const store = getInquiryStore();
    return {
      new: store.filter((item) => item.status === 'new').length,
      read: store.filter((item) => item.status === 'read').length,
      replied: store.filter((item) => item.status === 'replied').length,
      archived: store.filter((item) => item.status === 'archived').length,
    };
  },
};

/* ── Settings ─────────────────────────────────────────────────────────────── */

export const settingsRepo = {
  async get(): Promise<Settings> {
    return getSettingsStore();
  },

  async update(input: Partial<Settings>): Promise<Settings> {
    await simulateNetwork('settings:update');
    const next: Settings = { ...getSettingsStore(), ...input, updatedAt: nowIso() };
    return setSettingsStore(next);
  },
};
