import type { Service } from '@/types/content';
import { L, stamps, deriveStartingPrice } from './helpers';
import { mockCover, mockGallery } from './images';

/**
 * Six capabilities, matching the brand's own service split.
 * Coverage the seed deliberately includes:
 *  - svc_consulting  → zero packages (quote-only path)
 *  - svc_packaging   → Basic + Gold only (partial ladder)
 *
 * All six are published, so the services grid fills evenly.
 *
 * ── Harga ───────────────────────────────────────────────────────────────────
 *
 * Angkanya **disusun**, bukan diambil dari daftar harga yang sudah ada — tidak
 * ada satupun daftar semacam itu di sumber manapun. Yang diberikan hanya
 * arahannya: terjangkau, bukan puluhan juta.
 *
 * Rentangnya Rp 750 rb sampai Rp 18 jt per proyek, disusun sebagai tangga tiga
 * tingkat per layanan dengan lompatan sekitar 2–2,5 kali di tiap anak tangga.
 * Angka sebelumnya Rp 18–210 juta; itu karangan dan bertentangan dengan arahan.
 *
 * **Periksa dan sesuaikan lewat panel admin.** Ini titik awal yang masuk akal,
 * bukan harga yang dikonfirmasi.
 */

const webPackages = [
  {
    tier: 'basic' as const,
    price: 3_500_000,
    currency: 'IDR' as const,
    period: 'project' as const,
    description: L(
      'A focused marketing site or landing page, built to convert.',
      'Situs pemasaran atau landing page yang fokus dan dirancang untuk konversi.',
    ),
    includes: [
      L('Up to 6 pages', 'Maksimal 6 halaman'),
      L('Responsive across all breakpoints', 'Responsif di semua ukuran layar'),
      L('CMS for editable content', 'CMS untuk konten yang bisa diubah'),
      L('Core Web Vitals optimisation', 'Optimasi Core Web Vitals'),
      L('4 weeks of post-launch support', 'Dukungan 4 minggu setelah rilis'),
    ],
  },
  {
    tier: 'gold' as const,
    price: 8_500_000,
    currency: 'IDR' as const,
    period: 'project' as const,
    description: L(
      'A full product build with authentication, dashboards, and an admin panel.',
      'Pembangunan produk utuh dengan autentikasi, dasbor, dan panel admin.',
    ),
    includes: [
      L('Everything in Basic', 'Semua yang ada di Basic'),
      L('Custom design system', 'Design system khusus'),
      L('Authentication and user roles', 'Autentikasi dan peran pengguna'),
      L('Admin panel with full CRUD', 'Panel admin dengan CRUD lengkap'),
      L('API design and integration', 'Perancangan dan integrasi API'),
      L('Automated test suite', 'Rangkaian pengujian otomatis'),
      L('12 weeks of post-launch support', 'Dukungan 12 minggu setelah rilis'),
    ],
  },
  {
    tier: 'premium' as const,
    price: 18_000_000,
    currency: 'IDR' as const,
    period: 'project' as const,
    description: L(
      'Multi-platform systems, complex integrations, and ongoing engineering partnership.',
      'Sistem multi-platform, integrasi kompleks, dan kemitraan rekayasa berkelanjutan.',
    ),
    includes: [
      L('Everything in Gold', 'Semua yang ada di Gold'),
      L('Architecture and scalability planning', 'Perencanaan arsitektur dan skalabilitas'),
      L('Third-party system integration', 'Integrasi sistem pihak ketiga'),
      L('Dedicated engineering team', 'Tim rekayasa khusus'),
      L('SLA and monitoring', 'SLA dan pemantauan'),
      L('Retainer arrangement', 'Skema retainer'),
    ],
  },
];

const animationPackages = [
  {
    tier: 'basic' as const,
    price: 1_500_000,
    currency: 'IDR' as const,
    period: 'project' as const,
    description: L(
      'A single short-form animation for social or product launch.',
      'Satu animasi pendek untuk media sosial atau peluncuran produk.',
    ),
    includes: [
      L('Up to 20 seconds', 'Maksimal 20 detik'),
      L('Storyboard and one revision round', 'Storyboard dan satu putaran revisi'),
      L('1080p and square exports', 'Ekspor 1080p dan format persegi'),
      L('Licensed soundtrack', 'Musik latar berlisensi'),
    ],
  },
  {
    tier: 'gold' as const,
    price: 4_000_000,
    currency: 'IDR' as const,
    period: 'project' as const,
    description: L(
      'A full product film with modelling, lighting, and motion design.',
      'Film produk lengkap dengan modeling, pencahayaan, dan desain gerak.',
    ),
    includes: [
      L('Everything in Basic', 'Semua yang ada di Basic'),
      L('Up to 60 seconds', 'Maksimal 60 detik'),
      L('Custom 3D modelling and texturing', 'Modeling dan texturing 3D khusus'),
      L('Physically based lighting', 'Pencahayaan berbasis fisika'),
      L('4K delivery', 'Pengiriman 4K'),
      L('Three revision rounds', 'Tiga putaran revisi'),
    ],
  },
  {
    tier: 'premium' as const,
    price: 9_000_000,
    currency: 'IDR' as const,
    period: 'project' as const,
    description: L(
      'A campaign-scale series with real-time assets and interactive delivery.',
      'Rangkaian skala kampanye dengan aset real-time dan pengiriman interaktif.',
    ),
    includes: [
      L('Everything in Gold', 'Semua yang ada di Gold'),
      L('Multi-scene campaign series', 'Rangkaian kampanye multi-adegan'),
      L('Real-time WebGL assets', 'Aset WebGL real-time'),
      L('Interactive 3D product configurator', 'Konfigurator produk 3D interaktif'),
      L('Source files handed over', 'Berkas sumber diserahkan'),
    ],
  },
];

