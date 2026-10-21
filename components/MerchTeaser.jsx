'use client';

import Link from 'next/link';
import { useLang } from './LanguageProvider';
import Reveal from './Reveal';
import SectionHead from './SectionHead';

function BagIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d="M6 7h12l1 13H5L6 7z" />
      <path d="M9 10V6a3 3 0 0 1 6 0v4" />
    </svg>
  );
}

// Links to the CF23 pre-order form at /merch. The banner is the button: its own text says "pre-order now", and a
// language-aware label fades in over it while it is hovered or focused.
export default function MerchTeaser() {
  const { t } = useLang();

  return (
    <section className="room-teaser">
      <SectionHead no="09" title={t('merchTitle')} sub={t('merchSub')} />
      <Reveal y={30}>
        <Link href="/merch" className="merch-banner">
          <picture>
            <source media="(max-width: 700px)" srcSet="/merch/banner-mobile.webp" width={1200} height={960} />
            <img src="/merch/banner-desktop.webp" alt={t('merchBannerAlt')} width={2400} height={800} loading="lazy" decoding="async" />
          </picture>
          <span className="merch-banner-cta" aria-hidden="true">
            <span className="merch-banner-pill">
              <BagIcon className="cta-icon" />
              {t('merchBannerCta')}
            </span>
          </span>
        </Link>
      </Reveal>
    </section>
  );
}
