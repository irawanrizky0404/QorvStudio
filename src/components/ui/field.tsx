'use client';

import { forwardRef, useId } from 'react';
import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

/**
 * Form controls.
 *
 * Kolom bersegi di atas kertas, bergaris tinta 3px. Versi lama memakai
 * `rounded-xl bg-ink text-chrome` — sudut membulat yang tidak ada di sistem
 * ini, dan setelah palet berubah, tulisan tinta di atas latar tinta.
 *
 * Fokus ditandai dengan mengganti garis jadi acid, bukan menambah cincin di
 * luar kotak: garis 3px sudah cukup tebal untuk membawa keadaan fokus sendiri.
 */
const CONTROL =
  'w-full min-h-12 border-3 border-ink bg-paper px-4 py-3 text-sm text-ink ' +
  'placeholder:text-ink-soft transition-colors duration-150 focus:border-acid focus:outline-none ' +
  'disabled:cursor-not-allowed disabled:opacity-40 aria-[invalid=true]:border-danger';

function Shell({
  label, htmlFor, error, hint, required, className, children, errorId, hintId,
}: {
  label: string; htmlFor: string; error?: string; hint?: string; required?: boolean;
  className?: string; children: ReactNode; errorId: string; hintId: string;
}): ReactNode {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <label htmlFor={htmlFor} className="label">
        {label}
        {required ? <span className="ml-1 inline-block size-1.5 bg-acid align-middle" aria-hidden /> : null}
      </label>
      {children}
      {hint && !error ? <p id={hintId} className="text-xs text-ink-soft">{hint}</p> : null}
      {error ? <p id={errorId} className="text-xs text-danger">{error}</p> : null}
    </div>
  );
}

const describedBy = (e?: string, h?: string, eid?: string, hid?: string) => (e ? eid : h ? hid : undefined);

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> {
  label: string; error?: string; hint?: string; className?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, className, id, required, ...props }, ref) {
  const gen = useId(); const fid = id ?? gen;
  return (
    <Shell label={label} htmlFor={fid} error={error} hint={hint} required={required}
      className={className} errorId={`${fid}-e`} hintId={`${fid}-h`}>
      <input ref={ref} id={fid} required={required} aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(error, hint, `${fid}-e`, `${fid}-h`)} className={CONTROL} {...props} />
    </Shell>
  );
});

export interface TextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'className'> {
  label: string; error?: string; hint?: string; className?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, error, hint, className, id, required, rows = 5, ...props }, ref) {
  const gen = useId(); const fid = id ?? gen;
  return (
    <Shell label={label} htmlFor={fid} error={error} hint={hint} required={required}
      className={className} errorId={`${fid}-e`} hintId={`${fid}-h`}>
      <textarea ref={ref} id={fid} rows={rows} required={required} aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(error, hint, `${fid}-e`, `${fid}-h`)}
        className={cn(CONTROL, 'resize-y leading-relaxed')} {...props} />
    </Shell>
  );
});

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'className'> {
  label: string; error?: string; hint?: string; className?: string;
  options: Array<{ value: string; label: string }>; placeholder?: string;
}

/** Native select: keyboard- and screen-reader-correct for free, platform picker on mobile. */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, error, hint, className, id, required, options, placeholder, ...props }, ref) {
  const gen = useId(); const fid = id ?? gen;
  return (
    <Shell label={label} htmlFor={fid} error={error} hint={hint} required={required}
      className={className} errorId={`${fid}-e`} hintId={`${fid}-h`}>
      <select ref={ref} id={fid} required={required} aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(error, hint, `${fid}-e`, `${fid}-h`)}
        className={cn(CONTROL, 'appearance-none pr-10')} {...props}>
        {placeholder ? <option value="" disabled>{placeholder}</option> : null}
        {options.map((o) => <option key={o.value} value={o.value} className="bg-ink">{o.label}</option>)}
      </select>
    </Shell>
  );
});
