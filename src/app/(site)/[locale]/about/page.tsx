import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';

import { isLocale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/get-dictionary';
import { pickLocale } from '@/lib/i18n/pick-locale';
import { serviceRepo } from '@/lib/repo';
import type { Locale } from '@/types/content';

import { Reveal } from '@/components/motion/reveal';
import { InquiryDialog } from '@/components/inquiry/inquiry-dialog';
import { Container } from '@/components/ui/primitives';
import { Block, PageHead, Printed } from '@/components/ui/system';

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
    title: t.about.title,
    description: t.about.subtitle,
    alternates: { canonical: `/${locale}/about`, languages: { en: '/en/about', id: '/id/about' } },
  };
}

/**
 * Studio.
 *
 * Dua grid bersel, keduanya tiga kolom dan genap: disiplin dan prinsip. Dibangun
 * dari konstruksi yang sama dengan footer dan strip angka — sel kertas dipisah
 * garis tinta 3px — jadi halaman ini tidak memperkenalkan bentuk baru apapun.
 *
 * Ikon dalam cincin ganda dan panel bertekstur dari versi sebelumnya dibuang.
 * Keduanya dari template referensi, dan tidak satupun menerangkan isi selnya.
 */
export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<ReactNode> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale: Locale = raw;
  const t = await getDictionary(locale);

  const services = await serviceRepo.list({ perPage: 12 });

  return (
    <>
      <PageHead label={t.nav.about} title={t.about.title} body={t.about.subtitle} />

      {/* Keempat seksi memakai `Block` yang sama.
        *
        * Persona dulunya dua kolom bikinan sendiri — judul kiri, teks kanan —
        * dengan garis atas sendiri. Bentuknya tidak muncul di halaman lain
        * manapun, jadi ia membaca sebagai seksi dari situs yang berbeda, dan
        * judulnya jatuh di ritme yang lain dari dua blok di bawahnya. */}
      <Reveal as="div">
        <Block label={t.about.persona} title={[t.about.persona]} body={t.home.intro}>
          <p className="max-w-[68ch] text-[15.5px] leading-relaxed">
            {t.home.statementLead} {t.home.statementAccent} {t.home.statementTail}
          </p>
        </Block>
      </Reveal>

      <Reveal as="div">
        <Block label={t.about.capabilities} title={[t.about.capabilities]} body={t.services.subtitle}>
          <div className="grid gap-[3px] border-3 border-ink ruled sm:grid-cols-2 lg:grid-cols-3">
            {services.items.map((service, position) => (
              <div key={service.id} className="flex flex-col gap-3 bg-paper p-7">
                <span className="label tabular">{String(position + 1).padStart(2, '0')}</span>
                <h3 className="display rank-4">{pickLocale(service.name, locale)}</h3>
                <p className="text-[14.5px] leading-relaxed">
                  {pickLocale(service.tagline, locale)}
                </p>
              </div>
            ))}
          </div>
        </Block>
      </Reveal>

      <Reveal as="div">
        <Block label={t.about.process} title={[t.about.process]} body={t.home.whyBody}>
          <div className="grid gap-[3px] border-3 border-ink ruled sm:grid-cols-2 lg:grid-cols-3">
            {t.home.reasons.map((reason) => (
              <div key={reason.title} className="flex flex-col gap-3 bg-paper p-7">
                <span className="display rank-4 inline-flex size-9 items-center justify-center bg-acid">
                  {reason.mark}
                </span>
                <h3 className="display rank-5 mt-2">{reason.title}</h3>
                <p className="text-[14.5px] leading-relaxed">{reason.body}</p>
              </div>
            ))}
          </div>
        </Block>
      </Reveal>

      <Reveal as="section" className="band pt-0">
        <Container>
          <div className="place grid gap-8 border-3 border-ink bg-acid p-8 md:grid-cols-2 md:items-end md:p-12">
            <div className="grid gap-5">
              <h2 className="display rank-2 max-w-[14ch]">
                <Printed lines={[t.home.ctaTitle]} />
              </h2>
              <p className="max-w-[42ch] text-[15.5px] leading-relaxed text-ink">{t.home.ctaBody}</p>
            </div>
            <div className="md:justify-self-end">
              <InquiryDialog label={t.home.ctaButton} sourceType="contact" size="lg" />
            </div>
          </div>
        </Container>
      </Reveal>
    </>
  );
}
