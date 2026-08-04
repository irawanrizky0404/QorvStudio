'use client';

import type { ReactNode } from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { z } from 'zod';

import { createService, updateService } from '@/app/actions/content';
import { serviceSchema } from '@/lib/schemas/content';
import { adminRoutes } from '@/lib/routes';
import { formatPrice } from '@/lib/format';
import { deriveStartingPrice } from '@/lib/pricing';
import { TIERS } from '@/types/content';
import type { PricingTier, Service } from '@/types/content';

import {
  FieldRow,
  FormActions,
  FormSection,
  LocalizedField,
  MediaField,
  NumberField,
  ReferenceField,
  Repeater,
  SelectField,
  SwitchField,
  TextField,
  TokenField,
} from './form-kit';
import { useEntitySave } from './use-entity-form';

type Values = z.input<typeof serviceSchema>;
type Parsed = z.output<typeof serviceSchema>;

const emptyLocalized = { en: '', id: '' };
const emptyMedia = { url: '', alt: { ...emptyLocalized }, width: 1600, height: 1200 };

const TIER_LABEL: Record<string, string> = {
  basic: 'Basic',
  gold: 'Gold',
  premium: 'Premium',
};

const PERIODS = [
  { value: 'project', label: 'Per project' },
  { value: 'one-time', label: 'One time' },
  { value: 'monthly', label: 'Per month' },
  { value: 'yearly', label: 'Per year' },
] as const;

function defaults(service?: Service): Values {
  if (!service) {
    return {
      slug: '',
      name: { ...emptyLocalized },
      tagline: { ...emptyLocalized },
      icon: 'sparkles',
      cover: { ...emptyMedia },
      gallery: [],
      description: { ...emptyLocalized },
      deliverables: [],
      process: [],
      tools: [],
      packages: [],
      currency: 'IDR',
      timelineLabel: { ...emptyLocalized },
      faqs: [],
      relatedServiceIds: [],
      status: 'draft',
      featured: false,
      seo: { title: { ...emptyLocalized }, description: { ...emptyLocalized }, ogImage: '' },
    };
  }

  return {
    slug: service.slug,
    name: service.name,
    tagline: service.tagline,
    icon: service.icon,
    cover: service.cover,
    gallery: service.gallery,
    description: service.description,
    deliverables: service.deliverables,
    process: service.process,
    tools: service.tools,
    packages: service.packages.map((tier) => ({ ...tier, price: tier.price ?? '' })),
    currency: service.currency,
    timelineLabel: service.timelineLabel,
    faqs: service.faqs,
    relatedServiceIds: service.relatedServiceIds,
    status: service.status,
    featured: service.featured,
    seo: { ...service.seo, ogImage: service.seo.ogImage ?? '' },
  };
}

/** Mirrors what the public pages will show, so the ladder is checked before saving. */
function StartingPricePreview(): ReactNode {
  const packages = useWatch({ name: 'packages' }) as PricingTier[] | undefined;
  const currency = (useWatch({ name: 'currency' }) as 'IDR' | 'USD') ?? 'IDR';
  const list = Array.isArray(packages) ? packages : [];
  const derived = deriveStartingPrice(
    list.map((tier) => ({
      ...tier,
      // A blank price field reads as "on request", not as zero.
      price: tier.price === null || String(tier.price) === '' ? null : Number(tier.price),
    })),
  );

  return (
    <p className="bg-paper px-5 py-4 text-[13px] text-ink-soft border-3 border-ink">
      Starting price shown on the site:{' '}
      <span className="text-ink">
        {formatPrice(derived, currency, 'en', 'On request')}
      </span>{' '}
      <span className="text-ink-soft">- derived from the lowest package, never entered by hand.</span>
    </p>
  );
}

