# Logo QORV

Berkas di folder ini **dihasilkan**, bukan digambar. Sumbernya satu:
`scripts/make-logos.tsx`, yang merender logotype dari huruf Space Grotesk yang
di-vendor di `src/app/_brand/space-grotesk-700.ttf` — font yang sama dengan yang
dipakai situs, favicon, dan gambar Open Graph.

Regenerasi setelah mengubah warna atau ukuran:

```bash
npm run logos
```

Jangan menyunting PNG atau JPG di sini dengan tangan. Suntingan itu akan hilang
pada regenerasi berikutnya, dan logo di berkas ini akan menyimpang dari logo di
situs — persis hal yang dicegah dengan menghasilkannya dari satu sumber.

---

## Isi

Setiap nama tersedia dalam **`.png`** dan **`.jpg`**.

### Wordmark — 2400 × 700

| Berkas | Pakai untuk |
| --- | --- |
| `qorv-wordmark-ink` | Latar transparan, tinta. Tempel di atas latar terang apa saja |
| `qorv-wordmark-paper` | Latar transparan, kertas. Untuk latar gelap |
| `qorv-wordmark-ink-on-paper` | Bidangnya ikut, warna merek |
| `qorv-wordmark-paper-on-ink` | Bidangnya ikut, versi terbalik |
| `qorv-wordmark-black-on-white` | Hitam putih murni |
| `qorv-wordmark-white-on-black` | Hitam putih murni, terbalik |

### Persegi — 1024 × 1024

Wordmark utuh di dalam bidang 1:1, untuk tempat yang menolak rasio lebar: foto
profil, avatar, petak app store.

`qorv-square-ink-on-paper` · `qorv-square-paper-on-ink` ·
`qorv-square-black-on-white` · `qorv-square-white-on-black` ·
`qorv-square-ink-on-acid`

### Tanda — 1024 × 1024

Satu huruf **Q**, untuk ruang yang terlalu sempit buat wordmark. Bentuk ini juga
yang dipakai favicon situs.

`qorv-mark-acid` · `qorv-mark-ink` · `qorv-mark-paper` · `qorv-mark-black` ·
`qorv-mark-white`

---

## Aturan

Dari `brand_guidelines.html`, ditambah satu yang khusus berlaku di sini:

- **Jangan ubah tracking.** Logotype-nya dikunci di −0.06em.
- **Jangan miringkan, jangan putar.** Kecuali penempatan vertikal di tepi kemasan.
- **Jangan pakai huruf kecil.** Selalu `QORV.`, bukan `qorv.`
- **Titiknya acid** — kecuali kalau bidangnya sendiri acid. Di sana titiknya
  ikut warna huruf, karena acid di atas acid tidak terlihat. Aturan yang sama
  berlaku di seluruh situs: **acid tidak pernah jadi foreground di atas acid**.

## Catatan format

JPG tidak punya kanal alfa. Varian yang PNG-nya transparan karena itu diratakan
dulu ke warna yang masuk akal (kertas untuk yang tinta, tinta untuk yang kertas).
Kalau butuh latar transparan, **pakai PNG** — JPG tidak akan pernah bisa.

## Palet

```
Kertas   #E9E9E3      Tinta    #0B0B0B      Acid   #D4FF00
Putih    #FFFFFF      Hitam    #000000
```

Putih dan hitam murni sengaja dipisah dari kertas dan tinta. Palet merek memakai
#E9E9E3 dan #0B0B0B — keduanya bukan putih dan hitam betulan. Tapi cetak satu
warna, sablon, dan dokumen milik orang lain sering menuntut #FFF atau #000; di
sana kertas terbaca sebagai abu kotor.
