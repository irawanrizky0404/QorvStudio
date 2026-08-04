import 'server-only';

import type { Inquiry, Product, Project, Service, Settings } from '@/types/content';
import { mockProjects } from '@/lib/mock-data/projects';
import { mockServices } from '@/lib/mock-data/services';
import { mockProducts } from '@/lib/mock-data/products';
import { mockInquiries, mockSettings } from '@/lib/mock-data/inquiries';
import { getDriver, seededKey, storeKey } from '../driver';
import { Collection } from './store';

/**
 * Definisi koleksi. Instance-nya sendiri tidak menyimpan data — hanya konfigurasi
 * penyaringan dan kunci penyimpanan — jadi tidak perlu lagi dipin ke `globalThis`
 * seperti versi sebelumnya. Yang perlu bertahan lintas HMR adalah datanya, dan
 * itu sudah jadi urusan driver.
 */

export const projectsCollection = new Collection<Project>({
  label: 'projects',
  seed: mockProjects,
  matchesSearch: (item, term) =>
    item.title.en.toLowerCase().includes(term) ||
    item.title.id.toLowerCase().includes(term) ||
    item.client.toLowerCase().includes(term) ||
    item.summary.en.toLowerCase().includes(term) ||
    item.summary.id.toLowerCase().includes(term) ||
    item.stack.some((tech) => tech.toLowerCase().includes(term)),
  matchesCategory: (item, category) => item.category === category,
  sortTitle: (item) => item.title.en,
});

export const servicesCollection = new Collection<Service>({
  label: 'services',
  seed: mockServices,
  matchesSearch: (item, term) =>
    item.name.en.toLowerCase().includes(term) ||
    item.name.id.toLowerCase().includes(term) ||
    item.tagline.en.toLowerCase().includes(term) ||
    item.tagline.id.toLowerCase().includes(term) ||
    item.tools.some((tool) => tool.toLowerCase().includes(term)),
  sortTitle: (item) => item.name.en,
});

export const productsCollection = new Collection<Product>({
  label: 'products',
  seed: mockProducts,
  matchesSearch: (item, term) =>
    item.name.en.toLowerCase().includes(term) ||
    item.name.id.toLowerCase().includes(term) ||
    item.tagline.en.toLowerCase().includes(term) ||
    item.tagline.id.toLowerCase().includes(term) ||
    item.techStack.some((tech) => tech.toLowerCase().includes(term)),
  matchesCategory: (item, category) => item.type === category || item.productStatus === category,
  sortTitle: (item) => item.name.en,
});

/* ── Pesan masuk dan setelan ──────────────────────────────────────────────── */

/* Kunci dihitung saat dipakai, bukan saat modul dievaluasi — `seededKey`
 * menanyai driver, dan driver tidak boleh dipilih saat build. */
const inquiriesKey = (): string => seededKey('inquiries', mockInquiries);
const SETTINGS_KEY = storeKey('settings');

export async function readInquiries(): Promise<Inquiry[]> {
  return getDriver().loadOrSeed<Inquiry[]>(inquiriesKey(), () => structuredClone(mockInquiries));
}

export async function writeInquiries(items: Inquiry[]): Promise<void> {
  await getDriver().save(inquiriesKey(), items);
}

export async function readSettings(): Promise<Settings> {
  return getDriver().loadOrSeed<Settings>(SETTINGS_KEY, () => structuredClone(mockSettings));
}

export async function writeSettings(next: Settings): Promise<Settings> {
  await getDriver().save(SETTINGS_KEY, next);
  return next;
}
