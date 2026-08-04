import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { settingsRepo } from '@/lib/repo';

import { AdminHeader } from '@/components/admin/shell';
import { SettingsForm } from '@/components/admin/settings-form';

export const metadata: Metadata = { title: 'Settings' };
export const dynamic = 'force-dynamic';

export default async function SettingsPage(): Promise<ReactNode> {
  const settings = await settingsRepo.get();

  return (
    <>
      <AdminHeader
        title="Settings"
        body="Studio details and search defaults. These appear on every public page."
      />
      <SettingsForm settings={settings} />
    </>
  );
}
