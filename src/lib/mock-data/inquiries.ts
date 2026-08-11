import type { Inquiry } from '@/types/content';
import { L } from './helpers';
import type { Settings } from '@/types/content';


/**
 * Kosong, dan memang seharusnya.
 *
 * Sebelumnya ada dua belas pesan contoh dengan nama dan alamat email orang yang
 * tidak ada. Di situs yang sudah dipakai, itu bukan data demo — itu kotak masuk
 * palsu yang harus dibedakan dari pesan sungguhan setiap kali panel dibuka.
 *
 * Pesan pertama akan datang dari formulir kontak.
 */
export const mockInquiries: Inquiry[] = [];

export const mockSettings: Settings = {
  studioName: 'QORV Studio',
  tagline: L('Digital & physical architecture.', 'Arsitektur digital & fisik.'),
  foundedYear: 2021,
  location: L('Indonesia', 'Indonesia'),
  email: 'qorvstudio@gmail.com',
  whatsapp: '6281284469385',
  address: L('Indonesia', 'Indonesia'),
  socials: [
    { platform: 'Instagram', url: 'https://www.instagram.com/rizkyirawan44/' },
    { platform: 'Behance', url: 'https://www.behance.net/rizkyirawan' },
    { platform: 'LinkedIn', url: 'https://www.linkedin.com/in/rizky-irawan-b340363aa/' },
  ],
  seoDefaults: {
    title: L('QORV - Digital & Physical Architecture', 'QORV - Arsitektur Digital & Fisik'),
    description: L(
      'We engineer function, not decoration. Web and app development, 3D and animation, packaging and brand systems.',
      'Kami merekayasa fungsi, bukan sekadar dekorasi. Pengembangan web dan aplikasi, 3D dan animasi, kemasan dan sistem merek.',
    ),
    ogImage: null,
  },
  updatedAt: '2026-07-01T09:00:00.000Z',
};
