import 'server-only';

import type { Inquiry, Product, Project, Service, Settings } from '@/types/content';
import type { InquiryInput, ProductInput, ProjectInput, ServiceInput } from '@/types/inputs';
import type { ListQuery, Paginated, Repository } from '../types';
import { RepositoryError } from '../types';
import {
  productsCollection,
  projectsCollection,
  readInquiries,
  readSettings,
  servicesCollection,
  writeInquiries,
  writeSettings,
} from './collections';
import { checkFailure, makeId, nowIso } from './store';
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
    const timestamp = nowIso();
    const project: Project = {
      ...input,
      serviceIds: await validateServiceIds(input.serviceIds),
      id: makeId('proj'),
      order: await projectsCollection.nextOrder(),
      createdAt: timestamp,
      updatedAt: timestamp,
      publishedAt: publishStamp(input.status),
    };
    return projectsCollection.insert(project);
  },

  async update(id: string, input: Partial<ProjectInput>): Promise<Project> {
    const existing = await projectsCollection.getById(id);
    if (!existing) throw new RepositoryError(`No project with id "${id}"`, 'NOT_FOUND');

    const status = input.status ?? existing.status;
    const next: Project = {
      ...existing,
      ...input,
      serviceIds: await validateServiceIds(input.serviceIds ?? existing.serviceIds),
      id: existing.id,
      order: existing.order,
      createdAt: existing.createdAt,
      updatedAt: nowIso(),
      publishedAt: publishStamp(status, existing.publishedAt),
    };
    return projectsCollection.replace(id, next);
  },

  async remove(id: string): Promise<void> {
    await projectsCollection.delete(id);
  },

  async reorder(ids: string[]): Promise<void> {
    await projectsCollection.reorder(ids);
  },
};

/** Drops ids that no longer resolve, rather than rendering a dangling reference. */
async function validateServiceIds(ids: string[]): Promise<string[]> {
  const services = await servicesCollection.read();
  const known = new Set(services.map((service) => service.id));
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
    const timestamp = nowIso();
    const service: Service = {
      ...input,
      id: makeId('svc'),
      packages: sortPackagesByTier(input.packages),
      startingPrice: deriveStartingPrice(input.packages),
      order: await servicesCollection.nextOrder(),
      createdAt: timestamp,
      updatedAt: timestamp,
      publishedAt: publishStamp(input.status),
    };
    return servicesCollection.insert(service);
  },

  async update(id: string, input: Partial<ServiceInput>): Promise<Service> {
    const existing = await servicesCollection.getById(id);
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
   * The store has no foreign keys, so this cleanup is the repository's job -
   * doing it at a call site is how dangling references get shipped.
   * See DATABASE_SCHEMA.md §7 "Cross-entity writes".
   */
  async remove(id: string): Promise<void> {
    await servicesCollection.delete(id);

    const projects = await projectsCollection.read();
    const touched = projects.some((project) => project.serviceIds.includes(id));
    if (touched) {
      const timestamp = nowIso();
      await projectsCollection.writeAll(
        projects.map((project) =>
          project.serviceIds.includes(id)
            ? {
                ...project,
                serviceIds: project.serviceIds.filter((serviceId) => serviceId !== id),
                updatedAt: timestamp,
              }
            : project,
        ),
      );
    }

    const services = await servicesCollection.read();
    if (services.some((service) => service.relatedServiceIds.includes(id))) {
      await servicesCollection.writeAll(
        services.map((service) => ({
          ...service,
          relatedServiceIds: service.relatedServiceIds.filter((relatedId) => relatedId !== id),
        })),
      );
    }
  },

  async reorder(ids: string[]): Promise<void> {
    await servicesCollection.reorder(ids);
  },
};

/**
 * How many projects a service delete would unlink, per service id - shown in the
 * confirm dialog.
 *
 * Returns the whole map rather than a count for one id. The caller renders a
 * table of services, and asking per row would re-read the entire projects
 * collection once per row.
 */
export async function countProjectsByService(): Promise<Record<string, number>> {
  const projects = await projectsCollection.read();
  const counts: Record<string, number> = {};
  for (const project of projects) {
    for (const serviceId of project.serviceIds) {
      counts[serviceId] = (counts[serviceId] ?? 0) + 1;
    }
  }
  return counts;
}

