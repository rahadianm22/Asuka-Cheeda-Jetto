'use client';

import Link from 'next/link';
import { useLang } from './LanguageProvider';
import Reveal from './Reveal';
import SectionHead from './SectionHead';

// Homepage entry: the banner is the link, and the photos themselves live on /gallery.
export default function GalleryCF23() {
  const { t } = useLang();

  return (
    <section className="room-teaser gcf">
      <SectionHead no="09" title={t('galTitle')} sub={t('galSub')} />
      <Reveal y={30}>
        <Link href="/gallery" className="gcf-banner gcf-link">
          <img src="/merch/gallery-banner-2.webp" alt={t('galBannerAlt')} width={2400} height={800} loading="lazy" decoding="async" />
          <span className="gcf-cta" aria-hidden="true">
            <span className="merch-banner-pill">{t('galCta')}</span>
          </span>
        </Link>
      </Reveal>
    </section>
  );
}
