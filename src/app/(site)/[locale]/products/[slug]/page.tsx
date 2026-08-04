import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ExternalLink, FileText } from 'lucide-react';

import { LOCALES, isLocale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/get-dictionary';
import { pickLocale, pickLocaleList } from '@/lib/i18n/pick-locale';
import { productRepo, getProductsByIds } from '@/lib/repo';
import { routes } from '@/lib/routes';
import { formatDate } from '@/lib/format';
import type { Locale } from '@/types/content';

import { Reveal } from '@/components/motion/reveal';
import { Block } from '@/components/ui/system';
import { Button } from '@/components/ui/button';
import { Media } from '@/components/ui/media';
import { Accordion } from '@/components/ui/accordion';
import { Price } from '@/components/pricing/price';
import { InquiryDialog } from '@/components/inquiry/inquiry-dialog';
import { ProductFeatureIcon } from '@/components/product/product-feature-icon';
import {
  Card,
  Container,
  RingIcon,
  RuledCell,
  RuledGrid,
  Section,
  SectionIntro,
  Tag,
} from '@/components/ui/primitives';

export const revalidate = 300;

export async function generateStaticParams(): Promise<Array<{ locale: string; slug: string }>> {
  const products = await productRepo.list({ perPage: 50 });
  return LOCALES.flatMap((locale) =>
    products.items.map((product) => ({ locale, slug: product.slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const product = await productRepo.getBySlug(slug);
  if (!product) return {};

  const title = pickLocale(product.seo.title, locale) || pickLocale(product.name, locale);
  const description =
    pickLocale(product.seo.description, locale) || pickLocale(product.tagline, locale);

  return {
    title,
    description,
    alternates: {
      canonical: `/${locale}/products/${slug}`,
      languages: { en: `/en/products/${slug}`, id: `/id/products/${slug}` },
    },
    openGraph: { title, description },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<ReactNode> {
  const { locale: raw, slug } = await params;
  if (!isLocale(raw)) notFound();
  const locale: Locale = raw;
  const t = await getDictionary(locale);

  const product = await productRepo.getBySlug(slug);
  if (!product || product.status !== 'published') notFound();

  const name = pickLocale(product.name, locale);
  const requirements = pickLocaleList(product.requirements, locale);
  const related = (await getProductsByIds(product.relatedProductIds)).filter(
    (item) => item.status === 'published' && item.id !== product.id,
  );

  const specs = [
    { label: t.products.platforms, values: product.platforms },
    { label: t.products.techStack, values: product.techStack },
    { label: t.products.integrations, values: product.integrations },
  ].filter((spec) => spec.values.length > 0);

  return (
    <article>
      <Container className="pt-36 md:pt-40">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-6">
            <Tag tone={product.productStatus === 'available' ? 'acid' : 'neutral'}>
              {t.products.status[product.productStatus]}
            </Tag>
            <h1 className="display mt-6 text-[clamp(2.25rem,5vw,4.25rem)] text-ink">
              {name}
            </h1>
            <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-muted">
              {pickLocale(product.tagline, locale)}
            </p>

            <div className="mt-10">
              <Price
                amount={product.price.startingPrice}
                currency={product.price.currency}
                locale={locale}
                t={t}
                unit={product.price.unit}
              />
              {pickLocale(product.price.note, locale) ? (
                <p className="mt-2 text-[13px] text-faint">
                  {pickLocale(product.price.note, locale)}
                </p>
              ) : null}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              {/* One CTA. Products are not sold in tiers and there is no checkout. */}
              <InquiryDialog
                label={`${t.pricing.inquireAbout} ${name}`}
                sourceType="product"
                sourceId={product.id}
                contextLabel={t.inquiry.contextProduct}
                contextValue={name}
                size="lg"
              />
              {product.demoUrl ? (
                <Button asChild variant="outline" size="lg">
                  <a href={product.demoUrl} target="_blank" rel="noreferrer noopener">
                    {t.products.demo}
                    <ExternalLink className="size-4" aria-hidden />
                  </a>
                </Button>
              ) : null}
              {product.docsUrl ? (
                <Button asChild variant="ghost" size="lg">
                  <a href={product.docsUrl} target="_blank" rel="noreferrer noopener">
                    {t.products.docs}
                    <FileText className="size-4" aria-hidden />
                  </a>
                </Button>
              ) : null}
            </div>
          </div>

          <div className="lg:col-span-6">
            <Media
              media={product.cover}
              locale={locale}
              aspect="aspect-[4/3]"
              sizes="(max-width: 1024px) 100vw, 50vw"
              slotLabel={name}
              rounded="rounded-none"
              priority
            />
          </div>
        </div>
      </Container>

      <Section>
        <Container>
          <SectionIntro lead={t.products.overview} align="left" />
          <div className="mt-8 max-w-3xl">
            {pickLocale(product.description, locale)
              .split('\n\n')
              .map((paragraph, i) => (
                <p key={i} className="mb-5 text-[15px] leading-relaxed text-muted">
                  {paragraph}
                </p>
              ))}
          </div>
        </Container>
      </Section>

      {product.features.length > 0 ? (
        <Section bordered>
          <Container>
            <SectionIntro lead={t.products.features} />
            <Reveal stagger={0.06} className="mt-14 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {product.features.map((feature) => (
                <Card key={feature.id} className="text-center">
                  <RingIcon className="mx-auto">
                    <ProductFeatureIcon name={feature.icon} className="size-5" />
                  </RingIcon>
                  <h3 className="display mt-7 text-lg text-ink">
                    {pickLocale(feature.title, locale)}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted">
                    {pickLocale(feature.description, locale)}
                  </p>
                </Card>
              ))}
            </Reveal>
          </Container>
        </Section>
      ) : null}

      {/* Video demo — satu bidang lebar, sebelum galeri. Melihat produknya
        * bergerak menjawab lebih banyak daripada tangkapan layar diam, jadi
        * kalau ada, ia yang duluan.
        *
        * `<video>` biasa, bukan embed. Sumbernya diisi operator lewat panel dan
        * bisa mengarah ke mana saja; iframe pihak ketiga berarti menyerahkan satu
        * kotak di halaman ini kepada domain lain. */}
      {product.demoVideoUrl ? (
        <Section bordered>
          <Container>
            <SectionIntro lead={t.products.demoVideo} align="left" />
            <div className="mt-12 border-3 border-ink bg-ink">
              <video
                src={product.demoVideoUrl}
                controls
                playsInline
                preload="metadata"
                poster={product.cover.url}
                className="aspect-video w-full"
              />
            </div>
          </Container>
        </Section>
      ) : null}

      {/* Galeri — kisi bergaris yang sama dengan Karya. Rasio seragam supaya
        * tiap baris rata; rasio berselang-seling terbaca sebagai grid rusak. */}
      {product.gallery.length > 0 ? (
        <Section bordered>
          <Container>
            <SectionIntro lead={t.products.gallery} align="left" />
            <div className="mt-12 grid gap-[3px] border-3 border-ink bg-ink sm:grid-cols-2">
              {product.gallery.map((media, i) => (
                <div key={i} className="bg-paper">
                  <Media
                    media={media}
                    locale={locale}
                    aspect="aspect-[4/3]"
                    sizes="(max-width: 640px) 100vw, 45vw"
                    slotLabel={`${name} ${i + 1}`}
                    rounded="rounded-none"
                  />
                </div>
              ))}
            </div>
          </Container>
        </Section>
      ) : null}

      <Section bordered>
        <Container>
          <SectionIntro lead={t.products.specs} />
          <div className="mt-14">
            <RuledGrid columns={2}>
              {specs.map((spec) => (
                <RuledCell key={spec.label}>
                  <h3 className="text-[13px] text-faint">{spec.label}</h3>
                  <ul className="mt-5 flex flex-wrap gap-2">
                    {spec.values.map((value) => (
                      <li key={value}>
                        <Tag>{value}</Tag>
                      </li>
                    ))}
                  </ul>
                </RuledCell>
              ))}

              {requirements.length > 0 ? (
                <RuledCell>
                  <h3 className="text-[13px] text-faint">{t.products.requirements}</h3>
                  <ul className="mt-5 space-y-3">
                    {requirements.map((item, i) => (
                      <li
                        key={i}
                        className="border-l-3 border-ink pl-4 text-sm leading-relaxed"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </RuledCell>
              ) : null}

              {product.currentVersion ? (
                <RuledCell>
                  <h3 className="text-[13px] text-faint">{t.products.version}</h3>
                  <p className="display mt-5 text-2xl text-ink">
                    {product.currentVersion}
                  </p>
                  <p className="mt-2 text-[13px] text-faint">
                    {t.products.lastUpdated}: {formatDate(product.updatedAt, locale)}
                  </p>
                </RuledCell>
              ) : null}
            </RuledGrid>
          </div>
        </Container>
      </Section>

      {/* Bentuk yang sama dengan FAQ di halaman Harga: judul lewat `Block`, dan
        * daftarnya selebar container. `max-w-4xl` rata tengah menyisakan pita
        * kosong di kedua sisi, dan judulnya jadi tidak sebaris dengan seksi
        * mana pun di atasnya. */}
      {product.faqs.length > 0 ? (
        <Reveal as="div">
          <Block label={t.products.faq} title={[t.products.faq]} body={t.home.faqBody}>
            <Accordion
              items={product.faqs.map((faq) => ({
                id: faq.id,
                question: pickLocale(faq.question, locale),
                answer: pickLocale(faq.answer, locale),
              }))}
            />
          </Block>
        </Reveal>
      ) : null}

      {product.changelog.length > 0 ? (
        <Section bordered>
          <Container>
            <SectionIntro lead={t.products.changelog} align="left" />
            <ol className="mt-12 flex flex-col gap-4">
              {product.changelog.map((entry) => (
                <li key={entry.version}>
                  <Card className="grid gap-4 md:grid-cols-12 md:items-baseline">
                    <div className="md:col-span-2">
                      <Tag tone="acid">{entry.version}</Tag>
                    </div>
                    <p className="text-[13px] text-faint md:col-span-3">
                      {formatDate(entry.date, locale)}
                    </p>
                    <p className="text-sm leading-relaxed text-muted md:col-span-7">
                      {pickLocale(entry.notes, locale)}
                    </p>
                  </Card>
                </li>
              ))}
            </ol>
          </Container>
        </Section>
      ) : null}

      {related.length > 0 ? (
        <Section bordered>
          <Container>
            <SectionIntro lead={t.products.related} />
            <div className="mt-14 grid gap-8 md:grid-cols-2">
              {related.map((item) => (
                <Link
                  key={item.id}
                  href={routes.product(locale, item.slug)}
                  className="group block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
                >
                  <Card interactive>
                    <h3 className="display text-xl text-ink transition-colors decoration-[3px] underline-offset-4 group-hover:underline">
                      {pickLocale(item.name, locale)}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-muted">
                      {pickLocale(item.tagline, locale)}
                    </p>
                  </Card>
                </Link>
              ))}
            </div>
          </Container>
        </Section>
      ) : null}
    </article>
  );
}
