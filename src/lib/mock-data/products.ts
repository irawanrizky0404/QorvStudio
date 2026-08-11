import type { MediaRef, Product } from '@/types/content';
import { L, stamps } from './helpers';
import { PRODUCT_MEDIA } from './product-media';

/**
 * Produk sungguhan.
 *
 * Empat aplikasi yang benar-benar dibangun, tiga di antaranya bisa dibuka
 * sekarang juga. Isinya diringkas dari README masing-masing repositori di
 * `QorvStudio/PRODUCT/`; cover-nya tangkapan layar dari situs live-nya.
 *
 * ── Yang diambil apa adanya, dan yang disusun ───────────────────────────────
 *
 * Nama, URL demo, dokumentasi, tumpukan teknologi, dan daftar fitur diringkas
 * langsung dari README. Terjemahan Inggris/Indonesia disusun; sebagian README
 * berbahasa Indonesia, sebagian Inggris.
 *
 * `price` **kosong di keempatnya** — `startingPrice: null`, yang dirender
 * sebagai "Hubungi kami". Tidak ada satu pun angka harga di sumber manapun, dan
 * satu-satunya yang menyebut komersial (Clipper Studio) hanya menyebut ada tier
 * "Demo" dan "Paid Monthly PRO" tanpa nominal.
 *
 * `changelog` kosong: tidak ada berkas rilis yang bisa dijadikan sumber.
 */

function cover(slug: string, alt: ReturnType<typeof L>): MediaRef {
  const size = PRODUCT_MEDIA[slug]?.cover;
  if (!size) throw new Error(`product-media: ${slug} tidak ada.`);
  return { url: `/images/products/${slug}/cover.webp`, alt, width: size[0], height: size[1] };
}

/** Slot kosong untuk produk yang belum punya tangkapan layar. */
const PLACEHOLDER: MediaRef = {
  url: '/images/products/qorv-commerce/cover.webp',
  alt: L('QORV product', 'Produk QORV'),
  width: 1568,
  height: 754,
};

