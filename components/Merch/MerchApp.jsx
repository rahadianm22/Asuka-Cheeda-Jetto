'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { COPY, fmt } from '@/lib/merch-copy';
import { EVENT, ADMIN_WA, SHIPPING_ENABLED } from '@/lib/po-config';
import { TYPES } from '@/lib/products';
import { lineKey, priceLines, validateContact, validateAddress, unitsFree, withBundleStock } from '@/lib/po-core';
import ProductCard from './ProductCard';
import Summary from './Summary';
import ReviewDialog from './ReviewDialog';
import SuccessView from './SuccessView';

const STORAGE_KEY = 'jetto-po-order';

const EMPTY_FORM = { nama: '', whatsapp: '', catatan: '', alamat: '', kota: '', provinsi: '', kodepos: '', website: '' };

function Field({ id, label, error, hint, children }) {
  return (
    <div className="m-field">
      <label htmlFor={id}>
        {label} <span className="m-req">*</span>
      </label>
      {children}
      {hint && !error && <span className="m-hint" id={`${id}-hint`}>{hint}</span>}
      {error && (
        <span className="m-error" id={`${id}-err`} role="alert">
          {error}
        </span>
      )}
    </div>
  );
}

function SectionBox({ letter, title, tag, children }) {
  return (
    <fieldset className="m-box">
      <legend>
        <div className="m-box-head">
          <span className="m-box-title">
            <span>{letter}.</span>
            {title}
          </span>
          {tag}
        </div>
      </legend>
      <div className="m-box-body">{children}</div>
    </fieldset>
  );
}

