'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useLang } from './LanguageProvider';

function Clock() {
  const [time, setTime] = useState(null);

  useEffect(() => {
    const tick = () => {
      const d = new Date();
      setTime(
        `${String(d.getHours()).padStart(2, '0')}.${String(d.getMinutes()).padStart(2, '0')} WIB`
      );
    };
    tick();
    const int = setInterval(tick, 20000);
    return () => clearInterval(int);
  }, []);

  // Rendered empty on the server so the markup matches the first client paint.
  return <span className="relay">{time ?? '—'}</span>;
}

export default function TopBar() {
  const { lang, setLang, t } = useLang();

  return (
    <motion.div
      className="bar"
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.2, 0.7, 0.3, 1] }}
    >
      <span className="brand">{t('brand')}</span>
      <span className="spacer" />
      <Clock />
      <div className="langsw" role="group" aria-label="Language">
        {['id', 'en'].map((code) => (
          <button
            key={code}
            className="langbtn"
            data-lang={code}
            aria-pressed={lang === code}
            onClick={() => setLang(code)}
          >
            {lang === code && (
              <motion.span
                layoutId="langPill"
                className="pill"
                transition={{ type: 'spring', stiffness: 400, damping: 32 }}
              />
            )}
            <span>{code.toUpperCase()}</span>
          </button>
        ))}
      </div>
    </motion.div>
  );
}
