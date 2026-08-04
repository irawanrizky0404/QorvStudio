import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { pickLocale } from '@/lib/i18n/pick-locale';
import { serviceRepo } from '@/lib/repo';

import { AdminHeader } from '@/components/admin/shell';
import { ProjectForm } from '@/components/admin/project-form';

export const metadata: Metadata = { title: 'New project' };
export const dynamic = 'force-dynamic';

export default async function NewProjectPage(): Promise<ReactNode> {
  const services = await serviceRepo.list({ perPage: 50, includeDrafts: true });

  return (
    <>
      <AdminHeader
        title="New project"
        body="It stays a draft until you publish it, so you can save an unfinished record."
      />
      <ProjectForm
        services={services.items.map((service) => ({
          id: service.id,
          label: pickLocale(service.name, 'en'),
        }))}
      />
    </>
  );
}
