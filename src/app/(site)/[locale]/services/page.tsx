import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { isLocale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/get-dictionary';
import { pickLocale } from '@/lib/i18n/pick-locale';
import { serviceRepo } from '@/lib/repo';
import { routes } from '@/lib/routes';
import { formatPriceCompact } from '@/lib/format';
import type { Locale } from '@/types/content';

import { Reveal } from '@/components/motion/reveal';
import { InquiryDialog } from '@/components/inquiry/inquiry-dialog';
import { Plate } from '@/components/ui/plate';
import { EmptyState } from '@/components/ui/states';
import { Container } from '@/components/ui/primitives';
import { PageHead, Printed, Spec } from '@/components/ui/system';

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
    title: t.services.title,
    description: t.home.capabilitiesBody,
    alternates: {
      canonical: `/${locale}/services`,
      languages: { en: '/en/services', id: '/id/services' },
    },
  };
}

/**
 * Services index.
 *
 * Enam disiplin dalam grid tiga kolom, dua baris penuh — sama dengan Karya.
 * Halaman beranda memberi tiga di antaranya bayangan lebih panjang karena tiga
 * itu yang dijual paling depan; di sini keenamnya setara, karena halaman ini
 * daftar lengkap dan bukan etalase.
 *
 * Versi sebelumnya adalah daftar baris selebar halaman dengan sampul yang baru
 * muncul saat pointer mendekat. Itu menyembunyikan satu-satunya hal yang
 * membuat disiplin bisa dinilai sekilas, dan di ground kertas efek munculnya
 * tidak terbaca sama sekali.
 */
export default async function ServicesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<ReactNode> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale: Locale = raw;
  const t = await getDictionary(locale);

  const services = await serviceRepo.list({ perPage: 24 });



  return (
    <>
      <PageHead label={t.nav.services} title={t.services.title} body={t.home.capabilitiesBody} />

      <Reveal as="section" className="band pt-0">
        <Container>
          {services.items.length === 0 ? (
            <EmptyState title={t.states.emptyTitle} body={t.services.emptyBody} />
          ) : (
            <div className="grid grid-cols-1 items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {services.items.map((service, position) => (
                <Link
                  key={service.id}
                  href={routes.service(locale, service.slug)}
                  className={`place flex h-full flex-col border-3 border-ink bg-paper transition-[transform,box-shadow] duration-150 ease-out hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[16px_16px_0_var(--color-ink)] focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-ink ${
                    position % 3 === 1 ? 'd-1' : position % 3 === 2 ? 'd-2' : ''
                  }`}
                >
                  <Plate
                    src={service.cover.url}
                    alt={pickLocale(service.cover.alt, locale)}
                    index={String(position + 1).padStart(2, '0')}
                    aspect="aspect-4/3"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    priority={position < 3}
                    divide="bottom"
                  />
                  <div className="flex flex-1 flex-col gap-3 p-6">
                    <h2 className="display rank-4">{pickLocale(service.name, locale)}</h2>
                    <p className="flex-1 text-[14.5px] leading-relaxed">
                      {pickLocale(service.tagline, locale)}
                    </p>
                    <div className="mt-2">
                      <Spec
                        label={t.services.startingFrom}
                        value={formatPriceCompact(
                          service.startingPrice,
                          service.currency,
                          locale,
                          t.pricing.contactUs,
                        )}
                      />
                      <Spec
                        label={t.services.typicalTimeline}
                        value={pickLocale(service.timelineLabel, locale)}
                      />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Container>
      </Reveal>

      {/* Ajakan penutup. Satu bidang acid, sama seperti sel terakhir di footer. */}
      <Reveal as="section" className="band pt-0">
        <Container>
          <div className="place grid gap-8 border-3 border-ink bg-acid p-8 md:grid-cols-2 md:items-end md:p-12">
            <h2 className="display rank-2 max-w-[14ch]">
              <Printed lines={[t.home.ctaTitle]} />
            </h2>
            <div className="md:justify-self-end">
              <InquiryDialog label={t.home.ctaButton} sourceType="service" size="lg" />
            </div>
          </div>
        </Container>
      </Reveal>
    </>
  );
}
