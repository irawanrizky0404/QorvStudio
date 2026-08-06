import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { isLocale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/get-dictionary';
import { pickLocale } from '@/lib/i18n/pick-locale';
import { getPricingView } from '@/lib/repo';
import { routes } from '@/lib/routes';
import type { Locale } from '@/types/content';

import { Reveal } from '@/components/motion/reveal';
import { Accordion } from '@/components/ui/accordion';
import { Price, TierCard } from '@/components/pricing/price';
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
    title: t.pricing.title,
    description: t.pricing.subtitle,
    alternates: {
      canonical: `/${locale}/pricing`,
      languages: { en: '/en/pricing', id: '/id/pricing' },
    },
  };
}

/**
 * Aggregate pricing view. It reads the service and product repositories and owns
 * no prices of its own, so a package edited in the admin panel updates here in
 * the same action.
 *
 * Services and products are laid out differently on purpose: a service carries a
 * package ladder, a product carries one indicative price, and forcing them into
 * a single table would imply they are comparable.
 */
export default async function PricingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<ReactNode> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale: Locale = raw;
  const t = await getDictionary(locale);

  const { services, products } = await getPricingView();

  const engagement = [
    {
      id: 'eng-1',
      question: locale === 'id' ? 'Bagaimana pembayarannya?' : 'How does payment work?',
      answer:
        locale === 'id'
          ? 'Tidak ada pembayaran otomatis di situs ini. Setiap kerja sama dimulai dari percakapan, lalu penawaran tertulis dengan termin yang disepakati: umumnya 50% di muka dan sisanya saat serah terima.'
          : 'There is no automated payment on this site. Every engagement starts with a conversation, then a written proposal with agreed terms, usually 50% up front and the balance on handover.',
    },
    {
      id: 'eng-2',
      question: locale === 'id' ? 'Apakah harga ini final?' : 'Are these prices final?',
      answer:
        locale === 'id'
          ? 'Bukan. Angka di halaman ini adalah titik awal untuk lingkup umum. Angka final ditentukan setelah kami memahami masalahnya, dan kami menjelaskan apa yang membuatnya naik atau turun.'
          : 'No. These are starting points for a typical scope. The final number is set once we understand the problem, and we always explain what moves it up or down.',
    },
    {
      id: 'eng-3',
      question: locale === 'id' ? 'Berapa banyak revisi?' : 'How many revisions are included?',
      answer:
        locale === 'id'
          ? 'Tercantum di setiap paket. Di luar itu kami bekerja per jam, dan Anda selalu diberi tahu sebelum jam tambahan dimulai.'
          : 'Listed per package. Beyond that we work hourly, and you are always told before additional hours begin.',
    },
    {
      id: 'eng-4',
      question: locale === 'id' ? 'Siapa pemilik hasil kerjanya?' : 'Who owns the work?',
      answer:
        locale === 'id'
          ? 'Anda, sepenuhnya, setelah pelunasan. Kode, berkas sumber, dan aset diserahkan tanpa syarat tambahan.'
          : 'You do, in full, on final payment. Code, source files, and assets are handed over with no further conditions.',
    },
  ];

  return (
    <>
      <PageHead label={t.nav.pricing} title={t.pricing.title} body={t.pricing.subtitle} />

      {/* Service packages, grouped per service */}
      <Reveal as="div">
        <Block label={t.pricing.servicesHeading} title={[t.pricing.servicesHeading]} body={t.home.capabilitiesBody}>
          <div className="flex flex-col gap-16">
            {services.map((service) => {
              const name = pickLocale(service.name, locale);
              return (
                <div key={service.id}>
                  <div className="flex flex-wrap items-end justify-between gap-5 border-b-3 border-ink pb-5">
                    <div>
                      <h3 className="display rank-3">{name}</h3>
                      <p className="mt-3 text-[15px]">{pickLocale(service.tagline, locale)}</p>
                    </div>
                    <Link
                      href={routes.service(locale, service.slug)}
                      className="inline-flex w-fit items-center label text-ink underline decoration-ink decoration-[3px] underline-offset-4 transition-[text-decoration-thickness] duration-150 pointer-coarse:min-h-11 hover:decoration-[5px] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ink"
                    >
                      {t.common.viewService}
                    </Link>
                  </div>

                  {service.packages.length === 0 ? (
                    /* Quote-only services are shown, not hidden: the offering exists. */
                    <div className="mt-7 flex flex-wrap items-center justify-between gap-6 border-3 border-ink bg-paper p-7 shadow-[9px_9px_0_var(--color-ink)]">
                      <p className="max-w-lg text-[15px] leading-relaxed">
                        {pickLocale(service.description, locale).split('\n\n')[0]}
                      </p>
                      <InquiryDialog
                        label={t.pricing.requestQuote}
                        sourceType="pricing"
                        sourceId={service.id}
                        contextLabel={t.inquiry.contextService}
                        contextValue={name}
                        variant="outline"
                      />
                    </div>
                  ) : (
                    /* Selalu tiga kolom. Setiap layanan kini punya tangga
                       Basic/Gold/Premium yang lengkap di data, jadi tidak ada
                       lagi baris yang menyisakan sel kosong di ujungnya. */
                    <div className="mt-7 grid gap-6 lg:grid-cols-3 lg:grid-rows-[auto_auto_auto_1fr_auto]">
                      {service.packages.map((tier) => (
                        <TierCard
                          key={tier.tier}
                          tier={tier}
                          locale={locale}
                          t={t}
                          serviceId={service.id}
                          serviceName={name}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Block>
      </Reveal>

      {/* Product licensing: one indicative price each, no tiers */}
      <Reveal as="div">
        <Block label={t.pricing.productsHeading} title={[t.pricing.productsHeading]} body={t.products.subtitle}>
          <ul className="grid gap-[3px] border-3 border-ink bg-ink">
            {products.map((product) => {
              const name = pickLocale(product.name, locale);
              const note = pickLocale(product.price.note, locale);
              return (
                <li key={product.id} className="grid items-center gap-6 bg-paper p-6 md:grid-cols-12">
                  <div className="md:col-span-5">
                    <div className="flex flex-wrap items-baseline gap-3">
                      <Link
                        href={routes.product(locale, product.slug)}
                        className="inline-flex w-fit items-center display rank-4 underline decoration-ink decoration-[3px] underline-offset-4 transition-[text-decoration-thickness] duration-150 pointer-coarse:min-h-11 hover:decoration-[5px] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ink"
                      >
                        {name}
                      </Link>
                      <span className="label">{t.products.status[product.productStatus]}</span>
                    </div>
                    <p className="mt-3 text-[14.5px] leading-relaxed">
                      {pickLocale(product.tagline, locale)}
                    </p>
                  </div>

                  <div className="md:col-span-4">
                    <Price
                      amount={product.price.startingPrice}
                      currency={product.price.currency}
                      locale={locale}
                      t={t}
                      unit={product.price.unit}
                      showFrom
                      size="sm"
                    />
                    {note ? <p className="label mt-2">{note}</p> : null}
                  </div>

                  <div className="md:col-span-3 md:justify-self-end">
                    <InquiryDialog
                      label={t.pricing.inquireAbout}
                      sourceType="pricing"
                      sourceId={product.id}
                      contextLabel={t.inquiry.contextProduct}
                      contextValue={name}
                      variant="outline"
                      size="sm"
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </Block>
      </Reveal>

      <Reveal as="div">
        <Block label={t.pricing.faqHeading} title={[t.pricing.faqHeading]} body={t.home.faqBody}>
          {/* Selebar container. Sebelumnya `max-w-4xl` rata kiri, yang
              meninggalkan sepertiga halaman kosong di sebelah kanan daftar —
              lubang yang terbaca sebagai kolom yang lupa diisi. */}
          <Accordion items={engagement} />
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
              <InquiryDialog label={t.home.ctaButton} sourceType="pricing" size="lg" />
            </div>
          </div>
        </Container>
      </Reveal>
    </>
  );
}
