'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLang } from './LanguageProvider';
import Paw from './Paw';

// Within this many pixels of the bottom, the paw hops in.
const NEAR_BOTTOM = 600;

export function scrollToTop() {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
  // The button unmounts once the page leaves the bottom, so hand focus to the brand link.
  document.querySelector('.bar .brand')?.focus({ preventScroll: true });
}

export default function BackToTop() {
  const { t } = useLang();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const check = () => {
      const bottom = document.documentElement.scrollHeight - window.innerHeight;
      setShow(bottom > 0 && window.scrollY >= bottom - NEAR_BOTTOM);
    };
    check();
    window.addEventListener('scroll', check, { passive: true });
    window.addEventListener('resize', check);
    return () => {
      window.removeEventListener('scroll', check);
      window.removeEventListener('resize', check);
    };
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.button
          type="button"
          className="to-top"
          onClick={scrollToTop}
          initial={{ opacity: 0, y: 40, scale: 0.5, rotate: -25 }}
          animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
          exit={{ opacity: 0, y: 40, scale: 0.5 }}
          transition={{ type: 'spring', stiffness: 420, damping: 16 }}
        >
          <Paw className="to-top-paw" />
          <span className="to-top-label">{t('backToTop')}</span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