export const mockProducts: Product[] = [
  {
    id: 'prod_commerce',
    slug: 'qorv-commerce',
    name: L('QORV Commerce', 'QORV Commerce'),
    tagline: L(
      'White-label e-commerce for retail and FMCG. One deployment, one database, one store identity — no marketplace commission, no shared resources.',
      'E-commerce white-label untuk retail dan FMCG. Satu deployment, satu basis data, satu identitas toko — tanpa komisi marketplace, tanpa sumber daya bersama.',
    ),
    type: 'web-app',
    productStatus: 'beta',
    cover: cover('qorv-commerce', L('QORV Commerce storefront', 'Etalase QORV Commerce')),
    gallery: [],
    demoVideoUrl: null,
    description: L(
      'Every deployment is single-tenant: one application, one database, one store identity, and full operational control.\n\nThe admin dashboard covers revenue, orders, products, buyers, critical stock, and best sellers, plus CRUD for products, nested categories, vouchers, flash sales, and storefront decoration. Order handling spans payment status, tracking numbers, transfer receipts, returns, reviews, discussion threads, per-order live chat, notifications, reports, staff, and an audit log.\n\nThe buyer storefront carries a dynamic home built from store configuration, catalogue with search and category filters, slug-based product detail with gallery and variants, cart, wishlist, saved addresses, checkout with transfer-receipt upload, order history, and account. Price, stock, shipping, vouchers, and order totals are all revalidated by the backend rather than trusted from the client.\n\nIdentity, colours, fonts, hero, section order, card style, banners, contact details, social links, bank accounts, and footer content live in store settings — changeable without touching source code.',
      'Setiap deployment bersifat single-tenant: satu aplikasi, satu basis data, satu identitas toko, dan kendali operasional penuh.\n\nDasbor admin memuat ringkasan revenue, pesanan, produk, pembeli, stok kritis, dan produk terlaris, plus CRUD produk, kategori bertingkat, voucher, flash sale, dan dekorasi toko. Pengelolaan order mencakup status pembayaran, nomor resi, bukti transfer, retur, ulasan, diskusi, live chat per order, notifikasi, laporan, staff, dan audit log.\n\nEtalase pembeli membawa home dinamis dari konfigurasi toko, katalog dengan pencarian dan filter kategori, detail produk berbasis slug dengan galeri dan varian, keranjang, wishlist, alamat tersimpan, checkout dengan unggah bukti transfer, riwayat order, dan akun. Harga, stok, ongkir, voucher, dan total order semuanya divalidasi ulang oleh backend, bukan dipercaya dari klien.\n\nIdentitas, warna, font, hero, urutan section, gaya kartu, banner, kontak, sosial media, rekening bank, dan konten footer disimpan di pengaturan toko — bisa diubah tanpa menyentuh kode.',
    ),
    features: [
      {
        id: 'ft_c1',
        icon: 'layers',
        title: L('Single-tenant by design', 'Single-tenant sejak awal'),
        description: L(
          'One app, one database, one store. No shared resources with other merchants and no marketplace commission.',
          'Satu aplikasi, satu basis data, satu toko. Tanpa sumber daya bersama dengan pedagang lain dan tanpa komisi marketplace.',
        ),
      },
      {
        id: 'ft_c2',
        icon: 'shield',
        title: L('Server-side revalidation', 'Validasi ulang di server'),
        description: L(
          'Price, stock, shipping, vouchers, and order totals are recomputed by the backend — the client is never trusted.',
          'Harga, stok, ongkir, voucher, dan total order dihitung ulang backend — klien tidak pernah dipercaya.',
        ),
      },
      {
        id: 'ft_c3',
        icon: 'palette',
        title: L('White-label storefront', 'Etalase white-label'),
        description: L(
          'Identity, colours, fonts, hero, section order, and footer live in settings — no code change to rebrand.',
          'Identitas, warna, font, hero, urutan section, dan footer ada di pengaturan — ganti merek tanpa ubah kode.',
        ),
      },
      {
        id: 'ft_c4',
        icon: 'users',
        title: L('Roles and audit log', 'Peran dan audit log'),
        description: L(
          'Admin holds full access; staff is limited to catalogue and order operations. Every action is logged.',
          'Admin punya akses penuh; staff dibatasi ke operasi katalog dan pesanan. Setiap tindakan tercatat.',
        ),
      },
      {
        id: 'ft_c5',
        icon: 'message',
        title: L('Per-order live chat', 'Live chat per pesanan'),
        description: L(
          'Buyer and seller talk inside the order itself, so context never has to be re-explained.',
          'Pembeli dan penjual bicara di dalam ordernya sendiri, jadi konteksnya tidak perlu diulang.',
        ),
      },
      {
        id: 'ft_c6',
        icon: 'zap',
        title: L('Vouchers and flash sale', 'Voucher dan flash sale'),
        description: L(
          'Time-boxed promotions and voucher rules managed from the dashboard.',
          'Promo berbatas waktu dan aturan voucher dikelola dari dasbor.',
        ),
      },
    ],
    platforms: ['Web'],
    techStack: [
      'Next.js 16',
      'React 19',
      'TypeScript',
      'Tailwind CSS 4',
      'FastAPI',
      'SQLAlchemy 2',
      'PostgreSQL',
      'Cloudflare Workers',
      'Railway',
    ],
    integrations: ['JWT HS256', 'OpenNext', 'Swagger / OpenAPI'],
    requirements: [
      L('Modern browser', 'Peramban modern'),
      L('Backend deployment with PostgreSQL and a persistent upload volume', 'Deployment backend dengan PostgreSQL dan volume unggahan permanen'),
    ],
    price: {
      startingPrice: null,
      currency: 'IDR',
      unit: 'project',
      note: L(
        'Priced per deployment. Scope decides the figure.',
        'Dihitung per deployment. Lingkupnya yang menentukan angkanya.',
      ),
    },
    faqs: [],
    changelog: [],
    currentVersion: null,
    demoUrl: 'https://qorv-commerce.qorvstudio.workers.dev/store',
    docsUrl: 'https://backend-production-01a4e.up.railway.app/docs',
    relatedProductIds: ['prod_catering'],
    status: 'published',
    featured: true,
    order: 0,
    seo: {
      title: L('QORV Commerce — White-label e-commerce', 'QORV Commerce — E-commerce white-label'),
      description: L(
        'Single-tenant e-commerce platform for retail and FMCG, with full operational control.',
        'Platform e-commerce single-tenant untuk retail dan FMCG, dengan kendali operasional penuh.',
      ),
      ogImage: null,
    },
    ...stamps('2025-11-01', '2026-07-01'),
  },

  {
    id: 'prod_clipper',
    slug: 'clipper-studio',
    name: L('QORV Clipper Studio', 'QORV Clipper Studio'),
    tagline: L(
      'Timeline video editor for cutting long recordings into short-form — with AI subtitles, chapters, and voiceover that all run on your own machine.',
      'Editor video bertimeline untuk memotong rekaman panjang jadi konten pendek — dengan subtitle, bab, dan voiceover AI yang semuanya berjalan di mesin Anda sendiri.',
    ),
    type: 'web-app',
    productStatus: 'coming-soon',
    cover: PLACEHOLDER,
    gallery: [],
    demoVideoUrl: null,
    description: L(
      'A web-based timeline editor built for clipping long-form recordings — livestreams, podcasts, gameplay — into short-form content.\n\nEvery AI feature is backed by a service you run yourself. Subtitles come from faster-whisper running locally. Metadata, chapter generation, and subtitle translation go through LM Studio, an OpenAI-compatible local LLM server. Text-to-speech voiceover uses Kokoro-FastAPI. The voice changer is an in-app audio effect with no external service at all.\n\nNo video, audio, or transcript leaves your machine for AI processing.\n\nThe data model follows a two-level Project hierarchy: a Root Project holds a shared media pool with no timeline of its own, and Sub-Projects created inside it each own their own tracks, clips, and subtitles. Exports become managed video records surfaced in Video Manager, scoped back to the originating Root Project.',
      'Editor bertimeline berbasis web untuk memotong rekaman panjang — livestream, podcast, gameplay — jadi konten pendek.\n\nSetiap fitur AI ditopang layanan yang Anda jalankan sendiri. Subtitle datang dari faster-whisper yang berjalan lokal. Metadata, pembuatan bab, dan terjemahan subtitle lewat LM Studio, server LLM lokal yang kompatibel OpenAI. Voiceover text-to-speech memakai Kokoro-FastAPI. Pengubah suaranya efek audio di dalam aplikasi, tanpa layanan luar sama sekali.\n\nTidak ada video, audio, atau transkrip yang meninggalkan mesin Anda untuk diproses AI.\n\nModel datanya bertingkat dua: Root Project menyimpan kumpulan media bersama tanpa timeline sendiri, dan Sub-Project di dalamnya masing-masing punya track, klip, dan subtitle sendiri. Hasil ekspor jadi catatan video terkelola yang muncul di Video Manager, tetap terikat ke Root Project asalnya.',
    ),
    features: [
      {
        id: 'ft_k1',
        icon: 'shield',
        title: L('Local-first AI', 'AI yang berjalan lokal'),
        description: L(
          'Subtitles, metadata, chapters, and voiceover run on services you host. Nothing is sent to a third-party AI cloud.',
          'Subtitle, metadata, bab, dan voiceover berjalan di layanan yang Anda hosting sendiri. Tidak ada yang dikirim ke cloud AI pihak ketiga.',
        ),
      },
      {
        id: 'ft_k2',
        icon: 'scissors',
        title: L('Timeline editor', 'Editor bertimeline'),
        description: L(
          'Tracks, clips, auto-cut, split-screen, and waveform-accurate audio editing in the browser.',
          'Track, klip, auto-cut, split-screen, dan penyuntingan audio berbasis waveform langsung di peramban.',
        ),
      },
      {
        id: 'ft_k3',
        icon: 'layers',
        title: L('Two-level projects', 'Proyek dua tingkat'),
        description: L(
          'A Root Project holds the shared media pool; Sub-Projects each own their timeline. One recording, many cuts.',
          'Root Project menyimpan media bersama; tiap Sub-Project punya timeline sendiri. Satu rekaman, banyak potongan.',
        ),
      },
      {
        id: 'ft_k4',
        icon: 'folder',
        title: L('OBS watch folders', 'Folder pantau OBS'),
        description: L(
          'Recordings dropped by OBS are imported automatically, without a manual upload step.',
          'Rekaman yang dijatuhkan OBS diimpor otomatis, tanpa langkah unggah manual.',
        ),
      },
      {
        id: 'ft_k5',
        icon: 'mic',
        title: L('Voiceover and voice changer', 'Voiceover dan pengubah suara'),
        description: L(
          'Local text-to-speech plus in-app effects — deeper, echo, robot, chipmunk, studio presence.',
          'Text-to-speech lokal plus efek di aplikasi — lebih dalam, gema, robot, chipmunk, presence studio.',
        ),
      },
      {
        id: 'ft_k6',
        icon: 'file',
        title: L('Video Manager', 'Video Manager'),
        description: L(
          'Every export becomes a managed record, scoped back to the project it came from.',
          'Setiap ekspor jadi catatan terkelola, tetap terikat ke proyek asalnya.',
        ),
      },
    ],
    platforms: ['Web'],
    techStack: [
      'Next.js 16',
      'React 19',
      'TypeScript',
      'Tailwind CSS',
      'Zustand',
      'Radix UI',
      'wavesurfer.js',
      'Express 5',
      'Prisma',
      'PostgreSQL',
    ],
    integrations: ['faster-whisper', 'LM Studio', 'Kokoro-FastAPI', 'OBS'],
    requirements: [
      L('A machine able to run the local AI services (Whisper, LM Studio, Kokoro TTS)', 'Mesin yang sanggup menjalankan layanan AI lokal (Whisper, LM Studio, Kokoro TTS)'),
      L('PostgreSQL for the backend', 'PostgreSQL untuk backend-nya'),
    ],
    price: {
      startingPrice: null,
      currency: 'IDR',
      unit: 'month',
      note: L(
        'Demo and paid PRO tiers. Figures not published yet.',
        'Ada tier Demo dan PRO berbayar. Angkanya belum diterbitkan.',
      ),
    },
    faqs: [],
    changelog: [],
    currentVersion: null,
    demoUrl: null,
    docsUrl: null,
    relatedProductIds: [],
    status: 'published',
    featured: true,
    order: 1,
    seo: {
      title: L('QORV Clipper Studio — Local-first video editor', 'QORV Clipper Studio — Editor video yang berjalan lokal'),
      description: L(
        'Timeline video editor with AI subtitles, chapters, and voiceover running entirely on your own machine.',
        'Editor video bertimeline dengan subtitle, bab, dan voiceover AI yang seluruhnya berjalan di mesin Anda.',
      ),
      ogImage: null,
    },
    ...stamps('2026-01-01', '2026-07-01'),
  },

  {
    id: 'prod_catering',
    slug: 'qorv-catering',
    name: L('QORV Catering', 'QORV Catering'),
    tagline: L(
      'Display-only menu catalogue for catering businesses. Every order goes straight to WhatsApp, so the conversation stays personal.',
      'Katalog menu display-only untuk bisnis catering. Setiap pesanan diarahkan langsung ke WhatsApp, supaya percakapannya tetap personal.',
    ),
    type: 'web-app',
    productStatus: 'available',
    cover: cover('qorv-catering', L('QORV Catering catalogue', 'Katalog QORV Catering')),
    gallery: [],
    demoVideoUrl: null,
    description: L(
      'A public menu catalogue with photos, prices, categories, filters, and search — deliberately without in-app checkout.\n\nThat absence is the design decision. Catering orders involve portion counts, dates, delivery, and negotiation; a checkout button would flatten all of it into a transaction that then has to be re-opened as a conversation anyway. The order button opens WhatsApp with the message already filled in.\n\nVisitors can leave a star rating and a review without creating an account. The admin dashboard, behind login, covers an overview of totals and average rating, full menu CRUD with main photo and gallery upload, category management, review moderation, and staff accounts.',
      'Katalog menu publik dengan foto, harga, kategori, filter, dan pencarian — sengaja tanpa checkout di dalam aplikasi.\n\nKetiadaan itu justru keputusannya. Pesanan catering melibatkan jumlah porsi, tanggal, pengiriman, dan negosiasi; tombol checkout hanya akan memampatkan semuanya jadi transaksi yang toh harus dibuka lagi sebagai percakapan. Tombol pesan membuka WhatsApp dengan pesan yang sudah terisi.\n\nPengunjung bisa memberi rating bintang dan ulasan tanpa perlu membuat akun. Dasbor admin, di balik login, memuat ringkasan total dan rata-rata rating, CRUD menu lengkap dengan unggah foto utama dan galeri, pengelolaan kategori, moderasi ulasan, dan akun staf.',
    ),
    features: [
      {
        id: 'ft_g1',
        icon: 'book',
        title: L('Public menu catalogue', 'Katalog menu publik'),
        description: L(
          'Photos, descriptions, prices, categories, filters, and search — with a detail page per menu.',
          'Foto, deskripsi, harga, kategori, filter, dan pencarian — dengan halaman detail per menu.',
        ),
      },
      {
        id: 'ft_g2',
        icon: 'message',
        title: L('Ordering through WhatsApp', 'Pemesanan lewat WhatsApp'),
        description: L(
          'The order button opens WhatsApp with the message pre-filled. No checkout to abandon.',
          'Tombol pesan membuka WhatsApp dengan pesan yang sudah terisi. Tidak ada checkout untuk ditinggalkan.',
        ),
      },
      {
        id: 'ft_g3',
        icon: 'star',
        title: L('Reviews without accounts', 'Ulasan tanpa akun'),
        description: L(
          'Visitors rate and review without signing up; the dashboard moderates what appears.',
          'Pengunjung memberi rating dan ulasan tanpa mendaftar; dasbor yang memoderasi apa yang tampil.',
        ),
      },
      {
        id: 'ft_g4',
        icon: 'image',
        title: L('Menu management', 'Pengelolaan menu'),
        description: L(
          'Full CRUD with main photo and gallery upload, plus category management.',
          'CRUD penuh dengan unggah foto utama dan galeri, plus pengelolaan kategori.',
        ),
      },
    ],
    platforms: ['Web'],
    techStack: [
      'Next.js',
      'TypeScript',
      'Tailwind CSS 4',
      'Zustand',
      'Zod',
      'Framer Motion',
      'Radix UI',
      'Cloudflare D1',
      'Cloudflare Workers',
    ],
    integrations: ['WhatsApp', 'OpenNext'],
    requirements: [L('Modern browser', 'Peramban modern')],
    price: {
      startingPrice: null,
      currency: 'IDR',
      unit: 'project',
      note: L('Priced per deployment.', 'Dihitung per deployment.'),
    },
    faqs: [],
    changelog: [],
    currentVersion: null,
    demoUrl: 'https://qorv-catering.qorvstudio.workers.dev',
    docsUrl: null,
    relatedProductIds: ['prod_commerce'],
    status: 'published',
    featured: false,
    order: 2,
    seo: {
      title: L('QORV Catering — Menu catalogue', 'QORV Catering — Katalog menu'),
      description: L(
        'Display-only catering catalogue with WhatsApp ordering and public reviews.',
        'Katalog catering display-only dengan pemesanan WhatsApp dan ulasan publik.',
      ),
      ogImage: null,
    },
    ...stamps('2026-02-01', '2026-07-01'),
  },

  {
    id: 'prod_wakaf',
    slug: 'wakaf-rw',
    name: L('WakafRW', 'WakafRW'),
    tagline: L(
      'Community endowment bookkeeping for one RW — 5 RT, 1000+ households. Residents check their own balance; the treasurer stops writing in a notebook.',
      'Pencatatan iuran wakaf tingkat RW — 5 RT, 1000+ KK. Warga melihat sendiri sisa tagihannya; bendahara berhenti mencatat di buku tulis.',
    ),
    type: 'web-app',
    productStatus: 'beta',
    cover: cover('qorv-wakaf', L('WakafRW sign-in', 'Halaman masuk WakafRW')),
    gallery: [],
    demoVideoUrl: null,
    description: L(
      'This is not a payment gateway. No money moves through the application — there is no balance, no wallet, no auto-debit. Cash still goes to the treasurer or by transfer to the RW account. Only the bookkeeping changes.\n\nThree roles, three views. Residents see their outstanding balance and progress, the RW account number with one-tap copy, transfer-receipt upload, and printable history and receipts. The RW treasurer works a verification queue — one by one or in bulk — can correct the amount while approving, must give a reason when rejecting, and records cash or transfer payments from the bank statement. RT officers see only their own RT: dashboard, household list, export, and print.\n\nEvery rupiah leaves a trail that can be followed back.',
      'Ini bukan payment gateway. Tidak ada uang yang mengalir lewat aplikasi — tidak ada saldo, dompet, atau tarikan otomatis. Uang tetap berpindah tunai ke bendahara atau transfer ke rekening RW. Yang berubah hanya pencatatannya.\n\nTiga peran, tiga tampilan. Warga melihat sisa tagihan dan progresnya, nomor rekening RW dengan salin satu ketuk, unggah bukti transfer, serta riwayat dan kuitansi yang bisa dicetak. Bendahara RW menggarap antrian verifikasi — satuan maupun massal — bisa mengoreksi nominal saat menyetujui, wajib memberi alasan saat menolak, dan mencatat pembayaran tunai atau transfer dari mutasi. Pengurus RT hanya melihat RT-nya sendiri: dasbor, daftar KK, ekspor, dan cetak.\n\nSetiap rupiah punya jejak yang bisa ditelusuri.',
    ),
    features: [
      {
        id: 'ft_w1',
        icon: 'shield',
        title: L('Not a payment gateway', 'Bukan payment gateway'),
        description: L(
          'No money moves through the app. Cash and transfers stay outside it; only the record changes.',
          'Tidak ada uang yang mengalir lewat aplikasi. Tunai dan transfer tetap di luar; yang berubah catatannya.',
        ),
      },
      {
        id: 'ft_w2',
        icon: 'users',
        title: L('Three roles', 'Tiga peran'),
        description: L(
          'Resident, RW treasurer, and RT officer — each sees exactly what their job requires, and nothing else.',
          'Warga, bendahara RW, dan pengurus RT — masing-masing melihat persis yang dibutuhkan tugasnya, tidak lebih.',
        ),
      },
      {
        id: 'ft_w3',
        icon: 'check',
        title: L('Verification queue', 'Antrian verifikasi'),
        description: L(
          'Approve one by one or in bulk, correct the amount while approving, and give a required reason when rejecting.',
          'Setujui satuan atau massal, koreksi nominal saat menyetujui, dan beri alasan yang wajib saat menolak.',
        ),
      },
      {
        id: 'ft_w4',
        icon: 'file',
        title: L('Printable receipts and exports', 'Kuitansi dan ekspor siap cetak'),
        description: L(
          'Residents print their own receipts; RT officers export and print their own RT.',
          'Warga mencetak kuitansinya sendiri; pengurus RT mengekspor dan mencetak RT-nya sendiri.',
        ),
      },
    ],
    platforms: ['Web'],
    techStack: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Cloudflare Workers', 'OpenNext'],
    integrations: [],
    requirements: [L('Modern browser', 'Peramban modern')],
    price: {
      startingPrice: null,
      currency: 'IDR',
      unit: 'project',
      note: L('Priced per deployment.', 'Dihitung per deployment.'),
    },
    faqs: [],
    changelog: [],
    currentVersion: null,
    demoUrl: 'https://qorv-wakaf.qorvstudio.workers.dev',
    docsUrl: null,
    relatedProductIds: [],
    status: 'published',
    featured: false,
    order: 3,
    seo: {
      title: L('WakafRW — Community endowment bookkeeping', 'WakafRW — Pencatatan iuran wakaf'),
      description: L(
        'Endowment bookkeeping for one RW: residents check their own balance, every rupiah is traceable.',
        'Pencatatan iuran wakaf satu RW: warga melihat sendiri tagihannya, setiap rupiah bisa ditelusuri.',
      ),
      ogImage: null,
    },
    ...stamps('2026-03-01', '2026-07-01'),
  },
];
