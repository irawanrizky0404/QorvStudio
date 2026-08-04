import type { ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';

import { isLocale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/get-dictionary';
import { pickLocale } from '@/lib/i18n/pick-locale';
import { projectRepo, serviceRepo, productRepo, settingsRepo } from '@/lib/repo';
import { routes } from '@/lib/routes';
import { formatPriceCompact } from '@/lib/format';
import { clientLogos } from '@/lib/mock-data/testimonials';
import type { Locale } from '@/types/content';

import { Reveal } from '@/components/motion/reveal';
import { Button } from '@/components/ui/button';
import { Plate } from '@/components/ui/plate';
import { Container } from '@/components/ui/primitives';
import { Block, Eyebrow, Printed, Spec } from '@/components/ui/system';

export const revalidate = 300;

/**
 * Home.
 *
 * Lima struktur berbeda, bukan satu grid diulang lima kali — itu yang membuat
 * versi lama terbaca sama dari atas sampai bawah:
 *
 *   Hero      pita meta, judul tercetak, angka dalam satu strip
 *   Karya     kolom judul lengket + daftar bergulir di sebelahnya
 *   Disiplin  rel horizontal ber-snap untuk tiga unggulan, lalu daftar rapat
 *   Produk    baris lebar penuh yang bergantian sisi — terbaca sebagai katalog
 *   Harga     panggung acid, tier dibedakan oleh tinggi fisik
 *
 * Hirarki di seluruh halaman dibawa oleh panjang bayangan, bukan oleh warna
 * atau badge: yang lebih penting berdiri lebih tinggi.
 */
export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<ReactNode> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale: Locale = raw;
  const t = await getDictionary(locale);

  const [projects, services, products, settings] = await Promise.all([
    projectRepo.list({ perPage: 6 }),
    serviceRepo.list({ perPage: 6 }),
    productRepo.list({ perPage: 4 }),
    settingsRepo.get(),
  ]);

  const lead = services.items.slice(0, 3);
  const rest = services.items.slice(3);
  const packages = services.items[0]?.packages ?? [];
  /* Empat langkah pertama dari disiplin utama. Dinamai `steps`, bukan `process`
     — nama itu bentrok dengan global Node dan lolos typecheck sebagai
     `NodeJS.Process` alih-alih gagal di tempat yang benar. */
  const steps = services.items[0]?.process.slice(0, 4) ?? [];

  const stats = [
    { label: t.about.statProjects, value: projects.total },
    { label: t.home.capabilities, value: services.total },
    { label: t.home.ourProducts, value: products.total },
    { label: t.about.statSince, value: settings.foundedYear },
  ];

  const disciplines = services.items.map((service) => pickLocale(service.name, locale));

  return (
    <>
      {/* ══ HERO ═══════════════════════════════════════════════════════════════ */}
      <Reveal as="header" className="band">
        <Container>
          <div className="flex flex-wrap justify-between gap-8 border-b-3 border-ink pb-5">
            <div className="rise grid gap-2">
              <span className="label">{settings.studioName}</span>
              <span className="label">
                {pickLocale(settings.location, locale)} — Est. {settings.foundedYear}
              </span>
            </div>
            <div className="rise grid gap-2 text-right">
              <span className="label">{t.home.heroSub}</span>
              <span className="label">{disciplines.slice(0, 3).join(' · ')}</span>
            </div>
          </div>

          <h1 className="display rank-1 mt-10">
            <Printed lines={[t.home.heroLine1, t.home.heroLine2]} />
            {/* Satu baris berdiri di blok acid. Warna sebagai bidang, bukan
                sebagai warna teks — acid tidak pernah jadi tinta di atas terang. */}
            <span className="line-mask">
              <span>
                <span className="inline-block border-3 border-ink bg-acid px-3 py-1 shadow-[9px_9px_0_var(--color-ink)]">
                  {t.home.heroLine3}
                </span>
              </span>
            </span>
          </h1>

          <div className="mt-12 grid items-end gap-8 md:grid-cols-2">
            <p className="rise max-w-[46ch] text-[16px] leading-relaxed">{t.home.intro}</p>
            <div className="rise flex flex-wrap gap-4 md:justify-end">
              <Button asChild size="lg">
                <Link href={routes.contact(locale)}>{t.home.ctaButton}</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href={routes.work(locale)}>{t.home.selectedWork}</Link>
              </Button>
            </div>
          </div>

          <dl className="mt-14 grid grid-cols-2 gap-[3px] border-3 border-ink bg-ink md:grid-cols-4">
            {stats.map((stat, position) => (
              <div
                key={stat.label}
                className={position === 1 ? 'bg-acid px-5 py-7' : 'bg-paper px-5 py-7'}
              >
                <dd className="display tabular rank-3">{stat.value}</dd>
                <dt className="label mt-3 text-ink">{stat.label}</dt>
              </div>
            ))}
          </dl>
        </Container>
      </Reveal>

      {/* ══ PITA ══ CSS murni; tidak ada yang terikat posisi scroll */}
      <div className="overflow-hidden border-y-3 border-ink bg-acid py-3" aria-hidden>
        <div className="ticker-track">
          {[...disciplines, ...disciplines].map((name, position) => (
            <span key={`${name}-${position}`} className="flex items-center">
              <span className="display rank-4 whitespace-nowrap px-6">{name}</span>
              <span className="size-2.5 shrink-0 bg-ink" />
            </span>
          ))}
        </div>
      </div>

      {/* ══ KARYA ══════════════════════════════════════════════════════════════
        * Enam karya, tiga kolom, dua baris penuh. Simetris dan genap.
        *
        * Sebelumnya lebarnya dibuat bergantian (7/5 · 5/7 · 6/6) supaya tiap
        * baris terlihat berbeda. Itu keliru: enam kartu dengan tiga lebar
        * berbeda tidak berbagi satu garis dasar pun, dan yang muncul bukan
        * ritme melainkan barisan yang terlihat miring.
        *
        * Perbedaan antar section ditanggung oleh JUMLAH KOLOM — Karya tiga,
        * Produk empat — bukan oleh sel yang saling berbeda di dalam satu grid.
        */}
      <Reveal as="section" id="karya" className="band">
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-6 border-b-3 border-ink pb-6">
            <div className="grid max-w-2xl gap-5">
              <Eyebrow className="rise justify-self-start">{t.nav.work}</Eyebrow>
              <h2 className="display rank-2">
                <Printed lines={[t.home.selectedWork]} />
              </h2>
              <p className="rise text-[15.5px] leading-relaxed">{t.work.subtitle}</p>
            </div>
            <div className="rise">
              <Button asChild variant="outline">
                <Link href={routes.work(locale)}>{t.common.viewAll}</Link>
              </Button>
            </div>
          </div>

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
                  priority={position === 0}
                  divide="bottom"
                />
                <div className="flex flex-1 flex-col gap-3 p-6">
                  <div className="flex items-baseline justify-between gap-4">
                    <h3 className="display rank-4">{pickLocale(project.title, locale)}</h3>
                    <span className="label tabular shrink-0">{project.year}</span>
                  </div>
                  <p className="flex-1 text-[14.5px] leading-relaxed">
                    {pickLocale(project.summary, locale)}
                  </p>
                  <span className="label border-t-3 border-ink pt-4">{project.client}</span>
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </Reveal>

      {/* ══ KLIEN ══ satu baris tenang; ia menopang, bukan bersaing */}
      <div className="border-y-3 border-ink py-8">
        <Container>
          <p className="label text-center">{t.home.trustedBy}</p>
          <ul className="mt-6 grid grid-cols-4 items-center justify-items-center gap-y-7 lg:grid-cols-8">
            {clientLogos.map((logo) => (
              <li key={logo.name}>
                <Image
                  src={logo.file}
                  alt={logo.name}
                  width={104}
                  height={28}
                  className="h-5 w-auto opacity-55 invert transition-opacity duration-200 hover:opacity-100"
                />
              </li>
            ))}
          </ul>
        </Container>
      </div>

      {/* ══ DISIPLIN ══ rel ber-snap untuk tiga unggulan, lalu daftar rapat ═══ */}
      <Reveal as="div">
        <Block
          id="disiplin"
          label={t.nav.services}
          title={[t.home.capabilities]}
          body={t.home.capabilitiesBody}
        >
          {/* Tiga unggulan berdiri lebih tinggi — bayangan 16px lawan 9px. */}
          <ul className="-mx-1 grid snap-x snap-mandatory auto-cols-[minmax(280px,32%)] grid-flow-col gap-5 overflow-x-auto px-1 pb-5">
            {lead.map((service, position) => (
              <li
                key={service.id}
                className={`place place-tall flex snap-start flex-col gap-4 border-3 border-ink p-7 transition-[transform,box-shadow] duration-150 ease-out hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[20px_20px_0_var(--color-ink)] ${
                  position === 1 ? 'd-1 bg-acid' : 'bg-paper'
                } ${position === 2 ? 'd-2' : ''}`}
              >
                <span className="display tabular text-[2.75rem] leading-none">
                  {String(position + 1).padStart(2, '0')}
                </span>
                <h3 className="display rank-4">{pickLocale(service.name, locale)}</h3>
                <p className="flex-1 text-[14.5px] leading-relaxed">
                  {pickLocale(service.tagline, locale)}
                </p>
                <div className="flex justify-between gap-4 border-t-3 border-ink pt-4">
                  <span className="label">
                    {t.services.startingFrom}{' '}
                    <b className="tabular font-extrabold text-ink">
                      {formatPriceCompact(
                        service.startingPrice,
                        service.currency,
                        locale,
                        t.pricing.contactUs,
                      )}
                    </b>
                  </span>
                  <span className="label">{pickLocale(service.timelineLabel, locale)}</span>
                </div>
                <Link
                  href={routes.service(locale, service.slug)}
                  className="label underline decoration-3 underline-offset-4 hover:text-ink focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-ink"
                >
                  {t.common.viewService}
                </Link>
              </li>
            ))}
          </ul>

          {rest.length > 0 ? (
            <ul className="place mt-5 grid gap-[3px] border-3 border-ink bg-ink">
              {rest.map((service, position) => (
                <li key={service.id}>
                  <Link
                    href={routes.service(locale, service.slug)}
                    className="grid grid-cols-[3rem_1fr_auto] items-center gap-5 bg-paper px-5 py-5 transition-colors duration-150 hover:bg-acid focus-visible:outline-3 focus-visible:-outline-offset-3 focus-visible:outline-ink"
                  >
                    <span className="display tabular text-[1rem]">
                      {String(position + 4).padStart(2, '0')}
                    </span>
                    <h3 className="display rank-5">{pickLocale(service.name, locale)}</h3>
                    <span className="label shrink-0">
                      {t.services.startingFrom}{' '}
                      {formatPriceCompact(
                        service.startingPrice,
                        service.currency,
                        locale,
                        t.pricing.contactUs,
                      )}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
        </Block>
      </Reveal>

      {/* ══ PRODUK ══ baris lebar penuh berselang sisi — katalog, bukan kartu ══ */}
      <Reveal as="div">
        <Block
          id="produk"
          label={t.nav.products}
          title={[t.home.ourProducts]}
          body={t.home.productsTrail}
        >
          {/* Empat sel identik dalam satu baris.
            *
            * Versi sebelumnya memberi tiap sel bentuk berbeda (8/4/12) supaya
            * tidak menyerupai grid Karya. Niatnya benar, hasilnya kacau: tiga
            * rasio gambar berbeda dalam satu section berarti tidak ada satupun
            * garis dasar yang dibagi bersama, jadi barisnya terbaca miring.
            *
            * Variasi bukan hal yang harus dipaksakan ke dalam satu section.
            * Section boleh — dan sebaiknya — rapi ke dalam; perbedaannya
            * ditanggung ANTAR section, lewat jumlah kolom dan proporsinya.
            *
            * `items-stretch` plus `flex-1` pada paragraf yang menjaga baris
            * Spec di seluruh kartu duduk pada satu garis, apapun panjang
            * taglinenya. */}
          <div className="grid grid-cols-1 items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.items.map((product, position) => (
              <Link
                key={product.id}
                href={routes.product(locale, product.slug)}
                className={`place flex h-full flex-col border-3 border-ink bg-paper transition-[transform,box-shadow] duration-150 ease-out hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[16px_16px_0_var(--color-ink)] focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-ink ${
                  position === 1 ? 'd-1' : position === 2 ? 'd-2' : position === 3 ? 'd-3' : ''
                }`}
              >
                <Plate
                  src={product.cover.url}
                  alt={pickLocale(product.cover.alt, locale)}
                  aspect="aspect-4/3"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  divide="bottom"
                />
                <div className="flex flex-1 flex-col gap-3 p-5">
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="display rank-5">{pickLocale(product.name, locale)}</h3>
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
        </Block>
      </Reveal>

      {/* ══ CARA KERJA ═════════════════════════════════════════════════════════
        * Section ini hilang saat beranda ditulis ulang, dan itu kehilangan yang
        * nyata: calon klien yang belum pernah memakai studio ingin tahu apa yang
        * terjadi setelah mereka mengirim pesan, sebelum melihat harga.
        *
        * Empat langkah, empat kolom — genap, sama dengan Produk. Nomor langkah
        * duduk di kotak acid, penanda yang sama dengan yang dipakai di nav dan
        * logotipe.
        */}
      {steps.length > 0 ? (
        <Reveal as="div">
          <Block
            id="proses"
            label={t.about.process}
            title={[t.about.process]}
            body={t.home.processTrail}
          >
            <ol className="grid gap-[3px] border-3 border-ink bg-ink sm:grid-cols-2 lg:grid-cols-4">
              {steps.map((step) => (
                <li key={step.id} className="flex flex-col gap-3 bg-paper p-7">
                  <span className="display tabular rank-4 inline-flex size-11 items-center justify-center bg-acid">
                    {String(step.step).padStart(2, '0')}
                  </span>
                  <h3 className="display rank-5 mt-2">{pickLocale(step.title, locale)}</h3>
                  <p className="flex-1 text-[14.5px] leading-relaxed">
                    {pickLocale(step.description, locale)}
                  </p>
                  <span className="label border-t-3 border-ink pt-4">
                    {pickLocale(step.durationLabel, locale)}
                  </span>
                </li>
              ))}
            </ol>
          </Block>
        </Reveal>
      ) : null}

      {/* ══ HARGA ══ satu-satunya perubahan panggung: acid, bukan hitam ═══════
        * Tier utama tidak diberi badge "populer" — ia berdiri lebih tinggi dan
        * membuang bayangan lebih panjang, aturan yang sama yang mengangkat
        * disiplin unggulan di atas.
        */}
      {packages.length > 0 ? (
        <Reveal as="section" id="harga" className="band border-y-3 border-ink bg-acid">
          <Container>
            <div className="grid max-w-3xl gap-5">
              <span className="label rise inline-flex justify-self-start bg-ink px-3 py-2 text-acid">
                {t.pricing.title}
              </span>
              <h2 className="display rank-2">
                <Printed lines={[t.pricing.subtitle]} />
              </h2>
            </div>

            <ul className="mt-14 grid items-end gap-5 md:grid-cols-3">
              {packages.map((pack, position) => {
                const isLead = pack.tier === 'gold';
                return (
                  <li
                    key={pack.tier}
                    className={`place flex flex-col gap-4 border-3 border-ink bg-paper px-6 transition-[transform,box-shadow] duration-150 ease-out hover:-translate-x-1 hover:-translate-y-1 ${
                      isLead
                        ? 'place-tall py-11 hover:shadow-[20px_20px_0_var(--color-ink)]'
                        : 'py-7 hover:shadow-[13px_13px_0_var(--color-ink)]'
                    } ${position === 1 ? 'd-1' : position === 2 ? 'd-2' : ''}`}
                  >
                    <span className="label">{t.pricing.tier[pack.tier]}</span>
                    <span className="display tabular rank-3">
                      {formatPriceCompact(pack.price, pack.currency, locale, t.pricing.contactUs)}
                    </span>
                    <ul className="grid flex-1 gap-2.5 pt-2 text-[14px] leading-relaxed">
                      {pack.includes.map((item) => {
                        const text = pickLocale(item, locale);
                        return (
                          <li key={text} className="grid grid-cols-[0.9rem_1fr] gap-3">
                            <span aria-hidden className="mt-2 size-2.5 bg-ink" />
                            {text}
                          </li>
                        );
                      })}
                    </ul>
                  </li>
                );
              })}
            </ul>

            <div className="rise mt-12">
              <Button asChild size="lg" variant="secondary">
                <Link href={routes.pricing(locale)}>{t.common.viewAll}</Link>
              </Button>
            </div>
          </Container>
        </Reveal>
      ) : null}

      {/* ══ CTA ══════════════════════════════════════════════════════════════ */}
      <Reveal as="section" className="band">
        <Container>
          <div className="place block border-3 border-ink bg-acid px-7 py-14 md:px-14 md:py-20">
            <span className="label">{t.home.faqLead}</span>
            <h2 className="display rank-2 mt-5 max-w-3xl">
              <Printed lines={[t.home.ctaTitle]} />
            </h2>
            <p className="mt-6 max-w-[46ch] text-[15.5px] leading-relaxed text-ink">
              {t.home.ctaBody}
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Button asChild size="lg" variant="secondary">
                <Link href={routes.contact(locale)}>{t.home.ctaButton}</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href={routes.pricing(locale)}>{t.pricing.title}</Link>
              </Button>
            </div>
          </div>
        </Container>
      </Reveal>
    </>
  );
}
