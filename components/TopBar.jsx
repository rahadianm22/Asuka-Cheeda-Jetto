'use client';

import { useEffect, useState } from 'react';
import { motion, useScroll } from 'framer-motion';
import { useLang } from './LanguageProvider';
import Paw from './Paw';
import { scrollToTop } from './BackToTop';

const wib = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Asia/Jakarta',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});

function Clock() {
  const [time, setTime] = useState(null);

  useEffect(() => {
    const tick = () => setTime(`${wib.format(new Date()).replace(':', '.')} WIB`);
    tick();
    const int = setInterval(tick, 20000);
    return () => clearInterval(int);
  }, []);

  // Rendered as a neutral placeholder on the server so the markup matches the first client paint.
  return <span className="relay">{time ?? '--.-- WIB'}</span>;
}

export default function TopBar() {
  const { lang, setLang, t } = useLang();
  const { scrollYProgress } = useScroll();

  return (
    <div className="bar">
      <motion.span className="bar-progress" style={{ scaleX: scrollYProgress }} aria-hidden="true" />
      <a
        className="brand"
        href="#top"
        title={t('brandHint')}
        onClick={(e) => {
          e.preventDefault();
          scrollToTop();
        }}
      >
        <Paw className="brand-paw" />
        {t('brand')}
      </a>
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
    </div>
  );
}
