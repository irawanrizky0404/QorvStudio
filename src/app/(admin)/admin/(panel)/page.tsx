import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight } from 'lucide-react';

import { formatDateShort } from '@/lib/format';
import { adminRoutes } from '@/lib/routes';
import { inquiryRepo, productRepo, projectRepo, serviceRepo } from '@/lib/repo';
import { pickLocale } from '@/lib/i18n/pick-locale';

import { AdminHeader } from '@/components/admin/shell';
import { StatusPill } from '@/components/admin/status-pill';
import { Button } from '@/components/ui/button';
import { Card, RuledCell, RuledGrid } from '@/components/ui/primitives';

export const metadata: Metadata = { title: 'Dashboard' };
export const dynamic = 'force-dynamic';

export default async function DashboardPage(): Promise<ReactNode> {
  const [projects, services, products, inquiries, counts] = await Promise.all([
    projectRepo.list({ perPage: 50, includeDrafts: true }),
    serviceRepo.list({ perPage: 50, includeDrafts: true }),
    productRepo.list({ perPage: 50, includeDrafts: true }),
    inquiryRepo.list({ perPage: 6 }),
    inquiryRepo.countByStatus(),
  ]);

  const draftCount = [projects, services, products].reduce(
    (total, page) => total + page.items.filter((item) => item.status === 'draft').length,
    0,
  );

  const stats = [
    { label: 'Projects', value: projects.total, href: adminRoutes.projects },
    { label: 'Services', value: services.total, href: adminRoutes.services },
    { label: 'Products', value: products.total, href: adminRoutes.products },
    { label: 'New inquiries', value: counts.new, href: adminRoutes.inquiries },
  ];

  return (
    <>
      <AdminHeader
        title="Dashboard"
        body="What is published, what is still a draft, and who has written in."
        action={
          <Button asChild size="sm">
            <Link href={adminRoutes.projectNew}>New project</Link>
          </Button>
        }
      />

      <RuledGrid columns={4}>
        {stats.map((stat) => (
          <RuledCell key={stat.label} className="p-6 md:p-8">
            <Link
              href={stat.href}
              className="group block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
            >
              <p className="text-[13px] text-ink-soft">{stat.label}</p>
              <p className="display mt-3 text-4xl text-ink">{stat.value}</p>
              <span className="mt-4 inline-flex items-center gap-2 text-[13px] text-ink-soft transition-colors group-hover:text-ink">
                Manage
                <ArrowRight
                  aria-hidden
                  strokeWidth={1.5}
                  className="size-3.5 transition-transform group-hover:translate-x-1"
                />
              </span>
            </Link>
          </RuledCell>
        ))}
      </RuledGrid>

      <div className="mt-10 grid gap-8 lg:grid-cols-12">
        <Card className="lg:col-span-7">
          <div className="flex items-center justify-between gap-4">
            <h2 className="display text-xl text-ink">Recent inquiries</h2>
            <Link
              href={adminRoutes.inquiries}
              className="text-[13px] text-ink-soft transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
            >
              View all
            </Link>
          </div>

          {inquiries.items.length === 0 ? (
            <p className="mt-8 text-sm text-ink-soft">No inquiries yet.</p>
          ) : (
            <ul className="mt-6 divide-y divide-line">
              {inquiries.items.map((inquiry) => (
                <li key={inquiry.id}>
                  <Link
                    href={adminRoutes.inquiry(inquiry.id)}
                    className="group flex items-center gap-4 py-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-ink transition-colors decoration-[3px] underline-offset-4 group-hover:underline">
                        {inquiry.subject}
                      </p>
                      <p className="mt-1 truncate text-[13px] text-ink-soft">
                        {inquiry.name} · {inquiry.email}
                      </p>
                    </div>
                    <StatusPill status={inquiry.status} />
                    <span className="hidden text-[11px] text-ink-soft sm:block">
                      {formatDateShort(inquiry.createdAt, 'en')}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="lg:col-span-5">
          <h2 className="display text-xl text-ink">Drafts</h2>
          <p className="mt-3 text-sm leading-relaxed text-ink-soft">
            {draftCount === 0
              ? 'Everything is published.'
              : `${draftCount} ${draftCount === 1 ? 'record is' : 'records are'} still hidden from the public site.`}
          </p>

          <ul className="mt-6 flex flex-col gap-3">
            {[
              ...projects.items
                .filter((item) => item.status === 'draft')
                .map((item) => ({
                  id: item.id,
                  name: pickLocale(item.title, 'en'),
                  href: adminRoutes.projectEdit(item.id),
                  kind: 'Project',
                })),
              ...services.items
                .filter((item) => item.status === 'draft')
                .map((item) => ({
                  id: item.id,
                  name: pickLocale(item.name, 'en'),
                  href: adminRoutes.serviceEdit(item.id),
                  kind: 'Service',
                })),
              ...products.items
                .filter((item) => item.status === 'draft')
                .map((item) => ({
                  id: item.id,
                  name: pickLocale(item.name, 'en'),
                  href: adminRoutes.productEdit(item.id),
                  kind: 'Product',
                })),
            ].map((draft) => (
              <li key={draft.id}>
                <Link
                  href={draft.href}
                  className="group flex items-center justify-between gap-4 bg-paper px-5 py-4 border-3 border-ink transition-colors hover:border-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm text-ink transition-colors decoration-[3px] underline-offset-4 group-hover:underline">
                      {draft.name}
                    </span>
                    <span className="mt-1 block text-[13px] text-ink-soft">{draft.kind}</span>
                  </span>
                  <ArrowRight
                    aria-hidden
                    strokeWidth={1.5}
                    className="size-4 shrink-0 text-ink-soft transition-transform group-hover:translate-x-1"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* ── Dokumen desain ─────────────────────────────────────────────────
        * Disalin ke `public/docs/` supaya bisa dibuka lewat URL — Next hanya
        * menyajikan berkas statis dari `public/`, sementara sumbernya tetap di
        * `docs/` bersama dokumen proyek lain.
        *
        * Dibuka di tab baru, bukan menggantikan panel: operator biasanya membuka
        * ini sambil menyunting konten, bukan sebagai tujuan akhir.
        */}
      <div className="mt-6 grid gap-[3px] border-3 border-ink bg-ink sm:grid-cols-2">
        {[
          {
            href: '/docs/web_design_system.html',
            title: 'Sistem Desain Web',
            body: 'Palet, tipografi, tangga bayangan, komponen, motion, dan peta halaman situs ini.',
          },
          {
            href: '/docs/brand_guidelines.html',
            title: 'Brand Guidelines',
            body: 'Identitas perusahaan: logotype, warna, dan aturan pakai lintas kemasan, 3D, dan cetak.',
          },
        ].map((doc) => (
          <a
            key={doc.href}
            href={doc.href}
            target="_blank"
            rel="noreferrer noopener"
            className="group flex flex-col gap-3 bg-paper p-6 transition-colors duration-150 hover:bg-acid focus-visible:outline-3 focus-visible:-outline-offset-3 focus-visible:outline-ink"
          >
            <span className="label">Dokumen</span>
            <span className="display rank-4 flex items-center gap-3">
              {doc.title}
              <ArrowUpRight
                aria-hidden
                strokeWidth={2}
                className="size-5 shrink-0 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </span>
            <span className="text-[14px] leading-relaxed">{doc.body}</span>
          </a>
        ))}
      </div>
    </>
  );
}
