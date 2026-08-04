'use client';

import type { ReactNode } from 'react';
import { Controller, useFieldArray, useFormContext } from 'react-hook-form';
import type { FieldValues, Path } from 'react-hook-form';
import { GripVertical, Plus, X } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input, Select, Textarea } from '@/components/ui/field';
import { Card } from '@/components/ui/primitives';

/**
 * Field kit for the three entity editors.
 *
 * Every control reads from the surrounding `FormProvider`, so a form is a list
 * of fields rather than a wall of `control={control}` plumbing. Validation
 * messages come from the same Zod schema the server action runs, so the two
 * sides can never disagree about what is valid.
 */

/* ── Error lookup ─────────────────────────────────────────────────────────── */

/** Walks `errors` by dotted path: `cover.alt.en` → the leaf message, if any. */
function useError(name: string): string | undefined {
  const {
    formState: { errors },
  } = useFormContext();

  let node: unknown = errors;
  for (const key of name.split('.')) {
    if (node === null || typeof node !== 'object') return undefined;
    node = (node as Record<string, unknown>)[key];
  }
  if (node && typeof node === 'object' && 'message' in node) {
    const message = (node as { message?: unknown }).message;
    return typeof message === 'string' ? message : undefined;
  }
  return undefined;
}

/* ── Layout ───────────────────────────────────────────────────────────────── */

export function FormSection({
  title,
  body,
  children,
  className,
}: {
  title: string;
  body?: string;
  children: ReactNode;
  className?: string;
}): ReactNode {
  return (
    <Card className={className}>
      <h2 className="display text-xl text-ink">{title}</h2>
      {body ? <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">{body}</p> : null}
      <div className="mt-8 flex flex-col gap-6">{children}</div>
    </Card>
  );
}

export function FieldRow({ children }: { children: ReactNode }): ReactNode {
  return <div className="grid gap-6 md:grid-cols-2">{children}</div>;
}

/* ── Scalar fields ────────────────────────────────────────────────────────── */

export function TextField<T extends FieldValues>({
  name,
  label,
  hint,
  placeholder,
  type = 'text',
  required,
}: {
  name: Path<T>;
  label: string;
  hint?: string;
  placeholder?: string;
  type?: string;
  required?: boolean;
}): ReactNode {
  const { register } = useFormContext<T>();
  return (
    <Input
      label={label}
      hint={hint}
      type={type}
      placeholder={placeholder}
      required={required}
      error={useError(name)}
      {...register(name)}
    />
  );
}

export function NumberField<T extends FieldValues>({
  name,
  label,
  hint,
  required,
}: {
  name: Path<T>;
  label: string;
  hint?: string;
  required?: boolean;
}): ReactNode {
  const { register } = useFormContext<T>();
  return (
    <Input
      label={label}
      hint={hint}
      type="number"
      inputMode="numeric"
      required={required}
      error={useError(name)}
      {...register(name)}
    />
  );
}

export function SelectField<T extends FieldValues>({
  name,
  label,
  options,
  hint,
}: {
  name: Path<T>;
  label: string;
  options: ReadonlyArray<{ value: string; label: string }>;
  hint?: string;
}): ReactNode {
  const { register } = useFormContext<T>();
  return (
    <Select
      label={label}
      hint={hint}
      options={[...options]}
      error={useError(name)}
      {...register(name)}
    />
  );
}

/** Checkbox styled as a switch. Native input, so keyboard and SR work for free. */
export function SwitchField<T extends FieldValues>({
  name,
  label,
  hint,
}: {
  name: Path<T>;
  label: string;
  hint?: string;
}): ReactNode {
  const { register } = useFormContext<T>();
  return (
    <label className="flex cursor-pointer items-start gap-4 bg-paper p-5 border-3 border-ink transition-colors hover:border-ink has-[:focus-visible]:border-acid">
      <input
        type="checkbox"
        className="peer mt-0.5 size-5 shrink-0 accent-[var(--color-acid)]"
        {...register(name)}
      />
      <span className="min-w-0">
        <span className="block text-sm text-ink">{label}</span>
        {hint ? <span className="mt-1 block text-[13px] text-ink-soft">{hint}</span> : null}
      </span>
    </label>
  );
}

/* ── Localized pair ───────────────────────────────────────────────────────── */

/**
 * The bilingual control. Both languages sit side by side because writing one and
 * forgetting the other is the failure this panel exists to prevent.
 */
export function LocalizedField<T extends FieldValues>({
  name,
  label,
  hint,
  multiline = false,
  rows = 4,
  required,
}: {
  name: string;
  label: string;
  hint?: string;
  multiline?: boolean;
  rows?: number;
  required?: boolean;
}): ReactNode {
  const { register } = useFormContext<T>();
  const enError = useError(`${name}.en`);
  const idError = useError(`${name}.id`);
  const Control = multiline ? Textarea : Input;

  return (
    <fieldset>
      <legend className="text-[13px] text-ink-soft">
        {label}
        {required ? (
          <span className="ml-1 text-acid" aria-hidden>
            *
          </span>
        ) : null}
      </legend>
      {hint ? <p className="mt-1 text-xs text-ink-soft">{hint}</p> : null}
      <div className="mt-3 grid gap-4 md:grid-cols-2">
        <Control
          label="English"
          rows={rows}
          error={enError}
          {...register(`${name}.en` as Path<T>)}
        />
        <Control
          label="Indonesian"
          rows={rows}
          error={idError}
          {...register(`${name}.id` as Path<T>)}
        />
      </div>
    </fieldset>
  );
}

/* ── String list (tags) ───────────────────────────────────────────────────── */

/**
 * Chip editor for `string[]` fields: stack, tools, platforms.
 * Kept as chips rather than a comma-separated line so a value containing a
 * comma is still one value.
 */
export function TokenField<T extends FieldValues>({
  name,
  label,
  hint,
  placeholder = 'Type and press Enter',
}: {
  name: Path<T>;
  label: string;
  hint?: string;
  placeholder?: string;
}): ReactNode {
  const { control } = useFormContext<T>();
  const error = useError(name);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => {
        const values: string[] = Array.isArray(field.value) ? field.value : [];

        const add = (raw: string): void => {
          const value = raw.trim();
          if (value.length === 0 || values.includes(value)) return;
          field.onChange([...values, value]);
        };

        return (
          <div className="flex flex-col gap-2">
            <span className="text-[13px] text-ink-soft">{label}</span>
            {hint ? <span className="-mt-1 text-xs text-ink-soft">{hint}</span> : null}
            <div className="flex flex-wrap items-center gap-2 bg-paper p-3 border-3 border-ink focus-within:border-acid">
              {values.map((value, index) => (
                <span
                  key={`${value}-${index}`}
                  className="inline-flex items-center gap-2 bg-paper-dim px-3 py-1.5 text-[13px] text-ink"
                >
                  {value}
                  <button
                    type="button"
                    aria-label={`Remove ${value}`}
                    onClick={() =>
                      field.onChange(values.filter((_, position) => position !== index))
                    }
                    className="text-ink-soft transition-colors hover:text-danger focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acid"
                  >
                    <X className="size-3" aria-hidden />
                  </button>
                </span>
              ))}
              <input
                type="text"
                placeholder={placeholder}
                aria-label={label}
                onKeyDown={(event) => {
                  if (event.key !== 'Enter' && event.key !== ',') return;
                  event.preventDefault();
                  add(event.currentTarget.value);
                  event.currentTarget.value = '';
                }}
                onBlur={(event) => {
                  add(event.currentTarget.value);
                  event.currentTarget.value = '';
                }}
                className="min-h-9 min-w-40 flex-1 bg-transparent px-2 text-sm text-ink placeholder:text-ink-soft focus:outline-none"
              />
            </div>
            {error ? <p className="text-xs text-danger">{error}</p> : null}
          </div>
        );
      }}
    />
  );
}

