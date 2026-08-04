'use client';

import type { ReactNode } from 'react';
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { useUiStore } from '@/stores/ui-store';
import type { ToastVariant } from '@/stores/ui-store';
import { cn } from '@/lib/utils';

const ICONS: Record<ToastVariant, typeof Info> = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
};

const TONE: Record<ToastVariant, string> = {
  success: 'text-acid',
  error: 'text-danger',
  info: 'text-ink',
  warning: 'text-ink',
};

/**
 * The single notification surface. Native alert and confirm are not used
 * anywhere, so every save, delete, and failure surfaces here.
 * Errors persist until dismissed; an error that vanishes is one nobody read.
 */
export function Toaster(): ReactNode {
  const toasts = useUiStore((s) => s.toasts);
  const dismiss = useUiStore((s) => s.dismissToast);

  return (
    <div
      role="region"
      aria-label="Notifications"
      aria-live="polite"
      className="pointer-events-none fixed bottom-0 right-0 z-[100] flex w-full max-w-sm flex-col gap-3 p-4 sm:p-6"
    >
      {toasts.map((item) => {
        const Icon = ICONS[item.variant];
        return (
          <div
            key={item.id}
            className="pointer-events-auto flex items-start gap-3 border-3 border-ink bg-paper p-4 shadow-[9px_9px_0_var(--color-ink)]"
          >
            <Icon className={cn('mt-0.5 size-4 shrink-0', TONE[item.variant])} aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-ink">{item.title}</p>
              {item.description ? (
                <p className="mt-1 text-[13px] leading-relaxed text-muted">{item.description}</p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => dismiss(item.id)}
              aria-label="Dismiss notification"
              className="-m-1 flex size-8 shrink-0 items-center justify-center border-3 border-ink text-ink transition-colors duration-150 hover:bg-acid focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ink"
            >
              <X className="size-4" aria-hidden />
            </button>
          </div>
        );
      })}
    </div>
  );
}
