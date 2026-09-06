'use client';

import { motion } from 'framer-motion';
import { useLang } from './LanguageProvider';

const PAW = '\u{1F43E}';

export default function Ticker() {
  const { t } = useLang();
  // Each segment gets its own span so the CSS-driven bullet separator
  // is the only separator — no double spacing from a manually embedded dot.
  const segments = [t('tickerText'), t('tickerText2'), t('tickerText3'), PAW];
  const loop = [...segments, ...segments, ...segments, ...segments];

  return (
    <div className="ticker" aria-hidden="true">
      <motion.div
        className="ticker-track"
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
      >
        {loop.map((text, i) => (
          <span key={i}>{text}</span>
        ))}
      </motion.div>
    </div>
  );
}
