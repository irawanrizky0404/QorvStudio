import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';

import { isAuthenticated } from '@/lib/auth';
import { LoginForm } from '@/components/admin/login-form';

export const metadata: Metadata = { title: 'Sign in' };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}): Promise<ReactNode> {
  if (await isAuthenticated()) redirect('/admin');
  const { from } = await searchParams;

  return (
    <div className="ambient flex min-h-dvh items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <p className="wordmark display text-center text-3xl text-ink">
          QORV<span className="text-ink">.</span>
        </p>
        <p className="mt-3 text-center text-sm text-ink-soft">Studio admin</p>
        <LoginForm from={from ?? '/admin'} />
      </div>
    </div>
  );
}
