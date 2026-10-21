// Pure helpers shared by the browser and the API route, so the total on screen is the total the server computes.

export const lineKey = (sku, size) => (size ? `${sku}|${size}` : sku);

export function rp(n) {
  return 'Rp' + new Intl.NumberFormat('id-ID').format(n);
}

const WA_RE = /^(\+62|62|0)8[0-9]{8,12}$/;

/** "0812-3456-7890" / "+62 812..." -> "62812..."; null when it is not an Indonesian mobile number. */
export function normalizeWA(raw) {
  const s = String(raw || '').replace(/[\s\-().]/g, '');
  if (!WA_RE.test(s)) return null;
  if (s.startsWith('+')) return s.slice(1);
  if (s.startsWith('0')) return '62' + s.slice(1);
  return s;
}

export function validateContact({ nama, whatsapp }) {
  const errors = {};
  const cleanName = String(nama || '').trim().replace(/\s+/g, ' ');
  if (cleanName.length < 2) errors.nama = 'Nama minimal 2 karakter, ya~';
  else if (cleanName.length > 80) errors.nama = 'Namanya kepanjangan, maksimal 80 karakter.';
  const wa = normalizeWA(whatsapp);
  if (!wa) errors.whatsapp = 'Nomor WhatsApp belum valid. Contoh: 0812 3456 7890';
  return { errors, nama: cleanName, whatsapp: wa };
}

export function validateAddress({ alamat, kota, provinsi, kodepos }) {
  const errors = {};
  const v = (x) => String(x || '').trim();
  if (v(alamat).length < 8) errors.alamat = 'Alamat lengkapnya diisi dulu, ya.';
  if (!v(kota)) errors.kota = 'Kota / kabupaten wajib diisi.';
  if (!v(provinsi)) errors.provinsi = 'Provinsi wajib diisi.';
  if (!/^\d{5}$/.test(v(kodepos))) errors.kodepos = 'Kode pos 5 angka.';
  return { errors, alamat: v(alamat), kota: v(kota), provinsi: v(provinsi), kodepos: v(kodepos) };
}

/** Prices the lines {sku, ukuran, qty}. Unknown SKUs and empty quantities are skipped. */
export function priceLines(items, products) {
  const bySku = new Map(products.map((p) => [p.sku, p]));
  const lines = [];
  let totalQty = 0;
  let subtotal = 0;
  let hemat = 0;
  for (const it of items) {
    const p = bySku.get(it.sku);
    if (!p || !(it.qty > 0)) continue;
    const total = p.po * it.qty;
    lines.push({
      sku: p.sku,
      name: p.name,
      ukuran: it.ukuran || null,
      qty: it.qty,
      unit: p.po,
      total,
      img: p.img || null,
    });
    totalQty += it.qty;
    subtotal += total;
    hemat += (p.ots - p.po) * it.qty;
  }
  return { lines, totalQty, subtotal, hemat };
}

export const lineLabel = (l) => (l.ukuran ? `${l.name} (${l.ukuran})` : l.name);
