import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, ExternalLink } from 'lucide-react';

import { LOCALES, isLocale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/get-dictionary';
import { pickLocale } from '@/lib/i18n/pick-locale';
import { projectRepo, getServicesByIds } from '@/lib/repo';
import { routes } from '@/lib/routes';
import type { Locale } from '@/types/content';

import { Reveal, Parallax } from '@/components/motion/reveal';
import { Button } from '@/components/ui/button';
import { Media } from '@/components/ui/media';
import { Card, Container, Section, SectionIntro, Tag } from '@/components/ui/primitives';

export const revalidate = 300;

export async function generateStaticParams(): Promise<Array<{ locale: string; slug: string }>> {
  const projects = await projectRepo.list({ perPage: 50 });
  return LOCALES.flatMap((locale) =>
    projects.items.map((project) => ({ locale, slug: project.slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const project = await projectRepo.getBySlug(slug);
  if (!project) return {};

  const title = pickLocale(project.seo.title, locale) || pickLocale(project.title, locale);
  const description =
    pickLocale(project.seo.description, locale) || pickLocale(project.summary, locale);

  return {
    title,
    description,
    alternates: {
      canonical: `/${locale}/work/${slug}`,
      languages: { en: `/en/work/${slug}`, id: `/id/work/${slug}` },
    },
    openGraph: { title, description },
  };
}

/** Case study, following the reference templates' detail rhythm. */
export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<ReactNode> {
  const { locale: raw, slug } = await params;
  if (!isLocale(raw)) notFound();
  const locale: Locale = raw;
  const t = await getDictionary(locale);

  const project = await projectRepo.getBySlug(slug);
  if (!project || project.status !== 'published') notFound();

  const services = await getServicesByIds(project.serviceIds);
  const all = await projectRepo.list({ perPage: 50 });
  const index = all.items.findIndex((item) => item.id === project.id);
  const next = all.items[(index + 1) % all.items.length];

  const facts = [
    { label: t.common.client, value: project.client },
    { label: t.common.year, value: String(project.year) },
    { label: t.common.role, value: pickLocale(project.role, locale) },
    {
      label: t.common.duration,
      value: project.durationMonths ? `${project.durationMonths} mo` : 'n/a',
    },
  ];

  const chapters = [
    { title: t.work.challenge, body: pickLocale(project.challenge, locale) },
    { title: t.work.solution, body: pickLocale(project.solution, locale) },
    { title: t.work.outcome, body: pickLocale(project.outcome, locale) },
  ];

  return (
    <article>
      <Container className="pt-36 md:pt-40">
        <Tag tone="acid">{project.client}</Tag>
        <h1 className="display mt-6 max-w-4xl text-[clamp(2.25rem,5vw,4.25rem)] text-ink">
          {pickLocale(project.title, locale)}
        </h1>
        <p className="mt-6 max-w-2xl text-[15px] leading-relaxed text-muted">
          {pickLocale(project.summary, locale)}
        </p>
        {/* Naik ke hero saat seksi CTA di bawah dibuang: ini satu-satunya tempat
          * `liveUrl` muncul, dan di sini pun letaknya lebih masuk akal — orang
          * yang mau melihat hasil jadinya tidak perlu membaca dulu sampai habis. */}
        {project.liveUrl ? (
          <div className="mt-8">
            <Button asChild variant="outline">
              <a href={project.liveUrl} target="_blank" rel="noreferrer noopener">
                {t.work.liveSite}
                <ExternalLink className="size-4" aria-hidden />
              </a>
            </Button>
          </div>
        ) : null}
      </Container>

      <Container className="mt-14">
        <Parallax speed={12}>
          <Media
            media={project.cover}
            locale={locale}
            aspect="aspect-[16/9]"
            sizes="100vw"
            slotLabel={pickLocale(project.title, locale)}
            rounded="rounded-none"
            priority
          />
        </Parallax>
      </Container>

      <Container className="mt-14">
        <dl className="grid gap-[3px] border-3 border-ink bg-ink sm:grid-cols-2 lg:grid-cols-4">
          {facts.map((fact) => (
            <div key={fact.label} className="bg-paper p-7">
              <dt className="text-[13px] text-faint">{fact.label}</dt>
              <dd className="display mt-3 text-lg text-ink">{fact.value}</dd>
            </div>
          ))}
        </dl>
      </Container>

      <Section>
        <Container className="grid gap-12 lg:grid-cols-12">
          <div className="flex flex-col gap-10 lg:col-span-7">
            {chapters.map((chapter) => (
              <Reveal key={chapter.title} variant="up">
                <h2 className="display text-2xl text-ink">{chapter.title}</h2>
                <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-muted">
                  {chapter.body}
                </p>
              </Reveal>
            ))}
          </div>

          <div className="flex flex-col gap-8 lg:col-span-5">
            {project.results.length > 0 ? (
              <Card>
                <h2 className="text-[13px] text-faint">{t.work.results}</h2>
                <dl className="mt-6 flex flex-col gap-5">
                  {project.results.map((result, i) => (
                    <div key={i} className="flex items-baseline justify-between gap-4 border-b-3 border-ink pb-4 last:border-0 last:pb-0">
                      <dt className="text-sm text-muted">{pickLocale(result.label, locale)}</dt>
                      <dd className="display text-2xl text-ink">{result.value}</dd>
                    </div>
                  ))}
                </dl>
              </Card>
            ) : null}

            <Card>
              <h2 className="text-[13px] text-faint">{t.work.stack}</h2>
              <ul className="mt-5 flex flex-wrap gap-2">
                {project.stack.map((tech) => (
                  <li key={tech}>
                    <Tag>{tech}</Tag>
                  </li>
                ))}
              </ul>

              {services.length > 0 ? (
                <>
                  <h2 className="mt-8 text-[13px] text-faint">{t.work.servicesUsed}</h2>
                  <ul className="mt-4 flex flex-col gap-3">
                    {services.map((service) => (
                      <li key={service.id}>
                        <Link
                          href={routes.service(locale, service.slug)}
                          className="group flex items-center justify-between gap-4 text-sm text-ink transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
                        >
                          {pickLocale(service.name, locale)}
                          <ArrowRight
                            aria-hidden
                            strokeWidth={1.5}
                            className="size-4 transition-transform group-hover:translate-x-1"
                          />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </>
              ) : null}
            </Card>
          </div>
        </Container>
      </Section>

      {project.gallery.length > 0 ? (
        <Section bordered>
          <Container>
            <SectionIntro lead={t.work.gallery} align="left" />
            {/* Rasio seragam, bukan 4/5 tiap gambar ketiga. Rasio berselang-seling
              * membuat tiap baris tingginya beda dan barisnya tidak pernah rata —
              * yang terbaca sebagai grid rusak, bukan sebagai ritme.
              *
              * Sel bergaris 3px, sama seperti Karya di beranda: satu perlakuan
              * untuk semua kisi gambar di situs ini. */}
            <div className="mt-12 grid gap-[3px] border-3 border-ink bg-ink sm:grid-cols-2">
              {project.gallery.map((media, i) => (
                <div key={i} className="bg-paper">
                  <Media
                    media={media}
                    locale={locale}
                    aspect="aspect-[4/3]"
                    sizes="(max-width: 640px) 100vw, 45vw"
                    slotLabel={`${pickLocale(project.title, locale)} ${i + 1}`}
                    rounded="rounded-none"
                  />
                </div>
              ))}
            </div>
          </Container>
        </Section>
      ) : null}

      {next && next.id !== project.id ? (
        <Section bordered>
          <Container>
            <p className="text-[13px] text-faint">{t.work.nextProject}</p>
            <Link
              href={routes.project(locale, next.slug)}
              className="group mt-5 flex flex-wrap items-center justify-between gap-6 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
            >
              <h2 className="display text-[clamp(1.75rem,4vw,3.25rem)] text-ink transition-colors decoration-[3px] underline-offset-4 group-hover:underline">
                {pickLocale(next.title, locale)}
              </h2>
              <span
                aria-hidden
                className="flex size-14 shrink-0 items-center justify-center border-3 border-ink bg-paper text-ink transition-colors duration-150 group-hover:bg-acid"
              >
                <ArrowRight className="size-5" strokeWidth={1.5} />
              </span>
            </Link>
          </Container>
        </Section>
      ) : null}
    </article>
  );
}
