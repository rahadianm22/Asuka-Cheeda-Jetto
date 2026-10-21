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
    `DESCRIPTION:Tunjukin tiket ${order.noPO} a.n. ${order.nama} ke kasir booth. Bayar Rp${order.total.toLocaleString('id-ID')} pakai QRIS booth.`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
  downloadBlob(new Blob([ics], { type: 'text/calendar;charset=utf-8' }), `${order.noPO}-cf23.ics`);
}

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

  const waText = `Halo admin, aku ${order.nama}. Nomor PO-ku ${order.noPO}.`;
  const steps = [
    ['Datang ke booth Jetto', ` di CF23 antara jam ${EVENT.hoursLabel.replace(' – ', ' dan ').replace(' WIB', '')} WIB.`],
    ['Tunjukin tiket PO', ' (nomor PO + nama) ke kasir booth.'],
    ['Bayar pakai QRIS booth', ` sejumlah ${rp(order.total)}, terus merch langsung dibawa pulang. Pat pat~`],
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
          02 · Datang ke booth CF23
        </li>
        <li>
          <span className="m-dot m-dot-off">3</span>
          03 · Bayar &amp; ambil merch
        </li>
      </ol>

      <div className="m-success-cols">
        <section className="m-pass-panel" aria-labelledby="m-booth-title">
          <div className="m-pass-head">
            <span className="m-kicker m-kicker-lav">Bayar di tempat</span>
            <h1 id="m-booth-title" ref={titleRef} tabIndex={-1}>
              Sampai jumpa di booth CF23~
            </h1>
            <span>Merch kamu udah dicatat &amp; disisihin. Bayarnya nanti langsung di booth pakai QRIS booth, harga PO tetap berlaku.</span>
          </div>

          <div className="m-pass-body">
            <div className="m-ticket-wrap">
              {/* The whole capture frame is what "Simpan tiket" saves as a PNG. */}
              <div className="m-ticket-frame" ref={ticketRef}>
                <div className="m-ticket">
                  <div className="m-ticket-top">
                    <span className="m-kicker">Tiket ambil PO</span>
                    <span className="m-chip-dark">CF23</span>
                  </div>
                  <div className="m-ticket-mid">
                    <span className="m-ticket-hint">Tunjukin nomor ini ke kasir booth</span>
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
                      <dd>Rp0</dd>
                    </div>
                  </dl>
                  <div className="m-ticket-pay">
                    <span>Bayar di booth</span>
                    <strong>{rp(order.total)}</strong>
                  </div>
                  <div className="m-ticket-foot">
                    <span>Booth {EVENT.booth} · {EVENT.venue}</span>
                    <span>{EVENT.daysLabel}</span>
                    <span>Jam ambil {EVENT.hoursLabel}</span>
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
                {[
                  ['Booth', EVENT.booth],
                  ['Hari', EVENT.daysLabel],
                  ['Jam ambil', EVENT.hoursLabel],
                  ['Lokasi', EVENT.venue],
                ].map(([k, v]) => (
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
            <p>
              <strong>Pesanan disimpan sampai {EVENT.pickupDeadlineLabel}.</strong> Lewat dari itu, merch bisa dilepas ke pembeli OTS.
              {ADMIN_WA ? ' Kalau berhalangan, kabarin admin lewat WhatsApp, ya.' : ' Kalau berhalangan, kabarin admin ya.'}
            </p>
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
            <button type="button" onClick={() => saveCalendar(order)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3" y="5" width="18" height="16" rx="1" />
                <path d="M16 3v4" />
                <path d="M8 3v4" />
                <path d="M3 11h18" />
              </svg>
              Simpan ke kalender
            </button>
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
                <dd>Ambil di CF23</dd>
              </div>
              <div>
                <dt>Hemat vs OTS</dt>
                <dd className="m-saving">{order.hemat ? `−${rp(order.hemat)}` : 'Rp0'}</dd>
              </div>
              <div>
                <dt>Ongkir</dt>
                <dd>Rp0</dd>
              </div>
              <div>
                <dt>Status bayar</dt>
                <dd className="m-saving">Bayar di booth</dd>
              </div>
              <div className="m-sum-total">
                <dt>Total</dt>
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
              <strong>Screenshot halaman ini, ya!</strong> Nomor PO dipakai kasir buat nyari pesananmu di booth.
            </p>
          </div>

          <a className="m-btn-ghost" href="/">
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
