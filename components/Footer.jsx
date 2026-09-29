'use client';

import { motion } from 'framer-motion';
import { useLang } from './LanguageProvider';
import Reveal from './Reveal';

const WOOF = ['WOOF', 'WOOF~'];

export default function Footer() {
  const { t } = useLang();
  return (
    <Reveal as="footer">
      <p className="foot-woof" aria-hidden="true">
        {WOOF.map((word, wi) => (
          <span className="woof-word" key={wi}>
            {word.split('').map((ch, i) => (
              <motion.span
                key={i}
                whileHover={{ y: '-18%', rotate: i % 2 ? 6 : -6 }}
                transition={{ type: 'spring', stiffness: 500, damping: 12 }}
              >
                {ch}
              </motion.span>
            ))}
          </span>
        ))}
      </p>

      <div className="foot-main">
        <div className="foot-brand">
          <img src="/favicon-32.png" alt="" width={26} height={26} />
          <div>
            <strong>{t('brand')}</strong>
            <span>{t('footerTagline')}</span>
          </div>
        </div>

        <a
          className="foot-credit tactile"
          href="https://rahadianm22.my.id/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span className="foot-credit-label">{t('footerCreatedBy')}</span>
          <img src="/android-chrome-512x512.png" alt="" width={20} height={20} />
          <span className="foot-credit-name">Rahadian Maulana</span>
        </a>
      </div>

      <p className="foot-art">
        <span className="foot-art-label">{t('creditsLabel')}</span>
        {t('artOwnership')}
      </p>
    </Reveal>
  );
}
