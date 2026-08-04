import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { isLocale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/get-dictionary';
import { pickLocale } from '@/lib/i18n/pick-locale';
import { productRepo } from '@/lib/repo';
import { routes } from '@/lib/routes';
import { formatPriceCompact } from '@/lib/format';
import { PRODUCT_STATUSES } from '@/types/content';
import type { Locale } from '@/types/content';

import { Reveal } from '@/components/motion/reveal';
import { Plate } from '@/components/ui/plate';
import { EmptyState } from '@/components/ui/states';
import { Container } from '@/components/ui/primitives';
import { FilterBar, PageHead, Spec } from '@/components/ui/system';

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = await getDictionary(locale);
  return {
    title: t.products.title,
    description: t.products.subtitle,
    alternates: {
      canonical: `/${locale}/products`,
      languages: { en: '/en/products', id: '/id/products' },
    },
  };
}

/**
 * Products index.
 *
 * Empat kolom, sama dengan section Produk di beranda. Produk punya lebih sedikit
 * hal untuk dibaca per kartu dibanding karya — nama, satu kalimat, satu angka —
 * jadi selnya boleh lebih sempit tanpa isinya jadi sesak.
 */
export default async function ProductsPage({
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
  const status = typeof query.status === 'string' ? query.status : undefined;

  const products = await productRepo.list({ category: status, perPage: 24 });



  return (
    <>
      <PageHead label={t.nav.products} title={t.products.title} body={t.products.subtitle} />

      <Reveal as="section" className="band pt-0">
        <Container>
          <FilterBar
            ariaLabel={t.common.filter}
            items={[
              { href: routes.products(locale), label: t.common.all, active: !status },
              ...PRODUCT_STATUSES.map((value) => ({
                href: `${routes.products(locale)}?status=${value}`,
                label: t.products.status[value],
                active: status === value,
              })),
            ]}
          />

          {products.items.length === 0 ? (
            <EmptyState className="mt-12" title={t.states.emptyTitle} body={t.products.emptyBody} />
          ) : (
            <div className="mt-10 grid grid-cols-1 items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {products.items.map((product, position) => (
                <Link
                  key={product.id}
                  href={routes.product(locale, product.slug)}
                  className={`place flex h-full flex-col border-3 border-ink bg-paper transition-[transform,box-shadow] duration-150 ease-out hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[16px_16px_0_var(--color-ink)] focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-ink ${
                    position % 4 === 1 ? 'd-1' : position % 4 === 2 ? 'd-2' : position % 4 === 3 ? 'd-3' : ''
                  }`}
                >
                  <Plate
                    src={product.cover.url}
                    alt={pickLocale(product.cover.alt, locale)}
                    aspect="aspect-4/3"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    priority={position < 4}
                    divide="bottom"
                  />
                  <div className="flex flex-1 flex-col gap-3 p-5">
                    <div className="flex items-baseline justify-between gap-3">
                      <h2 className="display rank-5">{pickLocale(product.name, locale)}</h2>
                      <span className="label shrink-0">
                        {t.products.status[product.productStatus]}
                      </span>
                    </div>
                    <p className="flex-1 text-[14px] leading-relaxed">
                      {pickLocale(product.tagline, locale)}
                    </p>
                    <Spec
                      label={t.pricing.from}
                      value={formatPriceCompact(
                        product.price.startingPrice,
                        product.price.currency,
                        locale,
                        t.pricing.contactUs,
                      )}
                    />
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