const packagingPackages = [
  {
    tier: 'basic' as const,
    price: 1_500_000,
    currency: 'IDR' as const,
    period: 'project' as const,
    description: L(
      'A single SKU, from structure to print-ready artwork.',
      'Satu SKU, dari struktur hingga artwork siap cetak.',
    ),
    includes: [
      L('One primary package structure', 'Satu struktur kemasan utama'),
      L('Dieline and print-ready files', 'Dieline dan berkas siap cetak'),
      L('Material recommendation', 'Rekomendasi material'),
      L('Two revision rounds', 'Dua putaran revisi'),
    ],
  },
  {
    tier: 'gold' as const,
    price: 3_500_000,
    currency: 'IDR' as const,
    period: 'project' as const,
    description: L(
      'A full product line with a consistent shelf system.',
      'Lini produk lengkap dengan sistem rak yang konsisten.',
    ),
    includes: [
      L('Everything in Basic', 'Semua yang ada di Basic'),
      L('Up to 8 SKUs', 'Maksimal 8 SKU'),
      L('Shelf-impact system design', 'Perancangan sistem dampak rak'),
      L('3D mockups and renders', 'Mockup dan render 3D'),
      L('Print vendor liaison', 'Pendampingan vendor cetak'),
      L('Production supervision', 'Supervisi produksi'),
    ],
  },
  {
    tier: 'premium' as const,
    price: 7_500_000,
    currency: 'IDR' as const,
    period: 'project' as const,
    description: L(
      'A complete portfolio system with the rules to extend it without us.',
      'Sistem portofolio lengkap beserta aturan untuk mengembangkannya tanpa kami.',
    ),
    includes: [
      L('Everything in Gold', 'Semua yang ada di Gold'),
      L('Unlimited SKUs within the system', 'SKU tanpa batas di dalam sistem'),
      L('Structural prototyping and drop tests', 'Prototipe struktural dan uji jatuh'),
      L('Written packaging guideline', 'Panduan kemasan tertulis'),
      L('Sustainability and material audit', 'Audit material dan keberlanjutan'),
      L('12 months of artwork support', 'Dukungan artwork selama 12 bulan'),
    ],
  },
];

const consultingPackages = [
  {
    tier: 'basic' as const,
    price: 750_000,
    currency: 'IDR' as const,
    period: 'project' as const,
    description: L(
      'A read of one system, with the findings written down.',
      'Pembacaan satu sistem, dengan temuan yang dituliskan.',
    ),
    includes: [
      L('Codebase and infrastructure review', 'Tinjauan basis kode dan infrastruktur'),
      L('Performance and security scan', 'Pemindaian performa dan keamanan'),
      L('Written findings report', 'Laporan temuan tertulis'),
      L('One walkthrough session', 'Satu sesi pemaparan'),
    ],
  },
  {
    tier: 'gold' as const,
    price: 2_000_000,
    currency: 'IDR' as const,
    period: 'project' as const,
    description: L(
      'The full audit, plus a sequenced plan your team can execute.',
      'Audit lengkap, plus rencana berurutan yang bisa dijalankan tim Anda.',
    ),
    includes: [
      L('Everything in Basic', 'Semua yang ada di Basic'),
      L('Team and process interviews', 'Wawancara tim dan proses'),
      L('Cost and risk quantification', 'Kuantifikasi biaya dan risiko'),
      L('Sequenced remediation plan', 'Rencana perbaikan berurutan'),
      L('Two follow-up sessions', 'Dua sesi tindak lanjut'),
    ],
  },
  {
    tier: 'premium' as const,
    price: 4_500_000,
    currency: 'IDR' as const,
    period: 'project' as const,
    description: L(
      'We stay through the first phase of the plan and hand it over working.',
      'Kami menemani sampai fase pertama rencana berjalan, lalu menyerahkannya dalam keadaan hidup.',
    ),
    includes: [
      L('Everything in Gold', 'Semua yang ada di Gold'),
      L('Hands-on execution of phase one', 'Eksekusi langsung fase pertama'),
      L('Pair sessions with your engineers', 'Sesi berpasangan dengan tim teknis Anda'),
      L('Monitoring and alerting set up', 'Pemasangan pemantauan dan peringatan'),
      L('6 months of advisory retainer', 'Retainer pendampingan selama 6 bulan'),
    ],
  },
];

