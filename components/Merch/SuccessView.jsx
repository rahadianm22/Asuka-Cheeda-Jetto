'use client';

import { useEffect, useRef, useState } from 'react';
import { EVENT, ADMIN_WA } from '@/lib/po-config';
import { rp, lineLabel } from '@/lib/po-core';

const icsStamp = (iso) => new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// html-to-image cannot read rules of the cross-origin Google Fonts stylesheet (it throws and logs a
// SecurityError), so the Latin font files are fetched here and handed over as ready-made CSS.
let fontCssCache = null;
async function loadFontCss() {
  if (fontCssCache !== null) return fontCssCache;
  try {
    const href = document.querySelector('link[href*="fonts.googleapis.com/css2"]')?.href;
    if (!href) return (fontCssCache = '');
    const css = await (await fetch(href)).text();
    const blocks = [...css.matchAll(/\/\*\s*latin\s*\*\/\s*(@font-face\s*\{[^}]*\})/g)].map((m) => m[1]);
    const inlined = await Promise.all(
      blocks.map(async (block) => {
        const url = block.match(/url\(([^)]+)\)/)?.[1];
        if (!url) return '';
        const blob = await (await fetch(url)).blob();
        const data = await new Promise((resolve) => {
          const r = new FileReader();
          r.onload = () => resolve(r.result);
          r.readAsDataURL(blob);
        });
        return block.replace(url, data);
      }),
    );
    return (fontCssCache = inlined.join('\n'));
  } catch {
    return (fontCssCache = '');
  }
}

function saveCalendar(order) {
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Website Asuka Jetto//PO CF23//ID',
    'BEGIN:VEVENT',
    `UID:${order.noPO}@asukajetto.my.id`,
    `DTSTAMP:${icsStamp(new Date().toISOString())}`,
    `DTSTART:${icsStamp(EVENT.calendarStart)}`,
    `DTEND:${icsStamp(EVENT.calendarEnd)}`,
    `SUMMARY:Ambil merch Asuka Jetto (${order.noPO})`,
    `LOCATION:${EVENT.venue} · Booth ${EVENT.booth}`,
    `DESCRIPTION:Tunjukin tiket ${order.noPO} a.n. ${order.nama} ke kasir booth.`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
  downloadBlob(new Blob([ics], { type: 'text/calendar;charset=utf-8' }), `${order.noPO}-cf23.ics`);
}

// How the admin will reach the buyer, from whichever contact they filled in.
const contactLine = (o) =>
  [o.whatsapp && `WhatsApp +${o.whatsapp}`, o.email && `email ${o.email}`, o.sosmed && o.sosmed].filter(Boolean).join(' · ');

