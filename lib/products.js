// Catalog. Prices are whole rupiah. Swap the body of getProducts() for a Google Sheet fetch later.
// `tagline` is the one-line joke shown on the card (keep it under ~50 characters); `description` is the longer
// version for a detail view. Names, SKUs and prices stay plain on purpose, so nobody buys the wrong thing.
const PRODUCTS = [
  {
    sku: 'ASJ-B-GK-1', name: 'Jetto Wagging Tail Keychain', type: 'Gantungan Kunci', po: 65000, ots: 70000, stock: 20,
    img: '/merch/asj-b-gk-1.webp',
    tilt: { rest: -7, hover: 4 },
    tagline: 'Ekornya jujur, goyang tiap kamu lewat ^^',
    description: 'Selain nemenin kamu kemana-mana, ekorku bisa goyang-goyang lho. Jujur, ini satu-satunya ekor yang jujur sama perasaannya ^^',
  },
  {
    sku: 'ASJ-B-GK-2', name: 'Adopt Me 3D Clicker Keychain', type: 'Gantungan Kunci', po: 80000, ots: 85000, stock: 20,
    img: '/merch/asj-b-gk-2.webp',
    tilt: { rest: -7, hover: 4 },
    tagline: 'Klik-klik murah, lebih hemat dari terapi',
    description: 'Keychain clicker yang bisa kamu klik-klik tiap hari. Bunyinya cetak-cetok, stres kerjaan ikut kepencet pergi. Lebih murah dari terapi, wkwk.',
  },
  {
    // TODO: material and size are not confirmed, so the description does not mention them. The 4 small pins come from the owner.
    sku: 'ASJ-B-LA-1', name: 'Asukayang Totebag', type: 'Lainnya', po: 100000, ots: 105000, stock: 25,
    img: '/merch/asj-b-la-1.webp',
    tagline: 'Muat belanjaan, plus 4 pin kecil lucu',
    description: 'Totebag buat nemenin kamu kemana-mana, dari ke kampus sampai ke event. Muat buat barang bawaan, muat juga buat merch lainnya, wkwk. Di dalam paketnya ada 4 pin kecil juga lho, lumayan buat pamer ke teman~',
  },
  {
    sku: 'ASJ-B-PC-1', name: 'Asuka Jetto LATHI Lenticular Photocard', type: 'Photocard', po: 35000, ots: 40000, stock: 50,
    img: '/merch/asj-b-pc-1.webp', imgHover: '/merch/asj-b-pc-1-hover.webp',
    tilt: { rest: -7, hover: 4 },
    tagline: 'Miringin dikit, muka Jetto ganti',
    description: 'Katanya cuma punya satu pose? Salah dong! Lenticular Photocard ini punya dua muka, miringin dikit langsung ganti. Dua muka, tapi tetap satu hati kok.',
  },
  {
    sku: 'ASJ-B-LA-2', name: 'Paw Friend Tumbler', type: 'Lainnya', po: 75000, ots: 80000, stock: 20,
    img: '/merch/asj-b-la-2.webp',
    // TODO: capacity and material are not confirmed, so the description does not mention them.
    tagline: 'Minum air dulu, ditemenin tulang lucu',
    description: 'Tumbler dengan gambar aku dan tulang-tulang kecil yang berserakan di sekelilingnya. Sering lupa minum? Tenang, ada Paw Friend yang ngingetin tiap kamu liat dia ^^ Satu-satunya teman cakar yang nggak pernah ninggalin kamu.',
  },
  {
    sku: 'ASJ-B-ST-1', name: 'Hologram Sticker', type: 'Stiker', po: 5000, ots: 5000, stock: 250,
    img: '/merch/asj-b-st-1.webp',
    tilt: { rest: -7, hover: 4 },
    tagline: 'Ekspresi random, cocok sama hidupmu',
    description: 'Ekspresi kocak kayak kehidupanmu ini ya! Tempel di tempat yang kamu suka: laptop, helm, atau botol minum. Jidat temanmu jangan, yang itu jangan~',
  },
  {
    // Stock is a placeholder (same as the hologram set); set the real number in the Katalog sheet.
    sku: 'ASJ-B-ST-2', name: 'Sticker Bening', type: 'Stiker', po: 5000, ots: 5000, stock: 250,
    img: '/merch/asj-b-st-2.webp',
    tilt: { rest: -7, hover: 4 },
    tagline: 'Bening, lentur, tempel di mana aja',
    description: 'Yang di sebelah ini bening, tau kan bening? Kayak niat baikku, hahaha. Tapi serius, stikernya bening, lentur, dan bisa ditempel di mana-mana.',
  },
  {
    // Assumption: the 8 pcs are shared by every size (not confirmed with the admin).
    sku: 'ASJ-B-PA-1', name: 'Jetto x Daekan Boxy T-Shirt', type: 'Pakaian', po: 190000, ots: 200000, stock: 8,
    img: '/merch/asj-b-pa-1.webp', sizes: ['M', 'L', 'XL'],
    tagline: 'Exclusive item, jangan sampai kehabisan',
    description: 'Jetto x Daekan hadir di CF23, tersedia size M/L/XL. Jangan sampai kehabisan ya, sayang! Ini exclusive item lho, nanti nyesel malah baju orang lain yang kamu lirik terus~',
  },
  {
    sku: 'ASJ-B-SD-1', name: 'Swing Cheeda Acrylic Standee', type: 'Standee', po: 190000, ots: 195000, stock: 20,
    img: '/merch/asj-b-sd-1.webp',
    tagline: 'Ngayun bareng, galau pun ikut terbang',
    description: 'Mengayun-ayun, bikin kamu ga bakal manyun lagi~ Acrylic Standee ini bisa mengayun sambil nemenin kamu yang lagi ngelamun. Alias teman overthinking terbaik.',
  },
  {
    sku: 'ASJ-B-PC-2', name: 'Vet Jetto Photocard', type: 'Photocard', po: 20000, ots: 25000, stock: 50,
    img: '/merch/asj-b-pc-2.webp',
    tilt: { rest: -7, hover: 4 }, // leans left, swings a little to the right on hover
    tagline: 'Dokter hewan virtual, tanpa suntik',
    description: 'Aku virtual vet pertama di Indonesia lho! Kapan lagi kamu bisa koleksi Photocard V-Vet satu ini? Dijamin tanpa suntik, tanpa antre.',
  },
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