/* ── Repeater ─────────────────────────────────────────────────────────────── */

/**
 * Generic array editor. The caller renders the fields for one row and this
 * handles add, remove, and the surrounding frame - the shape of a process step
 * and the shape of a FAQ differ, but the mechanics never do.
 */
export function Repeater({
  name,
  label,
  hint,
  addLabel,
  makeItem,
  max,
  children,
}: {
  name: string;
  label: string;
  hint?: string;
  addLabel: string;
  makeItem: () => Record<string, unknown>;
  max?: number;
  children: (index: number) => ReactNode;
}): ReactNode {
  const { control } = useFormContext();
  const { fields, append, remove } = useFieldArray({ control, name });
  const error = useError(name);

  return (
    <fieldset>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <legend className="text-[13px] text-ink-soft">{label}</legend>
          {hint ? <p className="mt-1 text-xs text-ink-soft">{hint}</p> : null}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={max !== undefined && fields.length >= max}
          onClick={() => append(makeItem())}
        >
          <Plus className="size-3.5" aria-hidden strokeWidth={2} />
          {addLabel}
        </Button>
      </div>

      {fields.length === 0 ? (
        <p className="mt-4 bg-paper px-5 py-6 text-[13px] text-ink-soft border-3 border-ink">
          Nothing here yet.
        </p>
      ) : (
        <ol className="mt-4 flex flex-col gap-4">
          {fields.map((field, index) => (
            <li
              key={field.id}
              className="bg-paper p-5 border-3 border-ink md:p-6"
            >
              <div className="mb-5 flex items-center justify-between gap-4">
                <span className="inline-flex items-center gap-2 text-[11px] text-ink-soft">
                  <GripVertical className="size-3.5" aria-hidden />
                  {String(index + 1).padStart(2, '0')}
                </span>
                <button
                  type="button"
                  onClick={() => remove(index)}
                  aria-label={`Remove item ${index + 1}`}
                  className="flex size-9 items-center justify-center text-ink-soft transition-colors hover:bg-danger/10 hover:text-danger focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acid"
                >
                  <X className="size-4" aria-hidden />
                </button>
              </div>
              <div className="flex flex-col gap-5">{children(index)}</div>
            </li>
          ))}
        </ol>
      )}

      {error ? <p className="mt-3 text-xs text-danger">{error}</p> : null}
    </fieldset>
  );
}

