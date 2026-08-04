'use client';

import type { ReactNode } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { z } from 'zod';

import { createProduct, updateProduct } from '@/app/actions/content';
import { productSchema } from '@/lib/schemas/content';
import { adminRoutes } from '@/lib/routes';
import { PRODUCT_STATUSES, PRODUCT_TYPES } from '@/types/content';
import type { Product } from '@/types/content';

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

type Values = z.input<typeof productSchema>;
type Parsed = z.output<typeof productSchema>;

const emptyLocalized = { en: '', id: '' };
const emptyMedia = { url: '', alt: { ...emptyLocalized }, width: 1600, height: 1200 };

const TYPE_LABEL: Record<string, string> = {
  'web-app': 'Web app',
  'mobile-app': 'Mobile app',
  'desktop-app': 'Desktop app',
  tool: 'Tool',
  template: 'Template',
};

const STATUS_LABEL: Record<string, string> = {
  available: 'Available',
  beta: 'Beta',
  'coming-soon': 'Coming soon',
};

const UNITS = [
  { value: 'license', label: 'Per licence' },
  { value: 'month', label: 'Per month' },
  { value: 'year', label: 'Per year' },
  { value: 'project', label: 'Per project' },
  { value: 'day', label: 'Per day' },
] as const;

function defaults(product?: Product): Values {
  if (!product) {
    return {
      slug: '',
      name: { ...emptyLocalized },
      tagline: { ...emptyLocalized },
      type: 'web-app',
      productStatus: 'coming-soon',
      cover: { ...emptyMedia },
      gallery: [],
      demoVideoUrl: '',
      description: { ...emptyLocalized },
      features: [],
      platforms: [],
      techStack: [],
      integrations: [],
      requirements: [],
      price: {
        startingPrice: '',
        currency: 'IDR',
        unit: 'license',
        note: { ...emptyLocalized },
      },
      faqs: [],
      changelog: [],
      currentVersion: '',
      demoUrl: '',
      docsUrl: '',
      relatedProductIds: [],
      status: 'draft',
      featured: false,
      seo: { title: { ...emptyLocalized }, description: { ...emptyLocalized }, ogImage: '' },
    };
  }

  return {
    slug: product.slug,
    name: product.name,
    tagline: product.tagline,
    type: product.type,
    productStatus: product.productStatus,
    cover: product.cover,
    gallery: product.gallery,
    demoVideoUrl: product.demoVideoUrl ?? '',
    description: product.description,
    features: product.features,
    platforms: product.platforms,
    techStack: product.techStack,
    integrations: product.integrations,
    requirements: product.requirements,
    price: { ...product.price, startingPrice: product.price.startingPrice ?? '' },
    faqs: product.faqs,
    changelog: product.changelog,
    currentVersion: product.currentVersion ?? '',
    demoUrl: product.demoUrl ?? '',
    docsUrl: product.docsUrl ?? '',
    relatedProductIds: product.relatedProductIds,
    status: product.status,
    featured: product.featured,
    seo: { ...product.seo, ogImage: product.seo.ogImage ?? '' },
  };
}

/**
 * Product editor. A product carries one indicative price and no tier ladder -
 * that difference from a service is deliberate and is enforced by the schema,
 * not by a convention someone has to remember.
 */
