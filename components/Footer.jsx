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

        <a
          className="foot-credit"
          href="https://rahadianm22.my.id/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span className="foot-credit-label">{t('footerCreatedBy')}</span>
          <img src="/android-chrome-512x512.png" alt="" width={20} height={20} />
          <span className="foot-credit-name">Rahadian Maulana</span>
        </a>
      </div>
    </Reveal>
  );
}
