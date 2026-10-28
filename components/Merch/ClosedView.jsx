'use client';

import { useState } from 'react';
import { useLang } from '@/components/LanguageProvider';
import { EVENT, ADMIN_WA, PO_CLOSED_INFO, isFilled } from '@/lib/po-config';
import { TYPES } from '@/lib/products';
import { rp } from '@/lib/po-core';

// Type chips: the product data is Indonesian, so the English labels live here.
const TYPE_EN = {
  Semua: 'All',
  'Gantungan Kunci': 'Keychains',
  Photocard: 'Photocards',
  Stiker: 'Stickers',
  Pakaian: 'Apparel',
  Standee: 'Standees',
  Paket: 'Bundles',
  Lainnya: 'Others',
};

function BoothCard({ p }) {
  const { t, tf } = useLang();
  return (
    <article
      className="m-card mc-card"
      style={p.tilt ? { '--rot': `${p.tilt.rest}deg`, '--rot-hover': `${p.tilt.hover}deg` } : undefined}
    >
      <div className="m-card-photo">
        <span className="m-stage-floor" aria-hidden="true" />
        <span className="m-stage-shadow" aria-hidden="true" />
        {p.img ? (
          <>
            <img className="m-stage-img" src={p.img} alt={p.name} width={840} height={840} loading="lazy" decoding="async" />
            {p.imgHover && (
              <img className="m-stage-img m-stage-alt" src={p.imgHover} alt="" width={840} height={840} loading="lazy" decoding="async" aria-hidden="true" />
            )}
          </>
        ) : (
          <div className="m-card-nophoto" role="img" aria-label={p.name}>
            <span>[FOTO]</span>
            <span>{p.sku}</span>
          </div>
        )}
        <span className="m-chip-type">{p.type}</span>
      </div>
      <div className="m-card-info">
        <span className="m-sku">{p.sku}</span>
        <h3>{p.name}</h3>
        <div className="mc-price">
          {p.ots > 0 ? (
            <>
              <strong>{rp(p.ots)}</strong>
              <span>{tf('mcPoDone', { price: rp(p.po) })}</span>
            </>
          ) : (
            <strong className="mc-price-na">{t('mcPriceAtBooth')}</strong>
          )}
        </div>
      </div>
    </article>
  );
}