export default function MerchApp({ products: initialProducts, status }) {
  const [products, setProducts] = useState(initialProducts);
  const [cart, setCart] = useState({});
  const [sizes, setSizes] = useState({});
  const [filter, setFilter] = useState('Semua');
  const [form, setForm] = useState(EMPTY_FORM);
  const [method, setMethod] = useState('cf');
  const [errors, setErrors] = useState({});
  const [stockMsg, setStockMsg] = useState('');
  const [reviewing, setReviewing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [order, setOrder] = useState(null);
  const submittingRef = useRef(false);

  // The success page survives a refresh: the order is kept for this tab only.
  useEffect(() => {
    try {
      const saved = window.sessionStorage.getItem(STORAGE_KEY);
      if (saved) setOrder(JSON.parse(saved));
    } catch {}
  }, []);

  const items = useMemo(
    () =>
      products.flatMap((p) =>
        (p.sizes || [null]).map((s) => ({ sku: p.sku, ukuran: s, qty: cart[lineKey(p.sku, s)] || 0 })),
      ),
    [products, cart],
  );
  const priced = useMemo(() => priceLines(items, products), [items, products]);
  const canReview = priced.totalQty > 0;
  // How many units of each product-and-size still fit, counting what the rest of the cart takes from shared piles.
  const free = useMemo(
    () => Object.fromEntries(products.flatMap((p) => (p.sizes || [null]).map((sz) => [lineKey(p.sku, sz), unitsFree(p, sz, items, products)]))),
    [products, items],
  );

  const set = (name) => (e) => setForm((f) => ({ ...f, [name]: e.target.value }));

  function changeQty(p, size, delta) {
    setStockMsg('');
    setCart((c) => {
      const lines = products.flatMap((x) => (x.sizes || [null]).map((s) => ({ sku: x.sku, ukuran: s, qty: c[lineKey(x.sku, s)] || 0 })));
      if (delta > 0 && (c[lineKey(p.sku, size)] || 0) >= unitsFree(p, size, lines, products)) return c;
      const key = lineKey(p.sku, size);
      const next = Math.max(0, (c[key] || 0) + delta);
      return { ...c, [key]: next };
    });
  }

  function validate() {
    const contact = validateContact(form);
    const address = method === 'kirim' ? validateAddress(form) : { errors: {} };
    const found = { ...contact.errors, ...address.errors };
    setErrors(found);
    const first = ['nama', 'whatsapp', 'alamat', 'kota', 'provinsi', 'kodepos'].find((k) => found[k]);
    if (first) {
      document.getElementById(`m-${first}`)?.focus();
      return null;
    }
    return { nama: contact.nama, whatsapp: contact.whatsapp };
  }

  const [contact, setContact] = useState(null);

  function openReview() {
    if (!canReview) return;
    const ok = validate();
    if (!ok) return;
    setContact({ ...ok, catatan: form.catatan.trim() });
    setSubmitError('');
    setReviewing(true);
  }

  async function confirm() {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setSubmitting(true);
    setSubmitError('');
    try {
      const res = await fetch('/api/po', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nama: contact.nama,
          whatsapp: contact.whatsapp,
          catatan: contact.catatan,
          metode: method,
          ...(method === 'kirim' && { alamat: form.alamat, kota: form.kota, provinsi: form.provinsi, kodepos: form.kodepos }),
          website: form.website,
          items: priced.lines.map((l) => ({ sku: l.sku, ukuran: l.ukuran, qty: l.qty })),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (data.ok) {
        try {
          window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch {}
        setReviewing(false);
        setOrder(data);
        return;
      }
      if (data.error === 'stok') {
        const p = products.find((x) => x.sku === data.sku);
        setReviewing(false);
        if (p) {
          setStockMsg(fmt(COPY.stockChanged, { name: data.ukuran ? `${p.name} (${data.ukuran})` : p.name, n: data.tersisa }));
          // Refresh the short pile (it may sit inside a bundle); bundle stock is derived from its pieces.
          const [pileSku, pileSize] = String(data.piece || p.sku).split('|');
          setProducts((list) =>
            withBundleStock(
              list.map((x) => {
                if (x.sku !== pileSku) return x;
                return pileSize ? { ...x, sizeStock: { ...x.sizeStock, [pileSize]: data.pieceLeft } } : { ...x, stock: data.pieceLeft ?? data.tersisa };
              }),
            ),
          );
          // Trim the line that is too big so the cart fits what is left.
          setCart((c) => {
            const k = lineKey(p.sku, data.ukuran || null);
            return { ...c, [k]: Math.min(c[k] || 0, data.tersisa) };
          });
          document.getElementById('m-pick')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        return;
      }
      if (data.error === 'invalid' && data.fields) {
        setReviewing(false);
        setErrors(data.fields);
        return;
      }
      setSubmitError(
        data.error === 'rate' ? COPY.errRate : data.error === 'closed' ? COPY.errClosed : COPY.errGeneric,
      );
    } catch {
      setSubmitError(COPY.errNetwork);
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  }

  // Reloading starts a fresh form and pulls the current stock, which the order just placed has changed.
  function another() {
    try {
      window.sessionStorage.removeItem(STORAGE_KEY);
    } catch {}
    window.scrollTo({ top: 0 });
    window.location.reload();
  }

  if (order) return <SuccessView order={order} onAnother={another} />;

  const shown = filter === 'Semua' ? products : products.filter((p) => p.type === filter);
  const open = status === 'open';
  const statusText = open ? COPY.statusOpen : status === 'soon' ? COPY.statusSoon : COPY.statusClosed;

  return (
    <>
      <section className="m-hero">
        <div className="m-hero-main">
          <div className="m-hero-no">
            <span>No.</span>
            <strong>09</strong>
            <i aria-hidden="true" />
            <span>{COPY.heroNo}</span>
          </div>
          <h1>
            {COPY.heroTitle[0]}
            <br />
            <span>{COPY.heroTitle[1]}</span>
          </h1>
          <p>{COPY.heroText}</p>
        </div>
        <dl className="m-hero-facts">
          <div>
            <dt>{COPY.statusLabel}</dt>
            <dd className={open ? 'is-open' : 'is-shut'}>
              <i aria-hidden="true" />
              {statusText}
            </dd>
          </div>
          <div>
            <dt>{COPY.closeLabel}</dt>
            <dd>{EVENT.poCloseLabel}</dd>
          </div>
          <div className="m-wide">
            <dt>{COPY.pickupLabel}</dt>
            <dd>{COPY.pickupValue}</dd>
          </div>
        </dl>
      </section>

      {!open ? (
        <section className="m-closed" role="status">
          <h2>{status === 'soon' ? COPY.soonTitle : COPY.closedTitle}</h2>
          <p>{status === 'soon' ? COPY.soonText : COPY.closedText}</p>
          <a className="m-btn-ghost" href="/">
            Balik ke beranda
          </a>
        </section>
      ) : (
        <form className="m-form" onSubmit={(e) => e.preventDefault()} noValidate>
          <div className="m-form-main">
            <SectionBox letter="A" title={COPY.secPick}>
              <div id="m-pick" />
              {stockMsg && (
                <p className="m-alert" role="alert">
                  {stockMsg}
                </p>
              )}
              <div className="m-filters" role="group" aria-label={COPY.filterAria}>
                {TYPES.map((t) => (
                  <button key={t} type="button" aria-pressed={filter === t} onClick={() => setFilter(t)}>
                    {t}
                  </button>
                ))}
              </div>
              <div className="m-grid">
                {shown.map((p) => (
                  <ProductCard
                    key={p.sku}
                    p={p}
                    cart={cart}
                    free={free}
                    size={sizes[p.sku]}
                    onSize={(sku, s) => setSizes((z) => ({ ...z, [sku]: s }))}
                    onChange={changeQty}
                  />
                ))}
              </div>
            </SectionBox>

            <SectionBox letter="B" title={COPY.secContact} tag={<span className="m-box-tag">{COPY.secContactTag}</span>}>
              <div className="m-fields">
                <Field id="m-nama" label={COPY.fName} error={errors.nama}>
                  <input
                    id="m-nama"
                    type="text"
                    autoComplete="name"
                    placeholder={COPY.fNamePh}
                    value={form.nama}
                    onChange={set('nama')}
                    aria-invalid={!!errors.nama}
                    aria-describedby={errors.nama ? 'm-nama-err' : undefined}
                  />
                </Field>
                <Field id="m-whatsapp" label={COPY.fWa} error={errors.whatsapp} hint={COPY.fWaHint}>
                  <input
                    id="m-whatsapp"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder={COPY.fWaPh}
                    value={form.whatsapp}
                    onChange={set('whatsapp')}
                    aria-invalid={!!errors.whatsapp}
                    aria-describedby={errors.whatsapp ? 'm-whatsapp-err' : 'm-whatsapp-hint'}
                  />
                </Field>
                {/* Honeypot: real visitors never see or fill this. */}
                <div className="m-honey" aria-hidden="true">
                  <label htmlFor="m-website">Website</label>
                  <input id="m-website" type="text" tabIndex={-1} autoComplete="off" value={form.website} onChange={set('website')} />
                </div>
              </div>
            </SectionBox>

            <SectionBox letter="C" title={COPY.secMethod} tag={<span className="m-box-tag">{COPY.secMethodTag}</span>}>
              <div className="m-methods" role="radiogroup" aria-label={COPY.secMethod}>
                {SHIPPING_ENABLED ? (
                  <label className={`m-method${method === 'kirim' ? ' is-on' : ''}`}>
                    <input type="radio" name="metode" value="kirim" checked={method === 'kirim'} onChange={() => setMethod('kirim')} />
                    <span>
                      <strong>{COPY.methodShip}</strong>
                      <span>{COPY.methodShipText}</span>
                    </span>
                  </label>
                ) : (
                  <label className="m-method is-off" aria-disabled="true">
                    <input type="radio" name="metode" value="kirim" disabled checked={false} readOnly />
                    <span>
                      <strong>{COPY.methodShip}</strong>
                      <span>{COPY.methodShipSoon}</span>
                      <em>{COPY.methodShipOff}</em>
                    </span>
                  </label>
                )}
                <label className={`m-method${method === 'cf' ? ' is-on' : ''}`}>
                  <input type="radio" name="metode" value="cf" checked={method === 'cf'} onChange={() => setMethod('cf')} />
                  <span>
                    <strong>{COPY.methodCf}</strong>
                    <span>{COPY.methodCfText}</span>
                  </span>
                </label>
              </div>

              {SHIPPING_ENABLED && method === 'kirim' && (
                <div className="m-fields m-ship">
                  <div className="m-wide">
                    <Field id="m-alamat" label={COPY.fAddress} error={errors.alamat}>
                      <textarea id="m-alamat" rows={3} autoComplete="street-address" value={form.alamat} onChange={set('alamat')} aria-invalid={!!errors.alamat} />
                    </Field>
                  </div>
                  <Field id="m-kota" label={COPY.fCity} error={errors.kota}>
                    <input id="m-kota" type="text" autoComplete="address-level2" value={form.kota} onChange={set('kota')} aria-invalid={!!errors.kota} />
                  </Field>
                  <Field id="m-provinsi" label={COPY.fProvince} error={errors.provinsi}>
                    <input id="m-provinsi" type="text" autoComplete="address-level1" value={form.provinsi} onChange={set('provinsi')} aria-invalid={!!errors.provinsi} />
                  </Field>
                  <Field id="m-kodepos" label={COPY.fZip} error={errors.kodepos}>
                    <input id="m-kodepos" type="text" inputMode="numeric" autoComplete="postal-code" value={form.kodepos} onChange={set('kodepos')} aria-invalid={!!errors.kodepos} />
                  </Field>
                </div>
              )}
            </SectionBox>

            <SectionBox letter="D" title={COPY.secNote} tag={<span className="m-box-tag">{COPY.secNoteTag}</span>}>
              <div className="m-field">
                <label htmlFor="m-catatan">{COPY.fNote}</label>
                <textarea id="m-catatan" rows={3} maxLength={500} placeholder={COPY.fNotePh} value={form.catatan} onChange={set('catatan')} />
              </div>
            </SectionBox>
          </div>

          <Summary priced={priced} method={method} canReview={canReview} onReview={openReview} adminWa={ADMIN_WA} />
        </form>
      )}

      {reviewing && contact && (
        <ReviewDialog
          priced={priced}
          contact={contact}
          method={method}
          address={[form.alamat, form.kota, form.provinsi, form.kodepos].filter(Boolean).join(', ')}
          onClose={() => setReviewing(false)}
          onConfirm={confirm}
          submitting={submitting}
          error={submitError}
        />
      )}
    </>
  );
}
