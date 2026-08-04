'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import type { FieldValues, Path, UseFormReturn } from 'react-hook-form';

import type { AdminResult } from '@/app/actions/content';
import { toast } from '@/stores/ui-store';

/**
 * Save behaviour shared by the three entity editors.
 *
 * Field errors returned by the server are mapped back onto the form by their
 * dotted path, so a rule only the server can check still lands on the field
 * that caused it rather than in a toast the operator has to interpret.
 */
export function useEntitySave<TIn extends FieldValues, TOut extends FieldValues>({
  form,
  submit,
  listHref,
  noun,
}: {
  form: UseFormReturn<TIn, unknown, TOut>;
  submit: (values: unknown) => Promise<AdminResult>;
  listHref: string;
  noun: string;
}): {
  pending: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  cancel: () => void;
} {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function onValid(values: TOut): Promise<void> {
    setPending(true);
    const result = await submit(values).catch(
      (): AdminResult => ({ ok: false, message: 'The server did not respond. Try again.' }),
    );

    if (result.ok) {
      toast.success(`${noun} saved`);
      router.push(listHref);
      router.refresh();
      return;
    }

    setPending(false);
    for (const [path, message] of Object.entries(result.fieldErrors ?? {})) {
      form.setError(path as Path<TIn>, { type: 'server', message });
    }
    toast.error('Not saved', result.message);
  }

  return {
    pending,
    onSubmit: (event) => {
      void form.handleSubmit(onValid)(event);
    },
    cancel: () => router.push(listHref),
  };
}
