'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { motion, useAnimationControls } from 'framer-motion';
import Pops, { usePops } from './Pops';
import { PROFILE_ROWS, YOUTUBE_CHANNEL } from '@/lib/data';
import SocialIcon from './SocialIcon';
import Paw from './Paw';
import { useLang } from './LanguageProvider';
import Reveal from './Reveal';

const POSE_POPS = ['woof!', 'awoo~', 'hehe~'];

export default function Masthead() {
  const { t } = useLang();
  const controls = useAnimationControls();
  const [pops, addPop, removePop] = usePops();
  const popIndex = useRef(0);

  // Jetto sways on her feet when poked, like a happy wag.
  const wiggle = () => {
    addPop(POSE_POPS[popIndex.current++ % POSE_POPS.length]);
    controls.start({
      rotate: [0, -5, 4.5, -3.5, 2.5, -1, 0],
      y: [0, -12, 0, -6, 0],
      transition: { duration: 0.85, ease: 'easeInOut' },
    });
  };
  // Keeps the "!" after the underlined name on the same line.
  const after = t('mastH1b');
  const punct = after.match(/^[!,.~]*/)[0];

  return (
    <section className="mast">
      <Reveal className="mast-copy" y={40}>
        <h2 className="mast-title">
          {t('mastH1a')}
          <span className="nowrap">
            <em className="mark">
              {t('mastH1em')}
              <svg className="mark-line" viewBox="0 0 200 24" preserveAspectRatio="none" aria-hidden="true">
                <motion.path
                  d="M4 16 C 48 6, 104 22, 150 10 S 190 8, 196 12"
                  initial={{ pathLength: 0 }}
                  whileInView={{ pathLength: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.9, delay: 0.6, ease: 'easeOut' }}
                />
              </svg>
            </em>
            {punct}
          </span>
          {after.slice(punct.length)}
        </h2>
        <p className="sub">{t('mastSub')}</p>
        <div className="mast-actions">
          <a className="cta" href="#feed">
            {t('mastCta')}
          </a>
          <a className="cta cta-secondary" href={YOUTUBE_CHANNEL.href} target="_blank" rel="noopener noreferrer">
            <SocialIcon name="YouTube" className="cta-icon" />
            {t('mastCtaYoutube')}
          </a>
        </div>
      </Reveal>

      {/* Jetto holds a clipboard in this pose, so she stands beside her own patient file. */}
      <motion.div
        className="mast-pose"
        initial={{ opacity: 0, x: -60, y: 30, rotate: -4 }}
        whileInView={{ opacity: 1, x: 0, y: 0, rotate: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ type: 'spring', stiffness: 120, damping: 16, delay: 0.2 }}
      >
        <button type="button" className="pose-btn" onClick={wiggle}>
          {/* Hover sway lives on its own wrapper so it never fights the click wiggle below. */}
          <span className="pose-sway">
            <motion.span className="pose-inner" animate={controls} style={{ originY: 1 }}>
              <Image src="/pose.png" alt="" width={703} height={900} />
            </motion.span>
          </span>
          <span className="pose-hint">
            <Paw className="pose-hint-paw" />
            {t('poseAction')}
          </span>
          <Pops pops={pops} onDone={removePop} />
        </button>
      </motion.div>

      <Reveal className="file-wrap" delay={0.12} y={50}>
        <div className="file">
          <motion.div
            className="file-stamp"
            aria-hidden="true"
            initial={{ scale: 2, opacity: 0, rotate: -24 }}
            whileInView={{ scale: 1, opacity: 1, rotate: -9 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ type: 'spring', stiffness: 520, damping: 20, delay: 0.7 }}
          >
            {t('fileStamp')}
          </motion.div>
          <div className="eyebrow">{t('fileEyebrow')}</div>
          <h3>
            Asuka Cheeda Jetto
            <Paw className="file-name-paw" />
          </h3>
          <div className="binom">{t('fileBinom')}</div>
          <dl className="rows">
            {PROFILE_ROWS.map((row) => (
              <div key={row.labelKey}>
                <dt>{t(row.labelKey)}</dt>
                <dd>{row.valueKey ? t(row.valueKey) : row.value}</dd>
              </div>
            ))}
          </dl>
          {/* A patient walked across the file. */}
          <div className="file-trail">
            <span className="file-trail-label">{t('fileTrail')}</span>
            <span className="file-trail-paws" aria-hidden="true">
              {[0, 1, 2, 3, 4].map((i) => (
                <Paw key={i} className="file-trail-paw" />
              ))}
            </span>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
