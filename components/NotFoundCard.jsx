'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useLang } from './LanguageProvider';
import Paw from './Paw';

// A missing page is a patient who wandered off: the chart is blank, and the pawprints lead away.
export default function NotFoundCard() {
  const { t } = useLang();

  return (
    <main className="nf">
      <motion.div
        className="nf-sheet"
        initial={{ opacity: 0, y: 30, rotate: -3 }}
        animate={{ opacity: 1, y: 0, rotate: -1.5 }}
        transition={{ type: 'spring', stiffness: 160, damping: 16 }}
      >
        <motion.div
          className="nf-stamp"
          aria-hidden="true"
          initial={{ scale: 2, opacity: 0, rotate: -24 }}
          animate={{ scale: 1, opacity: 1, rotate: -9 }}
          transition={{ type: 'spring', stiffness: 520, damping: 20, delay: 0.5 }}
        >
          404
        </motion.div>
        <p className="nf-code">{t('nfCode')}</p>
        <h1 className="nf-title">{t('nfTitle')}</h1>
        <p className="nf-text">{t('nfText')}</p>
        <div className="nf-trail" aria-hidden="true">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <Paw key={i} className="nf-paw" />
          ))}
        </div>
        <Link className="cta nf-home" href="/">
          <Paw className="cta-icon" />
          {t('nfHome')}
        </Link>
        <img className="nf-cheeda" src="/cheeda.png" alt="" aria-hidden="true" />
      </motion.div>
    </main>
  );
}
