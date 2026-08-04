import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Mail, MessageCircle } from 'lucide-react';

import { formatDate } from '@/lib/format';
import { inquiryRepo, settingsRepo } from '@/lib/repo';
import { adminRoutes } from '@/lib/routes';

import { AdminHeader } from '@/components/admin/shell';
import { InquiryActions } from '@/components/admin/inquiry-actions';
import { StatusPill } from '@/components/admin/status-pill';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/primitives';

export const metadata: Metadata = { title: 'Inquiry' };
export const dynamic = 'force-dynamic';

const BUDGET_LABEL: Record<string, string> = {
  '<10m': 'Under IDR 10m',
  '10-50m': 'IDR 10m to 50m',
  '50-200m': 'IDR 50m to 200m',
  '200m+': 'Over IDR 200m',
  undecided: 'Undecided',
};

export default async function InquiryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<ReactNode> {
  const { id } = await params;
  const [inquiry, settings] = await Promise.all([inquiryRepo.getById(id), settingsRepo.get()]);
  if (!inquiry) notFound();

  const facts = [
    { label: 'Received', value: formatDate(inquiry.createdAt, 'en') },
    { label: 'Language', value: inquiry.locale === 'id' ? 'Indonesian' : 'English' },
    { label: 'Source', value: inquiry.sourceType },
    { label: 'Budget', value: inquiry.budgetRange ? BUDGET_LABEL[inquiry.budgetRange] ?? inquiry.budgetRange : 'Not stated' },
    { label: 'Package', value: inquiry.sourceTier ?? 'None' },
    { label: 'Company', value: inquiry.company ?? 'Not stated' },
    { label: 'Phone', value: inquiry.phone ?? 'Not stated' },
    { label: 'Read', value: inquiry.readAt ? formatDate(inquiry.readAt, 'en') : 'Not yet' },
    { label: 'Replied', value: inquiry.repliedAt ? formatDate(inquiry.repliedAt, 'en') : 'Not yet' },
  ];

  const replySubject = encodeURIComponent(`Re: ${inquiry.subject}`);
  const replyBody = encodeURIComponent(
    inquiry.locale === 'id'
      ? `Halo ${inquiry.name},\n\nTerima kasih sudah menghubungi ${settings.studioName}.\n\n`
      : `Hi ${inquiry.name},\n\nThank you for writing to ${settings.studioName}.\n\n`,
  );

  return (
    <>
      <Link
        href={adminRoutes.inquiries}
        className="mb-8 inline-flex items-center gap-2 text-[13px] text-ink-soft transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
      >
        <ArrowLeft className="size-3.5" aria-hidden strokeWidth={1.75} />
        All inquiries
      </Link>

      <AdminHeader
        title={inquiry.subject}
        body={`${inquiry.name} · ${inquiry.email}`}
        action={
          <>
            <Button asChild size="sm">
              <a href={`mailto:${inquiry.email}?subject=${replySubject}&body=${replyBody}`}>
                <Mail className="size-4" aria-hidden strokeWidth={1.75} />
                Reply by email
              </a>
            </Button>
            {inquiry.phone ? (
              <Button asChild variant="outline" size="sm">
                <a
                  href={`https://wa.me/${inquiry.phone.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  <MessageCircle className="size-4" aria-hidden strokeWidth={1.75} />
                  WhatsApp
                </a>
              </Button>
            ) : null}
          </>
        }
      />

      <div className="grid gap-8 lg:grid-cols-12">
        <Card className="lg:col-span-8">
          <div className="flex items-center gap-3">
            <StatusPill status={inquiry.status} />
            <span className="text-[11px] text-ink-soft">{inquiry.id}</span>
          </div>
          <h2 className="display mt-6 text-xl text-ink">Message</h2>
          {/* whitespace-pre-wrap: the operator wrote line breaks, keep them. */}
          <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-ink-soft">
            {inquiry.message}
          </p>

          <div className="mt-10 border-t-3 border-ink pt-8">
            <InquiryActions id={inquiry.id} status={inquiry.status} name={inquiry.name} />
          </div>
        </Card>

        <Card className="lg:col-span-4">
          <h2 className="display text-xl text-ink">Details</h2>
          <dl className="mt-6 flex flex-col divide-y divide-line">
            {facts.map((fact) => (
              <div key={fact.label} className="flex items-baseline justify-between gap-4 py-3">
                <dt className="text-[13px] text-ink-soft">{fact.label}</dt>
                <dd className="text-right text-[13px] text-ink">{fact.value}</dd>
              </div>
            ))}
          </dl>
        </Card>
      </div>
    </>
  );
}
