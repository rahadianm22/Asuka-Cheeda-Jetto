// Catalog. Prices are whole rupiah. Swap the body of getProducts() for a Google Sheet fetch later.
const PRODUCTS = [
  { sku: 'ASJ-B-GK-1', name: 'Jetto Wagging Tail Keychain', type: 'Gantungan Kunci', po: 65000, ots: 70000, stock: 20, img: '/merch/asj-b-gk-1.webp' },
  { sku: 'ASJ-B-GK-2', name: 'Adopt Me 3D Clicker Keychain', type: 'Gantungan Kunci', po: 80000, ots: 85000, stock: 20, img: '/merch/asj-b-gk-2.webp' },
  { sku: 'ASJ-B-LA-1', name: 'Asukayang Totebag', type: 'Lainnya', po: 100000, ots: 105000, stock: 25, img: '/merch/asj-b-la-1.webp' },
  { sku: 'ASJ-B-PC-1', name: 'Asuka Jetto LATHI Lenticular Photocard', type: 'Photocard', po: 35000, ots: 40000, stock: 50, img: '/merch/asj-b-pc-1.jpg' },
  { sku: 'ASJ-B-LA-2', name: 'Paw Friend Tumbler', type: 'Lainnya', po: 75000, ots: 80000, stock: 20, img: '/merch/asj-b-la-2.webp' },
  { sku: 'ASJ-B-ST-1', name: 'Asuka Jetto Stickers', type: 'Stiker', po: 5000, ots: 5000, stock: 250, img: '/merch/asj-b-st-1.webp' },
  // Assumption: the 8 pcs are shared by every size (not confirmed with the admin).
  { sku: 'ASJ-B-PA-1', name: 'Jetto x Daekan Boxy T-Shirt', type: 'Pakaian', po: 190000, ots: 200000, stock: 8, img: '/merch/asj-b-pa-1.jpg', sizes: ['M', 'L', 'XL'] },
  { sku: 'ASJ-B-SD-1', name: 'Swing Cheeda Acrylic Standee', type: 'Standee', po: 190000, ots: 195000, stock: 20, img: '/merch/asj-b-sd-1.webp' },
  { sku: 'ASJ-B-PC-2', name: 'Vet Jetto Photocard', type: 'Photocard', po: 20000, ots: 25000, stock: 50, img: '/merch/asj-b-pc-2.webp' },
];

export const TYPES = ['Semua', 'Gantungan Kunci', 'Photocard', 'Stiker', 'Pakaian', 'Standee', 'Lainnya'];

/** The catalog with `stock` = what is still available right now. */
export async function getProducts() {
  const url = process.env.APPS_SCRIPT_URL;
  if (url) {
    // Live stock lives in the Katalog sheet. If it cannot be reached, fall back to the base stock.
    try {
      const res = await fetch(`${url}?action=stok`, { cache: 'no-store' });
      const { stok } = await res.json();
      return PRODUCTS.map((p) => ({ ...p, stock: Number.isFinite(stok?.[p.sku]) ? stok[p.sku] : p.stock }));
    } catch (err) {
      console.error('[po] could not read stock from the sheet', err);
      return PRODUCTS;
    }
  }
  const sold = globalThis.__poStore?.sold || {}; // filled in by lib/po-server.js
  return PRODUCTS.map((p) => ({ ...p, stock: Math.max(0, p.stock - (sold[p.sku] || 0)) }));
}

/** Untouched catalog, for server-side checks that must not depend on the live stock. */
export function getBaseProducts() {
  return PRODUCTS;
}
