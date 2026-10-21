// Server-only order handling: validation, stock, PO numbers and persistence.
// Without APPS_SCRIPT_URL everything lives in this process's memory, which resets on restart and is NOT
// shared between Vercel instances. That is fine for trying the flow, not for the real PO.
import { SHIPPING_ENABLED, LIMITS, RATE_LIMIT, getPOStatus } from './po-config';
import { getBaseProducts } from './products';
import { priceLines, validateContact, validateAddress } from './po-core';

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

async function persist(order) {
  const url = process.env.APPS_SCRIPT_URL;
  if (!url) {
    // Local fallback: number it, count the stock as sold, keep it in memory and in the log.
    store.counter += 1;
    const noPO = `PO-${String(store.counter).padStart(4, '0')}`;
    for (const l of order.lines) store.sold[l.sku] = (store.sold[l.sku] || 0) + l.qty;
    store.orders.push({ noPO, ...order, at: new Date().toISOString() });
    console.log('[po] saved in memory', noPO, JSON.stringify(order));
    return { ok: true, noPO };
  }
  // Apps Script (scripts/apps-script-po.gs) takes the lock, checks the stock, numbers and appends the row.
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ ...order, secret: process.env.APPS_SCRIPT_SECRET || undefined }),
    cache: 'no-store',
  });
  const data = await res.json();
  if (data.ok) return { ok: true, noPO: String(data.noPO) };
  return data.error === 'stok' ? { ok: false, error: 'stok', sku: data.sku, tersisa: data.tersisa } : { ok: false, error: 'server' };
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

  // Stock is counted per SKU, so sizes of one SKU share it.
  const asked = {};
  for (const it of items) asked[it.sku] = (asked[it.sku] || 0) + it.qty;
  if (!process.env.APPS_SCRIPT_URL) {
    const sold = store.sold;
    for (const p of products) {
      const left = Math.max(0, p.stock - (sold[p.sku] || 0));
      if ((asked[p.sku] || 0) > left) return fail(409, 'stok', { sku: p.sku, tersisa: left });
    }
  }

  const priced = priceLines(items, products);
  const order = {
    nama: contact.nama,
    whatsapp: contact.whatsapp,
    catatan: String(body.catatan || '').trim().slice(0, LIMITS.maxNote),
    metode: body.metode,
    alamat: address ? [address.alamat, address.kota, address.provinsi, address.kodepos].join(', ') : '',
    lines: priced.lines,
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
    return saved.error === 'stok' ? fail(409, 'stok', { sku: saved.sku, tersisa: saved.tersisa }) : fail(503, 'server');
  }

  return {
    status: 200,
    body: {
      ok: true,
      noPO: saved.noPO,
      nama: order.nama,
      metode: order.metode,
      total: order.total,
      hemat: order.hemat,
      totalQty: order.totalQty,
      items: order.lines,
    },
  };
}
