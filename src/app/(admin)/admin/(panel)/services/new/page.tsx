import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { pickLocale } from '@/lib/i18n/pick-locale';
import { serviceRepo } from '@/lib/repo';

import { AdminHeader } from '@/components/admin/shell';
import { ServiceForm } from '@/components/admin/service-form';

export const metadata: Metadata = { title: 'New service' };
export const dynamic = 'force-dynamic';

export default async function NewServicePage(): Promise<ReactNode> {
  const services = await serviceRepo.list({ perPage: 50, includeDrafts: true });

  return (
    <>
      <AdminHeader
        title="New service"
        body="It stays a draft until you publish it, so you can save an unfinished ladder."
      />
      <ServiceForm
        services={services.items.map((service) => ({
          id: service.id,
          label: pickLocale(service.name, 'en'),
        }))}
      />
    </>
  );
}