export default function SuccessView({ order, onAnother }) {
  const ticketRef = useRef(null);
  const titleRef = useRef(null);
  const [note, setNote] = useState('');

  useEffect(() => {
    window.scrollTo({ top: 0 });
    titleRef.current?.focus();
  }, []);

  const say = (text) => {
    setNote(text);
    setTimeout(() => setNote(''), 2500);
  };

  async function saveTicket() {
    try {
      const { toPng } = await import('html-to-image');
      const dataUrl = await toPng(ticketRef.current, {
        pixelRatio: 2,
        backgroundColor: '#17111f',
        fontEmbedCSS: await loadFontCss(),
      });
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `tiket-${order.noPO}.png`;
      a.click();
    } catch {
      say('Gagal menyimpan gambar. Screenshot aja ya~');
    }
  }

  async function copyNumber() {
    try {
      await navigator.clipboard.writeText(order.noPO);
      say('Nomor PO tersalin!');
    } catch {
      say('Gagal menyalin. Salin manual ya~');
    }
  }

  // Payment is arranged manually by the admin for every order, so the site never shows a payment method.
  const shipped = order.metode === 'kirim';
  const waText = shipped
    ? `Halo admin, aku ${order.nama}. Nomor PO-ku ${order.noPO}, mau tanya soal ongkir & pembayaran.`
    : `Halo admin, aku ${order.nama}. Nomor PO-ku ${order.noPO}, mau tanya soal pembayaran.`;
  const steps = shipped
    ? [
        ['Admin cek ongkir', ' ke alamat yang kamu isi.'],
        ['Kamu dikabarin lewat kontakmu', ' soal total + ongkir dan cara bayarnya. Pastikan kontak yang kamu isi bisa dihubungi, ya.'],
        ['Bayar sesuai arahan admin', ', terus merch dikirim ke alamatmu. Pat pat~'],
      ]
    : [
        ['Kamu dikabarin lewat kontakmu', ' soal total dan cara bayarnya. Pastikan kontak yang kamu isi bisa dihubungi, ya.'],
        ['Bayar sesuai arahan admin', ', biar pesananmu terkonfirmasi.'],
        ['Datang ke booth Jetto', ` di CF23 antara jam ${EVENT.hoursLabel.replace(' – ', ' dan ').replace(' WIB', '')} WIB, tunjukin tiket PO (nomor PO + nama) ke kasir. Merch langsung dibawa pulang. Pat pat~`],
      ];

  return (
    <div className="m-success">
      <ol className="m-progress" aria-label="Tahap pesanan">
        <li className="is-done">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M20 6L9 17l-5-5" />
          </svg>
          01 · Isi formulir
        </li>
        <li className="is-now" aria-current="step">
          <span className="m-dot">2</span>
          02 · Konfirmasi &amp; bayar
        </li>
        <li>
          <span className="m-dot m-dot-off">3</span>
          {shipped ? '03 · Merch dikirim' : '03 · Ambil di booth CF23'}
        </li>
      </ol>

      <div className="m-success-cols">
        <section className="m-pass-panel" aria-labelledby="m-booth-title">
          <div className="m-pass-head">
            <span className="m-kicker m-kicker-lav">{shipped ? 'Tinggal tunggu kabar' : 'Satu langkah lagi'}</span>
            <h1 id="m-booth-title" ref={titleRef} tabIndex={-1}>
              {shipped ? 'Admin segera kabarin kamu~' : 'Sampai jumpa di booth CF23~'}
            </h1>
            <span>
              {shipped
                ? 'Merch kamu udah dicatat & disisihin. Admin bakal cek ongkir ke alamatmu, lalu kabarin total + ongkir dan cara bayarnya lewat kontak yang kamu isi. Harga PO tetap berlaku.'
                : 'Merch kamu udah dicatat & disisihin. Admin bakal kabarin total dan cara bayarnya lewat kontak yang kamu isi, abis itu tinggal ambil di booth CF23. Harga PO tetap berlaku.'}
            </span>
          </div>

          <div className="m-pass-body">
            <div className="m-ticket-wrap">
              {/* The whole capture frame is what "Simpan tiket" saves as a PNG. */}
              <div className="m-ticket-frame" ref={ticketRef}>
                <div className="m-ticket">
                  <div className="m-ticket-top">
                    <span className="m-kicker">{shipped ? 'Nomor pesanan PO' : 'Tiket ambil PO'}</span>
                    <span className="m-chip-dark">{shipped ? 'KIRIM' : 'CF23'}</span>
                  </div>
                  <div className="m-ticket-mid">
                    <span className="m-ticket-hint">{shipped ? 'Sebutin nomor ini kalau tanya admin' : 'Tunjukin nomor ini ke kasir booth'}</span>
                    <span className="m-ticket-no">#{order.noPO}</span>
                    <span className="m-ticket-name">a.n. {order.nama}</span>
                  </div>
                  <div className="m-ticket-items">
                    <span className="m-kicker">Detail pesanan · {order.totalQty} pcs</span>
                    {order.items.map((l) => (
                      <div className="m-ticket-item" key={`${l.sku}|${l.ukuran}`}>
                        <div className="m-thumb m-thumb-sm">
                          {l.img ? <img src={l.img} alt="" width={48} height={48} /> : <span aria-hidden="true" />}
                        </div>
                        <div className="m-rv-name">
                          <span>{lineLabel(l)}</span>
                          <span className="m-mono-sm">
                            {l.qty} × {rp(l.unit)}
                          </span>
                        </div>
                        <strong className="m-mono-md">{rp(l.total)}</strong>
                      </div>
                    ))}
                  </div>
                  <dl className="m-ticket-rows">
                    <div>
                      <dt>Hemat vs OTS</dt>
                      <dd className="m-saving">{order.hemat ? `−${rp(order.hemat)}` : 'Rp0'}</dd>
                    </div>
                    <div>
                      <dt>Ongkir</dt>
                      <dd>{shipped ? 'menyusul via kontakmu' : 'Rp0'}</dd>
                    </div>
                  </dl>
                  <div className="m-ticket-pay">
                    <span>Total merch</span>
                    <strong>{rp(order.total)}</strong>
                  </div>
                  <div className="m-ticket-foot">
                    {shipped ? (
                      <>
                        <span>Dikirim ke:</span>
                        <span>{order.alamat}</span>
                      </>
                    ) : (
                      <>
                        <span>Booth {EVENT.booth} · {EVENT.venue}</span>
                        <span>{EVENT.daysLabel}</span>
                        <span>Jam ambil {EVENT.hoursLabel}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="m-ticket-actions">
                <button type="button" className="m-btn-dark" onClick={saveTicket}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <path d="M7 10l5 5 5-5" />
                    <path d="M12 15V3" />
                  </svg>
                  Simpan tiket
                </button>
                <button type="button" className="m-btn-line-dark" onClick={copyNumber} aria-label="Salin nomor pesanan">
                  Salin
                </button>
              </div>
              <span className="m-copy-note" role="status" aria-live="polite">
                {note}
              </span>
            </div>

            <div className="m-pass-side">
              <dl className="m-facts">
                {(shipped
                  ? [
                      ['Pengambilan', 'Dikirim ke alamat'],
                      ['Ongkir', 'Dicek admin'],
                      ['Kabar via', contactLine(order) || '—'],
                      ['Status', 'Menunggu admin'],
                    ]
                  : [
                      ['Booth', EVENT.booth],
                      ['Hari', EVENT.daysLabel],
                      ['Jam ambil', EVENT.hoursLabel],
                      ['Lokasi', EVENT.venue],
                    ]
                ).map(([k, v]) => (
                  <div key={k}>
                    <dt>{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
              </dl>
              <ol className="m-steps">
                {steps.map(([bold, rest], i) => (
                  <li key={bold}>
                    <span>{i + 1}</span>
                    <span>
                      <strong>{bold}</strong>
                      {rest}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <div className="m-warn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 8v4" />
              <path d="M12 16h.01" />
            </svg>
            {shipped ? (
              <p>
                <strong>Pastikan kontak yang kamu isi bisa dihubungi.</strong> Pesanan baru diproses setelah admin kabarin ongkir dan kamu konfirmasi. Salah alamat? Kabarin admin secepatnya.
              </p>
            ) : (
              <p>
                <strong>Pesanan disimpan sampai {EVENT.pickupDeadlineLabel}.</strong> Lewat dari itu, merch bisa dilepas ke pembeli OTS.
                {ADMIN_WA ? ' Kalau berhalangan, kabarin admin lewat WhatsApp, ya.' : ' Kalau berhalangan, kabarin admin ya.'}
              </p>
            )}
          </div>

          <div className="m-pass-links">
            {ADMIN_WA && (
              <a href={`https://wa.me/${ADMIN_WA}?text=${encodeURIComponent(waText)}`} target="_blank" rel="noopener noreferrer">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M21 11.5a8.4 8.4 0 0 1-12.5 7.4L3 21l2.1-5.4A8.4 8.4 0 1 1 21 11.5z" />
                </svg>
                Hubungi admin via WhatsApp
              </a>
            )}
            {!shipped && (
              <button type="button" onClick={() => saveCalendar(order)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="3" y="5" width="18" height="16" rx="1" />
                  <path d="M16 3v4" />
                  <path d="M8 3v4" />
                  <path d="M3 11h18" />
                </svg>
                Simpan ke kalender
              </button>
            )}
          </div>
        </section>

        <aside className="m-receipt-col">
          <div className="m-receipt">
            <div className="m-receipt-head">
              <div>
                <span className="m-kicker">Berkas pesanan · diterima</span>
                <h2>Pesananmu udah masuk~</h2>
              </div>
              <span className="m-stamp" aria-hidden="true">DISIMPAN</span>
            </div>

            <div className="m-receipt-lines">
              {order.items.map((l) => (
                <div className="m-rv-line" key={`${l.sku}|${l.ukuran}`}>
                  <div className="m-thumb m-thumb-sm">
                    {l.img ? <img src={l.img} alt="" width={48} height={48} /> : <span aria-hidden="true" />}
                  </div>
                  <div className="m-rv-name">
                    <span>{lineLabel(l)}</span>
                    <span className="m-mono-sm">
                      {l.qty} × {rp(l.unit)}
                    </span>
                  </div>
                  <strong className="m-mono-md">{rp(l.total)}</strong>
                </div>
              ))}
            </div>

            <dl className="m-sum-rows m-receipt-rows">
              <div>
                <dt>Nama</dt>
                <dd className="m-sans">{order.nama}</dd>
              </div>
              <div>
                <dt>Pengambilan</dt>
                <dd>{shipped ? 'Dikirim' : 'Ambil di CF23'}</dd>
              </div>
              <div>
                <dt>Hemat vs OTS</dt>
                <dd className="m-saving">{order.hemat ? `−${rp(order.hemat)}` : 'Rp0'}</dd>
              </div>
              <div>
                <dt>Ongkir</dt>
                <dd>{shipped ? 'menyusul via kontakmu' : 'Rp0'}</dd>
              </div>
              <div>
                <dt>Status bayar</dt>
                <dd className="m-saving">Menunggu konfirmasi admin</dd>
              </div>
              <div className="m-sum-total">
                <dt>{shipped ? 'Total merch' : 'Total'}</dt>
                <dd>{rp(order.total)}</dd>
              </div>
            </dl>
          </div>

          <div className="m-info">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <p>
              <strong>Screenshot halaman ini, ya!</strong>{' '}
              {shipped ? 'Nomor PO dipakai admin buat nyari pesananmu.' : 'Nomor PO dipakai kasir buat nyari pesananmu di booth.'}
            </p>
          </div>

          <a className="m-btn-solid" href="/">
            Balik ke beranda
          </a>
          <button type="button" className="m-btn-ghost" onClick={onAnother}>
            Isi pesanan lain
          </button>
        </aside>
      </div>
    </div>
  );
}
