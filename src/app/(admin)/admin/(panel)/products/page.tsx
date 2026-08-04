import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { deleteProduct } from '@/app/actions/content';
import { formatDateShort, formatPrice } from '@/lib/format';
import { pickLocale } from '@/lib/i18n/pick-locale';
import { productRepo } from '@/lib/repo';
import { adminRoutes } from '@/lib/routes';

import { AdminHeader } from '@/components/admin/shell';
import { EntityTable, NewEntityButton } from '@/components/admin/entity-table';
import type { EntityRow } from '@/components/admin/entity-table';

export const metadata: Metadata = { title: 'Products' };
export const dynamic = 'force-dynamic';

export default async function AdminProductsPage(): Promise<ReactNode> {
  const { items } = await productRepo.list({
    perPage: 50,
    sort: 'manual',
    includeDrafts: true,
  });

  const rows: EntityRow[] = items.map((product) => ({
    id: product.id,
    title: pickLocale(product.name, 'en'),
    subtitle: `${product.type} · ${formatPrice(product.price.startingPrice, product.price.currency, 'en', 'on request')}`,
    status: product.status,
    badge: product.productStatus,
    meta: formatDateShort(product.updatedAt, 'en'),
    featured: product.featured,
    editHref: adminRoutes.productEdit(product.id),
  }));

  return (
    <>
      <AdminHeader
        title="Products"
        body="Apps QORV sells. One indicative price each, no tiers."
        action={<NewEntityButton href={adminRoutes.productNew} label="New product" />}
      />
      <EntityTable
        rows={rows}
        noun="products"
        onDelete={deleteProduct}
        emptyAction={<NewEntityButton href={adminRoutes.productNew} label="New product" />}
      />
    </>
  );
}
