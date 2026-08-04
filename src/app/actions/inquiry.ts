'use server';

import { headers } from 'next/headers';
import { inquiryRepo } from '@/lib/repo';
import { inquiryFormSchema } from '@/lib/schemas/inquiry';

export interface ActionResult {
  ok: boolean;
  /** Machine-readable so the client picks the right localized message. */
  code?: 'VALIDATION' | 'RATE_LIMITED' | 'INTERNAL';
  fieldErrors?: Record<string, string>;
}

/**
 * ponytail: in-memory sliding window keyed by IP. Correct for a single process;
 * Phase 5 replaces it with a KV counter that works across instances.
 */
const LIMIT = { max: 3, windowMs: 10 * 60 * 1000 };
const attempts = new Map<string, number[]>();

function limited(key: string): boolean {
  const now = Date.now();
  const recent = (attempts.get(key) ?? []).filter((at) => now - at < LIMIT.windowMs);
  if (recent.length >= LIMIT.max) {
    attempts.set(key, recent);
    return true;
  }
  recent.push(now);
  attempts.set(key, recent);
  return false;
}

export async function submitInquiry(raw: unknown): Promise<ActionResult> {
  const parsed = inquiryFormSchema.safeParse(raw);

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join('.');
      if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { ok: false, code: 'VALIDATION', fieldErrors };
  }

  const h = await headers();
  const ip = h.get('x-forwarded-for')?.split(',')[0]?.trim() ?? h.get('x-real-ip') ?? 'unknown';
  if (limited(ip)) return { ok: false, code: 'RATE_LIMITED' };

  const d = parsed.data;

  try {
    await inquiryRepo.create({
      name: d.name,
      email: d.email,
      company: d.company || null,
      phone: d.phone || null,
      subject: d.subject,
      message: d.message,
      budgetRange: d.budgetRange,
      sourceType: d.sourceType,
      sourceId: d.sourceId,
      sourceTier: d.sourceTier,
      locale: d.locale,
      meta: { ip, userAgent: h.get('user-agent'), referrer: h.get('referer') },
    });
    return { ok: true };
  } catch (error) {
    // Detail stays server-side; the client gets a code, never a stack.
    console.error('[inquiry] failed to persist', error);
    return { ok: false, code: 'INTERNAL' };
  }
}
