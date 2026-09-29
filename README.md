# Asuka Cheeda Jetto: Fansite

Fansite tidak resmi untuk Asuka Cheeda Jetto. Next.js (App Router) + Framer Motion.
Arah desain ada di [DESIGN.md](DESIGN.md), catatan audit desain di [anti-slop/](anti-slop/).

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

## Environment

Buat `.env.local` (tidak ikut ke git):

```bash
YOUTUBE_API_KEY=...                        # opsional, lihat di bawah
NEXT_PUBLIC_SITE_URL=https://domain-kamu   # opsional, untuk URL gambar preview link
```

Di Vercel, `NEXT_PUBLIC_SITE_URL` boleh dikosongkan: Next memakai domain produksi Vercel otomatis.

## Data YouTube

Dengan `YOUTUBE_API_KEY`, situs mengambil dari channel (cache 6 jam):

- statistik channel (subscriber, views, jumlah video),
- semua cover: upload yang judulnya **diawali** `【COVER】` (shorts ber-hashtag #cover tidak ikut),
- semua VETTALK: upload yang judulnya mengandung `【VETTALK】`.

Tanpa key, atau kalau API gagal, situs memakai daftar cadangan di `lib/data.js` (`COVERS`, `VETTALKS`)
dan label statistik berubah jadi "dicatat manual".

Topik VETTALK diambil dari judul (tag `【...】` dibuang). Judul yang ditulis kapital semua
diubah jadi huruf kalimat, jadi singkatan seperti FIP bisa ikut kecil: tulis topik yang benar
di `VETTALKS` (cocokkan `yt`), dan tulisan itu yang dipakai.

## Gambar

Semua gambar karakter dan ilustrasi berasal dari Jetto sendiri; footer menyebutkan kepemilikannya
(`artOwnership` di `lib/i18n.js`). Kalau nanti ada karya artis lain, tambahkan kreditnya di sana.

## Mengubah teks / terjemahan

Semua teks statis ada di `lib/i18n.js`, masing-masing punya versi `id` dan `en`.
Tombol ID/EN mengganti seluruh teks tanpa reload, dan pilihannya diingat di browser pengunjung.

## Struktur

```
app/
  layout.jsx            font, metadata, favicon, preview link
  opengraph-image.jsx   gambar preview link (Discord, X, WhatsApp)
  page.jsx              susunan section + ambil data YouTube
  globals.css           seluruh styling
components/
  TopBar, Hero, Ticker  bagian atas
  Masthead              sapaan + berkas dokter
  CharacterIntro        Cheeda (bisa dielus) & Cipet (bisa digendong)
  Preferences           hasil observasi: bikin happy / badmood
  ChannelStats          statistik YouTube
  Feed, VideoCard       cover lagu
  Vettalk               playlist VETTALK
  SupportLinks          Trakteer & Saweria
  SocialLinks           akun sosmed
  Footer, BackToTop     penutup + tombol paw ke atas
  NotFoundCard          halaman 404 "Pasien tidak ditemukan"
  PawCursor, PawBurst   kursor paw & jejak kaki
lib/
  data.js               data cadangan & sosmed
  youtube.js            pengambilan data YouTube
  i18n.js               kamus terjemahan
```

## Catatan

- Semua animasi mati kalau pengunjung mengaktifkan "reduce motion" di perangkatnya.
- Isi halaman tetap tampil walau JavaScript lambat atau mati (fallback di `globals.css`).
- Font Archivo di `app/fonts/` (lisensi SIL OFL) hanya dipakai untuk gambar preview link.
