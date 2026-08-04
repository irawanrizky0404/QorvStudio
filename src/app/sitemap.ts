import type { MetadataRoute } from 'next';
import { LOCALES } from '@/lib/i18n/config';
import { projectRepo, serviceRepo, productRepo } from '@/lib/repo';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3030';

/** Published content only. Drafts must never leak into the sitemap. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [projects, services, products] = await Promise.all([
    projectRepo.list({ perPage: 50 }),
    serviceRepo.list({ perPage: 50 }),
    productRepo.list({ perPage: 50 }),
  ]);

  const staticPaths = ['', '/work', '/services', '/products', '/pricing', '/about', '/contact'];
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of LOCALES) {
    for (const path of staticPaths) {
      entries.push({
        url: `${SITE_URL}/${locale}${path}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: path === '' ? 1 : 0.8,
      });
    }
    for (const p of projects.items) {
      entries.push({ url: `${SITE_URL}/${locale}/work/${p.slug}`, lastModified: new Date(p.updatedAt), priority: 0.7 });
    }
    for (const s of services.items) {
      entries.push({ url: `${SITE_URL}/${locale}/services/${s.slug}`, lastModified: new Date(s.updatedAt), priority: 0.9 });
    }
    for (const p of products.items) {
      entries.push({ url: `${SITE_URL}/${locale}/products/${p.slug}`, lastModified: new Date(p.updatedAt), priority: 0.7 });
    }
  }

  return entries;
}
