import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { pickLocale } from '@/lib/i18n/pick-locale';
import { productRepo } from '@/lib/repo';

import { AdminHeader } from '@/components/admin/shell';
import { ProductForm } from '@/components/admin/product-form';

export const metadata: Metadata = { title: 'New product' };
export const dynamic = 'force-dynamic';

export default async function NewProductPage(): Promise<ReactNode> {
  const products = await productRepo.list({ perPage: 50, includeDrafts: true });

  return (
    <>
      <AdminHeader
        title="New product"
        body="It stays a draft until you publish it, so you can save an unfinished record."
      />
      <ProductForm
        products={products.items.map((product) => ({
          id: product.id,
          label: pickLocale(product.name, 'en'),
        }))}
      />
    </>
  );
}
