'use client';

import { useId, useState } from 'react';
import { COPY, fmt, getStockLabel } from '@/lib/merch-copy';
import { rp, lineKey } from '@/lib/po-core';

// "OTS" explains itself: a tooltip that opens on hover, on keyboard focus and on tap, and closes with Escape.
function OtsHint() {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <span className="m-ots-wrap">
      <button
        type="button"
        className="m-ots"
        aria-describedby={id}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}
      >
        {COPY.ots}
      </button>
      <span id={id} role="tooltip" className={`m-ots-tip${open ? ' is-open' : ''}`}>
        {COPY.otsTip}
      </span>
    </span>
  );
}

export default function ProductCard({ p, cart, free = {}, size, onSize, onChange }) {
  const sizes = p.sizes || null;
  // Default to the first size that is still in stock, so a sold-out M does not hide the other sizes.
  const activeSize = sizes ? size || sizes.find((sz) => (p.sizeStock?.[sz] ?? 0) > 0) || sizes[0] : null;
  const qtyOf = (s) => cart[lineKey(p.sku, s)] || 0;
  const used = sizes ? sizes.reduce((n, s) => n + qtyOf(s), 0) : qtyOf(null);
  const qty = qtyOf(activeSize);
  // `free` is how many units of this product-and-size can be in the cart, already counting what other lines take
  // from shared piles (a bundle and a single item can share a shirt size).
  const freeFor = (sz) => free[lineKey(p.sku, sz)] ?? (sz ? p.sizeStock?.[sz] : p.stock) ?? 0;
  const left = freeFor(activeSize) - qty;
  const soldOut = p.stock <= 0; // nothing left in any size
  const incOff = soldOut || left <= 0;

  // For a sized product the line shows the chosen size; a size that is gone says so even when others are in stock.
  const sizeGone = !!sizes && (p.sizeStock?.[activeSize] ?? 0) <= 0;
  const stock = getStockLabel(left, soldOut || sizeGone);

  return (
    <article
      className={`m-card${used > 0 ? ' is-picked' : ''}${soldOut ? ' is-out' : ''}`}
      style={p.tilt ? { '--rot': `${p.tilt.rest}deg`, '--rot-hover': `${p.tilt.hover}deg` } : undefined}
    >
      <div className="m-card-photo">
        <span className="m-stage-floor" aria-hidden="true" />
        <span className="m-stage-shadow" aria-hidden="true" />
        {p.img ? (
          <>
            <img className="m-stage-img" src={p.img} alt={p.name} width={840} height={840} loading="lazy" decoding="async" />
            {/* Lenticular cards flip to a second picture while hovered. */}
            {p.imgHover && <img className="m-stage-img m-stage-alt" src={p.imgHover} alt="" width={840} height={840} loading="lazy" decoding="async" aria-hidden="true" />}
          </>
        ) : (
          <div className="m-card-nophoto" role="img" aria-label={`${COPY.photoMissing}: ${p.name}`}>
            <span>[FOTO]</span>
            <span>{p.sku}</span>
          </div>
        )}
        <span className="m-chip-type">{p.type}</span>
        {used > 0 && <span className="m-chip-cart">{fmt(COPY.inCart, { n: used })}</span>}
        {soldOut && (
          <span className="m-soldout" aria-hidden="true">
            <span>{COPY.soldOut}</span>
          </span>
        )}
      </div>

      <div className="m-card-info">
        <span className="m-sku">{p.sku}</span>
        <h3>{p.name}</h3>
        <p className="m-tagline" title={p.tagline || undefined}>{p.tagline}</p>
        <div className="m-price">
          <strong>{rp(p.po)}</strong>
          {p.ots > p.po && (
            <span>
              <s>{rp(p.ots)}</s> <OtsHint />
            </span>
          )}
        </div>
        <span className={`m-stock is-${stock.tone}`}>{stock.text}</span>
      </div>

      {sizes && (
        <div className="m-sizes">
          <span>{COPY.size}</span>
          <div role="group" aria-label={COPY.sizeAria}>
            {sizes.map((s) => (
              <button
                key={s}
                type="button"
                aria-pressed={s === activeSize}
                disabled={(p.sizeStock?.[s] ?? 0) <= 0 && qtyOf(s) === 0}
                onClick={() => onSize(p.sku, s)}
              >
                {qtyOf(s) ? `${s} · ${qtyOf(s)}` : s}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="m-stepper-row">
        <span>{sizes ? fmt(COPY.qtySize, { size: activeSize }) : COPY.qty}</span>
        <div className="m-stepper" title={COPY.qtyHint}>
          <button
            type="button"
            disabled={qty === 0}
            aria-label={fmt(COPY.dec, { name: p.name })}
            onClick={() => onChange(p, activeSize, -1)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M5 12h14" />
            </svg>
          </button>
          <output aria-live="polite">{qty}</output>
          <button
            type="button"
            disabled={incOff}
            aria-label={fmt(COPY.inc, { name: p.name })}
            onClick={() => onChange(p, activeSize, 1)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M12 5v14" />
              <path d="M5 12h14" />
            </svg>
          </button>
        </div>
      </div>
    </article>
  );
}
