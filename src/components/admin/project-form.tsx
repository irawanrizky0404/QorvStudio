'use client';

import type { ReactNode } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { z } from 'zod';

import { createProject, updateProject } from '@/app/actions/content';
import { projectSchema } from '@/lib/schemas/content';
import { adminRoutes } from '@/lib/routes';
import { PROJECT_CATEGORIES } from '@/types/content';
import type { Project } from '@/types/content';

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

type Values = z.input<typeof projectSchema>;
type Parsed = z.output<typeof projectSchema>;

const CATEGORY_LABEL: Record<string, string> = {
  'web-app': 'Web app',
  'mobile-app': 'Mobile app',
  '3d-animation': '3D and animation',
  packaging: 'Packaging',
  branding: 'Branding',
};

const emptyLocalized = { en: '', id: '' };

const emptyMedia = { url: '', alt: { ...emptyLocalized }, width: 1600, height: 1200 };

function defaults(project?: Project): Values {
  if (!project) {
    return {
      slug: '',
      title: { ...emptyLocalized },
      client: '',
      category: 'web-app',
      year: new Date().getFullYear(),
      summary: { ...emptyLocalized },
      cover: { ...emptyMedia },
      gallery: [],
      challenge: { ...emptyLocalized },
      solution: { ...emptyLocalized },
      outcome: { ...emptyLocalized },
      results: [],
      serviceIds: [],
      stack: [],
      role: { ...emptyLocalized },
      durationMonths: '',
      liveUrl: '',
      status: 'draft',
      featured: false,
      seo: { title: { ...emptyLocalized }, description: { ...emptyLocalized }, ogImage: '' },
    };
  }

  return {
    slug: project.slug,
    title: project.title,
    client: project.client,
    category: project.category,
    year: project.year,
    summary: project.summary,
    cover: project.cover,
    gallery: project.gallery,
    challenge: project.challenge,
    solution: project.solution,
    outcome: project.outcome,
    results: project.results,
    serviceIds: project.serviceIds,
    stack: project.stack,
    role: project.role,
    durationMonths: project.durationMonths ?? '',
    liveUrl: project.liveUrl ?? '',
    status: project.status,
    featured: project.featured,
    seo: { ...project.seo, ogImage: project.seo.ogImage ?? '' },
  };
}

/**
 * Project editor. Grouped by the question each block answers - what it is, what
 * it looked like, what happened, and how it is found - rather than by the shape
 * of the record, which is what makes a 30-field form navigable.
 */
export function ProjectForm({
  project,
  services,
}: {
  project?: Project;
  services: ReadonlyArray<{ id: string; label: string }>;
}): ReactNode {
  const form = useForm<Values, unknown, Parsed>({
    resolver: zodResolver(projectSchema),
    defaultValues: defaults(project),
  });

  const { pending, onSubmit, cancel } = useEntitySave<Values, Parsed>({
    form,
    submit: (values) => (project ? updateProject(project.id, values) : createProject(values)),
    listHref: adminRoutes.projects,
    noun: 'Project',
  });

  return (
    <FormProvider {...form}>
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-8">
        <FormSection title="Identity" body="How this project is addressed and filed.">
          <FieldRow>
            <TextField<Values>
              name="slug"
              label="Slug"
              hint="Appears in the URL: /en/work/your-slug"
              required
            />
            <TextField<Values> name="client" label="Client" required />
          </FieldRow>
          <LocalizedField name="title" label="Title" required />
          <FieldRow>
            <SelectField<Values>
              name="category"
              label="Category"
              options={PROJECT_CATEGORIES.map((value) => ({
                value,
                label: CATEGORY_LABEL[value] ?? value,
              }))}
            />
            <NumberField<Values> name="year" label="Year" required />
          </FieldRow>
          <LocalizedField
            name="summary"
            label="Summary"
            hint="One or two sentences. Used on cards and in search results."
            multiline
            rows={3}
            required
          />
        </FormSection>

        <FormSection title="Imagery" body="The cover carries the card; the gallery carries the case study.">
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

        <FormSection title="The story" body="Challenge, solution, outcome. This is the case study body.">
          <LocalizedField name="challenge" label="Challenge" multiline rows={5} required />
          <LocalizedField name="solution" label="Solution" multiline rows={5} required />
          <LocalizedField name="outcome" label="Outcome" multiline rows={5} required />
          <Repeater
            name="results"
            label="Results"
            hint="Short measured figures shown as a strip on the case study."
            addLabel="Add result"
            max={12}
            makeItem={() => ({ label: { ...emptyLocalized }, value: '' })}
          >
            {(index) => (
              <>
                <TextField<Values>
                  name={`results.${index}.value` as never}
                  label="Value"
                  placeholder="+38%"
                  required
                />
                <LocalizedField name={`results.${index}.label`} label="Label" required />
              </>
            )}
          </Repeater>
        </FormSection>

        <FormSection title="Delivery" body="What was involved and who did what.">
          <ReferenceField<Values>
            name="serviceIds"
            label="Services delivered"
            hint="Links this project into each service page."
            options={services}
          />
          <TokenField<Values> name="stack" label="Stack" hint="One technology per chip." />
          <LocalizedField name="role" label="Our role" required />
          <FieldRow>
            <NumberField<Values>
              name="durationMonths"
              label="Duration in months"
              hint="Leave blank if it does not apply."
            />
            <TextField<Values> name="liveUrl" label="Live URL" placeholder="https://" />
          </FieldRow>
        </FormSection>

        <FormSection title="Search and visibility">
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
              hint="Featured projects lead the home page."
            />
          </FieldRow>
        </FormSection>

        <FormActions
          pending={pending}
          submitLabel={project ? 'Save changes' : 'Create project'}
          onCancel={cancel}
        />
      </form>
    </FormProvider>
  );
}
