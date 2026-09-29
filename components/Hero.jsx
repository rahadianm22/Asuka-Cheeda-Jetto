'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { useLang } from './LanguageProvider';
import Paw from './Paw';

const NAME = 'JETTO';
const EASE = [0.2, 0.8, 0.2, 1];

function Stamp({ text, rotate }) {
  return (
    <motion.div
      className="hero-stamp"
      aria-hidden="true"
      initial={{ scale: 0, rotate: -120 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: 'spring', stiffness: 160, damping: 16, delay: 0.9 }}
    >
      <motion.svg viewBox="0 0 200 200" style={{ rotate }}>
        <defs>
          <path id="stampCircle" d="M100,100 m-76,0 a76,76 0 1,1 152,0 a76,76 0 1,1 -152,0" />
        </defs>
        <circle cx="100" cy="100" r="97" className="stamp-disc" />
        <circle cx="100" cy="100" r="94" className="stamp-ring" />
        <circle cx="100" cy="100" r="58" className="stamp-ring" />
        <text className="stamp-text">
          <textPath href="#stampCircle" textLength="470" lengthAdjust="spacing">{text}</textPath>
        </text>
      </motion.svg>
      <Paw className="stamp-paw" />
    </motion.div>
  );
}

export default function Hero() {
  const { t } = useLang();
  const ref = useRef(null);
  const reduce = useReducedMotion();

  // Scroll-linked values bypass MotionConfig, so reduced motion is checked here.
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['0%', reduce ? '0%' : '18%']);
  const scale = useTransform(scrollYProgress, [0, 1], [1, reduce ? 1 : 1.12]);
  const captionY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 90]);
  const captionOpacity = useTransform(scrollYProgress, [0, 0.7], [1, reduce ? 1 : 0]);
  const stampRotate = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 240]);

  return (
    <section className="hero" ref={ref}>
      <motion.div
        className="hero-img-wrap"
        style={{ y, scale }}
        initial={{ scale: 1.1, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.4, ease: EASE }}
      >
        <Image
          src="/hero.jpg"
          alt={t('heroAlt')}
          fill
          priority
          sizes="100vw"
          style={{ objectFit: 'cover', objectPosition: '70% 42%' }}
        />
      </motion.div>

      <Stamp text={t('heroStamp')} rotate={stampRotate} />

      <motion.div className="hero-caption" style={{ y: captionY, opacity: captionOpacity }}>
        <h1 className="hero-title">
          <span className="sr-only">Asuka Cheeda Jetto</span>
          <motion.span
            className="hero-kicker"
            aria-hidden="true"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: EASE }}
          >
            {t('heroKicker')}
          </motion.span>
          <span className="hero-name" aria-hidden="true">
            {NAME.split('').map((ch, i) => (
              <span className="hero-letter-mask" key={i}>
                <motion.span
                  className="hero-letter"
                  initial={{ y: '115%' }}
                  animate={{ y: '0%' }}
                  transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.45 + i * 0.08 }}
                >
                  <motion.span
                    className="hero-letter"
                    whileHover={{ y: '-10%' }}
                    transition={{ type: 'spring', stiffness: 420, damping: 12 }}
                  >
                    {ch}
                  </motion.span>
                </motion.span>
              </span>
            ))}
          </span>
        </h1>
      </motion.div>

      <span className="scroll-hint" aria-hidden="true">↓</span>
    </section>
  );
}
