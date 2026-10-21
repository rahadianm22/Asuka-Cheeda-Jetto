'use client';

import { COPY, fmt } from '@/lib/merch-copy';
import { rp, lineKey } from '@/lib/po-core';

export default function ProductCard({ p, cart, size, onSize, onChange }) {
  const sizes = p.sizes || null;
  const activeSize = sizes ? size || sizes[0] : null;
  const qtyOf = (s) => cart[lineKey(p.sku, s)] || 0;
  const used = sizes ? sizes.reduce((n, s) => n + qtyOf(s), 0) : qtyOf(null);
  const qty = qtyOf(activeSize);
  const left = p.stock - used;
  const soldOut = p.stock <= 0;
  const incOff = soldOut || used >= p.stock;

  let stockText;
  let stockClass = 'm-stock';
  if (soldOut) {
    stockText = COPY.stockOut;
    stockClass += ' is-out';
  } else if (p.stock <= 10) {
    stockText = fmt(COPY.stockLow, { n: left, m: p.stock });
    stockClass += ' is-low';
  } else {
    stockText = fmt(COPY.stockOk, { n: left });
    stockClass += ' is-ok';
  }

  return (
    <article className={`m-card${used > 0 ? ' is-picked' : ''}${soldOut ? ' is-out' : ''}`}>
      <div className="m-card-photo">
        <span className="m-stage-floor" aria-hidden="true" />
        <span className="m-stage-shadow" aria-hidden="true" />
        {p.img ? (
          <img className="m-stage-img" src={p.img} alt={p.name} width={840} height={840} loading="lazy" decoding="async" />
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
        <div className="m-price">
          <strong>{rp(p.po)}</strong>
          {p.ots > p.po && (
            <span>
              <s>{rp(p.ots)}</s> {COPY.ots}
            </span>
          )}
        </div>
        <span className={stockClass}>{stockText}</span>
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
        <div className="m-stepper">
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