export default function ClosedView({ products }) {
  const { t, tf, lang } = useLang();
  const [filter, setFilter] = useState('Semua');
  const en = lang === 'en';
  const shown = filter === 'Semua' ? products : products.filter((p) => p.type === filter);
  const eventLine = `${en ? EVENT.daysLabelEn : EVENT.daysLabel} · ${EVENT.venue}`;
  const closeDate = en ? EVENT.poCloseLabelEn : EVENT.poCloseLabel;
  const adminUrl = ADMIN_WA ? `https://wa.me/${ADMIN_WA}` : '';
  const s2 = isFilled(PO_CLOSED_INFO.paymentDeadline)
    ? tf('mcS2BodyDl', { date: PO_CLOSED_INFO.paymentDeadline })
    : t('mcS2Body');
  const s3 = isFilled(PO_CLOSED_INFO.shippingDate)
    ? tf('mcS3BodyDate', { date: PO_CLOSED_INFO.shippingDate, booth: EVENT.booth })
    : tf('mcS3Body', { booth: EVENT.booth });
  const steps = [
    ['01', t('mcS1Title'), t('mcS1Body')],
    ['02', t('mcS2Title'), s2],
    ['03', t('mcS3Title'), s3],
  ];

  return (
    <div className="mc">
      <section className="mc-hero">
        <div className="mc-hero-main">
          <div className="m-hero-no">
            <span>No.</span>
            <strong>09</strong>
            <i aria-hidden="true" />
            <span>PRE-ORDER · CF23</span>
            <em className="mc-pill">{t('mcBadge')}</em>
          </div>
          <div className="mc-title">
            <h1>
              Resep Merch
              <br />
              <span>Dokter Jetto</span>
            </h1>
            <div className="mc-stamp" aria-hidden="true">
              <b>{t('mcStampTitle')}</b>
              <span>28 · 10 · 2026</span>
            </div>
          </div>
          <p>{t('mcHeroText')}</p>
          <div className="mc-ctas">
            <a className="mc-cta-main" href="#langkah">
              {t('mcCtaDone')}
            </a>
            <a className="mc-cta-line" href="#booth">
              {t('mcCtaBooth')}
            </a>
          </div>
        </div>

        <dl className="mc-facts">
          <div className="mc-facts-row">
            <div>
              <dt>{t('mcStatus')}</dt>
              <dd className="is-shut">
                <i aria-hidden="true" />
                {t('mcStatusClosed')}
              </dd>
            </div>
            <div>
              <dt>{t('mcCloseLabel')}</dt>
              <dd>{closeDate}</dd>
            </div>
          </div>
          <div className="mc-facts-time">
            <dt>{t('mcTimeLeft')}</dt>
            <dd>
              <div className="mc-zero" aria-hidden="true">
                {['mcDays', 'mcHours', 'mcMinutes', 'mcSeconds'].map((k) => (
                  <div key={k}>
                    <strong>00</strong>
                    <span>{t(k)}</span>
                  </div>
                ))}
              </div>
              <p>{t('mcTimeUp')}</p>
            </dd>
          </div>
          <div className="mc-facts-next">
            <dt>{t('mcNext')}</dt>
            <dd>
              {tf('mcBoothLine', { booth: EVENT.booth })}
              <span>{eventLine}</span>
            </dd>
          </div>
        </dl>
      </section>

      <section id="langkah" className="mc-sec">
        <header>
          <span>A</span>
          <h2>{t('mcStepsTitle')}</h2>
        </header>
        <p className="mc-sub">{t('mcStepsSub')}</p>
        <ol className="mc-steps">
          {steps.map(([n, title, body]) => (
            <li key={n}>
              <strong>{n}</strong>
              <div>
                <h3>{title}</h3>
                <p>{body}</p>
              </div>
            </li>
          ))}
        </ol>
        {adminUrl && (
          <div className="mc-follow">
            <span>
              {isFilled(PO_CLOSED_INFO.followUpDays)
                ? tf('mcFollow', { days: PO_CLOSED_INFO.followUpDays })
                : t('mcFollowNoDays')}
            </span>
            <a href={adminUrl} target="_blank" rel="noopener noreferrer">
              {t('mcContactAdmin')}
            </a>
          </div>
        )}
      </section>

      <section id="booth" className="mc-sec">
        <div className="mc-sec-head">
          <div>
            <header>
              <span>B</span>
              <h2>{t('mcCatTitle')}</h2>
            </header>
            <p className="mc-sub">{t('mcCatSub')}</p>
          </div>
          <div className="m-filters mc-filters" role="group" aria-label={t('mcFilterAria')}>
            {TYPES.map((ty) => (
              <button key={ty} type="button" aria-pressed={filter === ty} onClick={() => setFilter(ty)}>
                {en ? TYPE_EN[ty] || ty : ty}
              </button>
            ))}
          </div>
        </div>
        <div className="m-grid">
          {shown.map((p) => (
            <BoothCard key={p.sku} p={p} />
          ))}
        </div>
      </section>

      <section className="mc-booth">
        <div className="mc-booth-a">
          <span>{t('mcSeeYou')}</span>
          <strong>{EVENT.booth}</strong>
          <p>
            {EVENT.name} · {eventLine}
          </p>
        </div>
        <div className="mc-booth-b">
          <h3>{t('mcBringTitle')}</h3>
          <ul>
            <li>{t('mcBring1')}</li>
            <li>{t('mcBring2')}</li>
            <li>{tf('mcBring3', { hours: EVENT.hoursLabel })}</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
