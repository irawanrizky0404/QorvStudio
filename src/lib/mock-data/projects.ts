import type { Project } from '@/types/content';
import { L, stamps } from './helpers';
import { mockCover, mockGallery } from './images';

/**
 * Eight case studies across all five categories.
 * Coverage: one draft (proj_atlas), varied years, every project wired to real
 * serviceIds so the Service ↔ Project reverse lookup has something to resolve.
 */
export const mockProjects: Project[] = [
  {
    id: 'proj_meridian',
    slug: 'meridian-logistics-platform',
    title: L('Meridian Logistics Platform', 'Platform Logistik Meridian'),
    client: 'Meridian Freight',
    category: 'web-app',
    year: 2026,
    summary: L(
      'A dispatch and tracking platform replacing eleven spreadsheets and a whiteboard.',
      'Platform pengiriman dan pelacakan yang menggantikan sebelas spreadsheet dan satu papan tulis.',
    ),
    cover: mockCover('qorv-meridian', L('Logistics dashboard interface', 'Antarmuka dasbor logistik')),
    gallery: mockGallery('qorv-meridian-g', 5, L('Meridian platform screen', 'Layar platform Meridian')),
    challenge: L(
      'Meridian moved 400 shipments a day through a process held together by spreadsheets, WhatsApp groups, and one dispatcher who knew where everything was. Nobody else could answer a customer question without calling him. Growth was capped by a single person\'s memory.',
      'Meridian memindahkan 400 pengiriman per hari lewat proses yang bertumpu pada spreadsheet, grup WhatsApp, dan satu dispatcher yang hafal posisi semuanya. Tidak ada orang lain yang bisa menjawab pertanyaan pelanggan tanpa meneleponnya. Pertumbuhan tertahan oleh ingatan satu orang.',
    ),
    solution: L(
      'We built a dispatch platform around the workflow that already worked, rather than the one a textbook would prescribe. Real-time shipment state, driver mobile handoff, and a customer tracking page that removed most inbound calls. The dispatcher\'s knowledge became a data model instead of a bottleneck.',
      'Kami membangun platform pengiriman di sekitar alur kerja yang memang sudah berjalan, bukan alur yang dianjurkan buku teks. Status pengiriman real-time, serah terima via aplikasi pengemudi, dan halaman pelacakan pelanggan yang memangkas sebagian besar telepon masuk. Pengetahuan sang dispatcher berubah menjadi model data, bukan lagi penyumbat.',
    ),
    outcome: L(
      'Dispatch capacity roughly doubled without new hires. Inbound status calls dropped sharply, and onboarding a new dispatcher went from months to days.',
      'Kapasitas pengiriman kurang lebih berlipat dua tanpa penambahan orang. Telepon menanyakan status turun tajam, dan pelatihan dispatcher baru berubah dari hitungan bulan menjadi hari.',
    ),
    results: [
      { label: L('Dispatch capacity', 'Kapasitas pengiriman'), value: '+118%' },
      { label: L('Inbound status calls', 'Telepon status masuk'), value: '-74%' },
      { label: L('Onboarding time', 'Waktu pelatihan'), value: '3 days' },
    ],
    serviceIds: ['svc_web', 'svc_uiux'],
    stack: ['Next.js', 'TypeScript', 'PostgreSQL', 'Redis', 'Mapbox', 'Vercel'],
    role: L('Product design and full-stack engineering', 'Desain produk dan rekayasa full-stack'),
    durationMonths: 7,
    liveUrl: 'https://example.com/meridian',
    status: 'published',
    featured: true,
    order: 0,
    seo: {
      title: L('Meridian Logistics Platform - QORV', 'Platform Logistik Meridian - QORV'),
      description: L(
        'A dispatch and tracking platform that doubled capacity without new hires.',
        'Platform pengiriman dan pelacakan yang melipatgandakan kapasitas tanpa menambah orang.',
      ),
      ogImage: null,
    },
    ...stamps('2026-01-10', '2026-07-14'),
  },

  {
    id: 'proj_nocturne',
    slug: 'nocturne-coffee-packaging',
    title: L('Nocturne Coffee System', 'Sistem Kemasan Kopi Nocturne'),
    client: 'Nocturne Roasters',
    category: 'packaging',
    year: 2026,
    summary: L(
      'A twelve-SKU packaging system built to read from three metres away.',
      'Sistem kemasan dua belas SKU yang dirancang agar terbaca dari jarak tiga meter.',
    ),
    cover: mockCover('qorv-nocturne', L('Coffee packaging range', 'Rangkaian kemasan kopi'), true),
    gallery: mockGallery('qorv-nocturne-g', 6, L('Nocturne packaging detail', 'Detail kemasan Nocturne'), true),
    challenge: L(
      'Nocturne had twelve single-origin beans and twelve unrelated bag designs. On a shelf they looked like twelve different companies, and staff were reprinting labels by hand every time a lot changed.',
      'Nocturne punya dua belas biji single-origin dan dua belas desain kemasan yang tidak saling terkait. Di rak, semuanya tampak seperti dua belas perusahaan berbeda, dan staf mencetak ulang label secara manual setiap kali lot berganti.',
    ),
    solution: L(
      'One structural system, one typographic grid, and a single variable: an origin band whose position encodes the roast profile. The base design never changes, so reprinting a lot is a one-field edit rather than a redesign.',
      'Satu sistem struktural, satu grid tipografi, dan satu variabel: pita asal yang posisinya mengkodekan profil sangrai. Desain dasarnya tidak pernah berubah, sehingga mencetak ulang satu lot cukup mengubah satu bidang, bukan mendesain ulang.',
    ),
    outcome: L(
      'Shelf recognition improved noticeably in retail feedback, and per-SKU artwork production dropped from days to under an hour.',
      'Pengenalan di rak meningkat nyata menurut umpan balik ritel, dan produksi artwork per SKU turun dari hitungan hari menjadi kurang dari satu jam.',
    ),
    results: [
      { label: L('SKUs unified', 'SKU yang disatukan'), value: '12' },
      { label: L('Artwork turnaround', 'Waktu produksi artwork'), value: '<1 hr' },
      { label: L('Retail listings', 'Penempatan ritel'), value: '+31%' },
    ],
    serviceIds: ['svc_packaging', 'svc_brand'],
    stack: ['Illustrator', 'Esko ArtiosCAD', 'Blender', 'Pantone'],
    role: L('Structural and surface design, production supervision', 'Desain struktur dan permukaan, supervisi produksi'),
    durationMonths: 4,
    liveUrl: null,
    status: 'published',
    featured: true,
    order: 1,
    seo: {
      title: L('Nocturne Coffee System - QORV', 'Sistem Kemasan Kopi Nocturne - QORV'),
      description: L(
        'A twelve-SKU packaging system with one variable and one grid.',
        'Sistem kemasan dua belas SKU dengan satu variabel dan satu grid.',
      ),
      ogImage: null,
    },
    ...stamps('2025-11-03', '2026-05-30'),
  },

  {
    id: 'proj_vantage',
    slug: 'vantage-product-film',
    title: L('Vantage Product Film', 'Film Produk Vantage'),
    client: 'Vantage Audio',
    category: '3d-animation',
    year: 2025,
    summary: L(
      'A 48-second product film that shows the mesh before the render.',
      'Film produk 48 detik yang menampilkan mesh sebelum render akhir.',
    ),
    cover: mockCover('qorv-vantage', L('Audio hardware render', 'Render perangkat audio')),
    gallery: mockGallery('qorv-vantage-g', 5, L('Vantage render frame', 'Frame render Vantage')),
    challenge: L(
      'Vantage was launching a flagship headphone with no physical units available for photography, six weeks before the announcement. The engineering CAD existed; nothing else did.',
      'Vantage meluncurkan headphone unggulan tanpa unit fisik untuk pemotretan, enam minggu sebelum pengumuman. Berkas CAD rekayasa sudah ada; selain itu tidak ada apa-apa.',
    ),
    solution: L(
      'We rebuilt the product from CAD with physically accurate materials, then built the film around the assembly itself - wireframe to solid, component by component. The manufacturing precision became the story instead of a limitation.',
      'Kami membangun ulang produk dari CAD dengan material yang akurat secara fisik, lalu menyusun filmnya di sekitar proses perakitan itu sendiri - dari wireframe ke solid, komponen demi komponen. Presisi manufaktur menjadi ceritanya, bukan keterbatasannya.',
    ),
    outcome: L(
      'The film carried the entire launch campaign, and the 3D assets were reused for the product page and retail displays.',
      'Film ini menopang seluruh kampanye peluncuran, dan aset 3D-nya dipakai ulang untuk halaman produk dan display ritel.',
    ),
    results: [
      { label: L('Launch views', 'Penayangan peluncuran'), value: '2.4M' },
      { label: L('Production time', 'Waktu produksi'), value: '6 wks' },
      { label: L('Assets reused', 'Aset dipakai ulang'), value: '40+' },
    ],
    serviceIds: ['svc_animation'],
    stack: ['Blender', 'Houdini', 'Redshift', 'DaVinci Resolve'],
    role: L('Modelling, look development, animation, grade', 'Modeling, pengembangan tampilan, animasi, gradasi warna'),
    durationMonths: 2,
    liveUrl: 'https://example.com/vantage',
    status: 'published',
    featured: true,
    order: 2,
    seo: {
      title: L('Vantage Product Film - QORV', 'Film Produk Vantage - QORV'),
      description: L(
        'A product film built entirely from CAD, six weeks before launch.',
        'Film produk yang dibangun sepenuhnya dari CAD, enam minggu sebelum peluncuran.',
      ),
      ogImage: null,
    },
    ...stamps('2025-06-18', '2026-02-09'),
  },

  {
    id: 'proj_halden',
    slug: 'halden-identity-system',
    title: L('Halden Identity System', 'Sistem Identitas Halden'),
    client: 'Halden Architecture',
    category: 'branding',
    year: 2025,
    summary: L(
      'An identity for an architecture practice, built to work at 16px and on a facade.',
      'Identitas untuk biro arsitektur, dirancang agar bekerja pada 16 piksel maupun di fasad gedung.',
    ),
    cover: mockCover('qorv-halden', L('Identity system application', 'Penerapan sistem identitas')),
    gallery: mockGallery('qorv-halden-g', 4, L('Halden brand application', 'Penerapan merek Halden')),
    challenge: L(
      'Halden had grown from three architects to forty across two cities, and every office had quietly invented its own version of the brand. Proposals going to the same client looked like they came from different firms.',
      'Halden tumbuh dari tiga arsitek menjadi empat puluh orang di dua kota, dan setiap kantor diam-diam menciptakan versi mereknya sendiri. Proposal untuk klien yang sama tampak berasal dari firma yang berbeda.',
    ),
    solution: L(
      'A single system with hard constraints and few options: one typeface family, a fixed grid, and a signage logic that scales from a business card to a building. We wrote the rules to be obeyed by people with no design training.',
      'Satu sistem dengan batasan tegas dan sedikit pilihan: satu keluarga huruf, grid tetap, dan logika penandaan yang berskala dari kartu nama hingga gedung. Aturannya kami tulis agar bisa dipatuhi orang tanpa latar belakang desain.',
    ),
    outcome: L(
      'Both offices now produce consistent proposals without design review, and the signage system has been applied to nine completed buildings.',
      'Kedua kantor kini menghasilkan proposal yang konsisten tanpa tinjauan desain, dan sistem penandaannya sudah diterapkan pada sembilan gedung yang selesai.',
    ),
    results: [
      { label: L('Offices aligned', 'Kantor yang selaras'), value: '2' },
      { label: L('Buildings signed', 'Gedung bertanda'), value: '9' },
      { label: L('Template adoption', 'Adopsi templat'), value: '100%' },
    ],
    serviceIds: ['svc_brand'],
    stack: ['Illustrator', 'InDesign', 'Figma', 'Glyphs'],
    role: L('Strategy, identity design, guideline authorship', 'Strategi, desain identitas, penulisan panduan'),
    durationMonths: 5,
    liveUrl: null,
    status: 'published',
    featured: false,
    order: 3,
    seo: {
      title: L('Halden Identity System - QORV', 'Sistem Identitas Halden - QORV'),
      description: L(
        'An identity system with hard constraints, built for a distributed practice.',
        'Sistem identitas dengan batasan tegas, dibangun untuk praktik yang tersebar.',
      ),
      ogImage: null,
    },
    ...stamps('2025-03-11', '2026-01-22'),
  },

  {
    id: 'proj_tessera',
    slug: 'tessera-field-app',
    title: L('Tessera Field App', 'Aplikasi Lapangan Tessera'),
    client: 'Tessera Survey',
    category: 'mobile-app',
    year: 2025,
    summary: L(
      'An offline-first survey app for teams working where there is no signal.',
      'Aplikasi survei offline-first untuk tim yang bekerja di wilayah tanpa sinyal.',
    ),
    cover: mockCover('qorv-tessera', L('Field survey application', 'Aplikasi survei lapangan')),
    gallery: mockGallery('qorv-tessera-g', 4, L('Tessera app screen', 'Layar aplikasi Tessera')),
    challenge: L(
      'Tessera\'s surveyors worked in areas with no reliable connectivity, then re-entered a day of paper notes each evening. Transcription errors were routine, and a lost notebook meant a lost site visit.',
      'Surveyor Tessera bekerja di wilayah tanpa konektivitas yang andal, lalu menyalin ulang catatan kertas sehari penuh setiap malam. Kesalahan transkripsi jadi hal biasa, dan buku catatan yang hilang berarti kunjungan lokasi yang hangus.',
    ),
    solution: L(
      'An offline-first app with a local database and conflict-aware sync. Photos, measurements, and GPS are captured on site and reconciled when a connection returns. We designed the sync conflict UI first, because that is where offline apps usually fail.',
      'Aplikasi offline-first dengan basis data lokal dan sinkronisasi yang sadar konflik. Foto, pengukuran, dan GPS direkam di lokasi lalu direkonsiliasi saat koneksi kembali. Kami merancang antarmuka konflik sinkronisasi lebih dulu, karena di situlah aplikasi offline biasanya gagal.',
    ),
    outcome: L(
      'Evening data entry disappeared entirely, and transcription errors fell to near zero across the first survey season.',
      'Entri data malam hari hilang sepenuhnya, dan kesalahan transkripsi turun mendekati nol sepanjang musim survei pertama.',
    ),
    results: [
      { label: L('Data entry time', 'Waktu entri data'), value: '-100%' },
      { label: L('Transcription errors', 'Kesalahan transkripsi'), value: '~0' },
      { label: L('Offline duration', 'Durasi offline'), value: '14 days' },
    ],
    serviceIds: ['svc_web', 'svc_uiux'],
    stack: ['React Native', 'TypeScript', 'SQLite', 'Expo', 'PostGIS'],
    role: L('Product design and mobile engineering', 'Desain produk dan rekayasa mobile'),
    durationMonths: 6,
    liveUrl: null,
    status: 'published',
    featured: false,
    order: 4,
    seo: {
      title: L('Tessera Field App - QORV', 'Aplikasi Lapangan Tessera - QORV'),
      description: L(
        'An offline-first survey app with conflict-aware sync.',
        'Aplikasi survei offline-first dengan sinkronisasi sadar konflik.',
      ),
      ogImage: null,
    },
    ...stamps('2025-01-28', '2025-12-15'),
  },

  {
    id: 'proj_kiln',
    slug: 'kiln-ceramics-commerce',
    title: L('Kiln Ceramics Commerce', 'Perdagangan Keramik Kiln'),
    client: 'Kiln Studio',
    category: 'web-app',
    year: 2024,
    summary: L(
      'A storefront for one-of-a-kind ceramics, where every item is stock of one.',
      'Etalase untuk keramik satu-satunya, di mana setiap barang berstok satu.',
    ),
    cover: mockCover('qorv-kiln', L('Ceramics storefront', 'Etalase keramik'), true),
    gallery: mockGallery('qorv-kiln-g', 4, L('Kiln product photography', 'Fotografi produk Kiln'), true),
    challenge: L(
      'Every Kiln piece is unique, so conventional commerce assumptions broke immediately: no variants, no restocks, and a race condition every time two people opened the same product.',
      'Setiap karya Kiln bersifat unik, sehingga asumsi perdagangan konvensional langsung runtuh: tidak ada varian, tidak ada restock, dan muncul race condition setiap kali dua orang membuka produk yang sama.',
    ),
    solution: L(
      'We treated scarcity as the feature. Soft reservation on add-to-cart, honest real-time availability, and a waitlist that converts to a commission request when a piece sells. The interface tells you the truth about scarcity rather than manufacturing urgency.',
      'Kami memperlakukan kelangkaan sebagai fitur. Reservasi lunak saat menambah ke keranjang, ketersediaan real-time yang jujur, dan daftar tunggu yang berubah menjadi permintaan pesanan khusus ketika sebuah karya terjual. Antarmukanya menyampaikan kelangkaan apa adanya, bukan menciptakan urgensi palsu.',
    ),
    outcome: L(
      'Overselling stopped completely, and the waitlist became a commission pipeline that now accounts for a meaningful share of studio revenue.',
      'Kelebihan penjualan berhenti sepenuhnya, dan daftar tunggu berubah menjadi jalur pesanan khusus yang kini menyumbang porsi berarti dari pendapatan studio.',
    ),
    results: [
      { label: L('Overselling incidents', 'Insiden kelebihan jual'), value: '0' },
      { label: L('Waitlist conversion', 'Konversi daftar tunggu'), value: '23%' },
      { label: L('Checkout completion', 'Penyelesaian checkout'), value: '+41%' },
    ],
    serviceIds: ['svc_web', 'svc_uiux'],
    stack: ['Next.js', 'TypeScript', 'PostgreSQL', 'Stripe', 'Cloudflare'],
    role: L('Full-stack engineering and interface design', 'Rekayasa full-stack dan desain antarmuka'),
    durationMonths: 4,
    liveUrl: 'https://example.com/kiln',
    status: 'published',
    featured: false,
    order: 5,
    seo: {
      title: L('Kiln Ceramics Commerce - QORV', 'Perdagangan Keramik Kiln - QORV'),
      description: L(
        'A storefront designed around scarcity, where every item is stock of one.',
        'Etalase yang dirancang di sekitar kelangkaan, di mana setiap barang berstok satu.',
      ),
      ogImage: null,
    },
    ...stamps('2024-07-02', '2025-09-08'),
  },

  {
    id: 'proj_orbit',
    slug: 'orbit-brand-film',
    title: L('Orbit Brand Film', 'Film Merek Orbit'),
    client: 'Orbit Mobility',
    category: '3d-animation',
    year: 2024,
    summary: L(
      'A brand film assembled from the vehicle\'s own engineering geometry.',
      'Film merek yang dirakit dari geometri rekayasa kendaraan itu sendiri.',
    ),
    cover: mockCover('qorv-orbit', L('Vehicle geometry study', 'Studi geometri kendaraan')),
    gallery: mockGallery('qorv-orbit-g', 3, L('Orbit film frame', 'Frame film Orbit')),
    challenge: L(
      'Orbit wanted a brand film without a hero product shot, because the vehicle was still eight months from production and looked unfinished in every render.',
      'Orbit menginginkan film merek tanpa bidikan produk utama, karena kendaraannya masih delapan bulan dari produksi dan tampak belum jadi di setiap render.',
    ),
    solution: L(
      'We made the incompleteness the subject. The film moves through exploded geometry, structural cross-sections, and motion studies - never resolving into a finished vehicle. It says "being engineered" instead of "for sale".',
      'Kami menjadikan ketidaklengkapan itu sebagai subjeknya. Filmnya bergerak melalui geometri terurai, potongan struktural, dan studi gerak - tanpa pernah berhenti pada kendaraan yang selesai. Ia berkata "sedang direkayasa", bukan "sedang dijual".',
    ),
    outcome: L(
      'The film ran for eleven months of pre-launch communication without ever going stale, and set the visual language for the eventual product launch.',
      'Film ini dipakai selama sebelas bulan komunikasi pra-peluncuran tanpa terasa basi, dan menetapkan bahasa visual untuk peluncuran produk berikutnya.',
    ),
    results: [
      { label: L('Campaign lifespan', 'Usia kampanye'), value: '11 mo' },
      { label: L('Completion rate', 'Tingkat tuntas tonton'), value: '68%' },
      { label: L('Derivative cuts', 'Potongan turunan'), value: '17' },
    ],
    serviceIds: ['svc_animation', 'svc_brand'],
    stack: ['Blender', 'Houdini', 'Redshift', 'After Effects'],
    role: L('Concept, animation direction, post-production', 'Konsep, penyutradaraan animasi, pascaproduksi'),
    durationMonths: 3,
    liveUrl: null,
    status: 'published',
    featured: false,
    order: 6,
    seo: {
      title: L('Orbit Brand Film - QORV', 'Film Merek Orbit - QORV'),
      description: L(
        'A brand film that never resolves into a finished product, by design.',
        'Film merek yang sengaja tidak pernah berhenti pada produk jadi.',
      ),
      ogImage: null,
    },
    ...stamps('2024-09-19', '2025-06-27'),
  },

  {
    id: 'proj_atlas',
    slug: 'atlas-research-portal',
    title: L('Atlas Research Portal', 'Portal Riset Atlas'),
    client: 'Atlas Institute',
    category: 'web-app',
    year: 2026,
    summary: L(
      'A public portal making twenty years of climate research actually searchable.',
      'Portal publik yang membuat dua puluh tahun riset iklim benar-benar bisa ditelusuri.',
    ),
    cover: mockCover('qorv-atlas', L('Research data interface', 'Antarmuka data riset')),
    gallery: mockGallery('qorv-atlas-g', 3, L('Atlas portal screen', 'Layar portal Atlas')),
    challenge: L(
      'Atlas held two decades of climate datasets behind a search that only worked if you already knew the exact filename. Researchers routinely re-ran studies that had already been done.',
      'Atlas menyimpan dua dekade set data iklim di balik pencarian yang hanya berfungsi bila Anda sudah tahu nama berkasnya persis. Peneliti kerap mengulang studi yang sebenarnya sudah pernah dikerjakan.',
    ),
    solution: L(
      'Faceted search over normalised metadata, dataset previews before download, and citation export. We spent most of the project on the metadata model rather than the interface, because that was the actual problem.',
      'Pencarian berfaset di atas metadata yang dinormalisasi, pratinjau set data sebelum diunduh, dan ekspor sitasi. Sebagian besar proyek kami habiskan pada model metadata, bukan antarmuka, karena di situlah masalah sesungguhnya.',
    ),
    outcome: L(
      'Currently in staged rollout with the research team. Early access users report finding relevant datasets in minutes rather than days.',
      'Saat ini dalam peluncuran bertahap bersama tim riset. Pengguna akses awal melaporkan menemukan set data relevan dalam hitungan menit, bukan hari.',
    ),
    results: [
      { label: L('Datasets indexed', 'Set data terindeks'), value: '14,200' },
      { label: L('Search latency', 'Latensi pencarian'), value: '<80ms' },
      { label: L('Years covered', 'Rentang tahun'), value: '20' },
    ],
    serviceIds: ['svc_web', 'svc_consulting'],
    stack: ['Next.js', 'TypeScript', 'PostgreSQL', 'Typesense', 'Python'],
    role: L('Metadata architecture and platform engineering', 'Arsitektur metadata dan rekayasa platform'),
    durationMonths: 9,
    liveUrl: null,
    status: 'draft',
    featured: false,
    order: 7,
    seo: {
      title: L('Atlas Research Portal - QORV', 'Portal Riset Atlas - QORV'),
      description: L(
        'Faceted search across twenty years of climate research datasets.',
        'Pencarian berfaset atas dua puluh tahun set data riset iklim.',
      ),
      ogImage: null,
    },
    ...stamps('2026-02-14', '2026-07-30', null),
  },
];