const brandPackages = [
  {
    tier: 'basic' as const,
    price: 2_500_000,
    currency: 'IDR' as const,
    period: 'project' as const,
    description: L(
      'A core identity: logotype, palette, and typography.',
      'Identitas inti: logotype, palet warna, dan tipografi.',
    ),
    includes: [
      L('Logotype and lockups', 'Logotype dan variasi susunannya'),
      L('Colour and typography system', 'Sistem warna dan tipografi'),
      L('Basic usage guidelines', 'Panduan penggunaan dasar'),
      L('Logo files in all formats', 'Berkas logo dalam semua format'),
    ],
  },
  {
    tier: 'gold' as const,
    price: 6_000_000,
    currency: 'IDR' as const,
    period: 'project' as const,
    description: L(
      'A complete identity system with tone of voice and applications.',
      'Sistem identitas lengkap dengan tone of voice dan penerapannya.',
    ),
    includes: [
      L('Everything in Basic', 'Semua yang ada di Basic'),
      L('Brand strategy and positioning', 'Strategi dan positioning merek'),
      L('Tone of voice guide', 'Panduan tone of voice'),
      L('Full guideline document', 'Dokumen panduan lengkap'),
      L('Stationery and social templates', 'Templat alat tulis dan media sosial'),
      L('Motion identity', 'Identitas gerak'),
    ],
  },
  {
    tier: 'premium' as const,
    price: 12_000_000,
    currency: 'IDR' as const,
    period: 'project' as const,
    description: L(
      'Brand architecture for multi-product or multi-market companies.',
      'Arsitektur merek untuk perusahaan multi-produk atau multi-pasar.',
    ),
    includes: [
      L('Everything in Gold', 'Semua yang ada di Gold'),
      L('Brand architecture and sub-brands', 'Arsitektur merek dan sub-merek'),
      L('Naming strategy', 'Strategi penamaan'),
      L('Digital design system', 'Design system digital'),
      L('Internal rollout workshop', 'Lokakarya penerapan internal'),
    ],
  },
];

const uiuxPackages = [
  {
    tier: 'basic' as const,
    price: 2_500_000,
    currency: 'IDR' as const,
    period: 'project' as const,
    description: L(
      'An audit and redesign of one critical flow.',
      'Audit dan perancangan ulang satu alur kritis.',
    ),
    includes: [
      L('Heuristic and accessibility audit', 'Audit heuristik dan aksesibilitas'),
      L('One redesigned flow', 'Satu alur yang dirancang ulang'),
      L('Interactive prototype', 'Prototipe interaktif'),
      L('Findings report', 'Laporan temuan'),
    ],
  },
  {
    tier: 'gold' as const,
    price: 6_000_000,
    currency: 'IDR' as const,
    period: 'project' as const,
    description: L(
      'End-to-end product design with a reusable design system.',
      'Desain produk menyeluruh dengan design system yang dapat digunakan ulang.',
    ),
    includes: [
      L('Everything in Basic', 'Semua yang ada di Basic'),
      L('User research and interviews', 'Riset pengguna dan wawancara'),
      L('Complete product design', 'Desain produk lengkap'),
      L('Component library in Figma', 'Pustaka komponen di Figma'),
      L('Developer handoff documentation', 'Dokumentasi serah terima ke pengembang'),
    ],
  },
  {
    tier: 'premium' as const,
    price: 13_000_000,
    currency: 'IDR' as const,
    period: 'project' as const,
    description: L(
      'A design system your team owns, with the testing loop that keeps it honest.',
      'Design system yang dimiliki tim Anda, lengkap dengan siklus pengujian yang menjaganya tetap jujur.',
    ),
    includes: [
      L('Everything in Gold', 'Semua yang ada di Gold'),
      L('Multi-platform design system', 'Design system lintas platform'),
      L('Coded component library', 'Pustaka komponen dalam kode'),
      L('Usability testing rounds', 'Putaran pengujian kebergunaan'),
      L('Accessibility certification to WCAG AA', 'Sertifikasi aksesibilitas hingga WCAG AA'),
      L('12 months of design support', 'Dukungan desain selama 12 bulan'),
    ],
  },
];

