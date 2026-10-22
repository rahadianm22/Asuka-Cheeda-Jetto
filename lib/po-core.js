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

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Name is required; of WhatsApp / email / social handle, any ONE is enough for the admin to send the payment. */
export function validateContact({ nama, whatsapp, email, sosmed }) {
  const errors = {};
  const cleanName = String(nama || '').trim().replace(/\s+/g, ' ');
  if (cleanName.length < 2) errors.nama = 'Nama minimal 2 karakter, ya~';
  else if (cleanName.length > 80) errors.nama = 'Namanya kepanjangan, maksimal 80 karakter.';
  const rawWa = String(whatsapp || '').trim();
  const wa = rawWa ? normalizeWA(rawWa) : null;
  if (rawWa && !wa) errors.whatsapp = 'Nomor WhatsApp belum valid. Contoh: 0812 3456 7890';
  const mail = String(email || '').trim().toLowerCase();
  if (mail && (mail.length > 120 || !EMAIL_RE.test(mail))) errors.email = 'Alamat email belum valid. Contoh: pemesan@gmail.com';
  const social = String(sosmed || '').trim().replace(/\s+/g, ' ');
  if (social.length > 80) errors.sosmed = 'Terlalu panjang, maksimal 80 karakter.';
  if (!errors.whatsapp && !errors.email && !errors.sosmed && !wa && !mail && !social) {
    errors.kontak = 'Isi salah satu ya: WhatsApp, email, atau media sosial, biar admin bisa ngirim QRIS pembayarannya~';
  }
  return { errors, nama: cleanName, whatsapp: wa || '', email: mail, sosmed: social };
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

// ---------- bundles and per-size stock ----------
// A bundle ("Paket") has no stock of its own: it uses up the pieces it contains, so its availability is the
// scarcest piece. A piece with `sizeStock` (the T-shirt) is counted per size, e.g. "ASJ-B-PA-1|M", and a bundle
// that contains it draws from the size the buyer picked. A shirt sold alone and one inside a bundle therefore
// come out of the same pile.

/** What a product takes out of stock: itself, or each piece of a bundle. */
export const partsOf = (p) => p.bundle ?? [{ sku: p.sku, qty: 1 }];

export const pieceKey = (sku, size) => (size ? `${sku}|${size}` : sku);

const bySku = (list) => new Map(list.map((p) => [p.sku, p]));

/** Stock-pile key a piece draws from for a line of this size: per size when the piece is sized. */
const keyOf = (by, part, size) => (by.get(part.sku)?.sizeStock ? pieceKey(part.sku, size) : part.sku);

/** Units left in one pile, given a key like "ASJ-B-GK-1" or "ASJ-B-PA-1|M". */
export function stockOfKey(products, key) {
  const [sku, size] = key.split('|');
  const p = bySku(products).get(sku);
  if (!p) return 0;
  return size ? p.sizeStock?.[size] ?? 0 : p.stock;
}

const sum = (o) => Object.values(o).reduce((n, v) => n + v, 0);

/** The list with sized pieces totalled and every bundle's stock (per size, when it has sizes) filled in. */
export function withBundleStock(list) {
  const by = bySku(list);
  return list.map((p) => {
    if (!p.bundle) return p.sizeStock ? { ...p, stock: sum(p.sizeStock) } : p;
    const full = (size) => {
      const n = Math.min(...p.bundle.map((b) => Math.floor(stockOfKey(list, keyOf(by, b, size)) / b.qty)));
      return Number.isFinite(n) ? Math.max(0, n) : 0;
    };
    if (p.sizes) {
      const sizeStock = Object.fromEntries(p.sizes.map((sz) => [sz, full(sz)]));
      return { ...p, sizeStock, stock: sum(sizeStock) };
    }
    return { ...p, stock: full(null) };
  });
}

/** {pileKey: units} that the lines {sku, ukuran, qty} use up, bundles expanded into their pieces. */
export function stockUse(items, products) {
  const by = bySku(products);
  const use = {};
  for (const it of items) {
    const p = by.get(it.sku);
    if (!p || !(it.qty > 0)) continue;
    for (const part of partsOf(p)) {
      const k = keyOf(by, part, it.ukuran);
      use[k] = (use[k] || 0) + part.qty * it.qty;
    }
  }
  return use;
}

const sameLine = (it, sku, size) => it.sku === sku && (it.ukuran || null) === (size || null);

/** How many units of `p` in this size can be in the cart in total, given what all other lines already use. */
export function unitsFree(p, size, items, products) {
  const by = bySku(products);
  const others = stockUse(items.filter((i) => !sameLine(i, p.sku, size)), products);
  let free = Infinity;
  for (const part of partsOf(p)) {
    const k = keyOf(by, part, size);
    free = Math.min(free, Math.floor((stockOfKey(products, k) - (others[k] || 0)) / part.qty));
  }
  return Number.isFinite(free) ? Math.max(0, free) : 0;
}

/**
 * Turns "pile K is short" into the cart line the buyer can actually change: the first line that draws on K,
 * with how many units of it still fit.
 */
export function shortLine(items, products, key, left) {
  const by = bySku(products);
  const line = items.find((it) => {
    const p = by.get(it.sku);
    return p && partsOf(p).some((pt) => keyOf(by, pt, it.ukuran) === key);
  });
  const [sku, size] = key.split('|');
  if (!line) return { sku, ukuran: size || null, tersisa: left };
  const part = partsOf(by.get(line.sku)).find((pt) => keyOf(by, pt, line.ukuran) === key);
  const others = stockUse(items.filter((i) => i !== line), products)[key] || 0;
  return { sku: line.sku, ukuran: line.ukuran || null, tersisa: Math.max(0, Math.floor((left - others) / part.qty)) };
}
