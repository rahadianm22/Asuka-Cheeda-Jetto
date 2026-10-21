'use client';

import { useState } from 'react';
import { COPY } from '@/lib/merch-copy';
import { rp, lineLabel } from '@/lib/po-core';

export default function Summary({ priced, method, canReview, onReview, adminWa }) {
  const [open, setOpen] = useState(false);
  const { lines, totalQty, subtotal, hemat } = priced;

  return (
    <aside className={`m-summary${open ? ' is-open' : ''}`} aria-label={COPY.sumKicker}>
      <div className="m-sum-card">
        {/* Phones: the card is a bottom bar; this row opens the receipt above it. */}
        <button
          type="button"
          className="m-sum-toggle"
          aria-expanded={open}
          aria-controls="m-sum-body"
          onClick={() => setOpen((v) => !v)}
        >
          <span>
            {COPY.sumToggle} · {totalQty} pcs
          </span>
          <strong>{rp(subtotal)}</strong>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M6 15l6-6 6 6" />
          </svg>
        </button>

        <div id="m-sum-body" className="m-sum-body">
          <div className="m-sum-head">
            <div>
              <div className="m-kicker">{COPY.sumKicker}</div>
              <div className="m-sum-title">{COPY.sumTitle}</div>
            </div>
            <div className="m-stamp" aria-hidden="true">PO · CF23</div>
          </div>

          <div className="m-sum-lines">
            {lines.length === 0 && <p className="m-sum-empty">{COPY.sumEmpty}</p>}
            {lines.map((l) => (
              <div key={`${l.sku}|${l.ukuran}`}>
                <span>
                  {lineLabel(l)} <em>×{l.qty}</em>
                </span>
                <span>{rp(l.total)}</span>
              </div>
            ))}
          </div>

          <dl className="m-sum-rows">
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
              <dd>{method === 'kirim' ? COPY.sumShippingShip : 'Rp0'}</dd>
            </div>
            <div className="m-sum-total">
              <dt>{COPY.sumTotal}</dt>
              <dd>{rp(subtotal)}</dd>
            </div>
          </dl>
          {method === 'kirim' && <p className="m-ship-note" role="note">{COPY.shipNote}</p>}
        </div>

        <button type="button" className="m-btn-primary" disabled={!canReview} onClick={onReview}>
          {COPY.review}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </button>
        <p className="m-sum-hint">{canReview ? COPY.hintReady : COPY.hintEmpty}</p>
      </div>

      <div className="m-info">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 16v-4" />
          <path d="M12 8h.01" />
        </svg>
        <p>
          {method === 'kirim' ? COPY.sumInfoShip : COPY.sumInfo}
          {adminWa && (
            <>
              {' '}
              <a href={`https://wa.me/${adminWa}`} target="_blank" rel="noopener noreferrer">
                {COPY.adminHelp}
              </a>
            </>
          )}
        </p>
      </div>
    </aside>
  );
}
