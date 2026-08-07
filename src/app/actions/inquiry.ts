'use server';

import { headers } from 'next/headers';
import { inquiryRepo } from '@/lib/repo';
import { inquiryFormSchema } from '@/lib/schemas/inquiry';
import { hit } from '@/lib/rate-limit';

export interface ActionResult {
  ok: boolean;
  /** Machine-readable so the client picks the right localized message. */
  code?: 'VALIDATION' | 'RATE_LIMITED' | 'INTERNAL';
  fieldErrors?: Record<string, string>;
}

/** Tiga kiriman per IP tiap sepuluh menit. Hitungannya di Redis — lihat `hit`. */
const MAX = 3;
const WINDOW_SEC = 10 * 60;

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
  const rate = await hit('inquiry', ip, MAX, WINDOW_SEC);
  if (rate.limited) return { ok: false, code: 'RATE_LIMITED' };

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
