/**
 * Backend for the /merch PO form, bound to the PKK spreadsheet ("Database Merchandise PKK CF 23").
 * Everything lives in the tab "Asuka Cheeda Jetto":
 *   - rows 1-17  : the price table (ASJ). The site reads stock from it and adds every order to "Terjual PO",
 *                  so "Sisa Stok" and the MasterMerch tab update by themselves.
 *   - N1:R17     : stock per size (SKU, Ukuran, Stok, Terjual PO, Sisa), for items sold in sizes (the T-shirt).
 *   - row 19-20  : title and header of the order table, rows 21+ : one row per order.
 *
 * Setup: Extensions > Apps Script of THIS spreadsheet, paste this file, run setup() once, then
 * Deploy > New deployment > Web app (Execute as: Me, Who has access: Anyone). The /exec URL goes into
 * APPS_SCRIPT_URL on the site.
 *
 * Optional: Project Settings > Script properties > SECRET = any long random string, and set the same value as
 * APPS_SCRIPT_SECRET on the site, so only the site can write orders.
 */
var TAB = 'Asuka Cheeda Jetto';
var TZ = 'Asia/Jakarta';
var ORDER_TITLE = 'PESANAN PO CF23 · diisi otomatis oleh website asukajetto.my.id (jangan diubah selain kolom Status)';
var ORDER_HEADER = ['Waktu', 'No. PO', 'Nama', 'WhatsApp', 'Pesanan', 'Total item', 'Metode', 'Alamat', 'Kota', 'Provinsi', 'Kode Pos', 'Catatan', 'Total', 'Status'];
var FIRST_STATUS = 'Menunggu pembayaran';

function sheet_() {
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(TAB);
  if (!sh) throw new Error('Tab "' + TAB + '" tidak ditemukan');
  return sh;
}

/** Row number of the order table's header (the row that starts with "Waktu" | "No. PO"), or 0 when missing. */
function orderHeaderRow_(sh) {
  var n = Math.max(sh.getLastRow(), 20);
  var ab = sh.getRange(1, 1, n, 2).getValues();
  for (var i = 0; i < ab.length; i++) if (ab[i][0] === 'Waktu' && ab[i][1] === 'No. PO') return i + 1;
  return 0;
}

/** Column numbers of the price table, found by header name so a moved column does not break anything. */
function productCols_(sh) {
  var head = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
  var cols = {};
  ['Kode SKU', 'Stok', 'Terjual PO', 'Terjual OTS'].forEach(function (name) {
    var i = head.indexOf(name);
    if (i < 0) throw new Error('Kolom "' + name + '" tidak ada di baris 1');
    cols[name] = i + 1;
  });
  return cols;
}

/** {SKU: {row, stok, po, ots, sisa}} for the price table (row 2 down to just above the order title). */
function products_(sh, hdr) {
  var cols = productCols_(sh);
  var last = hdr - 3; // header row, blank row and title row sit between the two tables
  var out = {};
  if (last < 2) return out;
  var data = sh.getRange(2, 1, last - 1, sh.getLastColumn()).getValues();
  for (var i = 0; i < data.length; i++) {
    var sku = String(data[i][cols['Kode SKU'] - 1] || '').trim();
    if (!sku) continue;
    var stok = Number(data[i][cols['Stok'] - 1]) || 0;
    var po = Number(data[i][cols['Terjual PO'] - 1]) || 0;
    var ots = Number(data[i][cols['Terjual OTS'] - 1]) || 0;
    out[sku] = { row: i + 2, stok: stok, po: po, ots: ots, sisa: stok - po - ots };
  }
  return out;
}

var SIZE_COL = 14; // column N: the per-size stock table, rows 2-17

/** {"SKU|size": {row, stok, po, sisa}} from the per-size table; empty when the table is not there. */
function sizes_(sh) {
  var rows = sh.getRange(2, SIZE_COL, 16, 4).getValues(); // SKU, Ukuran, Stok, Terjual PO
  var out = {};
  for (var i = 0; i < rows.length; i++) {
    var sku = String(rows[i][0] || '').trim(), size = String(rows[i][1] || '').trim();
    if (!sku || !size) continue;
    var stok = Number(rows[i][2]) || 0, po = Number(rows[i][3]) || 0;
    out[sku + '|' + size] = { row: i + 2, stok: stok, po: po, sisa: stok - po };
  }
  return out;
}

