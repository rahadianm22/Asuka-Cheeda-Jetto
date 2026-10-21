'use client';

import { useEffect, useRef } from 'react';
import { COPY } from '@/lib/merch-copy';
import { rp, lineLabel } from '@/lib/po-core';

const FOCUSABLE = 'button:not([disabled]), a[href], input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function ReviewDialog({ priced, contact, method, address, onClose, onConfirm, submitting, error }) {
  const dialogRef = useRef(null);
  // Latest values for the key handler, so it can be attached once.
  const live = useRef({ onClose, submitting });
  live.current = { onClose, submitting };

  useEffect(() => {
    const opener = document.activeElement;
    const dialog = dialogRef.current;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog.focus();

    const onKey = (e) => {
      if (e.key === 'Escape') {
        if (!live.current.submitting) live.current.onClose();
        return;
      }
      if (e.key !== 'Tab') return;
      const items = [...dialog.querySelectorAll(FOCUSABLE)];
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && (document.activeElement === first || document.activeElement === dialog)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      if (opener instanceof HTMLElement) opener.focus();
    };
  }, []);

  const { lines, totalQty, subtotal, hemat } = priced;

  return (
    <div
      className="m-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !submitting) onClose();
      }}
    >
      <div ref={dialogRef} className="m-dialog" role="dialog" aria-modal="true" aria-labelledby="m-review-title" tabIndex={-1}>
        <div className="m-dialog-head">
          <div>
            <span className="m-kicker">{COPY.rvKicker}</span>
            <h2 id="m-review-title">{COPY.rvTitle}</h2>
            <span className="m-dialog-sub">{COPY.rvSub}</span>
          </div>
          <button type="button" className="m-icon-btn" onClick={onClose} disabled={submitting} aria-label={COPY.rvClose}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M18 6L6 18" />
              <path d="M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="m-dialog-block">
          <span className="m-kicker">{COPY.rvOrder}</span>
          {lines.map((l) => (
            <div className="m-rv-line" key={`${l.sku}|${l.ukuran}`}>
              <div className="m-thumb">
                {l.img ? <img src={l.img} alt="" width={56} height={56} /> : <span aria-hidden="true" />}
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

        <dl className="m-rv-grid">
          <div>
            <dt>{COPY.rvName}</dt>
            <dd>{contact.nama}</dd>
          </div>
          <div>
            <dt>{COPY.rvWa}</dt>
            <dd className="m-mono-md">{contact.whatsapp}</dd>
          </div>
          <div className="m-wide">
            <dt>{COPY.rvPickup}</dt>
            <dd>{method === 'kirim' ? 'Dikirim ke alamat' : COPY.rvPickupValue}</dd>
            {method === 'kirim' && <dd className="m-rv-soft">{address}</dd>}
          </div>
          {contact.catatan && (
            <div className="m-wide">
              <dt>{COPY.rvNote}</dt>
              <dd className="m-rv-soft m-pre">{contact.catatan}</dd>
            </div>
          )}
        </dl>

        <dl className="m-sum-rows m-dialog-totals">
          <div>
            <dt>{COPY.sumItems}</dt>
            <dd>{totalQty} pcs</dd>
          </div>
          <div>
            <dt>{COPY.sumSaving}</dt>
            <dd className="m-saving">{hemat ? `−${rp(hemat)}` : 'Rp0'}</dd>
          </div>
          <div>
            <dt>{COPY.sumShipping}</dt>
            <dd>{method === 'kirim' ? '+ dicek admin' : 'Rp0'}</dd>
          </div>
          <div className="m-sum-total">
            <dt>{COPY.sumTotal}</dt>
            <dd>{rp(subtotal)}</dd>
          </div>
        </dl>
        {method === 'kirim' && <p className="m-ship-note m-ship-note-dialog" role="note">{COPY.shipNote}</p>}

        <p className="m-dialog-pay">{method === 'kirim' ? COPY.rvPayNoteShip : COPY.rvPayNote}</p>
        {error && (
          <p className="m-dialog-error" role="alert">
            {error}
          </p>
        )}

        <div className="m-dialog-actions">
          <button type="button" className="m-btn-outline" onClick={onClose} disabled={submitting}>
            {COPY.rvEdit}
          </button>
          <button type="button" className="m-btn-primary" onClick={onConfirm} disabled={submitting} aria-busy={submitting}>
            {submitting ? COPY.rvSending : COPY.rvSend}
            {!submitting && (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12h14" />
                <path d="M12 5l7 7-7 7" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