export function ProductForm({
  product,
  products,
}: {
  product?: Product;
  products: ReadonlyArray<{ id: string; label: string }>;
}): ReactNode {
  const form = useForm<Values, unknown, Parsed>({
    resolver: zodResolver(productSchema),
    defaultValues: defaults(product),
  });

  const { pending, onSubmit, cancel } = useEntitySave<Values, Parsed>({
    form,
    submit: (values) => (product ? updateProduct(product.id, values) : createProduct(values)),
    listHref: adminRoutes.products,
    noun: 'Product',
  });

  return (
    <FormProvider {...form}>
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-8">
        <FormSection title="Identity">
          <FieldRow>
            <TextField<Values>
              name="slug"
              label="Slug"
              hint="Appears in the URL: /en/products/your-slug"
              required
            />
            <TextField<Values>
              name="currentVersion"
              label="Current version"
              placeholder="1.4.0"
            />
          </FieldRow>
          <LocalizedField name="name" label="Name" required />
          <LocalizedField name="tagline" label="Tagline" required />
          <FieldRow>
            <SelectField<Values>
              name="type"
              label="Type"
              options={PRODUCT_TYPES.map((value) => ({
                value,
                label: TYPE_LABEL[value] ?? value,
              }))}
            />
            <SelectField<Values>
              name="productStatus"
              label="Availability"
              hint="Separate from publish status: a coming-soon product can still be public."
              options={PRODUCT_STATUSES.map((value) => ({
                value,
                label: STATUS_LABEL[value] ?? value,
              }))}
            />
          </FieldRow>
          <LocalizedField
            name="description"
            label="Description"
            multiline
            rows={7}
            required
          />
        </FormSection>

        <FormSection title="Imagery">
          <MediaField name="cover" label="Cover image" />
          <TextField<Values>
            name="demoVideoUrl"
            label="Demo video URL"
            placeholder="https://"
          />
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

        <FormSection title="Features">
          <Repeater
            name="features"
            label="Feature list"
            addLabel="Add feature"
            max={20}
            makeItem={() => ({
              id: `feat_${Math.random().toString(36).slice(2, 9)}`,
              icon: 'sparkles',
              title: { ...emptyLocalized },
              description: { ...emptyLocalized },
            })}
          >
            {(index) => (
              <>
                <TextField<Values>
                  name={`features.${index}.icon` as never}
                  label="Icon"
                  hint="A lucide icon name."
                  required
                />
                <LocalizedField name={`features.${index}.title`} label="Title" required />
                <LocalizedField
                  name={`features.${index}.description`}
                  label="Description"
                  multiline
                  rows={3}
                  required
                />
              </>
            )}
          </Repeater>
        </FormSection>

        <FormSection title="Technical">
          <TokenField<Values> name="platforms" label="Platforms" />
          <TokenField<Values> name="techStack" label="Tech stack" />
          <TokenField<Values> name="integrations" label="Integrations" />
          <Repeater
            name="requirements"
            label="Requirements"
            addLabel="Add requirement"
            max={40}
            makeItem={() => ({ ...emptyLocalized })}
          >
            {(index) => (
              <LocalizedField
                name={`requirements.${index}`}
                label={`Requirement ${index + 1}`}
                required
              />
            )}
          </Repeater>
          <FieldRow>
            <TextField<Values> name="demoUrl" label="Demo URL" placeholder="https://" />
            <TextField<Values> name="docsUrl" label="Docs URL" placeholder="https://" />
          </FieldRow>
        </FormSection>

        <FormSection
          title="Price"
          body="One indicative figure. Products are not sold in tiers, and there is no checkout - the price opens the inquiry form."
        >
          <FieldRow>
            <NumberField<Values>
              name="price.startingPrice"
              label="Starting price"
              hint="Blank means on request."
            />
            <SelectField<Values>
              name="price.currency"
              label="Currency"
              options={[
                { value: 'IDR', label: 'IDR' },
                { value: 'USD', label: 'USD' },
              ]}
            />
          </FieldRow>
          <SelectField<Values>
            name="price.unit"
            label="Unit"
            options={UNITS.map((option) => ({ ...option }))}
          />
          <LocalizedField
            name="price.note"
            label="Price note"
            hint="Optional. Leave both blank to show no note."
          />
        </FormSection>

        <FormSection title="Questions and history">
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

          <Repeater
            name="changelog"
            label="Changelog"
            addLabel="Add release"
            max={40}
            makeItem={() => ({
              version: '',
              date: new Date().toISOString().slice(0, 10),
              notes: { ...emptyLocalized },
            })}
          >
            {(index) => (
              <>
                <FieldRow>
                  <TextField<Values>
                    name={`changelog.${index}.version` as never}
                    label="Version"
                    placeholder="1.4.0"
                    required
                  />
                  <TextField<Values>
                    name={`changelog.${index}.date` as never}
                    label="Date"
                    type="date"
                    required
                  />
                </FieldRow>
                <LocalizedField
                  name={`changelog.${index}.notes`}
                  label="Notes"
                  multiline
                  rows={3}
                  required
                />
              </>
            )}
          </Repeater>
        </FormSection>

        <FormSection title="Search and visibility">
          <ReferenceField<Values>
            name="relatedProductIds"
            label="Related products"
            options={products.filter((option) => option.id !== product?.id)}
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
              hint="Featured products lead the home page."
            />
          </FieldRow>
        </FormSection>

        <FormActions
          pending={pending}
          submitLabel={product ? 'Save changes' : 'Create product'}
          onCancel={cancel}
        />
      </form>
    </FormProvider>
  );
}
