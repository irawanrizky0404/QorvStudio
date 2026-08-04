'use client';

import type { ReactNode } from 'react';
import { Inbox, RotateCw, TriangleAlert } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';

export function Skeleton({ className }: { className?: string }): ReactNode {
  return <div aria-hidden className={cn('animate-pulse border-3 border-ink bg-paper-dim', className)} />;
}

export function EmptyState({ title, body, action, className }: {
  title: string; body: string; action?: ReactNode; className?: string;
}): ReactNode {
  return (
    <div className={cn('flex flex-col items-center border-3 border-ink bg-paper px-6 py-20 text-center', className)}>
      <Inbox className="size-6 text-ink-soft" aria-hidden strokeWidth={1.5} />
      <h3 className="display rank-4 mt-5">{title}</h3>
      <p className="mt-3 max-w-sm text-[14.5px] leading-relaxed">{body}</p>
      {action ? <div className="mt-7">{action}</div> : null}
    </div>
  );
}

export function ErrorState({ title, body, retryLabel, onRetry, className }: {
  title: string; body: string; retryLabel: string; onRetry?: () => void; className?: string;
}): ReactNode {
  return (
    <div role="alert" className={cn('flex flex-col items-center border-3 border-danger bg-paper px-6 py-20 text-center', className)}>
      <TriangleAlert className="size-6 text-danger" aria-hidden strokeWidth={1.5} />
      <h3 className="display rank-4 mt-5">{title}</h3>
      <p className="mt-3 max-w-sm text-[14.5px] leading-relaxed">{body}</p>
      {onRetry ? (
        <Button variant="outline" size="sm" onClick={onRetry} className="mt-7">
          <RotateCw className="size-3.5" aria-hidden />{retryLabel}
        </Button>
      ) : null}
    </div>
  );
}
