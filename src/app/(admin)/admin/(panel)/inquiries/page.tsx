import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';

import { formatDateShort } from '@/lib/format';
import { inquiryRepo } from '@/lib/repo';
import { adminRoutes } from '@/lib/routes';
import { cn } from '@/lib/utils';

import { AdminHeader } from '@/components/admin/shell';
import { StatusPill } from '@/components/admin/status-pill';
import { EmptyState } from '@/components/ui/states';

export const metadata: Metadata = { title: 'Inquiries' };
export const dynamic = 'force-dynamic';

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'new', label: 'New' },
  { value: 'read', label: 'Read' },
  { value: 'replied', label: 'Replied' },
  { value: 'archived', label: 'Archived' },
] as const;

/**
 * Inquiry inbox. The filter lives in the URL rather than in component state so
 * a filtered view can be linked, bookmarked, and reloaded.
 */
export default async function InquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}): Promise<ReactNode> {
  const { status } = await searchParams;
  const active = FILTERS.some((filter) => filter.value === status) ? (status as string) : 'all';

  const [{ items }, counts] = await Promise.all([
    inquiryRepo.list({ status: active, perPage: 50 }),
    inquiryRepo.countByStatus(),
  ]);

  const totals: Record<string, number> = {
    all: counts.new + counts.read + counts.replied + counts.archived,
    ...counts,
  };

  return (
    <>
      <AdminHeader
        title="Inquiries"
        body="Every CTA on the site ends here. There is no checkout, so this is the only conversion path."
      />

      <nav aria-label="Filter by status" className="mb-8 flex flex-wrap gap-2">
        {FILTERS.map((filter) => {
          const isActive = filter.value === active;
          return (
            <Link
              key={filter.value}
              href={
                filter.value === 'all'
                  ? adminRoutes.inquiries
                  : `${adminRoutes.inquiries}?status=${filter.value}`
              }
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'inline-flex min-h-11 items-center gap-2 px-5 text-[13px] transition-colors',
                'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink',
                isActive
                  ? 'bg-acid text-ink'
                  : 'bg-paper text-ink-soft border-3 border-ink hover:text-ink',
              )}
            >
              {filter.label}
              <span className="text-[11px] opacity-70">
                {totals[filter.value] ?? 0}
              </span>
            </Link>
          );
        })}
      </nav>

      {items.length === 0 ? (
        <EmptyState
          title="Nothing here"
          body={
            active === 'all'
              ? 'No one has written in yet. Submissions from the contact form land here.'
              : `No inquiries with the ${active} status.`
          }
        />
      ) : (
        <ul className="divide-y divide-line border-y border-ink">
          {items.map((inquiry) => (
            <li key={inquiry.id}>
              <Link
                href={adminRoutes.inquiry(inquiry.id)}
                className="group flex flex-wrap items-center gap-x-5 gap-y-3 py-5 transition-colors hover:bg-paper/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
              >
                <div className="min-w-0 flex-1 basis-64">
                  <p
                    className={cn(
                      'truncate text-sm transition-colors decoration-[3px] underline-offset-4 group-hover:underline',
                      inquiry.status === 'new' ? 'text-ink' : 'text-ink-soft',
                    )}
                  >
                    {inquiry.subject}
                  </p>
                  <p className="mt-1 truncate text-[13px] text-ink-soft">
                    {inquiry.name} · {inquiry.email}
                    {inquiry.company ? ` · ${inquiry.company}` : ''}
                  </p>
                </div>

                <StatusPill status={inquiry.status} />
                <span className="shrink-0 bg-paper px-3 py-1 text-[12px] uppercase text-ink-soft border-3 border-ink">
                  {inquiry.sourceType}
                </span>
                <span className="hidden shrink-0 text-[11px] text-ink-soft sm:block">
                  {formatDateShort(inquiry.createdAt, 'en')}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
