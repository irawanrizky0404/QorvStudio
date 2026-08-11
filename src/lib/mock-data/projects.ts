import type { MediaRef, Project } from '@/types/content';
import { L, stamps } from './helpers';
import { WORK_MEDIA } from './work-media';

/**
 * Karya sungguhan.
 *
 * Sebelas proyek yang benar-benar dikerjakan, bukan data karangan. Sumbernya
 * dua: teks dari `works.json` di portofolio pribadi, dan gambar dari folder
 * `phantomstudio/web/public/projects` yang diturunkan ke WebP oleh
 * `npm run import:work`.
 *
 * ── Apa yang diambil apa adanya, dan apa yang disusun ───────────────────────
 *
 * `title`, `client`, `year`, `summary`, `stack`, dan `liveUrl` disalin dari
 * sumber tanpa diubah. Bahasa Inggrisnya juga; teks itu sudah ditulis dengan
 * baik dan menulis ulang hanya akan menurunkannya.
 *
 * `challenge`, `solution`, dan `outcome` **disusun** dengan memecah satu
 * paragraf `description` dari sumber menjadi tiga bagian yang diminta halaman
 * studi kasus. Isinya tidak ditambah — hanya dipotong pada sendi yang sudah ada
 * di kalimatnya, karena hampir semua deskripsi memang ditulis dengan urutan
 * masalah → pendekatan → hasil.
 *
 * Seluruh terjemahan Indonesia **disusun**; sumbernya hanya berbahasa Inggris.
 *
 * `results` dibiarkan kosong di semua proyek. Sumbernya tidak memuat satu pun
 * angka hasil, dan mengarang "+142% konversi" adalah persis kebiasaan yang
 * sedang dibuang dari situs ini. Kolomnya tidak dirender kalau kosong.
 *
 * `durationMonths` null karena tidak tercatat di manapun.
 */

/** Media dari manifes yang dihasilkan skrip impor — ukurannya selalu benar. */
function media(slug: string, key: string, alt: ReturnType<typeof L>): MediaRef {
  const size = WORK_MEDIA[slug]?.[key];
  if (!size) throw new Error(`work-media: ${slug}/${key} tidak ada. Jalankan npm run import:work.`);
  return { url: `/images/work/${slug}/${key}.webp`, alt, width: size[0], height: size[1] };
}

/** Semua kunci galeri yang tersedia untuk sebuah proyek, urut. */
function gallery(slug: string, alt: ReturnType<typeof L>): MediaRef[] {
  return Object.keys(WORK_MEDIA[slug] ?? {})
    .filter((k) => /^\d+$/.test(k))
    .sort()
    .map((k) => media(slug, k, alt));
}

