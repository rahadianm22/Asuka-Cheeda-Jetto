# Asuka Cheeda Jetto — Fansite

Fansite tidak resmi. Next.js (App Router) + Framer Motion. **Tanpa API key.**

## Menjalankan

```bash
npm install
npm run dev
```

Buka http://localhost:3000

```bash
npm run build   # build produksi
npm start       # jalankan hasil build
```

## Kenapa tidak butuh API key

Thumbnail YouTube diambil dari pola URL publik `img.youtube.com/vi/{ID}/maxresdefault.jpg`,
dan pemutarnya pakai iframe embed biasa. Keduanya tidak butuh otorisasi apa pun.
Konsekuensinya: daftar video **tidak** ter-update otomatis — ditulis manual di
`lib/data.js`.

## Menambah video baru

Buka `lib/data.js`, tambahkan satu objek ke array `COVERS`:

```js
{
  id: 'sg_06',                    // bebas, harus unik
  yt: 'VIDEO_ID',                 // dari youtube.com/watch?v=VIDEO_ID
  title: '【COVER】Judul Lagu',
  duration: '3:24',
  views: 1200,
  author: '@asukajetto',
  daysAgo: 3,                     // dipakai untuk urutan & label waktu
}
```

Urutan feed otomatis: `daysAgo` terkecil tampil duluan.

## Mengubah teks / terjemahan

Semua teks statis ada di `lib/i18n.js`, masing-masing punya versi `id` dan `en`.
Tombol ID/EN di pojok kanan atas mengganti seluruh teks tanpa reload.

## Struktur

```
app/
  layout.jsx        font, metadata, favicon
  page.jsx          susunan section
  globals.css       seluruh styling
components/
  LanguageProvider  context bahasa (t / tf)
  TopBar            bar atas, jam, tombol bahasa
  Hero              banner + parallax
  SocialLinks       grid akun sosmed
  Masthead          headline + berkas pasien
  Preferences       Bikin Happy / Bikin Badmood
  Feed, VideoCard   daftar cover lagu
  Reveal            wrapper animasi scroll
lib/
  data.js           data video & sosmed
  i18n.js           kamus terjemahan
public/             gambar hero & favicon
```

## Catatan

- Kredit ilustrasi hero masih placeholder (`heroCredit` di `lib/i18n.js`).
  Ganti dengan nama artist sebelum situs dipublikasikan.
- Semua animasi otomatis nonaktif kalau pengguna mengaktifkan
  "reduce motion" di sistem operasinya.
