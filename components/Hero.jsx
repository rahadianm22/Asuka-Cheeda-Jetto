'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useLang } from './LanguageProvider';

export default function Hero() {
  const { t } = useLang();
  const ref = useRef(null);

  // Parallax: the artwork drifts slower than the page, and dims slightly
  // as you scroll past it so the content below takes over cleanly.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '18%']);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.12]);
  const captionY = useTransform(scrollYProgress, [0, 1], [0, 60]);
  const captionOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  return (
    <section className="hero" ref={ref}>
      <motion.div
        className="hero-img-wrap"
        style={{ y, scale }}
        initial={{ scale: 1.1, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.4, ease: [0.2, 0.7, 0.3, 1] }}
      >
        <Image
          src="/hero.jpg"
          alt="Ilustrasi Asuka Cheeda Jetto duduk di padang rumput"
          fill
          priority
          sizes="100vw"
          style={{ objectFit: 'cover', objectPosition: '70% 42%' }}
        />
      </motion.div>

      <motion.div className="hero-caption" style={{ y: captionY, opacity: captionOpacity }}>
        <motion.h2
          className="hero-title"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.35, ease: [0.2, 0.7, 0.3, 1] }}
        >
          Asuka Cheeda Jetto
        </motion.h2>
      </motion.div>

      <motion.span
        className="scroll-hint"
        aria-hidden="true"
        animate={{ y: [0, 7, 0], opacity: [0.6, 0.25, 0.6] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
      >
        ↓
      </motion.span>
    </section>
  );
}