export const mockProjects: Project[] = [
  {
    id: 'proj_nasa',
    slug: 'nasa-space-tech',
    title: L('NASA Space Tech Art Challenge', 'NASA Space Tech Art Challenge'),
    client: 'NASA',
    category: 'illustration',
    year: 2024,
    summary: L(
      'Winner — NASA Space Tech Art Challenge: Imagine Tomorrow. An illustration series merging scientific accuracy with painterly atmosphere to make the technologies of the next century feel as tangible and inevitable as the present.',
      'Pemenang — NASA Space Tech Art Challenge: Imagine Tomorrow. Seri ilustrasi yang menyatukan ketepatan ilmiah dengan atmosfer lukisan, supaya teknologi abad berikutnya terasa senyata dan sepasti hari ini.',
    ),
    cover: media('nasa-space-tech', 'cover', L('NASA Space Tech Art Challenge', 'NASA Space Tech Art Challenge')),
    gallery: gallery('nasa-space-tech', L('Ilustrasi seri NASA', 'Ilustrasi seri NASA')),
    challenge: L(
      'Make emerging space technology feel as real and present as the world that already exists. Scientific illustration demands accuracy; atmospheric, painterly technique demands that accuracy be invisible — that the precision of the underlying research disappear into something that feels intuited rather than calculated.',
      'Membuat teknologi antariksa yang baru lahir terasa senyata dunia yang sudah ada. Ilustrasi ilmiah menuntut ketepatan; teknik atmosferik menuntut ketepatan itu tidak terlihat — presisi risetnya harus larut jadi sesuatu yang terasa dirasakan, bukan dihitung.',
    ),
    solution: L(
      'The works resolve this tension by using observational discipline as their structural foundation, allowing light, texture, and compositional atmosphere to carry the emotional weight on top.',
      'Ketegangan itu diselesaikan dengan menjadikan disiplin observasi sebagai kerangkanya, lalu membiarkan cahaya, tekstur, dan atmosfer komposisi yang membawa bobot emosinya di atas.',
    ),
    outcome: L(
      'Selected as a winner in NASA Space Tech Art Challenge: Imagine Tomorrow. The technologies depicted are real, in development, and consequential. The illustrations argue that they are also, already, beautiful.',
      'Terpilih sebagai pemenang NASA Space Tech Art Challenge: Imagine Tomorrow. Teknologi yang digambarkan nyata, sedang dikembangkan, dan berdampak. Ilustrasinya berargumen bahwa semuanya juga, sudah sejak sekarang, indah.',
    ),
    results: [],
    /* Tanpa tautan layanan: ini karya kompetisi, bukan pekerjaan yang dijual
       lewat salah satu layanan di situs ini. Begitu juga dua karya pribadi. */
    serviceIds: [],
    stack: ['Illustration', 'Space', 'Award', 'NASA'],
    role: L('Illustration, art direction', 'Ilustrasi, arahan seni'),
    durationMonths: null,
    liveUrl: 'https://www.nasa.gov/image-article/winners-named-in-nasa-space-tech-art-challenge/',
    status: 'published',
    featured: true,
    order: 0,
    seo: {
      title: L('NASA Space Tech Art Challenge — Winner', 'NASA Space Tech Art Challenge — Pemenang'),
      description: L(
        'Winning illustration series for NASA Space Tech Art Challenge: Imagine Tomorrow.',
        'Seri ilustrasi pemenang NASA Space Tech Art Challenge: Imagine Tomorrow.',
      ),
      ogImage: null,
    },
    ...stamps('2024-06-01', '2024-06-01'),
  },

  {
    id: 'proj_sleepstack',
    slug: 'sleepstack',
    title: L('Sleepstack — Branding & Packaging', 'Sleepstack — Merek & Kemasan'),
    client: 'Sleepstack',
    category: 'packaging',
    year: 2024,
    summary: L(
      'Complete brand identity and packaging system for Sleepstack — a sleep wellness company from the Netherlands, built around precision, calm, and the language of rest.',
      'Sistem identitas dan kemasan lengkap untuk Sleepstack — perusahaan kesehatan tidur dari Belanda, dibangun di sekitar presisi, ketenangan, dan bahasa istirahat.',
    ),
    cover: media('sleepstack', 'cover', L('Sleepstack branding', 'Merek Sleepstack')),
    gallery: gallery('sleepstack', L('Sistem kemasan Sleepstack', 'Sistem kemasan Sleepstack')),
    challenge: L(
      'Sleepstack required an identity that could communicate the feeling of rest before any product was opened. The packaging had to perform across both clinical retail environments and direct-to-consumer contexts.',
      'Sleepstack butuh identitas yang menyampaikan rasa istirahat sebelum satu produk pun dibuka. Kemasannya harus bekerja baik di rak retail klinis maupun dalam konteks kirim langsung ke konsumen.',
    ),
    solution: L(
      'The system — spanning primary mark, typographic hierarchy, and full packaging range — uses controlled negative space, a restrained voice, and a palette drawn from the transitional light between evening and sleep.',
      'Sistemnya — logo utama, hierarki tipografi, sampai rangkaian kemasan penuh — memakai ruang kosong yang terkendali, suara yang menahan diri, dan palet yang diambil dari cahaya peralihan antara petang dan tidur.',
    ),
    outcome: L(
      'Every touchpoint in the system was designed to feel like a promise: measured, considered, and reliable — maintaining its quality of quiet confidence in both retail and direct contexts.',
      'Setiap titik sentuh dirancang terasa seperti janji: terukur, dipikirkan, dan bisa diandalkan — menjaga rasa percaya diri yang tenang di kedua konteks itu.',
    ),
    results: [],
    serviceIds: ['svc_packaging', 'svc_brand'],
    stack: ['Branding', 'Packaging', 'Identity', 'Graphic Design'],
    role: L('Brand identity, packaging design', 'Identitas merek, desain kemasan'),
    durationMonths: null,
    liveUrl: 'https://sleepstack.nl/',
    status: 'published',
    featured: true,
    order: 1,
    seo: {
      title: L('Sleepstack — Branding & Packaging', 'Sleepstack — Merek & Kemasan'),
      description: L(
        'Full brand identity and packaging system for a Dutch sleep wellness company.',
        'Identitas merek dan sistem kemasan lengkap untuk perusahaan kesehatan tidur asal Belanda.',
      ),
      ogImage: null,
    },
    ...stamps('2024-05-01', '2024-05-01'),
  },

  {
    id: 'proj_cooldown',
    slug: 'cooldown',
    title: L('Cooldown — Urban Apparel Graphics', 'Cooldown — Grafis Apparel Urban'),
    client: 'Cooldown',
    category: 'illustration',
    year: 2024,
    summary: L(
      "Garment illustration for Cooldown's urban apparel line — bold graphics that hold their impact at distance and reward close inspection, drawn from street culture, vintage sportswear, and the visual language of the city.",
      'Ilustrasi garmen untuk lini apparel urban Cooldown — grafis tegas yang tetap berdampak dari jauh dan tetap menarik dari dekat, ditarik dari budaya jalanan, sportswear lawas, dan bahasa visual kota.',
    ),
    cover: media('cooldown', 'cover', L('Cooldown apparel graphics', 'Grafis apparel Cooldown')),
    gallery: gallery('cooldown', L('Seri grafis Cooldown', 'Seri grafis Cooldown')),
    challenge: L(
      'Apparel illustration operates under demanding constraints: the image must survive reduction to a chest or back print, hold its impact across a range of fabric colors, and remain interesting both at five meters and at arm’s length.',
      'Ilustrasi apparel bekerja di bawah batasan yang keras: gambarnya harus selamat saat diperkecil jadi cetak dada atau punggung, tetap kuat di berbagai warna kain, dan tetap menarik baik dari lima meter maupun sejarak lengan.',
    ),
    solution: L(
      'The series responds by working with iconography rather than fine detail — images built as clear graphic statements that read immediately from across a room, but contain enough textural layering to reward sustained attention.',
      'Serinya menjawab dengan bekerja lewat ikonografi, bukan detail halus — gambar yang disusun sebagai pernyataan grafis yang langsung terbaca dari seberang ruangan, tapi menyimpan cukup lapisan tekstur untuk dinikmati lebih lama.',
    ),
    outcome: L(
      'The visual references move freely between vintage American sportswear graphics, the mark-making traditions of urban street culture, and the compressed iconography of city life.',
      'Rujukan visualnya bergerak bebas antara grafis sportswear Amerika lawas, tradisi coretan budaya jalanan, dan ikonografi padat kehidupan kota.',
    ),
    results: [],
    serviceIds: ['svc_brand'],
    stack: ['Illustration', 'Apparel', 'Urban'],
    role: L('Illustration, apparel graphics', 'Ilustrasi, grafis apparel'),
    durationMonths: null,
    liveUrl: 'https://cooldown.me/',
    status: 'published',
    featured: true,
    order: 2,
    seo: {
      title: L('Cooldown — Urban Apparel Graphics', 'Cooldown — Grafis Apparel Urban'),
      description: L(
        'Garment illustration series for an urban apparel line.',
        'Seri ilustrasi garmen untuk lini apparel urban.',
      ),
      ogImage: null,
    },
    ...stamps('2024-04-01', '2024-04-01'),
  },

  {
    id: 'proj_myair0',
    slug: 'myair0',
    title: L('MyAir0 — 3D Product Render', 'MyAir0 — Render Produk 3D'),
    client: 'MyAir0',
    category: '3d-animation',
    year: 2024,
    summary: L(
      'High-fidelity 3D renders and animation reel for MyAir0 — a consumer air technology brand, spanning multiple colorways and built for digital and e-commerce deployment.',
      'Render 3D beresolusi tinggi dan reel animasi untuk MyAir0 — merek teknologi udara konsumen, mencakup beberapa varian warna dan disiapkan untuk kanal digital dan e-commerce.',
    ),
    cover: media('myair0', 'cover', L('MyAir0 product render', 'Render produk MyAir0')),
    gallery: gallery('myair0', L('Render MyAir0', 'Render MyAir0')),
    challenge: L(
      'Maintaining absolute material consistency across wildly different color treatments and lighting scenarios — each variant needed to read as the same product, shot with the same production quality, while occupying an entirely different palette.',
      'Menjaga konsistensi material secara mutlak di tengah perlakuan warna dan skenario pencahayaan yang jauh berbeda — tiap varian harus terbaca sebagai produk yang sama, diambil dengan kualitas produksi yang sama, meski paletnya berlainan sepenuhnya.',
    ),
    solution: L(
      'A comprehensive 3D visual suite: product renders across multiple colorways and surface configurations, lifestyle contextualizations, and a marketing-ready animation reel for use across digital channels.',
      'Satu rangkaian visual 3D menyeluruh: render produk lintas varian warna dan konfigurasi permukaan, penempatan dalam konteks pemakaian, dan reel animasi siap pakai untuk kanal digital.',
    ),
    outcome: L(
      'The renders were built to scale cleanly from e-commerce thumbnail to full-size advertising format, with a product precision that holds at any resolution.',
      'Rendernya dibangun agar tetap bersih dari thumbnail e-commerce sampai format iklan ukuran penuh, dengan presisi produk yang bertahan di resolusi mana pun.',
    ),
    results: [],
    serviceIds: ['svc_animation'],
    stack: ['3D', 'Product Render', 'Animation', 'E-commerce'],
    role: L('3D modelling, lighting, animation', 'Pemodelan 3D, pencahayaan, animasi'),
    durationMonths: null,
    liveUrl: 'https://myair0.com/',
    status: 'published',
    featured: true,
    order: 3,
    seo: {
      title: L('MyAir0 — 3D Product Render', 'MyAir0 — Render Produk 3D'),
      description: L(
        'Product renders and animation reel for a consumer air technology brand.',
        'Render produk dan reel animasi untuk merek teknologi udara konsumen.',
      ),
      ogImage: null,
    },
    ...stamps('2024-03-01', '2024-03-01'),
  },

  {
    id: 'proj_roombase',
    slug: 'roombase',
    title: L('Roombase — Product Design', 'Roombase — Desain Produk'),
    client: 'Roombase',
    category: 'ui-ux',
    year: 2023,
    summary: L(
      'Digital product design for Roombase — a room-finding platform built around reducing the cognitive friction of a stressful decision through clear spatial hierarchy, warm typography, and considered flows.',
      'Desain produk digital untuk Roombase — platform pencari kamar yang dibangun untuk mengurangi beban pikiran dalam keputusan yang menegangkan, lewat hierarki ruang yang jelas, tipografi yang hangat, dan alur yang dipikirkan.',
    ),
    cover: media('roombase', 'cover', L('Roombase product design', 'Desain produk Roombase')),
    gallery: gallery('roombase', L('Antarmuka Roombase', 'Antarmuka Roombase')),
    challenge: L(
      "Roombase serves an audience in the middle of one of life's more genuinely stressful processes: finding a place to live. The design had to respond to that emotional context, not just to a feature list.",
      'Roombase melayani orang yang sedang berada di tengah salah satu proses paling menegangkan dalam hidup: mencari tempat tinggal. Desainnya harus menjawab konteks emosional itu, bukan sekadar daftar fitur.',
    ),
    solution: L(
      'Spatial metaphors guide the information architecture; typography is approachable without being casual; the user flow was structured to give each decision room to breathe rather than presenting all options simultaneously.',
      'Metafora ruang menuntun arsitektur informasinya; tipografinya ramah tanpa jadi santai; alurnya disusun agar tiap keputusan punya ruang bernapas, bukan menyodorkan semua pilihan sekaligus.',
    ),
    outcome: L(
      'The result is a digital product that feels like assistance — something that understands what its users are experiencing and works alongside them rather than at them.',
      'Hasilnya produk digital yang terasa seperti bantuan — sesuatu yang paham apa yang sedang dialami penggunanya dan bekerja bersama mereka, bukan menghadapi mereka.',
    ),
    results: [],
    serviceIds: ['svc_uiux'],
    stack: ['UI/UX', 'Product Design', 'Digital'],
    role: L('Product design, UI/UX', 'Desain produk, UI/UX'),
    durationMonths: null,
    liveUrl: 'https://roombase.com/',
    status: 'published',
    featured: true,
    order: 4,
    seo: {
      title: L('Roombase — Product Design', 'Roombase — Desain Produk'),
      description: L(
        'UI/UX and product design for a room-finding platform.',
        'UI/UX dan desain produk untuk platform pencari kamar.',
      ),
      ogImage: null,
    },
    ...stamps('2023-09-01', '2023-09-01'),
  },

  {
    id: 'proj_glass_mousepad',
    slug: 'glass-mousepad',
    title: L('Glass Mousepad — Product Design & Animation', 'Glass Mousepad — Desain Produk & Animasi'),
    client: 'Private client (Dubai)',
    category: '3d-animation',
    year: 2024,
    summary: L(
      'High-end 3D product visualisation and animation for a premium glass mousepad — a commission demanding complete material fidelity and precision light behavior.',
      'Visualisasi dan animasi produk 3D kelas atas untuk mousepad kaca premium — pekerjaan yang menuntut kesetiaan material penuh dan perilaku cahaya yang presisi.',
    ),
    cover: media('glass-mousepad', 'cover', L('Glass mousepad render', 'Render mousepad kaca')),
    gallery: gallery('glass-mousepad', L('Studi produk mousepad kaca', 'Studi produk mousepad kaca')),
    challenge: L(
      'Glass presents the most demanding challenges in material simulation — refraction, partial reflection, surface clarity, and the way light bends through solid transparent geometry all have to be resolved simultaneously, and a single incorrect setting reads immediately as false.',
      'Kaca adalah tantangan tersulit dalam simulasi material — refraksi, pantulan sebagian, kejernihan permukaan, dan cara cahaya membelok di dalam geometri transparan padat harus diselesaikan sekaligus, dan satu setelan keliru langsung terbaca palsu.',
    ),
    solution: L(
      'A full 3D product study for a Dubai-based technology accessories company, with every frame constructed to make the object feel physically present.',
      'Satu studi produk 3D penuh untuk perusahaan aksesori teknologi berbasis Dubai, dengan tiap frame disusun supaya objeknya terasa benar-benar ada.',
    ),
    outcome: L(
      'Final deliverables span photorealistic stills across multiple studio lighting configurations and a seamless product animation loop built for digital marketing and e-commerce deployment.',
      'Keluarannya berupa still fotorealistik di beberapa konfigurasi pencahayaan studio, plus satu loop animasi produk mulus untuk pemasaran digital dan e-commerce.',
    ),
    results: [],
    serviceIds: ['svc_animation'],
    stack: ['3D', 'Product Design', 'Animation', 'Render'],
    role: L('3D product design, lighting, animation', 'Desain produk 3D, pencahayaan, animasi'),
    durationMonths: null,
    liveUrl: null,
    status: 'published',
    featured: false,
    order: 5,
    seo: {
      title: L('Glass Mousepad — Product Design & Animation', 'Glass Mousepad — Desain Produk & Animasi'),
      description: L(
        '3D product visualisation and animation for a premium glass desk peripheral.',
        'Visualisasi dan animasi produk 3D untuk peranti meja kaca premium.',
      ),
      ogImage: null,
    },
    ...stamps('2024-02-01', '2024-02-01'),
  },

  {
    id: 'proj_orthosis',
    slug: 'orthosis-shock',
    title: L('Orthosis Shock — Industrial Design', 'Orthosis Shock — Desain Industri'),
    client: 'Private client (Belgium)',
    category: '3d-animation',
    year: 2024,
    summary: L(
      'Precision industrial 3D modelling and presentation renders for a custom orthosis shock component — a Belgian prosthetics and orthotics commission requiring the highest degree of mechanical accuracy.',
      'Pemodelan 3D industri presisi dan render presentasi untuk komponen shock orthosis khusus — pekerjaan dari perusahaan prostetik dan ortotik Belgia yang menuntut ketepatan mekanis tertinggi.',
    ),
    cover: media('orthosis-shock', 'cover', L('Orthosis shock component', 'Komponen shock orthosis')),
    gallery: gallery('orthosis-shock', L('Render komponen orthosis', 'Render komponen orthosis')),
    challenge: L(
      'Every joint tolerance, material thickness, surface finish, and mechanical interface required precise translation from client technical documentation into rendered form.',
      'Setiap toleransi sambungan, ketebalan material, hasil akhir permukaan, dan antarmuka mekanis harus diterjemahkan persis dari dokumentasi teknis klien ke bentuk yang dirender.',
    ),
    solution: L(
      'An industrial 3D design project operating at the intersection of engineering and presentation — demanding both modelling discipline and an eye for the presentation qualities that allow a technical object to communicate its own integrity.',
      'Proyek desain 3D industri yang berdiri di persimpangan rekayasa dan presentasi — menuntut disiplin pemodelan sekaligus kepekaan pada kualitas presentasi yang membuat objek teknis menyampaikan integritasnya sendiri.',
    ),
    outcome: L(
      'Final deliverables included multi-angle renders suitable for client approval and downstream production documentation.',
      'Keluarannya mencakup render multi-sudut untuk persetujuan klien dan dokumentasi produksi lanjutan.',
    ),
    results: [],
    serviceIds: ['svc_animation'],
    stack: ['3D', 'Industrial Design', 'Product', 'Medical'],
    role: L('Industrial 3D modelling, presentation renders', 'Pemodelan 3D industri, render presentasi'),
    durationMonths: null,
    liveUrl: null,
    status: 'published',
    featured: false,
    order: 6,
    seo: {
      title: L('Orthosis Shock — Industrial Design', 'Orthosis Shock — Desain Industri'),
      description: L(
        'Precision 3D modelling for a prosthetics and orthotics component.',
        'Pemodelan 3D presisi untuk komponen prostetik dan ortotik.',
      ),
      ogImage: null,
    },
    ...stamps('2024-01-15', '2024-01-15'),
  },

  {
    id: 'proj_cartel_clinic',
    slug: 'cartel-clinic',
    title: L('Cartel Clinic — Interior Visualisation', 'Cartel Clinic — Visualisasi Interior'),
    client: 'Private client',
    category: '3d-animation',
    year: 2024,
    summary: L(
      'Architectural 3D interior visualisation for Cartel Clinic — a bold, industrial-aesthetic clinic space where raw materiality meets clinical precision.',
      'Visualisasi interior arsitektural 3D untuk Cartel Clinic — ruang klinik beraura industri yang tegas, tempat material mentah bertemu presisi klinis.',
    ),
    cover: media('cartel-clinic', 'cover', L('Cartel Clinic interior', 'Interior Cartel Clinic')),
    gallery: gallery('cartel-clinic', L('Visualisasi interior Cartel Clinic', 'Visualisasi interior Cartel Clinic')),
    challenge: L(
      'An unusual brief: a clinic space that should feel anything but clinical — while maintaining the spatial clarity and functional logic that a medical environment demands. Resolving these two registers without compromise was the central design challenge.',
      'Sebuah permintaan yang tidak biasa: ruang klinik yang justru tidak boleh terasa klinis — sambil tetap menjaga kejernihan ruang dan logika fungsi yang dituntut lingkungan medis. Menyelesaikan dua nada itu tanpa kompromi adalah inti tantangannya.',
    ),
    solution: L(
      'The interior draws its language from industrial architecture — raw concrete panels, exposed steel profiles, deliberate structural asymmetry.',
      'Interiornya mengambil bahasa dari arsitektur industri — panel beton mentah, profil baja terekspos, dan asimetri struktural yang disengaja.',
    ),
    outcome: L(
      'The visualisation captures this tension across multiple angles, showing how aggressive materiality and precision lighting can coexist within the same space and produce something that feels simultaneously confrontational and considered.',
      'Visualisasinya menangkap ketegangan itu dari beberapa sudut, memperlihatkan bagaimana material yang agresif dan pencahayaan presisi bisa hidup bersama dalam satu ruang dan menghasilkan sesuatu yang sekaligus menantang dan terpikirkan.',
    ),
    results: [],
    serviceIds: ['svc_animation'],
    stack: ['3D', 'Archviz', 'Interior', 'Architecture'],
    role: L('3D interior visualisation', 'Visualisasi interior 3D'),
    durationMonths: null,
    liveUrl: null,
    status: 'published',
    featured: false,
    order: 7,
    seo: {
      title: L('Cartel Clinic — Interior Visualisation', 'Cartel Clinic — Visualisasi Interior'),
      description: L(
        'Architectural 3D visualisation for an industrial-aesthetic clinic interior.',
        'Visualisasi arsitektural 3D untuk interior klinik beraura industri.',
      ),
      ogImage: null,
    },
    ...stamps('2024-01-01', '2024-01-01'),
  },

  {
    id: 'proj_f_this_party',
    slug: 'f-this-party',
    title: L('F--- This Party — Album Artwork', 'F--- This Party — Artwork Album'),
    client: 'Personal work',
    category: 'branding',
    year: 2024,
    summary: L(
      'Visual identity and artwork for an underground music release — raw graphic energy at the collision of street culture, defiance, and album art.',
      'Identitas visual dan artwork untuk rilisan musik bawah tanah — energi grafis mentah di titik tabrakan budaya jalanan, pembangkangan, dan seni sampul album.',
    ),
    cover: media('f-this-party', 'cover', L('F--- This Party artwork', 'Artwork F--- This Party')),
    gallery: gallery('f-this-party', L('Seri poster F--- This Party', 'Seri poster F--- This Party')),
    challenge: L(
      'A release rooted in confrontation and underground energy needed a visual system that communicates a position before the viewer has consciously registered the image.',
      'Rilisan yang berakar pada konfrontasi dan energi bawah tanah butuh sistem visual yang menyampaikan sikap sebelum penontonnya sadar sedang melihat apa.',
    ),
    solution: L(
      'The poster series uses overloaded composition, distressed typography, and deliberate visual noise to construct an aesthetic that channels the physical experience of underground music — the volume, the density, the refusal to be polite.',
      'Seri posternya memakai komposisi berjejal, tipografi yang dirusak, dan derau visual yang disengaja untuk membangun estetika yang menyalurkan pengalaman fisik musik bawah tanah — volumenya, kepadatannya, penolakannya untuk sopan.',
    ),
    outcome: L(
      'What began as an album artwork commission expanded into a complete visual system. These are not refinement exercises — they are designed to be felt before they are read.',
      'Yang berawal sebagai pesanan artwork album berkembang jadi sistem visual utuh. Ini bukan latihan memperhalus — ini dirancang untuk dirasakan sebelum dibaca.',
    ),
    results: [],
    serviceIds: ['svc_brand'],
    stack: ['3D', 'Poster', 'Punk'],
    role: L('Art direction, album artwork', 'Arahan seni, artwork album'),
    durationMonths: null,
    liveUrl: 'https://open.spotify.com/album/0vWDFLVEPSPjY3amshg8IV',
    status: 'published',
    featured: false,
    order: 8,
    seo: {
      title: L('F--- This Party — Album Artwork', 'F--- This Party — Artwork Album'),
      description: L(
        'Visual identity and poster series for an underground music release.',
        'Identitas visual dan seri poster untuk rilisan musik bawah tanah.',
      ),
      ogImage: null,
    },
    ...stamps('2024-02-15', '2024-02-15'),
  },

  {
    id: 'proj_dread_runaway',
    slug: 'dread-runaway',
    title: L('Dread Runaway', 'Dread Runaway'),
    client: 'Personal work',
    category: 'illustration',
    year: 2024,
    summary: L(
      'A series of dark, urgent 3D works examining flight and fear — figures caught mid-escape, always facing away, always at the edge of the frame and the edge of disappearing.',
      'Seri karya 3D yang gelap dan mendesak tentang pelarian dan ketakutan — sosok yang tertangkap di tengah kabur, selalu memunggungi, selalu di tepi bingkai dan di tepi menghilang.',
    ),
    cover: media('dread-runaway', 'cover', L('Dread Runaway series', 'Seri Dread Runaway')),
    gallery: gallery('dread-runaway', L('Seri Dread Runaway', 'Seri Dread Runaway')),
    challenge: L(
      'A single compositional rule imposed before the first mark was made: the figure is always in motion, always facing away from the viewer, and always at least partially outside the frame.',
      'Satu aturan komposisi ditetapkan sebelum goresan pertama: sosoknya selalu bergerak, selalu memunggungi penonton, dan selalu setidaknya sebagian berada di luar bingkai.',
    ),
    solution: L(
      'The palette is deliberately limited and dark; motion is conveyed through posture and directional force rather than blur or explicit movement indicators.',
      'Paletnya sengaja dibatasi dan gelap; gerak disampaikan lewat postur dan arah dorongan, bukan lewat blur atau penanda gerak yang gamblang.',
    ),
    outcome: L(
      'The constraint creates a consistent emotional condition across the series — the viewer arrives too late, the subject is already leaving. These are images of urgency rendered in stillness.',
      'Batasan itu menciptakan satu kondisi emosi yang konsisten di seluruh seri — penonton datang terlambat, subjeknya sudah pergi. Ini gambar tentang ketergesaan yang dirender dalam diam.',
    ),
    results: [],
    serviceIds: [],
    stack: ['3D', 'Dark', 'Figurative'],
    role: L('Concept, 3D, art direction', 'Konsep, 3D, arahan seni'),
    durationMonths: null,
    liveUrl: null,
    status: 'published',
    featured: false,
    order: 9,
    seo: {
      title: L('Dread Runaway', 'Dread Runaway'),
      description: L(
        'A dark 3D series on flight and fear.',
        'Seri 3D gelap tentang pelarian dan ketakutan.',
      ),
      ogImage: null,
    },
    ...stamps('2024-03-15', '2024-03-15'),
  },

  {
    id: 'proj_ghibli_interior',
    slug: 'ghibli-interior',
    title: L('Ghibli Interior Study', 'Studi Interior Ghibli'),
    client: 'Personal work',
    category: '3d-animation',
    year: 2024,
    summary: L(
      "A photorealistic 3D interior drawn entirely from the warm, painterly world of Studio Ghibli — the translation of animation's emotional atmosphere into a physically rendered space.",
      'Interior 3D fotorealistik yang sepenuhnya ditarik dari dunia hangat dan bernuansa lukisan Studio Ghibli — menerjemahkan atmosfer emosional animasi ke ruang yang dirender secara fisik.',
    ),
    cover: media('ghibli-interior', 'cover', L('Ghibli interior study', 'Studi interior Ghibli')),
    gallery: gallery('ghibli-interior', L('Studi interior Ghibli', 'Studi interior Ghibli')),
    challenge: L(
      'A formal question: how do you render something fundamentally painterly in a medium defined by physical accuracy?',
      'Satu pertanyaan bentuk: bagaimana merender sesuatu yang pada dasarnya bernuansa lukisan, di medium yang justru didefinisikan oleh ketepatan fisik?',
    ),
    solution: L(
      'Each object was chosen not for its realism but for its emotional function — a kettle catching afternoon light, the curl of a curtain at the window. The lighting was reverse-engineered from specific frames across multiple films.',
      'Tiap objek dipilih bukan karena realismenya, tapi karena fungsi emosinya — ceret yang menangkap cahaya sore, lengkung tirai di jendela. Pencahayaannya dibongkar-ulang dari frame-frame tertentu di beberapa film.',
    ),
    outcome: L(
      'The resulting environment is not a reproduction of any single film but a distillation: a room that could contain any of them, suffused with the sensation that someone meaningful was just here.',
      'Ruang yang dihasilkan bukan tiruan satu film tertentu, melainkan saripatinya: kamar yang bisa memuat film mana pun di antaranya, dipenuhi rasa bahwa seseorang yang berarti baru saja ada di situ.',
    ),
    results: [],
    serviceIds: [],
    stack: ['3D', 'Archviz', 'Interior'],
    role: L('3D environment, lighting', 'Lingkungan 3D, pencahayaan'),
    durationMonths: null,
    liveUrl: null,
    status: 'published',
    featured: false,
    order: 10,
    seo: {
      title: L('Ghibli Interior Study', 'Studi Interior Ghibli'),
      description: L(
        'A photorealistic 3D interior drawn from the world of Studio Ghibli.',
        'Interior 3D fotorealistik yang ditarik dari dunia Studio Ghibli.',
      ),
      ogImage: null,
    },
    ...stamps('2024-04-15', '2024-04-15'),
  },
];
