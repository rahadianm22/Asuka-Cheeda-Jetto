'use client';

import { useLang } from './LanguageProvider';
import Reveal from './Reveal';

export default function Footer() {
  const { t } = useLang();
  return (
    <Reveal as="footer">
      <div className="foot-main">
        <div className="foot-brand">
          <img src="/favicon-32.png" alt="" width={26} height={26} />
          <div>
            <strong>{t('brand')}</strong>
            <span>{t('footerTagline')}</span>
          </div>
        </div>

        <div className="foot-stamp" aria-hidden="true">
          <span className="foot-stamp-label">{t('footerRecord')}</span>
          <span className="foot-stamp-num">JT-0001</span>
          <span className="foot-stamp-status">{t('footerStatus')}</span>
        </div>
      </div>
    </Reveal>
  );
}
