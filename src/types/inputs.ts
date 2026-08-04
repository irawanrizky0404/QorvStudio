import type { Inquiry, Product, Project, Service } from './content';

/**
 * Write payloads. Derived from the entity so a new field cannot be added to one
 * without the other. Server-owned fields are excluded here, never optional:
 *  - id / timestamps      → assigned by the repository
 *  - order                → assigned on create, changed only via reorder()
 *  - startingPrice        → derived from packages (ADR-010)
 */
type ServerOwned = 'id' | 'createdAt' | 'updatedAt' | 'publishedAt' | 'order';

export type ProjectInput = Omit<Project, ServerOwned>;
export type ProductInput = Omit<Product, ServerOwned>;
export type ServiceInput = Omit<Service, ServerOwned | 'startingPrice'>;

export type InquiryInput = Omit<
  Inquiry,
  'id' | 'createdAt' | 'readAt' | 'repliedAt' | 'status' | 'meta'
> & {
  meta?: Partial<Inquiry['meta']>;
};
