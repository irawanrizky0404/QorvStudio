'use client';

import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Pencil, Search, Star, Trash2 } from 'lucide-react';

import type { AdminResult } from '@/app/actions/content';
import { toast } from '@/stores/ui-store';
import { cn } from '@/lib/utils';

import { StatusPill } from './status-pill';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/dialog';
import { EmptyState } from '@/components/ui/states';

export interface EntityRow {
  id: string;
  title: string;
  subtitle: string;
  status: string;
  /** Second chip, e.g. a product's availability. */
  badge?: string;
  meta: string;
  featured: boolean;
  editHref: string;
  /** Shown in the delete dialog when removing this record touches other records. */
  deleteWarning?: string;
}

/**
 * The one list border-3 border-ink bg-paper for projects, services, and products.
 *
 * Collections here are small by design (tens, not thousands), so filtering is
 * done in the browser: typing gives an answer with no round trip, and the
 * server keeps one cached response instead of one per query.
 */
export function EntityTable({
  rows,
  noun,
  onDelete,
  emptyAction,
}: {
  rows: EntityRow[];
  noun: string;
  onDelete: (id: string) => Promise<AdminResult>;
  emptyAction?: ReactNode;
}): ReactNode {
  const router = useRouter();
  const [term, setTerm] = useState('');
  const [pending, setPending] = useState(false);
  const [target, setTarget] = useState<EntityRow | null>(null);

  const visible = useMemo(() => {
    const needle = term.trim().toLowerCase();
    if (needle.length === 0) return rows;
    return rows.filter(
      (row) =>
        row.title.toLowerCase().includes(needle) || row.subtitle.toLowerCase().includes(needle),
    );
  }, [rows, term]);

  async function confirmDelete(): Promise<void> {
    if (!target) return;
    setPending(true);
    const result = await onDelete(target.id).catch(
      (): AdminResult => ({ ok: false, message: 'The server did not respond. Try again.' }),
    );
    setPending(false);

    if (result.ok) {
      toast.success(`${target.title} deleted`);
      setTarget(null);
      router.refresh();
      return;
    }
    toast.error('Delete failed', result.message);
  }

  return (
    <>
      <div className="mb-6 flex items-center gap-3 bg-paper px-5 border-3 border-ink focus-within:border-acid">
        <Search className="size-4 shrink-0 text-ink-soft" aria-hidden strokeWidth={1.75} />
        <input
          type="search"
          value={term}
          onChange={(event) => setTerm(event.target.value)}
          placeholder={`Search ${noun}`}
          aria-label={`Search ${noun}`}
          className="min-h-12 w-full bg-transparent text-sm text-ink placeholder:text-ink-soft focus:outline-none"
        />
        <span className="shrink-0 text-[11px] text-ink-soft">
          {visible.length}/{rows.length}
        </span>
      </div>

      {visible.length === 0 ? (
        <EmptyState
          title={rows.length === 0 ? `No ${noun} yet` : 'Nothing matches'}
          body={
            rows.length === 0
              ? `Create the first record and it will appear on the public site once published.`
              : 'Try a different word, or clear the search box.'
          }
          action={rows.length === 0 ? emptyAction : undefined}
        />
      ) : (
        <ul className="grid gap-[3px] border-3 border-ink bg-ink">
          {visible.map((row) => (
            <li
              key={row.id}
              className="flex flex-wrap items-center gap-x-5 gap-y-4 bg-paper px-5 py-5 transition-colors duration-150 hover:bg-paper-dim"
            >
              <div className="min-w-0 flex-1 basis-64">
                <div className="flex items-center gap-2">
                  <Link
                    href={row.editHref}
                    className="display rank-5 truncate normal-case focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ink"
                  >
                    {row.title}
                  </Link>
                  {row.featured ? (
                    <Star
                      className="size-3.5 shrink-0 text-ink"
                      aria-label="Featured"
                      strokeWidth={2}
                    />
                  ) : null}
                </div>
                <p className="mt-1 truncate text-[13px] text-ink-soft">{row.subtitle}</p>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <StatusPill status={row.status} />
                {row.badge ? <StatusPill status={row.badge} /> : null}
              </div>

              <span className="hidden shrink-0 text-[11px] text-ink-soft md:block">
                {row.meta}
              </span>

              <div className="flex shrink-0 items-center gap-1">
                <Link
                  href={row.editHref}
                  aria-label={`Edit ${row.title}`}
                  className={cn(
                    'flex size-10 items-center justify-center text-ink-soft transition-colors',
                    'hover:bg-paper-dim hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink',
                  )}
                >
                  <Pencil className="size-4" aria-hidden strokeWidth={1.75} />
                </Link>
                <button
                  type="button"
                  onClick={() => setTarget(row)}
                  aria-label={`Delete ${row.title}`}
                  className="flex size-10 items-center justify-center text-ink-soft transition-colors hover:bg-danger/10 hover:text-danger focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
                >
                  <Trash2 className="size-4" aria-hidden strokeWidth={1.75} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={target !== null}
        onOpenChange={(open) => {
          if (!open) setTarget(null);
        }}
        title={`Delete ${target?.title ?? ''}?`}
        description="This removes the record from the public site immediately. It cannot be undone."
        warning={target?.deleteWarning}
        confirmLabel="Delete"
        cancelLabel="Keep"
        loading={pending}
        onConfirm={() => void confirmDelete()}
      />
    </>
  );
}

/** Reused by the three list pages so the create button reads the same way. */
export function NewEntityButton({ href, label }: { href: string; label: string }): ReactNode {
  return (
    <Button asChild size="sm">
      <Link href={href}>{label}</Link>
    </Button>
  );
}
