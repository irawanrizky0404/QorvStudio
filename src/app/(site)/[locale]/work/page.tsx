import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { isLocale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/get-dictionary';
import { pickLocale } from '@/lib/i18n/pick-locale';
import { projectRepo } from '@/lib/repo';
import { routes } from '@/lib/routes';
import { PROJECT_CATEGORIES } from '@/types/content';
import type { Locale } from '@/types/content';

import { Reveal } from '@/components/motion/reveal';
import { Plate } from '@/components/ui/plate';
import { EmptyState } from '@/components/ui/states';
import { Container } from '@/components/ui/primitives';
import { FilterBar, PageHead } from '@/components/ui/system';

export const revalidate = 300;

const CATEGORY_LABEL: Record<string, string> = {
  'web-app': 'Web App',
  'mobile-app': 'Mobile App',
  '3d-animation': '3D / Animation',
  packaging: 'Packaging',
  branding: 'Branding',
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = await getDictionary(locale);
  return {
    title: t.work.title,
    description: t.work.subtitle,
    alternates: { canonical: `/${locale}/work`, languages: { en: '/en/work', id: '/id/work' } },
  };
}

/**
 * Work index.
 *
 * Tiga kolom, sama dengan grid Karya di beranda — halaman ini adalah versi
 * lengkap dari section itu, jadi memakai bentuk berbeda hanya akan membuat
 * keduanya terasa seperti dua tempat yang tidak berhubungan.
 *
 * Penyaring dipindah ke atas grid sebagai satu baris bersel bersambung, bukan
 * pil membulat mengambang. Versi lamanya `rounded-full bg-ink text-ink-soft`, yang
 * setelah palet berubah menjadi hitam di atas hitam.
 */
export default async function WorkPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<ReactNode> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale: Locale = raw;
  const t = await getDictionary(locale);

  const query = await searchParams;
  const category = typeof query.category === 'string' ? query.category : undefined;

  const projects = await projectRepo.list({ category, perPage: 24 });


  return (
    <>
      <PageHead label={t.nav.work} title={t.work.title} body={t.work.subtitle} />

      <Reveal as="section" className="band pt-0">
        <Container>
          <FilterBar
            ariaLabel={t.common.filter}
            items={[
              { href: routes.work(locale), label: t.common.all, active: !category },
              ...PROJECT_CATEGORIES.map((value) => ({
                href: `${routes.work(locale)}?category=${value}`,
                label: CATEGORY_LABEL[value] ?? value,
                active: category === value,
              })),
            ]}
          />

          {projects.items.length === 0 ? (
            <EmptyState className="mt-12" title={t.states.emptyTitle} body={t.work.emptyBody} />
          ) : (
            <div className="mt-10 grid grid-cols-1 items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {projects.items.map((project, position) => (
                <Link
                  key={project.id}
                  href={routes.project(locale, project.slug)}
                  className={`place flex h-full flex-col border-3 border-ink bg-paper transition-[transform,box-shadow] duration-150 ease-out hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[16px_16px_0_var(--color-ink)] focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-ink ${
                    position % 3 === 1 ? 'd-1' : position % 3 === 2 ? 'd-2' : ''
                  }`}
                >
                  <Plate
                    src={project.cover.url}
                    alt={pickLocale(project.cover.alt, locale)}
                    index={String(position + 1).padStart(2, '0')}
                    aspect="aspect-4/3"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    priority={position < 3}
                    divide="bottom"
                  />
                  <div className="flex flex-1 flex-col gap-3 p-6">
                    <div className="flex items-baseline justify-between gap-4">
                      <h2 className="display rank-4">{pickLocale(project.title, locale)}</h2>
                      <span className="label tabular shrink-0">{project.year}</span>
                    </div>
                    <p className="flex-1 text-[14.5px] leading-relaxed">
                      {pickLocale(project.summary, locale)}
                    </p>
                    <div className="flex items-baseline justify-between gap-4 border-t-3 border-ink pt-4">
                      <span className="label">{project.client}</span>
                      <span className="label">
                        {CATEGORY_LABEL[project.category] ?? project.category}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Container>
      </Reveal>
    </>
  );
}
