import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { pickLocale } from '@/lib/i18n/pick-locale';
import { serviceRepo } from '@/lib/repo';
import { routes } from '@/lib/routes';

import { AdminHeader } from '@/components/admin/shell';
import { ServiceForm } from '@/components/admin/service-form';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = { title: 'Edit service' };
export const dynamic = 'force-dynamic';

export default async function EditServicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<ReactNode> {
  const { id } = await params;
  const [service, services] = await Promise.all([
    serviceRepo.getById(id),
    serviceRepo.list({ perPage: 50, includeDrafts: true }),
  ]);
  if (!service) notFound();

  return (
    <>
      <AdminHeader
        title={pickLocale(service.name, 'en')}
        body={`Last updated ${new Date(service.updatedAt).toISOString().slice(0, 10)}.`}
        action={
          service.status === 'published' ? (
            <Button asChild variant="outline" size="sm">
              <Link href={routes.service('en', service.slug)} target="_blank" rel="noreferrer">
                View live
              </Link>
            </Button>
          ) : undefined
        }
      />
      <ServiceForm
        service={service}
        services={services.items.map((item) => ({
          id: item.id,
          label: pickLocale(item.name, 'en'),
        }))}
      />
    </>
  );
}
