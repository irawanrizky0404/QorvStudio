'use server';

import { revalidatePath } from 'next/cache';
import type { z } from 'zod';

import { requireSession } from '@/lib/auth';
import { inquiryRepo, productRepo, projectRepo, serviceRepo, settingsRepo } from '@/lib/repo';
import { RepositoryError } from '@/lib/repo';
import {
  productSchema,
  projectSchema,
  serviceSchema,
  settingsSchema,
} from '@/lib/schemas/content';
import type { InquiryStatus } from '@/types/content';

export interface AdminResult {
  ok: boolean;
  /** Present on success for create, so the caller can route to the new record. */
  id?: string;
  message?: string;
  /** Dotted path → message, e.g. `title.en`. */
  fieldErrors?: Record<string, string>;
}

/* ── Plumbing ─────────────────────────────────────────────────────────────── */

function fieldErrorsFrom(error: z.ZodError): Record<string, string> {
  const result: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join('.');
    if (key && !result[key]) result[key] = issue.message;
  }
  return result;
}

/** Every public page that can show this entity, so an edit is visible at once. */
function revalidateEntity(kind: 'projects' | 'services' | 'products'): void {
  const segment = kind === 'projects' ? 'work' : kind;
  for (const locale of ['en', 'id']) {
    revalidatePath(`/${locale}`);
    revalidatePath(`/${locale}/${segment}`);
    revalidatePath(`/${locale}/${segment}/[slug]`, 'page');
    revalidatePath(`/${locale}/pricing`);
    revalidatePath(`/${locale}/about`);
  }
  revalidatePath('/sitemap.xml');
  revalidatePath(`/admin/${kind}`);
  revalidatePath('/admin');
}

function failure(error: unknown, verb: string): AdminResult {
  if (error instanceof RepositoryError) {
    // Repository messages are written for the operator, so they are safe to show.
    return { ok: false, message: error.message };
  }
  // Anything else keeps its detail server-side.
  console.error(`[admin] ${verb} failed`, error);
  return { ok: false, message: `Could not ${verb}. Try again.` };
}

/**
 * One write path per verb, shared by all three entities. The repositories have
 * identical signatures, so a per-entity copy would only add drift.
 */
async function runCreate<TIn, TOut extends { id: string }>(
  kind: 'projects' | 'services' | 'products',
  schema: { safeParse: (raw: unknown) => z.ZodSafeParseResult<TIn> },
  repo: { create: (input: TIn) => Promise<TOut> },
  raw: unknown,
): Promise<AdminResult> {
  await requireSession();
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, message: 'Some fields need attention.', fieldErrors: fieldErrorsFrom(parsed.error) };
  }
  try {
    const created = await repo.create(parsed.data);
    revalidateEntity(kind);
    return { ok: true, id: created.id };
  } catch (error) {
    return failure(error, 'save');
  }
}

async function runUpdate<TIn, TOut>(
  kind: 'projects' | 'services' | 'products',
  schema: { safeParse: (raw: unknown) => z.ZodSafeParseResult<TIn> },
  repo: { update: (id: string, input: Partial<TIn>) => Promise<TOut> },
  id: string,
  raw: unknown,
): Promise<AdminResult> {
  await requireSession();
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, message: 'Some fields need attention.', fieldErrors: fieldErrorsFrom(parsed.error) };
  }
  try {
    await repo.update(id, parsed.data);
    revalidateEntity(kind);
    return { ok: true, id };
  } catch (error) {
    return failure(error, 'save');
  }
}

async function runRemove(
  kind: 'projects' | 'services' | 'products',
  repo: { remove: (id: string) => Promise<void> },
  id: string,
): Promise<AdminResult> {
  await requireSession();
  try {
    await repo.remove(id);
    revalidateEntity(kind);
    return { ok: true };
  } catch (error) {
    return failure(error, 'delete');
  }
}

/* ── Projects ─────────────────────────────────────────────────────────────── */

export async function createProject(raw: unknown): Promise<AdminResult> {
  return runCreate('projects', projectSchema, projectRepo, raw);
}

export async function updateProject(id: string, raw: unknown): Promise<AdminResult> {
  return runUpdate('projects', projectSchema, projectRepo, id, raw);
}

export async function deleteProject(id: string): Promise<AdminResult> {
  return runRemove('projects', projectRepo, id);
}

/* ── Services ─────────────────────────────────────────────────────────────── */

export async function createService(raw: unknown): Promise<AdminResult> {
  return runCreate('services', serviceSchema, serviceRepo, raw);
}

export async function updateService(id: string, raw: unknown): Promise<AdminResult> {
  return runUpdate('services', serviceSchema, serviceRepo, id, raw);
}

export async function deleteService(id: string): Promise<AdminResult> {
  return runRemove('services', serviceRepo, id);
}

/* ── Products ─────────────────────────────────────────────────────────────── */

export async function createProduct(raw: unknown): Promise<AdminResult> {
  return runCreate('products', productSchema, productRepo, raw);
}

export async function updateProduct(id: string, raw: unknown): Promise<AdminResult> {
  return runUpdate('products', productSchema, productRepo, id, raw);
}

export async function deleteProduct(id: string): Promise<AdminResult> {
  return runRemove('products', productRepo, id);
}

/* ── Inquiries ────────────────────────────────────────────────────────────── */

const INQUIRY_STATUSES: readonly InquiryStatus[] = ['new', 'read', 'replied', 'archived'];

export async function setInquiryStatus(id: string, status: string): Promise<AdminResult> {
  await requireSession();
  if (!INQUIRY_STATUSES.includes(status as InquiryStatus)) {
    return { ok: false, message: 'Unknown status.' };
  }
  try {
    await inquiryRepo.setStatus(id, status as InquiryStatus);
    revalidatePath('/admin/inquiries');
    revalidatePath(`/admin/inquiries/${id}`);
    revalidatePath('/admin');
    return { ok: true };
  } catch (error) {
    return failure(error, 'update');
  }
}

export async function deleteInquiry(id: string): Promise<AdminResult> {
  await requireSession();
  try {
    await inquiryRepo.remove(id);
    revalidatePath('/admin/inquiries');
    revalidatePath('/admin');
    return { ok: true };
  } catch (error) {
    return failure(error, 'delete');
  }
}

/* ── Settings ─────────────────────────────────────────────────────────────── */

export async function updateSettings(raw: unknown): Promise<AdminResult> {
  await requireSession();
  const parsed = settingsSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, message: 'Some fields need attention.', fieldErrors: fieldErrorsFrom(parsed.error) };
  }
  const { address, ...rest } = parsed.data;
  try {
    await settingsRepo.update({
      ...rest,
      // An empty pair means "no address", not a pair of empty strings.
      address: address.en || address.id ? address : null,
    });
    for (const locale of ['en', 'id']) {
      revalidatePath(`/${locale}`, 'layout');
    }
    revalidatePath('/admin/settings');
    return { ok: true };
  } catch (error) {
    return failure(error, 'save');
  }
}
