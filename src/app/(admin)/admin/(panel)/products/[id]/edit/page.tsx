import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { pickLocale } from '@/lib/i18n/pick-locale';
import { productRepo } from '@/lib/repo';
import { routes } from '@/lib/routes';

import { AdminHeader } from '@/components/admin/shell';
import { ProductForm } from '@/components/admin/product-form';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = { title: 'Edit product' };
export const dynamic = 'force-dynamic';

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<ReactNode> {
  const { id } = await params;
  const [product, products] = await Promise.all([
    productRepo.getById(id),
    productRepo.list({ perPage: 50, includeDrafts: true }),
  ]);
  if (!product) notFound();

  return (
    <>
      <AdminHeader
        title={pickLocale(product.name, 'en')}
        body={`Last updated ${new Date(product.updatedAt).toISOString().slice(0, 10)}.`}
        action={
          product.status === 'published' ? (
            <Button asChild variant="outline" size="sm">
              <Link href={routes.product('en', product.slug)} target="_blank" rel="noreferrer">
                View live
              </Link>
            </Button>
          ) : undefined
        }
      />
      <ProductForm
        product={product}
        products={products.items.map((item) => ({
          id: item.id,
          label: pickLocale(item.name, 'en'),
        }))}
      />
    </>
  );
}
