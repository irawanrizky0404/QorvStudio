'use client';

import { useState } from 'react';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ArrowUpRight,
  Boxes,
  Briefcase,
  Inbox,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings as SettingsIcon,
  Users,
  Wrench,
  X,
} from 'lucide-react';

import { logout } from '@/app/actions/auth';
import { cn } from '@/lib/utils';

/**
 * `devOnly` menyembunyikan menu dari peran `admin`.
 *
 * Ini murni soal tampilan. Gerbang sesungguhnya ada di `requireRole('dev')`
 * pada halaman dan setiap server action-nya — server action punya URL dan bisa
 * dipanggil langsung, jadi menu yang disembunyikan tidak menahan siapapun.
 */
const NAV = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true, devOnly: false },
  { href: '/admin/projects', label: 'Projects', icon: Briefcase, exact: false, devOnly: false },
  { href: '/admin/services', label: 'Services', icon: Wrench, exact: false, devOnly: false },
  { href: '/admin/products', label: 'Products', icon: Boxes, exact: false, devOnly: false },
  { href: '/admin/inquiries', label: 'Inquiries', icon: Inbox, exact: false, devOnly: false },
  { href: '/admin/users', label: 'Users', icon: Users, exact: false, devOnly: true },
  { href: '/admin/settings', label: 'Settings', icon: SettingsIcon, exact: false, devOnly: false },
] as const;

/**
 * Admin frame: a fixed rail on desktop, a slide-over on mobile.
 *
 * The active item takes the same graphite pill the public nav uses, so the two
 * surfaces read as one product without the admin borrowing marketing furniture.
 */
export function AdminShell({
  children,
  inquiryBadge = 0,
  role = 'admin',
  email,
}: {
  children: ReactNode;
  inquiryBadge?: number;
  role?: 'dev' | 'admin';
  email?: string;
}): ReactNode {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const nav = NAV.filter((item) => !item.devOnly || role === 'dev');

  const isActive = (href: string, exact: boolean): boolean =>
    exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  const rail = (
    <div className="flex h-full flex-col gap-8 p-6">
      <Link
        href="/admin"
        className="wordmark flex items-center text-2xl text-ink focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-ink"
      >
        QORV
        <span aria-hidden className="ml-1.5 size-2 bg-acid" />
      </Link>

      {email ? (
        <div className="border-3 border-ink px-4 py-3">
          <p className="label">{role === 'dev' ? 'Dev' : 'Admin'}</p>
          <p className="mt-1.5 truncate text-[13px] text-ink">{email}</p>
        </div>
      ) : null}

      <nav aria-label="Admin sections" className="flex flex-1 flex-col gap-1">
        {nav.map((item) => {
          const active = isActive(item.href, item.exact);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex min-h-11 items-center gap-3 px-4 text-sm transition-colors',
                'focus-visible:outline-3 focus-visible:-outline-offset-3 focus-visible:outline-ink',
                active ? 'bg-acid text-ink' : 'text-ink-soft hover:bg-paper-dim hover:text-ink',
              )}
            >
              <Icon className="size-4 shrink-0" aria-hidden strokeWidth={1.75} />
              <span className="flex-1">{item.label}</span>
              {item.href === '/admin/inquiries' && inquiryBadge > 0 ? (
                <span className="tabular border-3 border-ink bg-paper px-2 py-0.5 text-[11px] font-bold leading-tight text-ink">
                  {inquiryBadge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="flex flex-col gap-1 border-t-3 border-ink pt-4">
        <a
          href="/en"
          target="_blank"
          rel="noreferrer noopener"
          className="flex min-h-11 items-center gap-3 px-4 text-sm text-ink-soft transition-colors hover:bg-paper-dim hover:text-ink focus-visible:outline-3 focus-visible:-outline-offset-3 focus-visible:outline-ink"
        >
          <ArrowUpRight className="size-4 shrink-0" aria-hidden strokeWidth={1.75} />
          View site
        </a>
        <form action={logout}>
          <button
            type="submit"
            className="flex min-h-11 w-full items-center gap-3 px-4 text-sm text-ink-soft transition-colors hover:bg-danger/10 hover:text-danger focus-visible:outline-3 focus-visible:-outline-offset-3 focus-visible:outline-ink"
          >
            <LogOut className="size-4 shrink-0" aria-hidden strokeWidth={1.75} />
            Sign out
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <div className="min-h-dvh bg-paper">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r-3 border-ink bg-paper lg:block">
        {rail}
      </aside>

      {/* Mobile slide-over. Rendered only while open so it never traps focus. */}
      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-paper/80 backdrop-blur-sm"
          />
          <aside className="absolute inset-y-0 left-0 w-72 border-r-3 border-ink bg-paper">
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="absolute right-4 top-6 flex size-10 items-center justify-center text-ink-soft transition-colors hover:bg-paper-dim hover:text-ink focus-visible:outline-3 focus-visible:-outline-offset-3 focus-visible:outline-ink"
            >
              <X className="size-4" aria-hidden />
            </button>
            {rail}
          </aside>
        </div>
      ) : null}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex min-h-16 items-center gap-4 border-b-3 border-ink bg-paper/85 px-6 backdrop-blur-md lg:hidden">
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            className="flex size-10 items-center justify-center text-ink transition-colors hover:bg-paper-dim focus-visible:outline-3 focus-visible:-outline-offset-3 focus-visible:outline-ink"
          >
            <Menu className="size-5" aria-hidden strokeWidth={1.75} />
          </button>
          <span className="wordmark display text-lg text-ink">
            QORV<span className="text-acid">.</span>
          </span>
        </header>

        <main className="px-6 py-10 md:px-10 md:py-14">{children}</main>
      </div>
    </div>
  );
}

/** Page opener: title, one line of purpose, and the page's primary action. */
export function AdminHeader({
  title,
  body,
  action,
}: {
  title: string;
  body?: string;
  action?: ReactNode;
}): ReactNode {
  return (
    <div className="mb-10 flex flex-wrap items-end justify-between gap-6 border-b-3 border-ink pb-8">
      <div>
        <h1 className="display text-3xl text-ink md:text-4xl">{title}</h1>
        {body ? <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-soft">{body}</p> : null}
      </div>
      {action ? <div className="flex flex-wrap gap-3">{action}</div> : null}
    </div>
  );
}
