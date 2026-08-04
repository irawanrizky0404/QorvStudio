'use client';

import type { ReactNode } from 'react';
import * as RadixDialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';

/** Radix handles focus trap, restore, escape and scroll lock; we only restyle. */
export function Dialog({
  open, onOpenChange, title, description, children, className, closeLabel = 'Close',
}: {
  open: boolean; onOpenChange: (open: boolean) => void; title: string;
  description?: string; children?: ReactNode; className?: string; closeLabel?: string;
}): ReactNode {
  return (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="fixed inset-0 z-[90] bg-ink/70" />
        <RadixDialog.Content
          className={cn(
            // Lebih lebar (max-w-4xl, bukan 2xl) supaya isian bisa berdiri dua
            // kolom dan tingginya turun. `surface` dibuang: kelas itu milik
            // palet gelap lama dan menimpa latar kertas di sini.
            'fixed left-1/2 top-1/2 z-[95] w-[calc(100%-2rem)] max-w-4xl -translate-x-1/2 -translate-y-1/2',
            'max-h-[92vh] overflow-y-auto border-3 border-ink bg-paper p-6 md:p-8', className,
          )}
        >
          <div className="flex items-start justify-between gap-5">
            <div className="min-w-0">
              <RadixDialog.Title className="display rank-3">
                {title}
              </RadixDialog.Title>
              {description ? (
                <RadixDialog.Description className="mt-2 text-sm leading-relaxed text-muted">
                  {description}
                </RadixDialog.Description>
              ) : null}
            </div>
            <RadixDialog.Close
              aria-label={closeLabel}
              className="-m-1 flex size-10 shrink-0 items-center justify-center border-3 border-ink bg-paper text-ink transition-colors duration-150 hover:bg-acid focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ink"
            >
              <X className="size-4" aria-hidden />
            </RadixDialog.Close>
          </div>
          {children ? <div className="mt-7">{children}</div> : null}
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
}

/** Replacement for window.confirm. States the consequence before it happens. */
export function ConfirmDialog({
  open, onOpenChange, title, description, confirmLabel, cancelLabel,
  onConfirm, loading = false, destructive = true, warning,
}: {
  open: boolean; onOpenChange: (open: boolean) => void; title: string; description: string;
  confirmLabel: string; cancelLabel: string; onConfirm: () => void;
  loading?: boolean; destructive?: boolean; warning?: string;
}): ReactNode {
  return (
    <Dialog open={open} onOpenChange={onOpenChange} title={title} description={description} className="max-w-lg">
      {warning ? (
        <p className="border-3 border-danger p-4 text-[13px] leading-relaxed text-danger">
          {warning}
        </p>
      ) : null}
      <div className="mt-7 flex flex-wrap justify-end gap-3">
        <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={loading}>{cancelLabel}</Button>
        <Button variant={destructive ? 'danger' : 'primary'} onClick={onConfirm} loading={loading}>
          {confirmLabel}
        </Button>
      </div>
    </Dialog>
  );
}
