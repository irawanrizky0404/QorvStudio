import type { Localized } from '@/types/content';
import { L } from './helpers';

/**
 * Client proof. Taken from the reference templates' testimonial pattern:
 * a short quoted headline in the accent colour, a body paragraph, then the
 * person, their role, and a link out to the work.
 *
 * Names are Indonesian and role-specific rather than "John Doe" placeholders,
 * and each one ties to a project that exists in the seed data.
 */
export interface Testimonial {
  id: string;
  /** The one line that carries the endorsement. Rendered in acid. */
  headline: Localized;
  body: Localized;
  name: string;
  role: string;
  company: string;
  /** Slug of the project this refers to, so the card can link to real work. */
  projectSlug: string;
}

export const mockTestimonials: Testimonial[] = [
  {
    id: 'tst_meridian',
    headline: L(
      'Dispatch capacity doubled without hiring anyone.',
      'Kapasitas pengiriman berlipat dua tanpa menambah orang.',
    ),
    body: L(
      'We were held together by spreadsheets and one dispatcher who knew where everything was. QORV turned that knowledge into a system. The handover was the calmest part of the project.',
      'Kami bertahan dengan spreadsheet dan satu dispatcher yang hafal semuanya. QORV mengubah pengetahuan itu jadi sistem. Serah terimanya justru bagian paling tenang dari proyek ini.',
    ),
    name: 'Clara Wijaya',
    role: 'Head of Operations',
    company: 'Meridian Freight',
    projectSlug: 'meridian-logistics-platform',
  },
  {
    id: 'tst_nocturne',
    headline: L(
      'Twelve bags finally looked like one company.',
      'Dua belas kemasan akhirnya terlihat seperti satu perusahaan.',
    ),
    body: L(
      'They did not redesign twelve packages. They designed one system with a single variable, and reprinting a lot went from days to under an hour.',
      'Mereka tidak mendesain ulang dua belas kemasan. Mereka merancang satu sistem dengan satu variabel, dan cetak ulang satu lot turun dari hitungan hari jadi kurang dari sejam.',
    ),
    name: 'Anindita Rahmawati',
    role: 'Brand Lead',
    company: 'Nocturne Roasters',
    projectSlug: 'nocturne-coffee-packaging',
  },
  {
    id: 'tst_vantage',
    headline: L(
      'They built the film from CAD, six weeks out.',
      'Mereka membuat filmnya dari CAD, enam minggu sebelum rilis.',
    ),
    body: L(
      'We had no physical units and an announcement date. QORV rebuilt the product from engineering files and made the assembly itself the story.',
      'Kami tidak punya unit fisik dan tanggal pengumuman sudah terkunci. QORV membangun ulang produk dari berkas rekayasa dan menjadikan proses perakitannya sebagai cerita.',
    ),
    name: 'Erika Santoso',
    role: 'Marketing Director',
    company: 'Vantage Audio',
    projectSlug: 'vantage-product-film',
  },
  {
    id: 'tst_halden',
    headline: L(
      'Two offices stopped inventing their own brand.',
      'Dua kantor berhenti menciptakan versi mereknya sendiri.',
    ),
    body: L(
      'The rules were written to be obeyed by people with no design training. That is why they are still followed two years later.',
      'Aturannya ditulis agar bisa dipatuhi orang tanpa latar belakang desain. Itu sebabnya masih diikuti dua tahun kemudian.',
    ),
    name: 'Karina Dewi',
    role: 'Managing Partner',
    company: 'Halden Architecture',
    projectSlug: 'halden-identity-system',
  },
  {
    id: 'tst_tessera',
    headline: L(
      'Evening data entry disappeared entirely.',
      'Entri data malam hari hilang sepenuhnya.',
    ),
    body: L(
      'They designed the sync conflict screen first, before anything else. That told us they had built an offline app before.',
      'Mereka merancang layar konflik sinkronisasi lebih dulu, sebelum yang lain. Dari situ kami tahu mereka pernah membangun aplikasi offline.',
    ),
    name: 'Bagus Prasetyo',
    role: 'Field Operations Manager',
    company: 'Tessera Survey',
    projectSlug: 'tessera-field-app',
  },
  {
    id: 'tst_kiln',
    headline: L(
      'Overselling stopped on day one.',
      'Kelebihan penjualan berhenti sejak hari pertama.',
    ),
    body: L(
      'Every piece we make is one of one, and every commerce platform we tried assumed otherwise. QORV treated scarcity as the feature.',
      'Setiap karya kami hanya ada satu, dan setiap platform yang kami coba mengasumsikan sebaliknya. QORV memperlakukan kelangkaan sebagai fitur.',
    ),
    name: 'Intan Permata',
    role: 'Founder',
    company: 'Kiln Studio',
    projectSlug: 'kiln-ceramics-commerce',
  },
];

/** Logo wall. Real SVG marks in `public/logos/`, not text wordmarks. */
export const clientLogos = [
  { name: 'Stripe', file: '/logos/stripe.svg' },
  { name: 'Shopify', file: '/logos/shopify.svg' },
  { name: 'Vercel', file: '/logos/vercel.svg' },
  { name: 'Figma', file: '/logos/figma.svg' },
  { name: 'Linear', file: '/logos/linear.svg' },
  { name: 'Notion', file: '/logos/notion.svg' },
  { name: 'Cloudflare', file: '/logos/cloudflare.svg' },
  { name: 'Supabase', file: '/logos/supabase.svg' },
] as const;
