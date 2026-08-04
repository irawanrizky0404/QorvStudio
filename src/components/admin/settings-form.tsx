'use client';

import { useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { z } from 'zod';

import { updateSettings } from '@/app/actions/content';
import { settingsSchema } from '@/lib/schemas/content';
import { toast } from '@/stores/ui-store';
import type { Settings } from '@/types/content';

import {
  FieldRow,
  FormActions,
  FormSection,
  LocalizedField,
  Repeater,
  TextField,
} from './form-kit';

type Values = z.input<typeof settingsSchema>;
type Parsed = z.output<typeof settingsSchema>;

export function SettingsForm({ settings }: { settings: Settings }): ReactNode {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const form = useForm<Values, unknown, Parsed>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      studioName: settings.studioName,
      tagline: settings.tagline,
      foundedYear: settings.foundedYear,
      location: settings.location,
      email: settings.email,
      whatsapp: settings.whatsapp,
      address: settings.address ?? { en: '', id: '' },
      socials: settings.socials,
      seoDefaults: { ...settings.seoDefaults, ogImage: settings.seoDefaults.ogImage ?? '' },
    },
  });

  async function onValid(values: Parsed): Promise<void> {
    setPending(true);
    const result = await updateSettings(values);
    setPending(false);

    if (result.ok) {
      toast.success('Settings saved');
      router.refresh();
      return;
    }
    for (const [path, message] of Object.entries(result.fieldErrors ?? {})) {
      form.setError(path as never, { type: 'server', message });
    }
    toast.error('Not saved', result.message);
  }

  function onSubmit(event: FormEvent<HTMLFormElement>): void {
    void form.handleSubmit(onValid)(event);
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-8">
        <FormSection title="Studio" body="Shown in the footer and used as the sender identity.">
          <TextField<Values> name="studioName" label="Studio name" required />
          <LocalizedField name="tagline" label="Tagline" required />
          <TextField<Values> name="foundedYear" label="Founded year" required />
          <LocalizedField name="location" label="Location" required />
          <LocalizedField
            name="address"
            label="Address"
            hint="Optional. Leave both blank to hide the address block."
            multiline
            rows={3}
          />
        </FormSection>

        <FormSection
          title="Contact"
          body="Both channels appear on the contact page and behind every inquiry CTA."
        >
          <FieldRow>
            <TextField<Values> name="email" label="Email" type="email" required />
            <TextField<Values>
              name="whatsapp"
              label="WhatsApp"
              hint="Digits only, including country code: 628123456789"
              required
            />
          </FieldRow>
          <Repeater
            name="socials"
            label="Social links"
            addLabel="Add link"
            max={12}
            makeItem={() => ({ platform: '', url: '' })}
          >
            {(index) => (
              <FieldRow>
                <TextField<Values>
                  name={`socials.${index}.platform` as never}
                  label="Platform"
                  placeholder="Instagram"
                  required
                />
                <TextField<Values>
                  name={`socials.${index}.url` as never}
                  label="URL"
                  placeholder="https://"
                  required
                />
              </FieldRow>
            )}
          </Repeater>
        </FormSection>

        <FormSection
          title="Search defaults"
          body="Used for any page that does not set its own title or description."
        >
          <LocalizedField name="seoDefaults.title" label="Default title" required />
          <LocalizedField
            name="seoDefaults.description"
            label="Default description"
            multiline
            rows={3}
            required
          />
          <TextField<Values>
            name="seoDefaults.ogImage"
            label="Default social image"
            placeholder="/images/og.jpg"
          />
        </FormSection>

        <FormActions
          pending={pending}
          submitLabel="Save settings"
          onCancel={() => form.reset()}
        />
      </form>
    </FormProvider>
  );
}
