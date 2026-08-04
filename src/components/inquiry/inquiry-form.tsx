'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2 } from 'lucide-react';

import { useDictionary } from '@/lib/i18n/dictionary-provider';
import { inquiryFormSchema } from '@/lib/schemas/inquiry';
import type { InquiryFormValues } from '@/lib/schemas/inquiry';
import { submitInquiry } from '@/app/actions/inquiry';
import { toast } from '@/stores/ui-store';
import type { InquirySource, Tier } from '@/types/content';

import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/field';
import { Card, RingIcon, Tag } from '@/components/ui/primitives';
import { cn } from '@/lib/utils';

const BUDGETS = ['<10m', '10-50m', '50-200m', '200m+', 'undecided'] as const;

/**
 * Inquiry form, following reference theme A's contact page: two-column fields,
 * a chip row for the budget band instead of a dropdown, then a wide message
 * field and a single submit.
 *
 * There is no checkout anywhere on this site, so this form is the only
 * conversion path and every package CTA opens it with its context attached.
 */
export function InquiryForm({
  sourceType,
  sourceId = null,
  sourceTier = null,
  contextLabel,
  contextValue,
  onSuccess,
}: {
  sourceType: InquirySource;
  sourceId?: string | null;
  sourceTier?: Tier | null;
  contextLabel?: string;
  contextValue?: string;
  onSuccess?: () => void;
}): ReactNode {
  const { dictionary: t, locale } = useDictionary();
  const [submitted, setSubmitted] = useState(false);
  const mountedAt = useRef<number>(0);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<InquiryFormValues>({
    resolver: zodResolver(inquiryFormSchema),
    defaultValues: {
      name: '',
      email: '',
      company: '',
      phone: '',
      subject: contextValue ? `${contextLabel}: ${contextValue}` : '',
      message: '',
      budgetRange: 'undecided',
      sourceType,
      sourceId,
      sourceTier,
      locale,
      website: '',
      elapsedMs: 0,
    },
  });

  useEffect(() => {
    mountedAt.current = Date.now();
  }, []);

  const budget = watch('budgetRange');

  const onValid = useCallback(
    async (values: InquiryFormValues): Promise<void> => {
      // Time-to-submit guard, read on submit rather than during render.
      const elapsedMs = mountedAt.current === 0 ? 2000 : Date.now() - mountedAt.current;
      const result = await submitInquiry({ ...values, elapsedMs });

      if (result.ok) {
        setSubmitted(true);
        reset();
        toast.success(t.inquiry.successTitle, t.inquiry.successBody);
        onSuccess?.();
        return;
      }
      if (result.code === 'RATE_LIMITED') {
        toast.error(t.inquiry.errorTitle, t.inquiry.rateLimited);
        return;
      }
      toast.error(t.inquiry.errorTitle, t.inquiry.errorBody);
    },
    [reset, onSuccess, t],
  );

  const onSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    void handleSubmit(onValid)(event);
  };

  if (submitted) {
    return (
      <Card className="flex flex-col items-center py-10 text-center">
        <RingIcon tone="acid">
          <CheckCircle2 className="size-5" strokeWidth={1.75} />
        </RingIcon>
        <h3 className="display rank-3 mt-5">{t.inquiry.successTitle}</h3>
        <p className="mt-4 max-w-sm text-[15px] leading-relaxed">{t.inquiry.successBody}</p>
        <Button
          variant="outline"
          size="sm"
          className="mt-6"
          onClick={() => {
            setSubmitted(false);
            mountedAt.current = Date.now();
          }}
        >
          {t.contact.formTitle}
        </Button>
      </Card>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      {contextValue ? (
        /* Blok konteks: paket atau layanan yang sedang ditanyakan.
           Dulu `rounded-2xl bg-ink` dengan nilai disetel acid — sudut membulat
           yang tidak ada di sistem ini, dan setelah palet berubah, latar tinta
           pekat yang menelan labelnya. Acid dipakai sebagai bidang, bukan
           sebagai warna teks, jadi nilainya kini tinta di atas acid. */
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-3 border-ink bg-acid px-4 py-3">
          <span className="label">{contextLabel}</span>
          <span className="display rank-5 text-ink">{contextValue}</span>
        </div>
      ) : null}

      {/* Honeypot: hidden from sight and from assistive tech, never autofilled. */}
      <div aria-hidden className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="website">Website</label>
        <input id="website" type="text" tabIndex={-1} autoComplete="off" {...register('website')} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Input
          label={t.inquiry.name}
          placeholder={t.inquiry.namePlaceholder}
          autoComplete="name"
          required
          error={errors.name ? t.validation.required : undefined}
          {...register('name')}
        />
        <Input
          label={t.inquiry.email}
          type="email"
          placeholder={t.inquiry.emailPlaceholder}
          autoComplete="email"
          required
          error={errors.email ? t.validation.invalidEmail : undefined}
          {...register('email')}
        />
        <Input
          label={t.inquiry.company}
          placeholder={t.inquiry.companyPlaceholder}
          autoComplete="organization"
          {...register('company')}
        />
        <Input
          label={t.inquiry.phone}
          type="tel"
          placeholder={t.inquiry.phonePlaceholder}
          autoComplete="tel"
          {...register('phone')}
        />
      </div>

      <Input
        label={t.inquiry.subject}
        placeholder={t.inquiry.subjectPlaceholder}
        required
        error={errors.subject ? t.validation.tooShort : undefined}
        {...register('subject')}
      />

      {/* Budget as a chip row, per reference theme A's contact form. */}
      <fieldset>
        <legend className="label">{t.inquiry.budget}</legend>
        {/* Grid berkolom tetap, bukan `flex-wrap` dengan `flex-1`.
            Kombinasi itu membuat sel di baris terakhir melar mengisi sisa lebar
            sementara sel di baris pertama tetap sempit, jadi kolomnya tidak
            pernah berbaris dan labelnya saling bertindih saat teksnya panjang.
            Grid memberi setiap pilihan lebar yang sama, di lebar layar manapun. */}
        <div className="mt-2 grid grid-cols-2 gap-[3px] border-3 border-ink bg-ink sm:grid-cols-3 lg:grid-cols-5">
          {BUDGETS.map((value) => {
            const active = budget === value;
            return (
              <button
                key={value}
                type="button"
                aria-pressed={active}
                onClick={() => setValue('budgetRange', value, { shouldDirty: true })}
                className={cn(
                  // `leading-snug` dan padding vertikal, bukan tinggi tetap:
                  // "Belum ditentukan" butuh dua baris di kolom sempit, dan
                  // tinggi tetap akan memotongnya.
                  'label min-h-12 px-3 py-3 text-center leading-snug transition-colors duration-150',
                  'focus-visible:outline-3 focus-visible:-outline-offset-3 focus-visible:outline-ink',
                  active ? 'bg-acid text-ink' : 'bg-paper text-ink-soft hover:bg-paper-dim',
                )}
              >
                {t.inquiry.budgetOptions[value]}
              </button>
            );
          })}
        </div>
      </fieldset>

      <Textarea
        label={t.inquiry.message}
        placeholder={t.inquiry.messagePlaceholder}
        rows={3}
        required
        error={errors.message ? t.validation.tooShort : undefined}
        {...register('message')}
      />

      <div>
        <Button type="submit" size="lg" loading={isSubmitting}>
          {isSubmitting ? t.inquiry.submitting : t.inquiry.submit}
        </Button>
      </div>
    </form>
  );
}

/** Context chip used by callers to show which package opened the form. */
export function InquiryContext({ label, value }: { label: string; value: string }): ReactNode {
  return (
    <Tag tone="acid">
      {label}: {value}
    </Tag>
  );
}