export const mockServices: Service[] = [
  {
    id: 'svc_web',
    slug: 'web-app-development',
    name: L('Web & App Development', 'Pengembangan Web & Aplikasi'),
    tagline: L(
      'Production systems, not prototypes.',
      'Sistem produksi, bukan sekadar prototipe.',
    ),
    icon: 'code',
    cover: mockCover('qorv-svc-web', L('Code on a dark screen', 'Kode di layar gelap')),
    gallery: mockGallery(
      'qorv-svc-web-g',
      3,
      L('Development workspace', 'Ruang kerja pengembangan'),
    ),
    description: L(
      'We build web and mobile products that survive contact with real users. Every system ships with typed contracts, automated tests, and the observability needed to run it in production. We do not hand over a prototype and call it a product.',
      'Kami membangun produk web dan mobile yang tahan menghadapi pengguna nyata. Setiap sistem dikirim dengan kontrak bertipe, pengujian otomatis, dan observabilitas yang dibutuhkan untuk menjalankannya di produksi. Kami tidak menyerahkan prototipe lalu menyebutnya produk.',
    ),
    deliverables: [
      L('Production-ready application', 'Aplikasi siap produksi'),
      L('Source code and documentation', 'Kode sumber dan dokumentasi'),
      L('Automated test suite', 'Rangkaian pengujian otomatis'),
      L('Deployment pipeline', 'Pipeline penerapan'),
      L('Admin panel where applicable', 'Panel admin bila relevan'),
      L('Handover session with the team', 'Sesi serah terima bersama tim'),
    ],
    process: [
      {
        id: 'ps_web_1',
        step: 1,
        title: L('Discovery', 'Penggalian'),
        description: L(
          'We map the problem, the users, and the constraints before proposing anything.',
          'Kami memetakan masalah, pengguna, dan batasan sebelum mengusulkan apa pun.',
        ),
        durationLabel: L('1-2 weeks', '1-2 minggu'),
      },
      {
        id: 'ps_web_2',
        step: 2,
        title: L('Architecture', 'Arsitektur'),
        description: L(
          'Data model, API contracts, and rendering strategy are decided and written down.',
          'Model data, kontrak API, dan strategi rendering diputuskan dan didokumentasikan.',
        ),
        durationLabel: L('1 week', '1 minggu'),
      },
      {
        id: 'ps_web_3',
        step: 3,
        title: L('Interface', 'Antarmuka'),
        description: L(
          'The full UI is built against mock data, so it can be reviewed before any backend exists.',
          'Seluruh antarmuka dibangun dengan data tiruan, sehingga bisa ditinjau sebelum backend ada.',
        ),
        durationLabel: L('3-6 weeks', '3-6 minggu'),
      },
      {
        id: 'ps_web_4',
        step: 4,
        title: L('Engineering', 'Rekayasa'),
        description: L(
          'Backend, integrations, and tests land against the interface that was already approved.',
          'Backend, integrasi, dan pengujian dikerjakan di atas antarmuka yang sudah disetujui.',
        ),
        durationLabel: L('3-8 weeks', '3-8 minggu'),
      },
      {
        id: 'ps_web_5',
        step: 5,
        title: L('Launch', 'Peluncuran'),
        description: L(
          'Staged rollout, monitoring, and a support window after go-live.',
          'Peluncuran bertahap, pemantauan, dan masa dukungan setelah rilis.',
        ),
        durationLabel: L('1-2 weeks', '1-2 minggu'),
      },
    ],
    tools: ['Next.js', 'TypeScript', 'PostgreSQL', 'Tailwind CSS', 'Vercel', 'Playwright'],
    packages: webPackages,
    startingPrice: deriveStartingPrice(webPackages),
    currency: 'IDR',
    timelineLabel: L('8-16 weeks', '8-16 minggu'),
    faqs: [
      {
        id: 'faq_web_1',
        question: L('Do you work with an existing codebase?', 'Bisakah menangani kode yang sudah ada?'),
        answer: L(
          'Yes. We start with an audit, then propose whether to extend, refactor, or rebuild - with the reasoning made explicit.',
          'Bisa. Kami mulai dengan audit, lalu mengusulkan apakah dikembangkan, dirapikan, atau dibangun ulang - dengan alasan yang dijelaskan terbuka.',
        ),
      },
      {
        id: 'faq_web_2',
        question: L('Who owns the code?', 'Siapa pemilik kodenya?'),
        answer: L(
          'You do, in full, from the first commit. The repository is yours and we work inside it.',
          'Anda, sepenuhnya, sejak commit pertama. Repositori milik Anda dan kami bekerja di dalamnya.',
        ),
      },
      {
        id: 'faq_web_3',
        question: L('What happens after launch?', 'Bagaimana setelah peluncuran?'),
        answer: L(
          'Every package includes a support window. Beyond that we offer a monthly retainer for maintenance and new features.',
          'Setiap paket sudah termasuk masa dukungan. Setelahnya kami menawarkan retainer bulanan untuk pemeliharaan dan fitur baru.',
        ),
      },
    ],
    relatedServiceIds: ['svc_uiux', 'svc_consulting'],
    status: 'published',
    featured: true,
    order: 0,
    seo: {
      title: L('Web & App Development - QORV', 'Pengembangan Web & Aplikasi - QORV'),
      description: L(
        'Production web and mobile systems built with typed contracts, tests, and observability.',
        'Sistem web dan mobile produksi dengan kontrak bertipe, pengujian, dan observabilitas.',
      ),
      ogImage: null,
    },
    ...stamps('2024-01-15', '2026-06-02'),
  },

  {
    id: 'svc_animation',
    slug: '3d-animation',
    name: L('3D & Animation', '3D & Animasi'),
    tagline: L('Mesh before render. Process is the identity.', 'Mesh sebelum render. Proses adalah identitas.'),
    icon: 'box',
    cover: mockCover('qorv-svc-3d', L('Wireframe mesh study', 'Studi mesh wireframe')),
    gallery: mockGallery('qorv-svc-3d-g', 4, L('3D render study', 'Studi render 3D')),
    description: L(
      'We model, light, and animate products with physical accuracy. Our work shows the wireframe and the mesh before the final render - the work-in-progress aesthetic is deliberate, not a shortcut. Output ranges from short-form social film to real-time WebGL configurators.',
      'Kami memodelkan, mencahayai, dan menganimasikan produk dengan akurasi fisik. Karya kami menampilkan wireframe dan mesh sebelum render akhir - estetika work-in-progress itu disengaja, bukan jalan pintas. Keluarannya mulai dari film pendek media sosial hingga konfigurator WebGL real-time.',
    ),
    deliverables: [
      L('Master film in agreed formats', 'Film utama dalam format yang disepakati'),
      L('Social crops and cutdowns', 'Potongan untuk media sosial'),
      L('Still renders for print and web', 'Render diam untuk cetak dan web'),
      L('Storyboard and animatic', 'Storyboard dan animatic'),
    ],
    process: [
      {
        id: 'ps_3d_1',
        step: 1,
        title: L('Concept', 'Konsep'),
        description: L(
          'Reference gathering, narrative, and a storyboard you sign off before production.',
          'Pengumpulan referensi, narasi, dan storyboard yang Anda setujui sebelum produksi.',
        ),
        durationLabel: L('1 week', '1 minggu'),
      },
      {
        id: 'ps_3d_2',
        step: 2,
        title: L('Modelling', 'Modeling'),
        description: L(
          'Geometry and topology built to spec, reviewed as raw mesh.',
          'Geometri dan topologi dibangun sesuai spesifikasi, ditinjau dalam bentuk mesh mentah.',
        ),
        durationLabel: L('1-3 weeks', '1-3 minggu'),
      },
      {
        id: 'ps_3d_3',
        step: 3,
        title: L('Look development', 'Pengembangan tampilan'),
        description: L(
          'Materials, lighting, and camera language established on a test frame.',
          'Material, pencahayaan, dan bahasa kamera ditetapkan pada satu frame uji.',
        ),
        durationLabel: L('1-2 weeks', '1-2 minggu'),
      },
      {
        id: 'ps_3d_4',
        step: 4,
        title: L('Animation & render', 'Animasi & render'),
        description: L(
          'Motion, simulation, rendering, and colour grade.',
          'Gerak, simulasi, rendering, dan gradasi warna.',
        ),
        durationLabel: L('2-4 weeks', '2-4 minggu'),
      },
    ],
    tools: ['Blender', 'Houdini', 'Redshift', 'After Effects', 'Three.js', 'DaVinci Resolve'],
    packages: animationPackages,
    startingPrice: deriveStartingPrice(animationPackages),
    currency: 'IDR',
    timelineLabel: L('4-10 weeks', '4-10 minggu'),
    faqs: [
      {
        id: 'faq_3d_1',
        question: L('Do you need a physical product to model from?', 'Apakah perlu produk fisik untuk dimodelkan?'),
        answer: L(
          'Not necessarily. CAD files, technical drawings, or a detailed photo set are enough. A physical sample improves material accuracy.',
          'Tidak selalu. Berkas CAD, gambar teknis, atau set foto detail sudah cukup. Sampel fisik membuat akurasi material lebih baik.',
        ),
      },
      {
        id: 'faq_3d_2',
        question: L('Can the assets be reused on the web?', 'Bisakah asetnya dipakai ulang di web?'),
        answer: L(
          'Yes - the Premium package includes real-time WebGL assets optimised for browsers, not just pre-rendered video.',
          'Bisa - paket Premium mencakup aset WebGL real-time yang dioptimalkan untuk peramban, bukan hanya video pra-render.',
        ),
      },
    ],
    relatedServiceIds: ['svc_packaging', 'svc_brand'],
    status: 'published',
    featured: true,
    order: 1,
    seo: {
      title: L('3D & Animation - QORV', '3D & Animasi - QORV'),
      description: L(
        'Product films, real-time WebGL assets, and motion design with physical accuracy.',
        'Film produk, aset WebGL real-time, dan desain gerak dengan akurasi fisik.',
      ),
      ogImage: null,
    },
    ...stamps('2024-02-08', '2026-05-19'),
  },

  {
    id: 'svc_packaging',
    slug: 'packaging-design',
    name: L('Packaging Design', 'Desain Kemasan'),
    tagline: L('Material first. Typography solid.', 'Material dulu. Tipografi solid.'),
    icon: 'package',
    cover: mockCover('qorv-svc-pack', L('Packaging structure study', 'Studi struktur kemasan'), true),
    gallery: mockGallery('qorv-svc-pack-g', 3, L('Packaging mockup', 'Mockup kemasan'), true),
    description: L(
      'Packaging is where the brand becomes an object you can hold. We design structure and surface together - dieline, material, finish, and typography treated as one system. Our packaging work leans on solid type and dominant vantablack and chrome, because shelf impact comes from restraint, not noise.',
      'Kemasan adalah tempat merek berubah menjadi benda yang bisa digenggam. Kami merancang struktur dan permukaan sekaligus - dieline, material, finishing, dan tipografi diperlakukan sebagai satu sistem. Karya kemasan kami bertumpu pada tipografi solid serta dominasi vantablack dan chrome, karena dampak di rak lahir dari kesederhanaan, bukan kebisingan.',
    ),
    deliverables: [
      L('Print-ready dielines', 'Dieline siap cetak'),
      L('Material and finish specification', 'Spesifikasi material dan finishing'),
      L('3D mockups and renders', 'Mockup dan render 3D'),
      L('Production-ready artwork per SKU', 'Artwork siap produksi per SKU'),
    ],
    process: [
      {
        id: 'ps_pack_1',
        step: 1,
        title: L('Structure', 'Struktur'),
        description: L(
          'Format, dieline, and material selected against budget and logistics.',
          'Format, dieline, dan material dipilih sesuai anggaran dan logistik.',
        ),
        durationLabel: L('1-2 weeks', '1-2 minggu'),
      },
      {
        id: 'ps_pack_2',
        step: 2,
        title: L('Surface', 'Permukaan'),
        description: L(
          'Typography, hierarchy, and finish designed on the real dieline.',
          'Tipografi, hierarki, dan finishing dirancang langsung di atas dieline asli.',
        ),
        durationLabel: L('2-3 weeks', '2-3 minggu'),
      },
      {
        id: 'ps_pack_3',
        step: 3,
        title: L('Production', 'Produksi'),
        description: L(
          'Vendor liaison, proofing, and a press check before the full run.',
          'Pendampingan vendor, proofing, dan pemeriksaan cetak sebelum produksi penuh.',
        ),
        durationLabel: L('2-4 weeks', '2-4 minggu'),
      },
    ],
    tools: ['Illustrator', 'Blender', 'Esko ArtiosCAD', 'Pantone', 'InDesign'],
    packages: packagingPackages,
    startingPrice: deriveStartingPrice(packagingPackages),
    currency: 'IDR',
    timelineLabel: L('5-9 weeks', '5-9 minggu'),
    faqs: [
      {
        id: 'faq_pack_1',
        question: L('Do you handle printing?', 'Apakah menangani pencetakan?'),
        answer: L(
          'We do not print, but we manage the vendor relationship, proofing, and press check so the result matches the design.',
          'Kami tidak mencetak, tetapi kami mengelola hubungan dengan vendor, proofing, dan pemeriksaan cetak agar hasilnya sesuai desain.',
        ),
      },
      {
        id: 'faq_pack_2',
        question: L('What about sustainability?', 'Bagaimana dengan keberlanjutan?'),
        answer: L(
          'Material choice is part of the structure phase. We will always show you the recyclable or mono-material option and what it costs.',
          'Pemilihan material adalah bagian dari tahap struktur. Kami selalu menunjukkan opsi daur ulang atau mono-material beserta konsekuensi biayanya.',
        ),
      },
    ],
    relatedServiceIds: ['svc_brand', 'svc_animation'],
    status: 'published',
    featured: false,
    order: 2,
    seo: {
      title: L('Packaging Design - QORV', 'Desain Kemasan - QORV'),
      description: L(
        'Structure and surface designed as one system, from dieline to press check.',
        'Struktur dan permukaan dirancang sebagai satu sistem, dari dieline hingga pemeriksaan cetak.',
      ),
      ogImage: null,
    },
    ...stamps('2024-03-22', '2026-04-11'),
  },

  {
    id: 'svc_brand',
    slug: 'brand-identity',
    name: L('Brand Identity', 'Identitas Merek'),
    tagline: L('Systems, not logos.', 'Sistem, bukan sekadar logo.'),
    icon: 'shapes',
    cover: mockCover('qorv-svc-brand', L('Identity system layout', 'Tata letak sistem identitas')),
    gallery: mockGallery('qorv-svc-brand-g', 4, L('Brand application', 'Penerapan merek')),
    description: L(
      'A logo is one artefact. What a company actually needs is a system: how it speaks, what it looks like in motion, how it behaves at 16 pixels and on a building. We deliver identity as a working system with the rules written down, so it survives being handed to people who were not in the room.',
      'Logo hanyalah satu artefak. Yang sebenarnya dibutuhkan perusahaan adalah sistem: bagaimana ia berbicara, seperti apa wujudnya saat bergerak, bagaimana ia bekerja pada ukuran 16 piksel maupun di dinding gedung. Kami menyerahkan identitas sebagai sistem yang berfungsi dengan aturan yang tertulis, sehingga tetap utuh saat diteruskan ke orang yang tidak ikut dalam prosesnya.',
    ),
    deliverables: [
      L('Logotype and full lockup set', 'Logotype dan set susunan lengkap'),
      L('Colour and typography system', 'Sistem warna dan tipografi'),
      L('Written guideline document', 'Dokumen panduan tertulis'),
      L('Application templates', 'Templat penerapan'),
      L('Motion identity', 'Identitas gerak'),
    ],
    process: [
      {
        id: 'ps_brand_1',
        step: 1,
        title: L('Positioning', 'Positioning'),
        description: L(
          'Audience, competitors, and the single idea the brand has to own.',
          'Audiens, kompetitor, dan satu gagasan yang harus dimiliki merek ini.',
        ),
        durationLabel: L('2 weeks', '2 minggu'),
      },
      {
        id: 'ps_brand_2',
        step: 2,
        title: L('Identity', 'Identitas'),
        description: L(
          'Logotype, palette, and typography developed as one system.',
          'Logotype, palet, dan tipografi dikembangkan sebagai satu sistem.',
        ),
        durationLabel: L('3-4 weeks', '3-4 minggu'),
      },
      {
        id: 'ps_brand_3',
        step: 3,
        title: L('System', 'Sistem'),
        description: L(
          'Rules, templates, and motion - everything needed to apply it without us.',
          'Aturan, templat, dan gerak - semua yang dibutuhkan untuk menerapkannya tanpa kami.',
        ),
        durationLabel: L('2-3 weeks', '2-3 minggu'),
      },
      {
        id: 'ps_brand_4',
        step: 4,
        title: L('Rollout', 'Penerapan'),
        description: L(
          'Handover workshop so the internal team can run the system confidently.',
          'Lokakarya serah terima agar tim internal percaya diri menjalankan sistemnya.',
        ),
        durationLabel: L('1 week', '1 minggu'),
      },
    ],
    tools: ['Illustrator', 'Figma', 'InDesign', 'After Effects', 'Glyphs'],
    packages: brandPackages,
    startingPrice: deriveStartingPrice(brandPackages),
    currency: 'IDR',
    timelineLabel: L('6-12 weeks', '6-12 minggu'),
    faqs: [
      {
        id: 'faq_brand_1',
        question: L('How many logo directions do we see?', 'Berapa arah desain logo yang kami lihat?'),
        answer: L(
          'Two or three, each one a complete system rather than a sketch. We do not present a wall of options to be voted on.',
          'Dua atau tiga, masing-masing berupa sistem utuh, bukan sekadar sketsa. Kami tidak menyodorkan puluhan opsi untuk divoting.',
        ),
      },
      {
        id: 'faq_brand_2',
        question: L('Do you handle trademark checks?', 'Apakah menangani pemeriksaan merek dagang?'),
        answer: L(
          'We run a preliminary search and flag risks, but formal registration should go through your legal counsel.',
          'Kami melakukan penelusuran awal dan menandai risikonya, tetapi pendaftaran resmi sebaiknya melalui penasihat hukum Anda.',
        ),
      },
    ],
    relatedServiceIds: ['svc_packaging', 'svc_uiux'],
    status: 'published',
    featured: true,
    order: 3,
    seo: {
      title: L('Brand Identity - QORV', 'Identitas Merek - QORV'),
      description: L(
        'Identity delivered as a working system, with the rules written down.',
        'Identitas yang diserahkan sebagai sistem berfungsi, dengan aturan yang tertulis.',
      ),
      ogImage: null,
    },
    ...stamps('2024-04-30', '2026-06-20'),
  },

  {
    id: 'svc_uiux',
    slug: 'ui-ux-design',
    name: L('UI/UX Design', 'Desain UI/UX'),
    tagline: L('Interfaces that survive real use.', 'Antarmuka yang tahan penggunaan nyata.'),
    icon: 'layout',
    cover: mockCover('qorv-svc-uiux', L('Interface wireframe', 'Wireframe antarmuka')),
    gallery: mockGallery('qorv-svc-uiux-g', 3, L('Interface design study', 'Studi desain antarmuka')),
    description: L(
      'Design work that starts from the flow, not the screen. We audit what exists, research who uses it, then rebuild the interface as a component system a development team can actually implement without guessing.',
      'Pekerjaan desain yang bermula dari alur, bukan dari layar. Kami mengaudit yang sudah ada, meneliti siapa penggunanya, lalu membangun ulang antarmuka sebagai sistem komponen yang benar-benar bisa diterapkan tim pengembang tanpa menebak-nebak.',
    ),
    deliverables: [
      L('Audit and findings report', 'Laporan audit dan temuan'),
      L('Interactive prototype', 'Prototipe interaktif'),
      L('Component library', 'Pustaka komponen'),
      L('Developer handoff documentation', 'Dokumentasi serah terima ke pengembang'),
    ],
    process: [
      {
        id: 'ps_uiux_1',
        step: 1,
        title: L('Audit', 'Audit'),
        description: L(
          'Heuristic review, accessibility check, and analytics reading of the current product.',
          'Tinjauan heuristik, pemeriksaan aksesibilitas, dan pembacaan analitik produk saat ini.',
        ),
        durationLabel: L('1 week', '1 minggu'),
      },
      {
        id: 'ps_uiux_2',
        step: 2,
        title: L('Research', 'Riset'),
        description: L(
          'Interviews and task observation with real users of the product.',
          'Wawancara dan observasi tugas bersama pengguna nyata produk tersebut.',
        ),
        durationLabel: L('1-2 weeks', '1-2 minggu'),
      },
      {
        id: 'ps_uiux_3',
        step: 3,
        title: L('Design', 'Desain'),
        description: L(
          'Flows, wireframes, and visual design built as a reusable system.',
          'Alur, wireframe, dan desain visual dibangun sebagai sistem yang dapat digunakan ulang.',
        ),
        durationLabel: L('3-5 weeks', '3-5 minggu'),
      },
      {
        id: 'ps_uiux_4',
        step: 4,
        title: L('Validation', 'Validasi'),
        description: L(
          'Prototype testing with users, then revision before handoff.',
          'Pengujian prototipe bersama pengguna, lalu revisi sebelum serah terima.',
        ),
        durationLabel: L('1 week', '1 minggu'),
      },
    ],
    tools: ['Figma', 'Maze', 'Axe', 'Storybook', 'Hotjar'],
    packages: uiuxPackages,
    startingPrice: deriveStartingPrice(uiuxPackages),
    currency: 'IDR',
    timelineLabel: L('5-9 weeks', '5-9 minggu'),
    faqs: [
      {
        id: 'faq_uiux_1',
        question: L('Can you work with our developers?', 'Bisakah bekerja dengan pengembang kami?'),
        answer: L(
          'Yes. Handoff includes a component library and documentation, and we stay available during implementation.',
          'Bisa. Serah terima mencakup pustaka komponen dan dokumentasi, dan kami tetap tersedia selama implementasi.',
        ),
      },
    ],
    relatedServiceIds: ['svc_web', 'svc_brand'],
    status: 'published',
    featured: false,
    order: 4,
    seo: {
      title: L('UI/UX Design - QORV', 'Desain UI/UX - QORV'),
      description: L(
        'Audit, research, and interface systems built for implementation.',
        'Audit, riset, dan sistem antarmuka yang dibangun untuk diterapkan.',
      ),
      ogImage: null,
    },
    ...stamps('2025-08-14', '2026-07-28'),
  },

  {
    id: 'svc_consulting',
    slug: 'technical-consulting',
    name: L('Technical Consulting', 'Konsultasi Teknis'),
    tagline: L('An outside read on your architecture.', 'Pandangan luar atas arsitektur Anda.'),
    icon: 'compass',
    cover: mockCover('qorv-svc-consult', L('Architecture diagram', 'Diagram arsitektur')),
    gallery: [],
    description: L(
      'Sometimes the problem is not that you need a new product - it is that nobody can say why the current one is slow, expensive, or impossible to change. We audit architecture, delivery process, and technical debt, then hand you a prioritised plan with the trade-offs stated plainly. Scope varies too much for fixed packages, so this one is quoted per engagement.',
      'Kadang masalahnya bukan Anda butuh produk baru - melainkan tidak ada yang bisa menjelaskan mengapa produk sekarang lambat, mahal, atau mustahil diubah. Kami mengaudit arsitektur, proses pengiriman, dan utang teknis, lalu menyerahkan rencana berprioritas dengan trade-off yang dijelaskan apa adanya. Lingkupnya terlalu beragam untuk paket tetap, jadi layanan ini ditawarkan per penugasan.',
    ),
    deliverables: [
      L('Architecture audit report', 'Laporan audit arsitektur'),
      L('Prioritised remediation plan', 'Rencana perbaikan berprioritas'),
      L('Cost and risk assessment', 'Penilaian biaya dan risiko'),
      L('Presentation to stakeholders', 'Presentasi kepada pemangku kepentingan'),
    ],
    process: [
      {
        id: 'ps_con_1',
        step: 1,
        title: L('Access', 'Akses'),
        description: L(
          'Codebase, infrastructure, and a conversation with the people who maintain it.',
          'Kode, infrastruktur, dan percakapan dengan orang-orang yang merawatnya.',
        ),
        durationLabel: L('3 days', '3 hari'),
      },
      {
        id: 'ps_con_2',
        step: 2,
        title: L('Analysis', 'Analisis'),
        description: L(
          'Where the cost, risk, and friction actually sit - measured, not guessed.',
          'Di mana biaya, risiko, dan hambatan sebenarnya berada - diukur, bukan ditebak.',
        ),
        durationLabel: L('1-2 weeks', '1-2 minggu'),
      },
      {
        id: 'ps_con_3',
        step: 3,
        title: L('Plan', 'Rencana'),
        description: L(
          'A sequenced plan with effort, impact, and what happens if you do nothing.',
          'Rencana berurutan dengan estimasi usaha, dampak, dan konsekuensi bila tidak dikerjakan.',
        ),
        durationLabel: L('1 week', '1 minggu'),
      },
    ],
    tools: ['Lighthouse', 'k6', 'Grafana', 'Semgrep', 'OpenTelemetry'],
    packages: consultingPackages,
    startingPrice: deriveStartingPrice(consultingPackages),
    currency: 'IDR',
    timelineLabel: L('2-4 weeks', '2-4 minggu'),
    faqs: [
      {
        id: 'faq_con_1',
        question: L('Why is there no fixed price?', 'Mengapa tidak ada harga tetap?'),
        answer: L(
          'Because scope ranges from a two-week read of one service to a quarter-long review of an entire platform. We quote after a short scoping call, at no cost.',
          'Karena lingkupnya berkisar dari telaah dua minggu atas satu layanan hingga tinjauan satu kuartal atas seluruh platform. Kami memberi penawaran setelah panggilan penjajakan singkat, tanpa biaya.',
        ),
      },
      {
        id: 'faq_con_2',
        question: L('Will you also implement the fixes?', 'Apakah perbaikannya juga dikerjakan?'),
        answer: L(
          'We can, through the Web & App Development service. But the audit is deliberately sold separately so the recommendation stays honest.',
          'Bisa, melalui layanan Pengembangan Web & Aplikasi. Namun auditnya sengaja dijual terpisah agar rekomendasinya tetap jujur.',
        ),
      },
    ],
    relatedServiceIds: ['svc_web'],
    status: 'published',
    featured: false,
    order: 5,
    seo: {
      title: L('Technical Consulting - QORV', 'Konsultasi Teknis - QORV'),
      description: L(
        'Architecture audits and prioritised remediation plans, quoted per engagement.',
        'Audit arsitektur dan rencana perbaikan berprioritas, ditawarkan per penugasan.',
      ),
      ogImage: null,
    },
    ...stamps('2025-01-09', '2026-03-05'),
  },
];