export function ServiceForm({
  service,
  services,
}: {
  service?: Service;
  services: ReadonlyArray<{ id: string; label: string }>;
}): ReactNode {
  const form = useForm<Values, unknown, Parsed>({
    resolver: zodResolver(serviceSchema),
    defaultValues: defaults(service),
  });

  const { pending, onSubmit, cancel } = useEntitySave<Values, Parsed>({
    form,
    submit: (values) => (service ? updateService(service.id, values) : createService(values)),
    listHref: adminRoutes.services,
    noun: 'Service',
  });

  return (
    <FormProvider {...form}>
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-8">
        <FormSection title="Identity">
          <FieldRow>
            <TextField<Values>
              name="slug"
              label="Slug"
              hint="Appears in the URL: /en/services/your-slug"
              required
            />
            <TextField<Values>
              name="icon"
              label="Icon"
              hint="A lucide icon name, for example code or palette."
              required
            />
          </FieldRow>
          <LocalizedField name="name" label="Name" required />
          <LocalizedField name="tagline" label="Tagline" required />
          <LocalizedField
            name="description"
            label="Description"
            hint="Blank lines separate paragraphs on the service page."
            multiline
            rows={7}
            required
          />
        </FormSection>

        <FormSection title="Imagery">
          <MediaField name="cover" label="Cover image" />
          <Repeater
            name="gallery"
            label="Gallery"
            addLabel="Add image"
            max={20}
            makeItem={() => ({ ...emptyMedia, alt: { ...emptyLocalized } })}
          >
            {(index) => <MediaField name={`gallery.${index}`} label={`Image ${index + 1}`} />}
          </Repeater>
        </FormSection>

        <FormSection title="What the client receives">
          <Repeater
            name="deliverables"
            label="Deliverables"
            addLabel="Add deliverable"
            max={40}
            makeItem={() => ({ ...emptyLocalized })}
          >
            {(index) => (
              <LocalizedField name={`deliverables.${index}`} label={`Deliverable ${index + 1}`} required />
            )}
          </Repeater>
          <TokenField<Values> name="tools" label="Tools" hint="One tool per chip." />
          <LocalizedField
            name="timelineLabel"
            label="Typical timeline"
            hint="For example: 6 to 10 weeks."
            required
          />
        </FormSection>

        <FormSection title="Process" body="The steps shown on the service page, in order.">
          <Repeater
            name="process"
            label="Steps"
            addLabel="Add step"
            max={12}
            makeItem={() => ({
              id: `step_${Math.random().toString(36).slice(2, 9)}`,
              step: 1,
              title: { ...emptyLocalized },
              description: { ...emptyLocalized },
              durationLabel: { ...emptyLocalized },
            })}
          >
            {(index) => (
              <>
                <NumberField<Values> name={`process.${index}.step` as never} label="Step number" required />
                <LocalizedField name={`process.${index}.title`} label="Title" required />
                <LocalizedField
                  name={`process.${index}.description`}
                  label="Description"
                  multiline
                  rows={3}
                  required
                />
                <LocalizedField name={`process.${index}.durationLabel`} label="Duration" required />
              </>
            )}
          </Repeater>
        </FormSection>

        <FormSection
          title="Packages"
          body="Basic, Gold, and Premium. Leave a price blank to show it as on request. There is no checkout, so every package opens the inquiry form."
        >
          <SelectField<Values>
            name="currency"
            label="Currency"
            options={[
              { value: 'IDR', label: 'IDR' },
              { value: 'USD', label: 'USD' },
            ]}
          />
          <StartingPricePreview />
          <Repeater
            name="packages"
            label="Ladder"
            hint="Each tier may appear only once. Display order is fixed by tier, not by this list."
            addLabel="Add package"
            max={3}
            makeItem={() => ({
              tier: 'basic',
              price: '',
              currency: 'IDR',
              period: 'project',
              description: { ...emptyLocalized },
              includes: [],
            })}
          >
            {(index) => (
              <>
                <FieldRow>
                  <SelectField<Values>
                    name={`packages.${index}.tier` as never}
                    label="Tier"
                    options={TIERS.map((value) => ({ value, label: TIER_LABEL[value] ?? value }))}
                  />
                  <SelectField<Values>
                    name={`packages.${index}.period` as never}
                    label="Period"
                    options={PERIODS.map((option) => ({ ...option }))}
                  />
                </FieldRow>
                <FieldRow>
                  <NumberField<Values>
                    name={`packages.${index}.price` as never}
                    label="Price"
                    hint="Blank means on request."
                  />
                  <SelectField<Values>
                    name={`packages.${index}.currency` as never}
                    label="Currency"
                    options={[
                      { value: 'IDR', label: 'IDR' },
                      { value: 'USD', label: 'USD' },
                    ]}
                  />
                </FieldRow>
                <LocalizedField
                  name={`packages.${index}.description`}
                  label="Description"
                  multiline
                  rows={3}
                  required
                />
                <Repeater
                  name={`packages.${index}.includes`}
                  label="Includes"
                  addLabel="Add line"
                  max={40}
                  makeItem={() => ({ ...emptyLocalized })}
                >
                  {(line) => (
                    <LocalizedField
                      name={`packages.${index}.includes.${line}`}
                      label={`Line ${line + 1}`}
                      required
                    />
                  )}
                </Repeater>
              </>
            )}
          </Repeater>
        </FormSection>

        <FormSection title="Questions">
          <Repeater
            name="faqs"
            label="FAQs"
            addLabel="Add question"
            max={20}
            makeItem={() => ({
              id: `faq_${Math.random().toString(36).slice(2, 9)}`,
              question: { ...emptyLocalized },
              answer: { ...emptyLocalized },
            })}
          >
            {(index) => (
              <>
                <LocalizedField name={`faqs.${index}.question`} label="Question" required />
                <LocalizedField
                  name={`faqs.${index}.answer`}
                  label="Answer"
                  multiline
                  rows={4}
                  required
                />
              </>
            )}
          </Repeater>
        </FormSection>

        <FormSection title="Search and visibility">
          <ReferenceField<Values>
            name="relatedServiceIds"
            label="Related services"
            options={services.filter((option) => option.id !== service?.id)}
          />
          <LocalizedField name="seo.title" label="SEO title" required />
          <LocalizedField name="seo.description" label="SEO description" multiline rows={3} required />
          <TextField<Values> name="seo.ogImage" label="Social share image" placeholder="/images/og.jpg" />
          <FieldRow>
            <SelectField<Values>
              name="status"
              label="Status"
              hint="Drafts are invisible on the public site."
              options={[
                { value: 'draft', label: 'Draft' },
                { value: 'published', label: 'Published' },
              ]}
            />
            <SwitchField<Values>
              name="featured"
              label="Featured"
              hint="Featured services lead the home page."
            />
          </FieldRow>
        </FormSection>

        <FormActions
          pending={pending}
          submitLabel={service ? 'Save changes' : 'Create service'}
          onCancel={cancel}
        />
      </form>
    </FormProvider>
  );
}