/** Reverse lookup: published projects delivered under a service. */
export async function getProjectsForService(serviceId: string): Promise<Project[]> {
  const projects = await projectsCollection.read();
  return projects
    .filter((project) => project.status === 'published' && project.serviceIds.includes(serviceId))
    .sort((a, b) => a.order - b.order);
}

export async function getServicesByIds(ids: string[]): Promise<Service[]> {
  return servicesCollection.getMany(ids);
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
    const timestamp = nowIso();
    const product: Product = {
      ...input,
      id: makeId('prod'),
      order: await productsCollection.nextOrder(),
      createdAt: timestamp,
      updatedAt: timestamp,
      publishedAt: publishStamp(input.status),
    };
    return productsCollection.insert(product);
  },

  async update(id: string, input: Partial<ProductInput>): Promise<Product> {
    const existing = await productsCollection.getById(id);
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
    await productsCollection.delete(id);

    const products = await productsCollection.read();
    if (products.some((product) => product.relatedProductIds.includes(id))) {
      await productsCollection.writeAll(
        products.map((product) => ({
          ...product,
          relatedProductIds: product.relatedProductIds.filter((relatedId) => relatedId !== id),
        })),
      );
    }
  },

  async reorder(ids: string[]): Promise<void> {
    await productsCollection.reorder(ids);
  },
};

export async function getProductsByIds(ids: string[]): Promise<Product[]> {
  return productsCollection.getMany(ids);
}

/* ── Pricing (composed view - owns no data) ───────────────────────────────── */

export interface PricingView {
  services: Service[];
  products: Product[];
}

export async function getPricingView(): Promise<PricingView> {
  const [services, products] = await Promise.all([
    servicesCollection.read(),
    productsCollection.read(),
  ]);
  return {
    services: servicesCollection.filter(services, { perPage: 50, sort: 'manual' }).items,
    products: productsCollection.filter(products, { perPage: 50, sort: 'manual' }).items,
  };
}

/* ── Inquiries ────────────────────────────────────────────────────────────── */

export const inquiryRepo = {
  async list(query: ListQuery = {}): Promise<Paginated<Inquiry>> {
    checkFailure('inquiries');
    const { search, status, page = 1, perPage = 20 } = query;
    let result = [...(await readInquiries())];

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
    const items = await readInquiries();
    return items.find((item) => item.id === id) ?? null;
  },

  async create(input: InquiryInput): Promise<Inquiry> {
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
    const items = await readInquiries();
    await writeInquiries([inquiry, ...items]);
    return inquiry;
  },

  async setStatus(id: string, status: Inquiry['status']): Promise<Inquiry> {
    const items = await readInquiries();
    const existing = items.find((item) => item.id === id);
    if (!existing) throw new RepositoryError(`No inquiry with id "${id}"`, 'NOT_FOUND');

    const next: Inquiry = { ...existing, status };
    if (status === 'read' && !next.readAt) next.readAt = nowIso();
    if (status === 'replied') {
      next.readAt = next.readAt ?? nowIso();
      next.repliedAt = nowIso();
    }

    await writeInquiries(items.map((item) => (item.id === id ? next : item)));
    return next;
  },

  async remove(id: string): Promise<void> {
    const items = await readInquiries();
    if (!items.some((item) => item.id === id)) {
      throw new RepositoryError(`No inquiry with id "${id}"`, 'NOT_FOUND');
    }
    await writeInquiries(items.filter((item) => item.id !== id));
  },

  async countByStatus(): Promise<Record<Inquiry['status'], number>> {
    const items = await readInquiries();
    return {
      new: items.filter((item) => item.status === 'new').length,
      read: items.filter((item) => item.status === 'read').length,
      replied: items.filter((item) => item.status === 'replied').length,
      archived: items.filter((item) => item.status === 'archived').length,
    };
  },
};

/* ── Settings ─────────────────────────────────────────────────────────────── */

export const settingsRepo = {
  async get(): Promise<Settings> {
    return readSettings();
  },

  async update(input: Partial<Settings>): Promise<Settings> {
    const current = await readSettings();
    return writeSettings({ ...current, ...input, updatedAt: nowIso() });
  },
};
