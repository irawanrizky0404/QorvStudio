import type { ReactNode } from 'react';
import type { Currency, Locale, PricePeriod, PriceUnit, PricingTier } from '@/types/content';
import { EMPHASIZED_TIER } from '@/types/content';
import { formatPrice } from '@/lib/format';
import { pickLocale, pickLocaleList } from '@/lib/i18n/pick-locale';
import type { Dictionary } from '@/lib/i18n/dictionaries/en';
import { cn } from '@/lib/utils';
import { InquiryDialog } from '@/components/inquiry/inquiry-dialog';

/**
 * The only place a price becomes text. Owns two rules that must never diverge:
 * null renders as "contact us", never "free" or "0"; formatting goes through
 * Intl.NumberFormat, never a hand-built currency string.
 */
export function Price({
  amount, currency, locale, t, period, unit, showFrom = false, className, size = 'md',
}: {
  amount: number | null; currency: Currency; locale: Locale; t: Dictionary;
  period?: PricePeriod; unit?: PriceUnit; showFrom?: boolean; className?: string;
  size?: 'sm' | 'md' | 'lg';
}): ReactNode {
  const quoteOnly = amount === null;
  const text = formatPrice(amount, currency, locale, t.pricing.contactUs);
  const suffix = period ? t.pricing.period[period] : unit ? t.pricing.unit[unit] : null;
  const scale = size === 'lg' ? 'rank-2' : size === 'md' ? 'rank-3' : 'rank-4';

  return (
    <p className={cn('flex flex-wrap items-baseline gap-x-2.5', className)}>
      {showFrom && !quoteOnly ? <span className="label">{t.pricing.from}</span> : null}
      <span className={cn('display tabular', quoteOnly ? 'rank-4' : scale)}>{text}</span>
      {suffix && !quoteOnly ? <span className="label">{suffix}</span> : null}
    </p>
  );
}

/**
 * Service package card.
 *
 * Tier yang direkomendasikan tidak diberi lencana "populer". Ia BERDIRI LEBIH
 * TINGGI — padding lebih besar dan bayangan 16px lawan 9px — sesuai aturan yang
 * sama yang mengangkat disiplin unggulan dan kartu di beranda: yang lebih
 * penting membuang bayangan lebih panjang. Lencana adalah keterangan; tinggi
 * adalah bentuk, dan bentuk terbaca sebelum satu kata pun dibaca.
 *
 * Ceklis dari lucide dibuang. Di sistem yang tidak punya satupun kurva, ikon
 * centang adalah bentuk asing; kotak tinta padat melakukan pekerjaan yang sama.
 */
export function TierCard({
  tier, locale, t, serviceId, serviceName,
}: {
  tier: PricingTier; locale: Locale; t: Dictionary; serviceId: string; serviceName: string;
}): ReactNode {
  const emphasized = tier.tier === EMPHASIZED_TIER;
  const includes = pickLocaleList(tier.includes, locale);
  const label = t.pricing.tier[tier.tier];

  return (
    <div
      className={cn(
        'flex flex-col border-3 border-ink bg-paper px-6 transition-[transform,box-shadow] duration-150 ease-out',
        'hover:-translate-x-1 hover:-translate-y-1',
        emphasized
          ? 'py-11 shadow-[16px_16px_0_var(--color-ink)] hover:shadow-[20px_20px_0_var(--color-ink)]'
          : 'py-7 shadow-[9px_9px_0_var(--color-ink)] hover:shadow-[13px_13px_0_var(--color-ink)]',
      )}
    >
      <h3 className="display rank-4">{label}</h3>

      <p className="mt-3 min-h-10 text-[14.5px] leading-relaxed">
        {pickLocale(tier.description, locale)}
      </p>

      <Price
        amount={tier.price}
        currency={tier.currency}
        locale={locale}
        t={t}
        period={tier.period}
        className="mt-6 border-t-3 border-ink pt-6"
      />

      {includes.length > 0 ? (
        <ul className="mt-6 grid flex-1 gap-2.5">
          {includes.map((item, i) => (
            <li key={i} className="grid grid-cols-[0.9rem_1fr] gap-3 text-[14px] leading-relaxed">
              <span aria-hidden className="mt-1.5 size-2.5 bg-ink" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex-1" />
      )}

      <InquiryDialog
        label={`${t.pricing.inquireAbout} ${label}`}
        sourceType="service"
        sourceId={serviceId}
        sourceTier={tier.tier}
        contextLabel={t.inquiry.contextService}
        contextValue={`${serviceName} - ${label}`}
        variant={emphasized ? 'primary' : 'outline'}
        className="mt-8 w-full"
      />
    </div>
  );
}
