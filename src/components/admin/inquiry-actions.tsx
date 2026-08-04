'use client';

import { useState } from 'react';
import type { ReactNode } from 'react';
import { useRouter } from 'next/navigation';

import { deleteInquiry, setInquiryStatus } from '@/app/actions/content';
import type { AdminResult } from '@/app/actions/content';
import { adminRoutes } from '@/lib/routes';
import { toast } from '@/stores/ui-store';
import { cn } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/dialog';

const STATUSES = [
  { value: 'new', label: 'New' },
  { value: 'read', label: 'Read' },
  { value: 'replied', label: 'Replied' },
  { value: 'archived', label: 'Archived' },
] as const;

/**
 * Status is a segmented control rather than a dropdown: there are four states
 * and the current one should be readable without opening anything.
 */
export function InquiryActions({
  id,
  status,
  name,
}: {
  id: string;
  status: string;
  name: string;
}): ReactNode {
  const router = useRouter();
  const [pending, setPending] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  async function change(next: string): Promise<void> {
    if (next === status) return;
    setPending(next);
    const result = await setInquiryStatus(id, next).catch(
      (): AdminResult => ({ ok: false, message: 'The server did not respond. Try again.' }),
    );
    setPending(null);

    if (result.ok) {
      router.refresh();
      return;
    }
    toast.error('Not updated', result.message);
  }

  async function remove(): Promise<void> {
    setPending('delete');
    const result = await deleteInquiry(id).catch(
      (): AdminResult => ({ ok: false, message: 'The server did not respond. Try again.' }),
    );

    if (result.ok) {
      toast.success('Inquiry deleted');
      router.push(adminRoutes.inquiries);
      router.refresh();
      return;
    }
    setPending(null);
    toast.error('Delete failed', result.message);
  }

  return (
    <>
      <div className="flex flex-col gap-5">
        <div>
          <p className="text-[13px] text-ink-soft">Status</p>
          <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Inquiry status">
            {STATUSES.map((option) => {
              const active = option.value === status;
              return (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={active}
                  disabled={pending !== null}
                  onClick={() => void change(option.value)}
                  className={cn(
                    'min-h-11 px-5 text-[13px] transition-colors disabled:opacity-50',
                    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acid',
                    active
                      ? 'bg-acid text-ink'
                      : 'bg-paper text-ink-soft border-3 border-ink hover:text-ink',
                  )}
                >
                  {pending === option.value ? 'Saving' : option.label}
                </button>
              );
            })}
          </div>
        </div>

        <Button
          variant="danger"
          size="sm"
          onClick={() => setConfirming(true)}
          className="self-start"
        >
          Delete inquiry
        </Button>
      </div>

      <ConfirmDialog
        open={confirming}
        onOpenChange={setConfirming}
        title={`Delete the inquiry from ${name}?`}
        description="The message and the contact details go with it. This cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Keep"
        loading={pending === 'delete'}
        onConfirm={() => void remove()}
      />
    </>
  );
}
