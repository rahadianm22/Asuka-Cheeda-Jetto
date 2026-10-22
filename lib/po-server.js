// Server-only order handling: validation, stock, PO numbers and persistence.
// Without APPS_SCRIPT_URL everything lives in this process's memory, which resets on restart and is NOT
// shared between Vercel instances. That is fine for trying the flow, not for the real PO.
import { SHIPPING_ENABLED, LIMITS, RATE_LIMIT, getPOStatus } from './po-config';
import { getBaseProducts } from './products';
import { priceLines, validateContact, validateAddress, stockUse, shortLine, stockOfKey } from './po-core';

const store = (globalThis.__poStore ??= { counter: 0, sold: {}, orders: [], hits: new Map() });

function rateLimited(ip) {
  const now = Date.now();
  const recent = (store.hits.get(ip) || []).filter((t) => now - t < RATE_LIMIT.windowMs);
  recent.push(now);
  store.hits.set(ip, recent);
  if (store.hits.size > 2000) store.hits.clear();
  return recent.length > RATE_LIMIT.max;
}

const fail = (status, error, extra = {}) => ({ status, body: { ok: false, error, ...extra } });

function parseItems(raw, products) {
  if (!Array.isArray(raw) || raw.length === 0 || raw.length > LIMITS.maxLines) return null;
  const bySku = new Map(products.map((p) => [p.sku, p]));
  const merged = new Map();
  for (const it of raw) {
    const p = bySku.get(it?.sku);
    const qty = it?.qty;
    if (!p || !Number.isInteger(qty) || qty < 1 || qty > LIMITS.maxQty) return null;
    let ukuran = null;
    if (p.sizes) {
      if (!p.sizes.includes(it.ukuran)) return null;
      ukuran = it.ukuran;
    }
    const key = `${p.sku}|${ukuran || ''}`;
    const prev = merged.get(key);
    merged.set(key, { sku: p.sku, ukuran, qty: (prev?.qty || 0) + qty });
  }
  return [...merged.values()];
}

const fullAddress = (order) => [order.alamat, order.kota, order.provinsi, order.kodepos].filter(Boolean).join(', ');

// Sent as `catatan` so a sheet script that predates the address columns still keeps the address.
// A newer script reads `catatanUser` plus the separate address fields instead.
function sheetNote(order) {
  if (!order.alamat) return order.catatan;
  return `ALAMAT: ${fullAddress(order)}${order.catatan ? ` | CATATAN: ${order.catatan}` : ''}`;
}

async function persist(order) {
  const url = process.env.APPS_SCRIPT_URL;
  if (!url) {
    // Local fallback: number it, count the stock as sold, keep it in memory and in the log.
    store.counter += 1;
    const noPO = `PO-${String(store.counter).padStart(4, '0')}`;
    for (const [sku, qty] of Object.entries(order.stock)) store.sold[sku] = (store.sold[sku] || 0) + qty;
    store.orders.push({ noPO, ...order, at: new Date().toISOString() });
    console.log('[po] saved in memory', noPO, JSON.stringify(order));
    return { ok: true, noPO };
  }
  // Apps Script (scripts/apps-script-po.gs) takes the lock, checks the stock, numbers and appends the row.
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ ...order, catatan: sheetNote(order), catatanUser: order.catatan, secret: process.env.APPS_SCRIPT_SECRET || undefined }),
    cache: 'no-store',
  });
  const data = await res.json();
  if (data.ok) return { ok: true, noPO: String(data.noPO) };
  return data.error === 'stok' ? { ok: false, error: 'stok', piece: data.sku, left: data.tersisa } : { ok: false, error: 'server' };
}

// A short piece is reported as the cart line the buyer can change, plus the piece itself so the page can refresh it.
function stockFail(items, products, piece, left) {
  return fail(409, 'stok', { ...shortLine(items, products, piece, left), piece, pieceLeft: left });
}

/** @returns {Promise<{status: number, body: object}>} */
export async function createOrder(body, ip) {
  if (rateLimited(ip)) return fail(429, 'rate');
  if (!body || typeof body !== 'object') return fail(400, 'invalid');
  if (body.website) return fail(400, 'invalid'); // honeypot
  if (getPOStatus() !== 'open') return fail(403, 'closed');
  if (body.metode !== 'cf' && !(SHIPPING_ENABLED && body.metode === 'kirim')) return fail(400, 'metode');

  const products = getBaseProducts();
  const contact = validateContact(body);
  const address = body.metode === 'kirim' ? validateAddress(body) : null;
  const errors = { ...contact.errors, ...address?.errors };
  const items = parseItems(body.items, products);
  if (!items || Object.keys(errors).length) return fail(400, 'invalid', { fields: errors });

  // Stock is counted per pile: a sized piece (the T-shirt) has one pile per size, and a bundle draws on the pieces it contains.
  const stock = stockUse(items, products);
  if (!process.env.APPS_SCRIPT_URL) {
    for (const [key, qty] of Object.entries(stock)) {
      const left = Math.max(0, stockOfKey(products, key) - (store.sold[key] || 0));
      if (qty > left) return stockFail(items, products, key, left);
    }
  }

  const priced = priceLines(items, products);
  const order = {
    nama: contact.nama,
    whatsapp: contact.whatsapp,
    email: contact.email,
    sosmed: contact.sosmed,
    catatan: String(body.catatan || '').trim().slice(0, LIMITS.maxNote),
    metode: body.metode,
    alamat: address?.alamat ?? '',
    kota: address?.kota ?? '',
    provinsi: address?.provinsi ?? '',
    kodepos: address?.kodepos ?? '',
    lines: priced.lines,
    stock,
    totalQty: priced.totalQty,
    total: priced.subtotal,
    hemat: priced.hemat,
  };

  let saved;
  try {
    saved = await persist(order);
  } catch (err) {
    console.error('[po] persist failed', err);
    return fail(503, 'server');
  }
  if (!saved.ok) {
    return saved.error === 'stok' ? stockFail(items, products, saved.piece, saved.left) : fail(503, 'server');
  }

  return {
    status: 200,
    body: {
      ok: true,
      noPO: saved.noPO,
      nama: order.nama,
      metode: order.metode,
      alamat: fullAddress(order),
      whatsapp: order.whatsapp,
      email: order.email,
      sosmed: order.sosmed,
      total: order.total,
      hemat: order.hemat,
      totalQty: order.totalQty,
      items: order.lines,
    },
  };
}
