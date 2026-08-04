import type { Product } from '@/types/content';
import { L, stamps } from './helpers';
import { mockCover, mockGallery } from './images';

/**
 * Five products QORV builds and sells. No tiers - one indicative price each
 * (ADR-010). Coverage: one `coming-soon` with a null price ("Contact us"),
 * one beta, one draft.
 */
export const mockProducts: Product[] = [
  {
    id: 'prod_forge',
    slug: 'forge',
    name: L('Forge', 'Forge'),
    tagline: L(
      'Design tokens that stay in sync with the code.',
      'Design token yang tetap sinkron dengan kodenya.',
    ),
    type: 'web-app',
    productStatus: 'available',
    cover: mockCover('qorv-forge', L('Forge interface', 'Antarmuka Forge')),
    gallery: mockGallery('qorv-forge-g', 5, L('Forge application screen', 'Layar aplikasi Forge')),
    demoVideoUrl: null,
    description: L(
      'Forge is the bridge between a design file and a production stylesheet. It reads tokens from Figma, validates them against your rules, and emits typed CSS, Tailwind config, and platform variables in one pass.\n\nMost token tools stop at export. Forge treats drift as the real problem: it watches both sides, tells you when a designer changed a value that code has hardcoded, and opens a pull request instead of a notification nobody reads.',
      'Forge adalah jembatan antara berkas desain dan stylesheet produksi. Ia membaca token dari Figma, memvalidasinya terhadap aturan Anda, lalu menghasilkan CSS bertipe, konfigurasi Tailwind, dan variabel platform dalam satu proses.\n\nKebanyakan alat token berhenti di ekspor. Forge memperlakukan penyimpangan sebagai masalah sesungguhnya: ia mengawasi kedua sisi, memberi tahu ketika desainer mengubah nilai yang di kode ditulis manual, lalu membuka pull request alih-alih notifikasi yang tak dibaca siapa pun.',
    ),
    features: [
      {
        id: 'ft_forge_1',
        icon: 'refresh-cw',
        title: L('Two-way drift detection', 'Deteksi penyimpangan dua arah'),
        description: L(
          'Forge compares the design file and the codebase continuously, and flags the exact line where they diverged.',
          'Forge membandingkan berkas desain dan kode secara terus-menerus, lalu menandai baris persis tempat keduanya berbeda.',
        ),
      },
      {
        id: 'ft_forge_2',
        icon: 'file-code',
        title: L('Typed output', 'Keluaran bertipe'),
        description: L(
          'Emits TypeScript types alongside CSS variables, so an unknown token name fails at build time.',
          'Menghasilkan tipe TypeScript bersama variabel CSS, sehingga nama token yang salah gagal saat build.',
        ),
      },
      {
        id: 'ft_forge_3',
        icon: 'git-pull-request',
        title: L('Pull requests, not alerts', 'Pull request, bukan sekadar peringatan'),
        description: L(
          'Changes arrive as reviewable pull requests with a visual diff of what moved.',
          'Perubahan datang sebagai pull request yang bisa ditinjau, lengkap dengan diff visual.',
        ),
      },
      {
        id: 'ft_forge_4',
        icon: 'shield-check',
        title: L('Contrast validation', 'Validasi kontras'),
        description: L(
          'Every colour pairing is checked against WCAG AA before it can ship.',
          'Setiap pasangan warna diperiksa terhadap WCAG AA sebelum bisa dirilis.',
        ),
      },
      {
        id: 'ft_forge_5',
        icon: 'layers',
        title: L('Multi-brand themes', 'Tema multi-merek'),
        description: L(
          'One token graph, many themes, with inheritance and per-brand overrides.',
          'Satu graf token, banyak tema, dengan pewarisan dan penimpaan per merek.',
        ),
      },
      {
        id: 'ft_forge_6',
        icon: 'history',
        title: L('Token history', 'Riwayat token'),
        description: L(
          'Every value change is versioned, attributed, and revertible.',
          'Setiap perubahan nilai tercatat versinya, pelakunya, dan bisa dikembalikan.',
        ),
      },
    ],
    platforms: ['Web', 'macOS', 'Windows'],
    techStack: ['TypeScript', 'Rust', 'Figma API', 'GitHub Actions'],
    integrations: ['Figma', 'GitHub', 'GitLab', 'Storybook', 'Tailwind CSS', 'Slack'],
    requirements: [
      L('A Figma organisation or professional plan', 'Akun Figma paket organisasi atau profesional'),
      L('Git repository hosted on GitHub or GitLab', 'Repositori Git di GitHub atau GitLab'),
      L('Node.js 20 or newer for the CLI', 'Node.js 20 atau lebih baru untuk CLI'),
    ],
    price: {
      startingPrice: 1_200_000,
      currency: 'IDR',
      unit: 'month',
      note: L('per workspace, billed annually', 'per ruang kerja, ditagih tahunan'),
    },
    faqs: [
      {
        id: 'faq_forge_1',
        question: L('Does it work without Figma?', 'Bisakah dipakai tanpa Figma?'),
        answer: L(
          'Yes. Figma is the most common source, but Forge also reads a plain JSON token file, so it fits a code-first workflow.',
          'Bisa. Figma adalah sumber paling umum, tetapi Forge juga membaca berkas token JSON biasa, sehingga cocok untuk alur kerja yang berbasis kode.',
        ),
      },
      {
        id: 'faq_forge_2',
        question: L('Can we self-host?', 'Bisakah dipasang di server sendiri?'),
        answer: L(
          'Self-hosting is available on the annual plan. The sync engine runs in your own CI, and no design data leaves your infrastructure.',
          'Pemasangan mandiri tersedia pada paket tahunan. Mesin sinkronisasi berjalan di CI Anda sendiri, dan tidak ada data desain yang keluar dari infrastruktur Anda.',
        ),
      },
      {
        id: 'faq_forge_3',
        question: L('What happens if we cancel?', 'Apa yang terjadi bila kami berhenti berlangganan?'),
        answer: L(
          'The generated files are plain CSS and TypeScript in your repository. They keep working - you simply stop getting sync.',
          'Berkas yang dihasilkan adalah CSS dan TypeScript biasa di repositori Anda. Semuanya tetap berfungsi - Anda hanya berhenti mendapatkan sinkronisasi.',
        ),
      },
    ],
    changelog: [
      {
        version: '2.4.0',
        date: '2026-07-08T00:00:00.000Z',
        notes: L(
          'Added multi-brand theme inheritance and per-brand overrides.',
          'Menambahkan pewarisan tema multi-merek dan penimpaan per merek.',
        ),
      },
      {
        version: '2.3.1',
        date: '2026-05-21T00:00:00.000Z',
        notes: L(
          'Fixed a race condition when two designers edited the same token set.',
          'Memperbaiki race condition saat dua desainer menyunting set token yang sama.',
        ),
      },
      {
        version: '2.3.0',
        date: '2026-04-02T00:00:00.000Z',
        notes: L(
          'Contrast validation now runs on every pull request.',
          'Validasi kontras kini berjalan pada setiap pull request.',
        ),
      },
    ],
    currentVersion: '2.4.0',
    demoUrl: 'https://example.com/forge/demo',
    docsUrl: 'https://example.com/forge/docs',
    relatedProductIds: ['prod_strata', 'prod_relay'],
    status: 'published',
    featured: true,
    order: 0,
    seo: {
      title: L('Forge - Design tokens in sync', 'Forge - Design token yang selalu sinkron'),
      description: L(
        'Two-way sync between design tokens and production code, with drift detection.',
        'Sinkronisasi dua arah antara design token dan kode produksi, dengan deteksi penyimpangan.',
      ),
      ogImage: null,
    },
    ...stamps('2024-05-20', '2026-07-08'),
  },

  {
    id: 'prod_strata',
    slug: 'strata',
    name: L('Strata', 'Strata'),
    tagline: L(
      'Know what your infrastructure costs before you deploy it.',
      'Ketahui biaya infrastruktur Anda sebelum menerapkannya.',
    ),
    type: 'tool',
    productStatus: 'available',
    cover: mockCover('qorv-strata', L('Cost analysis dashboard', 'Dasbor analisis biaya')),
    gallery: mockGallery('qorv-strata-g', 4, L('Strata dashboard screen', 'Layar dasbor Strata')),
    demoVideoUrl: null,
    description: L(
      'Strata reads your Terraform plan and tells you what it will cost per month, before it is applied. It comments the estimate directly on the pull request, broken down by resource, with the delta against the current state.\n\nCloud bills are a surprise because the cost of a change is invisible at the moment the change is made. Strata moves that number to where the decision actually happens.',
      'Strata membaca rencana Terraform Anda dan memberi tahu biayanya per bulan, sebelum diterapkan. Estimasinya dikomentari langsung di pull request, dirinci per sumber daya, lengkap dengan selisih terhadap kondisi saat ini.\n\nTagihan cloud terasa mengejutkan karena biaya sebuah perubahan tidak terlihat saat perubahan itu dibuat. Strata memindahkan angka tersebut ke tempat keputusan benar-benar diambil.',
    ),
    features: [
      {
        id: 'ft_strata_1',
        icon: 'calculator',
        title: L('Pre-apply estimates', 'Estimasi sebelum diterapkan'),
        description: L(
          'Costs are calculated from the plan file, so you see the number before anything is provisioned.',
          'Biaya dihitung dari berkas rencana, sehingga Anda melihat angkanya sebelum ada yang dibuat.',
        ),
      },
      {
        id: 'ft_strata_2',
        icon: 'message-square',
        title: L('Pull request comments', 'Komentar di pull request'),
        description: L(
          'The estimate lands in code review, where the decision is made.',
          'Estimasinya muncul di tinjauan kode, tempat keputusan diambil.',
        ),
      },
      {
        id: 'ft_strata_3',
        icon: 'trending-up',
        title: L('Drift and forecast', 'Penyimpangan dan proyeksi'),
        description: L(
          'Compares projected spend against actual billing and flags the gap.',
          'Membandingkan proyeksi belanja dengan tagihan nyata dan menandai selisihnya.',
        ),
      },
      {
        id: 'ft_strata_4',
        icon: 'siren',
        title: L('Budget guardrails', 'Pagar anggaran'),
        description: L(
          'Fails the pipeline when a change would push a team over its budget.',
          'Menggagalkan pipeline ketika sebuah perubahan membuat tim melewati anggarannya.',
        ),
      },
    ],
    platforms: ['CLI', 'Web', 'GitHub Action'],
    techStack: ['Go', 'TypeScript', 'Terraform', 'OpenTofu'],
    integrations: ['AWS', 'Google Cloud', 'Azure', 'GitHub', 'GitLab', 'Terraform Cloud'],
    requirements: [
      L('Terraform 1.5+ or OpenTofu', 'Terraform 1.5+ atau OpenTofu'),
      L('Read access to a cloud billing account', 'Akses baca ke akun penagihan cloud'),
    ],
    price: {
      startingPrice: 850_000,
      currency: 'IDR',
      unit: 'month',
      note: L('per repository', 'per repositori'),
    },
    faqs: [
      {
        id: 'faq_strata_1',
        question: L('How accurate are the estimates?', 'Seberapa akurat estimasinya?'),
        answer: L(
          'Typically within five percent for predictable resources. Usage-based services such as bandwidth are shown as a range, not a single number.',
          'Umumnya dalam selisih lima persen untuk sumber daya yang dapat diprediksi. Layanan berbasis pemakaian seperti bandwidth ditampilkan sebagai rentang, bukan angka tunggal.',
        ),
      },
      {
        id: 'faq_strata_2',
        question: L('Does it need write access?', 'Apakah butuh akses tulis?'),
        answer: L(
          'No. Strata only reads the plan file and billing data. It never applies changes.',
          'Tidak. Strata hanya membaca berkas rencana dan data penagihan. Ia tidak pernah menerapkan perubahan.',
        ),
      },
    ],
    changelog: [
      {
        version: '1.9.2',
        date: '2026-06-30T00:00:00.000Z',
        notes: L('Added Azure spot instance pricing.', 'Menambahkan harga instance spot Azure.'),
      },
      {
        version: '1.9.0',
        date: '2026-03-17T00:00:00.000Z',
        notes: L('OpenTofu support and budget guardrails.', 'Dukungan OpenTofu dan pagar anggaran.'),
      },
    ],
    currentVersion: '1.9.2',
    demoUrl: null,
    docsUrl: 'https://example.com/strata/docs',
    relatedProductIds: ['prod_forge', 'prod_relay'],
    status: 'published',
    featured: true,
    order: 1,
    seo: {
      title: L('Strata - Infrastructure cost estimates', 'Strata - Estimasi biaya infrastruktur'),
      description: L(
        'See what a Terraform change costs before you apply it, in the pull request.',
        'Lihat biaya perubahan Terraform sebelum diterapkan, langsung di pull request.',
      ),
      ogImage: null,
    },
    ...stamps('2024-11-12', '2026-06-30'),
  },

  {
    id: 'prod_relay',
    slug: 'relay',
    name: L('Relay', 'Relay'),
    tagline: L(
      'Webhook delivery you can actually debug.',
      'Pengiriman webhook yang benar-benar bisa ditelusuri.',
    ),
    type: 'web-app',
    productStatus: 'beta',
    cover: mockCover('qorv-relay', L('Webhook delivery log', 'Log pengiriman webhook')),
    gallery: mockGallery('qorv-relay-g', 3, L('Relay dashboard screen', 'Layar dasbor Relay')),
    demoVideoUrl: null,
    description: L(
      'Relay sits between your service and your customers\' endpoints. It handles retries with exponential backoff, signs every payload, keeps a searchable log of each attempt, and lets a customer replay a failed delivery themselves.\n\nWebhooks are simple until one fails at 3am and nobody can say whether it was sent, rejected, or silently dropped. Relay is the answer to that question.',
      'Relay berada di antara layanan Anda dan endpoint pelanggan. Ia menangani percobaan ulang dengan exponential backoff, menandatangani setiap payload, menyimpan log setiap percobaan yang bisa ditelusuri, dan memungkinkan pelanggan mengulang pengiriman yang gagal sendiri.\n\nWebhook terasa sederhana sampai satu pengiriman gagal pukul tiga pagi dan tidak ada yang bisa memastikan apakah ia terkirim, ditolak, atau hilang begitu saja. Relay adalah jawaban atas pertanyaan itu.',
    ),
    features: [
      {
        id: 'ft_relay_1',
        icon: 'repeat',
        title: L('Retries with backoff', 'Percobaan ulang dengan backoff'),
        description: L(
          'Configurable exponential retry with a dead-letter queue for permanent failures.',
          'Percobaan ulang eksponensial yang dapat dikonfigurasi, dengan antrean dead-letter untuk kegagalan permanen.',
        ),
      },
      {
        id: 'ft_relay_2',
        icon: 'search',
        title: L('Searchable delivery log', 'Log pengiriman yang bisa dicari'),
        description: L(
          'Every attempt is stored with request, response, timing, and status.',
          'Setiap percobaan tersimpan lengkap dengan permintaan, respons, waktu, dan status.',
        ),
      },
      {
        id: 'ft_relay_3',
        icon: 'key-round',
        title: L('Signed payloads', 'Payload bertanda tangan'),
        description: L(
          'HMAC signatures with key rotation, so recipients can verify authenticity.',
          'Tanda tangan HMAC dengan rotasi kunci, sehingga penerima dapat memverifikasi keasliannya.',
        ),
      },
      {
        id: 'ft_relay_4',
        icon: 'play',
        title: L('Customer self-replay', 'Ulang kirim mandiri'),
        description: L(
          'A hosted portal where your customers replay their own failed deliveries.',
          'Portal yang kami sediakan agar pelanggan Anda mengulang sendiri pengiriman yang gagal.',
        ),
      },
    ],
    platforms: ['Web', 'REST API'],
    techStack: ['Go', 'PostgreSQL', 'NATS', 'TypeScript'],
    integrations: ['Stripe', 'Shopify', 'Slack', 'Datadog', 'Sentry'],
    requirements: [
      L('An HTTPS endpoint to receive events', 'Endpoint HTTPS untuk menerima peristiwa'),
      L('API key issued from the Relay dashboard', 'Kunci API yang diterbitkan dari dasbor Relay'),
    ],
    price: {
      startingPrice: 450_000,
      currency: 'IDR',
      unit: 'month',
      note: L('includes 500,000 deliveries', 'termasuk 500.000 pengiriman'),
    },
    faqs: [
      {
        id: 'faq_relay_1',
        question: L('What does beta mean here?', 'Apa arti beta di sini?'),
        answer: L(
          'The API is stable and in production use, but we are still changing the dashboard. Beta pricing is locked for the first year.',
          'API-nya stabil dan sudah dipakai di produksi, tetapi dasbornya masih kami ubah. Harga beta dikunci selama tahun pertama.',
        ),
      },
      {
        id: 'faq_relay_2',
        question: L('Where is data stored?', 'Di mana data disimpan?'),
        answer: L(
          'Singapore by default, with Jakarta available on request. Payload bodies are retained for 30 days.',
          'Singapura secara bawaan, dengan opsi Jakarta bila diminta. Isi payload disimpan selama 30 hari.',
        ),
      },
    ],
    changelog: [
      {
        version: '0.8.0',
        date: '2026-07-22T00:00:00.000Z',
        notes: L('Customer self-replay portal.', 'Portal ulang kirim mandiri untuk pelanggan.'),
      },
      {
        version: '0.7.0',
        date: '2026-05-04T00:00:00.000Z',
        notes: L('Key rotation without downtime.', 'Rotasi kunci tanpa waktu henti.'),
      },
    ],
    currentVersion: '0.8.0',
    demoUrl: 'https://example.com/relay/demo',
    docsUrl: 'https://example.com/relay/docs',
    relatedProductIds: ['prod_strata', 'prod_forge'],
    status: 'published',
    featured: false,
    order: 2,
    seo: {
      title: L('Relay - Webhook delivery', 'Relay - Pengiriman webhook'),
      description: L(
        'Retries, signing, and a searchable log for every webhook delivery.',
        'Percobaan ulang, penandatanganan, dan log yang bisa dicari untuk setiap webhook.',
      ),
      ogImage: null,
    },
    ...stamps('2025-09-01', '2026-07-22'),
  },

  {
    id: 'prod_quarry',
    slug: 'quarry',
    name: L('Quarry', 'Quarry'),
    tagline: L(
      'Turn a warehouse of documents into an answerable question.',
      'Ubah gudang dokumen menjadi pertanyaan yang bisa dijawab.',
    ),
    type: 'desktop-app',
    productStatus: 'coming-soon',
    cover: mockCover('qorv-quarry', L('Document search interface', 'Antarmuka pencarian dokumen')),
    gallery: mockGallery('qorv-quarry-g', 3, L('Quarry application screen', 'Layar aplikasi Quarry')),
    demoVideoUrl: null,
    description: L(
      'Quarry indexes a folder of contracts, reports, and scans, then answers questions about them with citations pointing at the exact page. Everything runs locally - the documents never leave the machine.\n\nBuilt for teams who cannot upload their archive to someone else\'s server: law firms, clinics, and anyone holding records they are legally responsible for.',
      'Quarry mengindeks folder berisi kontrak, laporan, dan hasil pindai, lalu menjawab pertanyaan tentangnya dengan sitasi yang menunjuk halaman persis. Semuanya berjalan lokal - dokumennya tidak pernah keluar dari perangkat.\n\nDibangun untuk tim yang tidak boleh mengunggah arsipnya ke server orang lain: kantor hukum, klinik, dan siapa pun yang memegang rekaman dengan tanggung jawab hukum.',
    ),
    features: [
      {
        id: 'ft_quarry_1',
        icon: 'hard-drive',
        title: L('Fully local', 'Sepenuhnya lokal'),
        description: L(
          'Indexing and inference run on your machine. No document is ever uploaded.',
          'Pengindeksan dan inferensi berjalan di perangkat Anda. Tidak ada dokumen yang diunggah.',
        ),
      },
      {
        id: 'ft_quarry_2',
        icon: 'quote',
        title: L('Citations, not summaries', 'Sitasi, bukan ringkasan'),
        description: L(
          'Every answer links to the source page, so you can verify it rather than trust it.',
          'Setiap jawaban menautkan ke halaman sumbernya, sehingga bisa Anda verifikasi, bukan sekadar dipercaya.',
        ),
      },
      {
        id: 'ft_quarry_3',
        icon: 'scan-text',
        title: L('Scan and handwriting OCR', 'OCR pindaian dan tulisan tangan'),
        description: L(
          'Reads scanned PDFs and photographed documents, including handwritten annotations.',
          'Membaca PDF hasil pindai dan dokumen yang difoto, termasuk anotasi tulisan tangan.',
        ),
      },
    ],
    platforms: ['macOS', 'Windows', 'Linux'],
    techStack: ['Rust', 'Tauri', 'TypeScript', 'ONNX Runtime'],
    integrations: ['Local filesystem', 'Network shares', 'Encrypted volumes'],
    requirements: [
      L('16 GB RAM minimum, 32 GB recommended', 'RAM minimum 16 GB, disarankan 32 GB'),
      L('20 GB free disk space for the index', 'Ruang disk kosong 20 GB untuk indeks'),
      L('macOS 14+, Windows 11, or Ubuntu 22.04+', 'macOS 14+, Windows 11, atau Ubuntu 22.04+'),
    ],
    price: {
      startingPrice: null,
      currency: 'IDR',
      unit: 'license',
      note: L('pricing announced at launch', 'harga diumumkan saat peluncuran'),
    },
    faqs: [
      {
        id: 'faq_quarry_1',
        question: L('When does it launch?', 'Kapan diluncurkan?'),
        answer: L(
          'Private beta is running now with a small group of firms. General availability is planned for the first quarter of 2027.',
          'Beta tertutup sedang berjalan bersama sekelompok kecil firma. Ketersediaan umum direncanakan pada kuartal pertama 2027.',
        ),
      },
      {
        id: 'faq_quarry_2',
        question: L('Can we join the beta?', 'Bisakah kami ikut beta?'),
        answer: L(
          'Send us a note describing your archive size and document types. We are adding a few organisations each month.',
          'Kirimkan pesan yang menjelaskan ukuran arsip dan jenis dokumen Anda. Kami menambahkan beberapa organisasi setiap bulan.',
        ),
      },
    ],
    changelog: [],
    currentVersion: null,
    demoUrl: null,
    docsUrl: null,
    relatedProductIds: ['prod_forge'],
    status: 'published',
    featured: false,
    order: 3,
    seo: {
      title: L('Quarry - Local document intelligence', 'Quarry - Kecerdasan dokumen lokal'),
      description: L(
        'Ask questions of your document archive without it ever leaving the machine.',
        'Ajukan pertanyaan pada arsip dokumen Anda tanpa datanya keluar dari perangkat.',
      ),
      ogImage: null,
    },
    ...stamps('2026-04-05', '2026-07-19'),
  },

  {
    id: 'prod_ledger',
    slug: 'ledger-kit',
    name: L('Ledger Kit', 'Ledger Kit'),
    tagline: L(
      'A double-entry accounting core you can build on.',
      'Inti akuntansi berpasangan yang siap Anda kembangkan.',
    ),
    type: 'template',
    productStatus: 'available',
    cover: mockCover('qorv-ledger', L('Accounting interface', 'Antarmuka akuntansi')),
    gallery: mockGallery('qorv-ledger-g', 3, L('Ledger Kit screen', 'Layar Ledger Kit')),
    demoVideoUrl: null,
    description: L(
      'Ledger Kit is a correct double-entry accounting engine with a TypeScript API, migrations, and a reference interface. Accounts, journals, postings, period close, and immutable audit trail - the parts that are tedious to build and expensive to get wrong.\n\nIt is a starting point, not a product: you own the code and shape the rest of the application around it.',
      'Ledger Kit adalah mesin akuntansi berpasangan yang benar, dengan API TypeScript, migrasi, dan antarmuka rujukan. Akun, jurnal, posting, tutup periode, dan jejak audit yang tak dapat diubah - bagian-bagian yang membosankan untuk dibangun dan mahal bila salah.\n\nIni titik awal, bukan produk jadi: kodenya milik Anda, dan sisa aplikasinya Anda bentuk sendiri di sekitarnya.',
    ),
    features: [
      {
        id: 'ft_ledger_1',
        icon: 'scale',
        title: L('Enforced balance', 'Keseimbangan yang dipaksakan'),
        description: L(
          'Unbalanced journals are rejected at the database level, not just in application code.',
          'Jurnal yang tidak seimbang ditolak di tingkat basis data, bukan hanya di kode aplikasi.',
        ),
      },
      {
        id: 'ft_ledger_2',
        icon: 'lock',
        title: L('Immutable postings', 'Posting yang tak dapat diubah'),
        description: L(
          'Corrections are reversing entries. Nothing is ever edited or deleted.',
          'Koreksi dilakukan lewat jurnal pembalik. Tidak ada yang pernah disunting atau dihapus.',
        ),
      },
      {
        id: 'ft_ledger_3',
        icon: 'coins',
        title: L('Multi-currency', 'Multi-mata uang'),
        description: L(
          'Per-transaction rates with realised and unrealised gain handling.',
          'Kurs per transaksi dengan penanganan selisih kurs terealisasi dan belum terealisasi.',
        ),
      },
      {
        id: 'ft_ledger_4',
        icon: 'file-check',
        title: L('Period close', 'Tutup periode'),
        description: L(
          'Locking, adjustment entries, and trial balance generation built in.',
          'Penguncian, jurnal penyesuaian, dan pembuatan neraca saldo sudah tersedia.',
        ),
      },
    ],
    platforms: ['Node.js', 'Web'],
    techStack: ['TypeScript', 'PostgreSQL', 'Drizzle', 'Next.js'],
    integrations: ['Xero', 'QuickBooks', 'CSV import', 'REST API'],
    requirements: [
      L('PostgreSQL 15 or newer', 'PostgreSQL 15 atau lebih baru'),
      L('Node.js 20 or newer', 'Node.js 20 atau lebih baru'),
      L('Working knowledge of double-entry accounting', 'Pemahaman kerja akuntansi berpasangan'),
    ],
    price: {
      startingPrice: 14_500_000,
      currency: 'IDR',
      unit: 'license',
      note: L('one-time, perpetual, per product', 'sekali bayar, selamanya, per produk'),
    },
    faqs: [
      {
        id: 'faq_ledger_1',
        question: L('Can we ship it in a commercial product?', 'Bisakah dipakai di produk komersial?'),
        answer: L(
          'Yes. The licence is perpetual and per product - build and sell whatever you like on top of it. You may not resell Ledger Kit itself as a competing kit.',
          'Bisa. Lisensinya berlaku selamanya dan per produk - bangun serta jual apa pun di atasnya. Yang tidak boleh adalah menjual ulang Ledger Kit sebagai kit pesaing.',
        ),
      },
      {
        id: 'faq_ledger_2',
        question: L('Do we get updates?', 'Apakah mendapat pembaruan?'),
        answer: L(
          'Twelve months of updates are included. After that the code keeps working; renewal is optional.',
          'Termasuk dua belas bulan pembaruan. Setelahnya kodenya tetap berfungsi; perpanjangan bersifat opsional.',
        ),
      },
    ],
    changelog: [
      {
        version: '3.1.0',
        date: '2026-06-11T00:00:00.000Z',
        notes: L(
          'Multi-currency revaluation and unrealised gain reporting.',
          'Revaluasi multi-mata uang dan pelaporan selisih kurs belum terealisasi.',
        ),
      },
      {
        version: '3.0.0',
        date: '2026-01-30T00:00:00.000Z',
        notes: L(
          'Migrated to Drizzle. Breaking change to the migration runner.',
          'Bermigrasi ke Drizzle. Perubahan besar pada penjalan migrasi.',
        ),
      },
    ],
    currentVersion: '3.1.0',
    demoUrl: 'https://example.com/ledger/demo',
    docsUrl: 'https://example.com/ledger/docs',
    relatedProductIds: ['prod_strata'],
    status: 'draft',
    featured: false,
    order: 4,
    seo: {
      title: L('Ledger Kit - Double-entry accounting core', 'Ledger Kit - Inti akuntansi berpasangan'),
      description: L(
        'A correct double-entry engine with a TypeScript API and reference interface.',
        'Mesin akuntansi berpasangan yang benar dengan API TypeScript dan antarmuka rujukan.',
      ),
      ogImage: null,
    },
    ...stamps('2025-02-17', '2026-06-11', null),
  },
];
