/**
 * Versi seed, dipakai sebagai awalan kunci penyimpanan.
 *
 * Menaikkannya membuat aplikasi membaca kunci baru yang belum ada isinya, jadi
 * seed dijalankan ulang dan data seed yang terbaru akhirnya terpakai. Tanpa itu
 * perubahan pada berkas seed tidak pernah sampai ke situs live: `loadOrSeed`
 * hanya menulis kalau kuncinya masih kosong.
 *
 * Data lama tidak dihapus — ia tetap ada di kunci versi sebelumnya dan bisa
 * dibaca kembali kalau perlu. Yang berpindah hanya kunci yang dibaca aplikasi.
 *
 * Naikkan hanya kalau memang bermaksud membuang isi yang sekarang. Suntingan
 * apa pun yang dibuat lewat panel pada versi lama tidak ikut pindah.
 *
 *   v1  data contoh saat membangun
 *   v2  karya, produk, dan setelan sungguhan
 *   v3  galeri produk terisi, cover produk dirancang, cover karya dipertajam
 *   v4  galeri produk memuat dashboard, cover tiap produk berkomposisi sendiri
 *   v5  galeri produk tidak lagi dibatasi enam — seluruh layar yang ada masuk
 *
 * Berkas sendiri, bukan di `driver.ts`, karena `driver.ts` diawali
 * `import 'server-only'` — dan skrip cadangan yang jalan di Node biasa langsung
 * tumbang saat mengimpornya. Sebelum ini nomor versinya ditulis ulang dengan
 * tangan di skrip cadangan, dan sempat tertinggal satu versi tanpa satu pun
 * peringatan: yang tercadangkan justru data yang sudah ditinggalkan.
 */
export const SEED_VERSION = 5;
