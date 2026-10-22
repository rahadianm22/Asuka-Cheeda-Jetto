// Indonesian copy for /merch. Kept as a dictionary so an EN version can be added next to it later.
import { EVENT, SHIPPING_ENABLED } from './po-config';

export const COPY = {
  ticker: ['PRE-ORDER CF23', 'HARGA PO LEBIH HEMAT DARI OTS', 'WOOF WOOF~'],

  heroNo: 'PRE-ORDER · CF23',
  heroTitle: ['Resep Merch', 'Dokter Jetto'],
  heroText:
    SHIPPING_ENABLED
      ? 'Alloo, fam Suaka! Pilih merch yang kamu mau, isi nama, terus tentuin mau dikirim atau ambil langsung di CF23. Harga PO lebih murah dari harga di booth lho~ Woof!'
      : 'Alloo, fam Suaka! Pilih merch yang kamu mau, isi nama, terus ambil langsung di CF23. Harga PO lebih murah dari harga di booth lho~ Woof!',
  statusLabel: 'Status',
  statusOpen: 'PO Dibuka',
  statusSoon: 'Segera dibuka',
  statusClosed: 'PO Ditutup',
  closeLabel: 'PO tutup',
  pickupLabel: 'Pengambilan',
  pickupValue: SHIPPING_ENABLED ? 'Dikirim (ongkir dicek per alamat) · Ambil di CF23' : 'Ambil di CF23',

  closedTitle: 'PO sudah ditutup~',
  closedText: `Pre-order CF23 ditutup pada ${EVENT.poCloseLabel}. Merch yang masih ada bisa dibeli langsung (OTS) di booth ${EVENT.booth}, Comic Frontier 23.`,
  soonTitle: 'PO belum dibuka~',
  soonText: 'Formulir PO belum dibuka. Pantau terus info dari Jetto, ya!',

  secPick: 'Pilih Merch',
  filterAria: 'Filter jenis barang',
  ots: 'OTS',
  otsTip: 'OTS = harga On The Spot, khusus beli langsung di event',
  qtyHint: 'Mau berapa, sayang?',
  stockOk: 'Stok {n}, masih aman, santai~',
  stockLow: 'Sisa {n}, jangan kebanyakan mikir ya',
  stockInCart: 'Semua stoknya udah di keranjangmu~',
  stockOut: 'Habis! Jetto lagi nangis di pojokan',
  soldOut: 'HABIS',
  photoMissing: 'Foto belum ada',
  inCart: '{n} di keranjang',
  size: 'Ukuran',
  sizeAria: 'Pilih ukuran',
  qty: 'Jumlah',
  qtySize: 'Jumlah ({size})',
  dec: 'Kurangi {name}',
  inc: 'Tambah {name}',
  stockChanged: 'Stok {name} tinggal {n}, ubah jumlahnya dulu ya~',

  secContact: 'Data Pemesan',
  secContactTag: 'identitas pasien',
  fName: 'Nama',
  fNamePh: 'Nama kamu',
  fContactTitle: 'Kontak buat ngirim QRIS',
  fContactHint: 'Isi salah satu aja yang bisa dihubungi, ya. Admin bakal ngirim QRIS pembayaran lewat situ~',
  fWa: 'Nomor WhatsApp / HP aktif',
  fWaOpt: 'Pilihan 1',
  fWaPh: 'Contoh: 081234567890',
  fMail: 'Alamat email',
  fMailOpt: 'Pilihan 2',
  fMailPh: 'Contoh: pemesan@gmail.com',
  fSos: 'Media sosial (Twitter / IG / Discord)',
  fSosOpt: 'Pilihan 3',
  fSosPh: 'Contoh: @username_ig / @handle_x / username#1234',

  secMethod: 'Dikirim atau Ambil di CF?',
  secMethodTag: 'pilih salah satu',
  methodShip: 'Dikirim ke alamat',
  methodShipOff: 'Belum tersedia untuk PO ini',
  methodShipText: 'Ongkir dicek admin ke alamatmu, nanti dikabarin lewat WhatsApp',
  methodShipSoon: 'Pengiriman menyusul~',
  methodCf: 'Ambil di CF23',
  methodCfText: `Tanpa ongkir · ambil di booth ${EVENT.booth}, CF23`,
  fAddress: 'Alamat lengkap',
  fCity: 'Kota / Kabupaten',
  fProvince: 'Provinsi',
  fZip: 'Kode pos',

  secNote: 'Catatan',
  secNoteTag: 'opsional',
  fNote: 'Pesan buat Jetto / admin',
  fNotePh: 'Titip salam, request, atau catatan lain~',

  sumTitle: 'Ringkasan',
  sumKicker: 'Resep pesanan',
  sumEmpty: 'Keranjangnya sepi, kayak dompet akhir bulan',
  sumItems: 'Jumlah item',
  sumSaving: 'Hemat vs OTS',
  sumShipping: 'Ongkir',
  sumTotal: 'Total',
  review: 'Review Pesanan',
  hintEmpty: 'Pilih minimal 1 merch dulu di bagian A.',
  hintReady: 'Klik Review Pesanan buat cek ulang sebelum dikirim.',
  sumToggle: 'Lihat resep pesanan',
  sumInfo: 'Stok berkurang otomatis tiap ada pesanan masuk. Total dan QRIS pembayarannya dikirim admin lewat kontak yang kamu isi setelah pesananmu masuk.',
  sumInfoShip: 'Stok berkurang otomatis tiap ada pesanan masuk. Total + ongkir dan QRIS pembayarannya dikirim admin lewat kontak yang kamu isi setelah ongkir dicek.',
  sumShippingShip: '+ dicek admin',
  shipNote: 'Tarif ongkir belum dihitung untuk pengiriman, dicek admin terlebih dulu ya~ Total di atas baru harga merch.',
  adminHelp: 'Ada pertanyaan? Hubungi admin lewat WhatsApp.',

  rvKicker: 'Review pesanan · PO CF23',
  rvTitle: 'Cek lagi, ya~',
  rvSub: 'Pastikan semua udah bener sebelum dikirim ke Jetto.',
  rvClose: 'Tutup review',
  rvOrder: 'Pesanan',
  rvName: 'Nama',
  rvContact: 'Kontak buat QRIS',
  rvWa: 'WhatsApp',
  rvMail: 'Email',
  rvSos: 'Media sosial',
  rvPickup: 'Pengambilan',
  rvPickupValue: `Ambil di CF23 · booth ${EVENT.booth}`,
  rvNote: 'Catatan',
  rvPayNote: 'Pembayaran diatur admin, nanti total dan QRIS-nya dikirim lewat kontak yang kamu isi.',
  rvPayNoteShip: 'Admin bakal cek ongkir ke alamatmu, lalu kirim total + ongkir dan QRIS-nya lewat kontak yang kamu isi.',
  rvEdit: 'Ubah pesanan',
  rvSend: 'Kirim Pesanan',
  rvSending: 'Mengirim…',
  errGeneric: 'Pesananmu belum bisa dikirim. Coba lagi sebentar lagi, ya~',
  errRate: 'Kebanyakan percobaan. Tunggu semenit, lalu coba lagi~',
  errClosed: 'PO sudah ditutup, jadi pesanan ini nggak bisa dikirim lagi.',
  errNetwork: 'Koneksi lagi bermasalah. Cek internetmu, lalu coba lagi~',
};

export function fmt(str, vars = {}) {
  return str.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ''));
}

/** Stock line for a card. `left` is what can still be added (stock minus what is already in the cart). */
export function getStockLabel(left, soldOut = left <= 0) {
  if (soldOut) return { text: COPY.stockOut, tone: 'out' };
  if (left <= 0) return { text: COPY.stockInCart, tone: 'low' };
  if (left <= 5) return { text: fmt(COPY.stockLow, { n: left }), tone: 'low' };
  return { text: fmt(COPY.stockOk, { n: left }), tone: 'ok' };
}
