'use client';

import Link from 'next/link';
import { useLang } from '../LanguageProvider';

export default function GalleryHead() {
  const { t } = useLang();
  return (
    <header className="gcf-head">
      <Link href="/" className="gcf-back">← {t('galBack')}</Link>
      <div className="gcf-banner">
        <img src="/merch/gallery-banner-2.webp" alt={t('galBannerAlt')} width={2400} height={800} decoding="async" />
      </div>
    </header>
  );
}
