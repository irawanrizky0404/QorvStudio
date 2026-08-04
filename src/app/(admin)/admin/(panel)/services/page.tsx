import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { deleteService } from '@/app/actions/content';
import { formatDateShort, formatPrice } from '@/lib/format';
import { pickLocale } from '@/lib/i18n/pick-locale';
import { countProjectsUsingService, serviceRepo } from '@/lib/repo';
import { adminRoutes } from '@/lib/routes';

import { AdminHeader } from '@/components/admin/shell';
import { EntityTable, NewEntityButton } from '@/components/admin/entity-table';
import type { EntityRow } from '@/components/admin/entity-table';

export const metadata: Metadata = { title: 'Services' };
export const dynamic = 'force-dynamic';

export default async function AdminServicesPage(): Promise<ReactNode> {
  const { items } = await serviceRepo.list({
    perPage: 50,
    sort: 'manual',
    includeDrafts: true,
  });

  const rows: EntityRow[] = items.map((service) => {
    const linked = countProjectsUsingService(service.id);
    return {
      id: service.id,
      title: pickLocale(service.name, 'en'),
      subtitle: `${service.packages.length} package${service.packages.length === 1 ? '' : 's'} · ${
        service.startingPrice === null
          ? 'quote only'
          : `from ${formatPrice(service.startingPrice, service.currency, 'en', '')}`
      }`,
      status: service.status,
      meta: formatDateShort(service.updatedAt, 'en'),
      featured: service.featured,
      editHref: adminRoutes.serviceEdit(service.id),
      // Deleting a service unlinks it from every project that referenced it.
      deleteWarning:
        linked > 0
          ? `${linked} project${linked === 1 ? '' : 's'} will lose their link to this service.`
          : undefined,
    };
  });

  return (
    <>
      <AdminHeader
        title="Services"
        body="Work for hire, each with a Basic, Gold, and Premium ladder."
        action={<NewEntityButton href={adminRoutes.serviceNew} label="New service" />}
      />
      <EntityTable
        rows={rows}
        noun="services"
        onDelete={deleteService}
        emptyAction={<NewEntityButton href={adminRoutes.serviceNew} label="New service" />}
      />
    </>
  );
}