/** Run once from the editor: makes sure the order table's title and header exist. Safe to run again. */
function setup() {
  var sh = sheet_();
  productCols_(sh); // throws a readable error when the price table is not where it should be
  if (!orderHeaderRow_(sh)) {
    sh.getRange(19, 1).setValue(ORDER_TITLE).setFontWeight('bold');
    sh.getRange(20, 1, 1, ORDER_HEADER.length).setValues([ORDER_HEADER]).setFontWeight('bold').setBackground('#9b69c7').setFontColor('#ffffff');
    sh.getRange(21, 4, sh.getMaxRows() - 20, 1).setNumberFormat('@');
    sh.getRange(21, 11, sh.getMaxRows() - 20, 1).setNumberFormat('@');
  }
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/** GET ?action=stok -> {"ok":true,"stok":{"ASJ-B-GK-1": 20, ...}} (Sisa Stok per SKU) for the live stock on the site. */
function doGet(e) {
  var sh = sheet_();
  var hdr = orderHeaderRow_(sh);
  if (!hdr) return json_({ ok: false, error: 'server', message: 'order table not found, run setup()' });
  var stok = {};
  var p = products_(sh, hdr);
  for (var sku in p) stok[sku] = Math.max(0, p[sku].sisa);
  // Items sold in sizes: {"ASJ-B-PA-1": {"M": 3, "L": 3, "XL": 2}}
  var sizes = {};
  var z = sizes_(sh);
  for (var key in z) {
    var parts = key.split('|');
    (sizes[parts[0]] = sizes[parts[0]] || {})[parts[1]] = Math.max(0, z[key].sisa);
  }
  return json_({ ok: true, stok: stok, sizes: sizes });
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var order = JSON.parse(e.postData.contents);
    var props = PropertiesService.getScriptProperties();
    var secret = props.getProperty('SECRET');
    if (secret && order.secret !== secret) return json_({ ok: false, error: 'auth' });

    var sh = sheet_();
    var hdr = orderHeaderRow_(sh);
    if (!hdr) return json_({ ok: false, error: 'server', message: 'order table not found, run setup()' });
    var cols = productCols_(sh);
    var prod = products_(sh, hdr);
    var sz = sizes_(sh);

    // Stock is counted per pile: the site sends order.stock = {"SKU": units, "SKU|size": units} with bundles already
    // split into the pieces they contain. (Older sites only send the lines.)
    var asked = order.stock;
    if (!asked) {
      asked = {};
      order.lines.forEach(function (l) { asked[l.sku] = (asked[l.sku] || 0) + l.qty; });
    }
    for (var key in asked) {
      var left = key.indexOf('|') >= 0 ? (sz[key] ? Math.max(0, sz[key].sisa) : 0) : (prod[key] ? Math.max(0, prod[key].sisa) : 0);
      if (asked[key] > left) return json_({ ok: false, error: 'stok', sku: key, tersisa: left });
    }

    // Next number: the larger of the saved counter and the highest number already in the sheet, plus one.
    var bCol = sh.getRange(hdr + 1, 2, Math.max(sh.getMaxRows() - hdr, 1), 1).getValues();
    var nextRow = 0;
    var highest = 0;
    for (var i = 0; i < bCol.length; i++) {
      var v = String(bCol[i][0] || '');
      if (!v && !nextRow) nextRow = hdr + 1 + i;
      var m = v.match(/^PO-(\d+)$/);
      if (m) highest = Math.max(highest, Number(m[1]));
    }
    if (!nextRow) { sh.insertRowAfter(sh.getMaxRows()); nextRow = sh.getMaxRows(); }
    var n = Math.max(Number(props.getProperty('PO_COUNTER') || 0), highest) + 1;
    props.setProperty('PO_COUNTER', String(n));
    var noPO = 'PO-' + ('0000' + n).slice(-4);

    // Count the pieces as sold: Terjual PO goes up, so Sisa Stok (and MasterMerch) follow by formula.
    // Bundle rows are left alone on purpose: they have no stock of their own, the pieces carry it.
    // A sized piece is counted in its size row and in the item's own row, so both stay in step.
    var addMain = {};
    for (var k in asked) {
      var sku = k.split('|')[0];
      addMain[sku] = (addMain[sku] || 0) + asked[k];
      if (k.indexOf('|') >= 0) sh.getRange(sz[k].row, SIZE_COL + 3).setValue(sz[k].po + asked[k]);
    }
    for (var m in addMain) sh.getRange(prod[m].row, cols['Terjual PO']).setValue(prod[m].po + addMain[m]);

    var items = order.lines.map(function (l) {
      return l.name + (l.ukuran ? ' (' + l.ukuran + ')' : '') + ' x' + l.qty;
    }).join('; ');
    var note = order.catatanUser !== undefined ? order.catatanUser : order.catatan;
    sh.getRange(nextRow, 4).setNumberFormat('@');
    sh.getRange(nextRow, 11).setNumberFormat('@');
    sh.getRange(nextRow, 1, 1, ORDER_HEADER.length).setValues([[
      Utilities.formatDate(new Date(), TZ, 'yyyy-MM-dd HH:mm:ss'), noPO, order.nama, order.whatsapp, items,
      order.totalQty, order.metode, order.alamat || '', order.kota || '', order.provinsi || '', order.kodepos || '',
      note || '', order.total, FIRST_STATUS,
    ]]);
    return json_({ ok: true, noPO: noPO });
  } catch (err) {
    return json_({ ok: false, error: 'server', message: String(err) });
  } finally {
    lock.releaseLock();
  }
}
