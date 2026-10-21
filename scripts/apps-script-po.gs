/**
 * Backend for the /merch PO form. Paste this into Extensions > Apps Script of the spreadsheet,
 * run setup() once, then Deploy > New deployment > Web app (Execute as: Me, Who has access: Anyone).
 * The /exec URL goes into APPS_SCRIPT_URL on the site.
 *
 * Optional: Project Settings > Script properties > SECRET = any long random string, and set the same
 * value as APPS_SCRIPT_SECRET on the site, so only the site can write orders.
 */
var KATALOG = 'Katalog';
var PESANAN = 'Pesanan';
var TZ = 'Asia/Jakarta';

var KATALOG_HEADER = ['SKU', 'Nama', 'Jenis', 'Harga PO', 'Harga OTS', 'Stok'];
var PESANAN_HEADER = ['Waktu', 'No. PO', 'Nama', 'WhatsApp', 'Pesanan', 'Total item', 'Metode', 'Catatan', 'Total', 'Status', 'Alamat', 'Kota', 'Provinsi', 'Kode Pos'];
var SEED = [
  ['ASJ-B-GK-1', 'Jetto Wagging Tail Keychain', 'Gantungan Kunci', 65000, 70000, 20],
  ['ASJ-B-GK-2', 'Adopt Me 3D Clicker Keychain', 'Gantungan Kunci', 80000, 85000, 20],
  ['ASJ-B-LA-1', 'Asukayang Totebag', 'Lainnya', 100000, 105000, 25],
  ['ASJ-B-PC-1', 'Asuka Jetto LATHI Lenticular Photocard', 'Photocard', 35000, 40000, 50],
  ['ASJ-B-LA-2', 'Paw Friend Tumbler', 'Lainnya', 75000, 80000, 20],
  ['ASJ-B-ST-1', 'Hologram Sticker', 'Stiker', 5000, 5000, 250],
  ['ASJ-B-ST-2', 'Sticker Bening', 'Stiker', 5000, 5000, 250],
  ['ASJ-B-PA-1', 'Jetto x Daekan Boxy T-Shirt', 'Pakaian', 190000, 200000, 8],
  ['ASJ-B-SD-1', 'Swing Cheeda Acrylic Standee', 'Standee', 190000, 195000, 20],
  ['ASJ-B-PC-2', 'Vet Jetto Photocard', 'Photocard', 20000, 25000, 50],
];

/** Run from the editor: creates the two tabs, the starting stock (only if Katalog is empty) and the order headers. */
function setup() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var kat = ss.getSheetByName(KATALOG) || ss.insertSheet(KATALOG);
  if (kat.getLastRow() === 0) {
    kat.getRange(1, 1, 1, KATALOG_HEADER.length).setValues([KATALOG_HEADER]).setFontWeight('bold');
    kat.getRange(2, 1, SEED.length, KATALOG_HEADER.length).setValues(SEED);
    kat.setFrozenRows(1);
  }
  var pes = ss.getSheetByName(PESANAN) || ss.insertSheet(PESANAN);
  // The header is rewritten on every run, so columns added in later versions (Alamat...) appear without touching orders.
  pes.getRange(1, 1, 1, PESANAN_HEADER.length).setValues([PESANAN_HEADER]).setFontWeight('bold');
  pes.getRange('D:D').setNumberFormat('@'); // keep the WhatsApp number as text
  pes.getRange('N:N').setNumberFormat('@'); // and the postal code
  pes.setFrozenRows(1);
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/** GET ?action=stok -> {"ASJ-B-GK-1": 20, ...} for the live stock on the site. */
function doGet(e) {
  var rows = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(KATALOG).getDataRange().getValues();
  var stok = {};
  for (var i = 1; i < rows.length; i++) stok[rows[i][0]] = Number(rows[i][5]) || 0;
  return json_({ ok: true, stok: stok });
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var order = JSON.parse(e.postData.contents);
    var secret = PropertiesService.getScriptProperties().getProperty('SECRET');
    if (secret && order.secret !== secret) return json_({ ok: false, error: 'auth' });

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var kat = ss.getSheetByName(KATALOG);
    var data = kat.getDataRange().getValues();
    var rowOf = {};
    for (var i = 1; i < data.length; i++) rowOf[data[i][0]] = i;

    // Stock is counted per SKU, so every size of a shirt shares it.
    var asked = {};
    order.lines.forEach(function (l) { asked[l.sku] = (asked[l.sku] || 0) + l.qty; });
    for (var sku in asked) {
      var left = sku in rowOf ? Number(data[rowOf[sku]][5]) || 0 : 0;
      if (asked[sku] > left) return json_({ ok: false, error: 'stok', sku: sku, tersisa: left });
    }

    // Counter lives in script properties so deleted rows never cause a repeated number.
    var props = PropertiesService.getScriptProperties();
    var n = Number(props.getProperty('PO_COUNTER') || 0) + 1;
    props.setProperty('PO_COUNTER', String(n));
    var noPO = 'PO-' + ('0000' + n).slice(-4);

    for (var s in asked) kat.getRange(rowOf[s] + 1, 6).setValue(Number(data[rowOf[s]][5]) - asked[s]);

    var items = order.lines.map(function (l) {
      return l.name + (l.ukuran ? ' (' + l.ukuran + ')' : '') + ' x' + l.qty;
    }).join('; ');
    var pes = ss.getSheetByName(PESANAN);
    var row = pes.getLastRow() + 1;
    pes.getRange(row, 4).setNumberFormat('@');
    pes.getRange(row, 14).setNumberFormat('@');
    // New site versions send the plain note as catatanUser and the address as separate fields.
    var note = order.catatanUser !== undefined ? order.catatanUser : order.catatan;
    pes.getRange(row, 1, 1, PESANAN_HEADER.length).setValues([[
      Utilities.formatDate(new Date(), TZ, 'yyyy-MM-dd HH:mm:ss'), noPO, order.nama, order.whatsapp, items,
      order.totalQty, order.metode, note || '', order.total, 'Menunggu pembayaran',
      order.alamat || '', order.kota || '', order.provinsi || '', order.kodepos || '',
    ]]);
    return json_({ ok: true, noPO: noPO });
  } catch (err) {
    return json_({ ok: false, error: 'server', message: String(err) });
  } finally {
    lock.releaseLock();
  }
}