/* ── Media ────────────────────────────────────────────────────────────────── */

/** Image reference with a live preview, so a wrong path is visible immediately. */
export function MediaField<T extends FieldValues>({
  name,
  label,
  hint,
}: {
  name: string;
  label: string;
  hint?: string;
}): ReactNode {
  const { register, watch } = useFormContext<T>();
  const url = watch(`${name}.url` as Path<T>) as unknown as string | undefined;

  return (
    <fieldset>
      <legend className="text-[13px] text-ink-soft">{label}</legend>
      {hint ? <p className="mt-1 text-xs text-ink-soft">{hint}</p> : null}

      <div className="mt-3 grid gap-5 md:grid-cols-12">
        <div className="md:col-span-4">
          <div className="aspect-4/3 overflow-hidden bg-paper-dim border-3 border-ink">
            {url ? (
              /* Plain img: the path is operator-entered and may be off-domain. */
              // eslint-disable-next-line @next/next/no-img-element
              <img src={url} alt="" className="size-full object-cover" />
            ) : (
              <span className="flex size-full items-center justify-center text-[13px] text-ink-soft">
                No image
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-5 md:col-span-8">
          <Input
            label="Path or URL"
            placeholder="/images/example.jpg"
            error={useError(`${name}.url`)}
            {...register(`${name}.url` as Path<T>)}
          />
          <div className="grid gap-5 sm:grid-cols-2">
            <Input
              label="Width"
              type="number"
              error={useError(`${name}.width`)}
              {...register(`${name}.width` as Path<T>)}
            />
            <Input
              label="Height"
              type="number"
              error={useError(`${name}.height`)}
              {...register(`${name}.height` as Path<T>)}
            />
          </div>
          <LocalizedField name={`${name}.alt`} label="Alt text" required />
        </div>
      </div>
    </fieldset>
  );
}

/* ── Reference picker ─────────────────────────────────────────────────────── */

/** Multi-select over other records, rendered as toggle chips. */
export function ReferenceField<T extends FieldValues>({
  name,
  label,
  hint,
  options,
}: {
  name: Path<T>;
  label: string;
  hint?: string;
  options: ReadonlyArray<{ id: string; label: string }>;
}): ReactNode {
  const { control } = useFormContext<T>();
  const error = useError(name);

  if (options.length === 0) {
    return (
      <div>
        <span className="text-[13px] text-ink-soft">{label}</span>
        <p className="mt-2 text-[13px] text-ink-soft">Nothing available to link yet.</p>
      </div>
    );
  }

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => {
        const selected: string[] = Array.isArray(field.value) ? field.value : [];
        return (
          <fieldset>
            <legend className="text-[13px] text-ink-soft">{label}</legend>
            {hint ? <p className="mt-1 text-xs text-ink-soft">{hint}</p> : null}
            <div className="mt-3 flex flex-wrap gap-2">
              {options.map((option) => {
                const active = selected.includes(option.id);
                return (
                  <button
                    key={option.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() =>
                      field.onChange(
                        active
                          ? selected.filter((id) => id !== option.id)
                          : [...selected, option.id],
                      )
                    }
                    className={cn(
                      'min-h-11 px-5 text-[13px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acid',
                      active
                        ? 'bg-acid text-ink'
                        : 'bg-paper text-ink-soft border-3 border-ink hover:text-ink',
                    )}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
            {error ? <p className="mt-2 text-xs text-danger">{error}</p> : null}
          </fieldset>
        );
      }}
    />
  );
}

/* ── Footer ───────────────────────────────────────────────────────────────── */

/** Sticky save bar: on a form this long, the button must never scroll away. */
export function FormActions({
  pending,
  submitLabel,
  onCancel,
}: {
  pending: boolean;
  submitLabel: string;
  onCancel: () => void;
}): ReactNode {
  return (
    <div className="sticky bottom-0 z-20 -mx-6 mt-2 border-t-3 border-ink bg-paper/90 px-6 py-5 backdrop-blur-md md:-mx-10 md:px-10">
      <div className="flex flex-wrap justify-end gap-3">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={pending}>
          Cancel
        </Button>
        <Button type="submit" loading={pending}>
          {pending ? 'Saving' : submitLabel}
        </Button>
      </div>
    </div>
  );
}
