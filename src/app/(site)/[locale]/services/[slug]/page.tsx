import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowUpRight, Check } from 'lucide-react';

import { LOCALES, isLocale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/get-dictionary';
import { pickLocale, pickLocaleList } from '@/lib/i18n/pick-locale';
import { serviceRepo, getProjectsForService, getServicesByIds } from '@/lib/repo';
import { routes } from '@/lib/routes';
import type { Locale } from '@/types/content';

import { Reveal } from '@/components/motion/reveal';
import { Block } from '@/components/ui/system';
import { Media } from '@/components/ui/media';
import { Accordion } from '@/components/ui/accordion';
import { Price, TierCard } from '@/components/pricing/price';
import { InquiryDialog } from '@/components/inquiry/inquiry-dialog';
import { ServiceIcon } from '@/components/service/service-icon';
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
  const services = await serviceRepo.list({ perPage: 50 });
  return LOCALES.flatMap((locale) =>
    services.items.map((service) => ({ locale, slug: service.slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const service = await serviceRepo.getBySlug(slug);
  if (!service) return {};

  const title = pickLocale(service.seo.title, locale) || pickLocale(service.name, locale);
  const description =
    pickLocale(service.seo.description, locale) || pickLocale(service.tagline, locale);

  return {
    title,
    description,
    alternates: {
      canonical: `/${locale}/services/${slug}`,
      languages: { en: `/en/services/${slug}`, id: `/id/services/${slug}` },
    },
    openGraph: { title, description },
  };
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<ReactNode> {
  const { locale: raw, slug } = await params;
  if (!isLocale(raw)) notFound();
  const locale: Locale = raw;
  const t = await getDictionary(locale);

  const service = await serviceRepo.getBySlug(slug);
  if (!service || service.status !== 'published') notFound();

  const name = pickLocale(service.name, locale);
  const deliverables = pickLocaleList(service.deliverables, locale);
  const relatedProjects = (await getProjectsForService(service.id)).slice(0, 2);
  const relatedServices = (await getServicesByIds(service.relatedServiceIds)).filter(
    (item) => item.status === 'published',
  );

  return (
    <article>
      {/* Hero: ring icon, name, tagline, then the two facts a buyer needs. */}
      <Container className="pt-36 md:pt-40">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-7">
            <RingIcon tone="acid">
              <ServiceIcon name={service.icon} className="size-5" strokeWidth={1.75} />
            </RingIcon>
            <h1 className="display mt-8 text-[clamp(2.25rem,5vw,4.25rem)] text-ink">
              {name}
            </h1>
            <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-ink-soft">
              {pickLocale(service.tagline, locale)}
            </p>

            <div className="mt-10 flex flex-wrap items-end gap-x-12 gap-y-6">
              <div>
                <p className="text-[13px] text-ink-soft">{t.services.startingFrom}</p>
                <Price
                  amount={service.startingPrice}
                  currency={service.currency}
                  locale={locale}
                  t={t}
                  className="mt-2"
                />
              </div>
              <div>
                <p className="text-[13px] text-ink-soft">{t.services.typicalTimeline}</p>
                <p className="display mt-2 text-2xl text-ink">
                  {pickLocale(service.timelineLabel, locale)}
                </p>
              </div>
              <InquiryDialog
                label={t.pricing.requestQuote}
                sourceType="service"
                sourceId={service.id}
                contextLabel={t.inquiry.contextService}
                contextValue={name}
                size="lg"
              />
            </div>
          </div>

          <div className="lg:col-span-5">
            <Media
              media={service.cover}
              locale={locale}
              aspect="aspect-[4/3]"
              sizes="(max-width: 1024px) 100vw, 40vw"
              slotLabel={name}
              rounded="rounded-none"
              priority
            />
          </div>
        </div>
      </Container>

      {/* Description and deliverables */}
      <Section>
        <Container className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            {pickLocale(service.description, locale)
              .split('\n\n')
              .map((paragraph, i) => (
                <p key={i} className="mb-5 text-[15px] leading-relaxed text-ink-soft">
                  {paragraph}
                </p>
              ))}
          </div>

          {deliverables.length > 0 ? (
            <Card className="lg:col-span-5">
              <h2 className="text-[13px] text-ink-soft">{t.services.deliverables}</h2>
              <ul className="mt-6 space-y-4">
                {deliverables.map((item, i) => (
                  <li key={i} className="flex gap-3 text-sm leading-relaxed text-ink">
                    <Check className="mt-0.5 size-4 shrink-0 text-ink" aria-hidden strokeWidth={1.75} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}
        </Container>
      </Section>

      {/* Process: ruled grid, numbered */}
      {service.process.length > 0 ? (
        <Section bordered>
          <Container>
            <SectionIntro lead={t.services.process} trail={t.home.processTrail} />
            <Reveal stagger={0.05} className="mt-14">
              <RuledGrid columns={service.process.length >= 4 ? 4 : 3}>
                {service.process.map((step) => (
                  <RuledCell key={step.id}>
                    <span className="display text-4xl text-ink">
                      {String(step.step).padStart(2, '0')}
                    </span>
                    <h3 className="display mt-6 text-lg text-ink">
                      {pickLocale(step.title, locale)}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                      {pickLocale(step.description, locale)}
                    </p>
                    <p className="mt-5 text-[13px] text-ink-soft">
                      {pickLocale(step.durationLabel, locale)}
                    </p>
                  </RuledCell>
                ))}
              </RuledGrid>
            </Reveal>
          </Container>
        </Section>
      ) : null}

      {/* Packages */}
      <Section bordered>
        <Container>
          <SectionIntro lead={t.services.packages} body={t.pricing.subtitle} />

          {service.packages.length === 0 ? (
            <Card className="mx-auto mt-14 max-w-2xl text-center">
              <h3 className="display text-2xl text-ink">
                {t.pricing.requestQuote}
              </h3>
              <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-ink-soft">
                {pickLocale(service.description, locale).split('\n\n')[0]}
              </p>
              <div className="mt-8 flex justify-center">
                <InquiryDialog
                  label={t.pricing.requestQuote}
                  sourceType="service"
                  sourceId={service.id}
                  contextLabel={t.inquiry.contextService}
                  contextValue={name}
                />
              </div>
            </Card>
          ) : (
            <Reveal
              stagger={0.08}
              className="mt-14 grid gap-8 lg:grid-cols-3 lg:grid-rows-[auto_auto_auto_1fr_auto]"
            >
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
            </Reveal>
          )}
        </Container>
      </Section>

      {/* Tools */}
      {service.tools.length > 0 ? (
        <Section bordered>
          <Container>
            <SectionIntro lead={t.services.tools} align="left" />
            <ul className="mt-8 flex flex-wrap gap-2">
              {service.tools.map((tool) => (
                <li key={tool}>
                  <Tag>{tool}</Tag>
                </li>
              ))}
            </ul>
          </Container>
        </Section>
      ) : null}

      {/* Work delivered under this service, resolved rather than stored */}
      {relatedProjects.length > 0 ? (
        <Section bordered>
          <Container>
            <SectionIntro lead={t.services.relatedProjects} />
            <div className="mt-14 grid gap-x-10 gap-y-14 md:grid-cols-2">
              {relatedProjects.map((project) => (
                <Link
                  key={project.id}
                  href={routes.project(locale, project.slug)}
                  className="group block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
                >
                  <Media
                    media={project.cover}
                    locale={locale}
                    aspect="aspect-[16/10]"
                    sizes="(max-width: 768px) 100vw, 45vw"
                    slotLabel={pickLocale(project.title, locale)}
                    rounded="rounded-none"
                  />
                  <h3 className="display mt-6 text-2xl text-ink transition-colors decoration-[3px] underline-offset-4 group-hover:underline">
                    {pickLocale(project.title, locale)}
                  </h3>
                  <p className="mt-2 text-[13px] text-ink-soft">
                    {project.client}, {project.year}
                  </p>
                </Link>
              ))}
            </div>
          </Container>
        </Section>
      ) : null}

      {/* FAQ — bentuknya disamakan dengan halaman Harga. Lihat catatan di
        * products/[slug]. */}
      {service.faqs.length > 0 ? (
        <Reveal as="div">
          <Block label={t.services.faq} title={[t.services.faq]} body={t.home.faqBody}>
            <Accordion
              items={service.faqs.map((faq) => ({
                id: faq.id,
                question: pickLocale(faq.question, locale),
                answer: pickLocale(faq.answer, locale),
              }))}
            />
          </Block>
        </Reveal>
      ) : null}

      {/* Related services */}
      {relatedServices.length > 0 ? (
        <Section bordered>
          <Container>
            <SectionIntro lead={t.services.relatedServices} align="left" />
            <ul className="mt-10 grid gap-6 md:grid-cols-2">
              {relatedServices.map((item) => (
                <li key={item.id}>
                  <Link
                    href={routes.service(locale, item.slug)}
                    className="group focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
                  >
                    <Card interactive className="flex items-center justify-between gap-6">
                      <div>
                        <h3 className="display text-xl text-ink transition-colors decoration-[3px] underline-offset-4 group-hover:underline">
                          {pickLocale(item.name, locale)}
                        </h3>
                        <p className="mt-2 text-sm text-ink-soft">
                          {pickLocale(item.tagline, locale)}
                        </p>
                      </div>
                      <span
                        aria-hidden
                        className="flex size-11 shrink-0 items-center justify-center border-3 border-ink bg-paper text-ink transition-colors duration-150 group-hover:bg-acid"
                      >
                        <ArrowUpRight className="size-4" strokeWidth={1.75} />
                      </span>
                    </Card>
                  </Link>
                </li>
              ))}
            </ul>
          </Container>
        </Section>
      ) : null}
    </article>
  );
}
