import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Tone = 'acid' | 'neutral' | 'muted' | 'danger';

/**
 * Warna dipakai sebagai BIDANG, bukan sebagai warna teks.
 *
 * Versi lama menyetel teks acid di atas latar acid 12% — cukup di ground gelap,
 * tapi di atas kertas acid pada teks kecil praktis tidak terbaca. Sekarang
 * bidangnya yang berwarna dan tulisannya selalu tinta.
 */
const TONES: Record<Tone, string> = {
  acid: 'bg-acid text-ink',
  neutral: 'bg-paper-dim text-ink',
  muted: 'bg-paper text-ink-soft',
  danger: 'bg-danger text-paper border-danger',
};

const LOOKUP: Record<string, { label: string; tone: Tone }> = {
  published: { label: 'Published', tone: 'acid' },
  draft: { label: 'Draft', tone: 'muted' },
  new: { label: 'New', tone: 'acid' },
  read: { label: 'Read', tone: 'neutral' },
  replied: { label: 'Replied', tone: 'neutral' },
  archived: { label: 'Archived', tone: 'muted' },
  available: { label: 'Available', tone: 'acid' },
  beta: { label: 'Beta', tone: 'neutral' },
  'coming-soon': { label: 'Coming soon', tone: 'muted' },
};

/** One vocabulary for every state chip in the panel. */
export function StatusPill({
  status,
  className,
}: {
  status: string;
  className?: string;
}): ReactNode {
  const entry = LOOKUP[status] ?? { label: status, tone: 'muted' as Tone };
  return (
    <span
      className={cn(
        'label inline-flex shrink-0 items-center border-3 border-ink px-3 py-1.5',
        TONES[entry.tone],
        className,
      )}
    >
      {entry.label}
    </span>
  );
}
