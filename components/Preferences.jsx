'use client';

import { useId } from 'react';
import { motion } from 'framer-motion';
import { LIKES, DISLIKES } from '@/lib/data';
import { useLang } from './LanguageProvider';
import Reveal from './Reveal';

// Sticker tilts, repeated in order so the list looks hand-placed rather than random on every render.
const TILTS = [-1.2, 0.9, -0.6, 1.1, -0.9, 0.6, -0.4, 1, -0.7];

const HEART =
  'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z';

function Heart({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
      <path d={HEART} />
    </svg>
  );
}

// The same heart with a crack cut through it, so the two lists read as a pair.
function BrokenHeart({ className }) {
  const id = `crack${useId().replace(/:/g, '')}`;
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
      <mask id={id}>
        <rect width="24" height="24" fill="white" />
        <path d="M12.6 3.5 L10.4 9 L13.6 12.4 L10.8 16 L12 22" fill="none" stroke="black" strokeWidth="2" strokeLinejoin="round" />
      </mask>
      <path d={HEART} mask={`url(#${id})`} />
    </svg>
  );
}

function PillGroup({ tone, Icon, titleKey, countKey, keys, highlightFirst = false }) {
  const { t } = useLang();

  return (
    <div className={`vgroup ${tone}`}>
      <Reveal className="vgroup-head">
        <span className="vbadge" aria-hidden="true">
          <Icon className="vbadge-icon" />
        </span>
        <h3>{t(titleKey)}</h3>
        <span className="count">{t(countKey)}</span>
      </Reveal>

      {/* An empty touch listener lets iOS apply :hover/:active on tap, so pills wiggle on phones too. */}
      <ul className="vpills" onTouchStart={() => {}}>
        {keys.map((key, i) => (
          <motion.li
            key={key}
            initial={{ opacity: 0, scale: 0.7, y: 10 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ type: 'spring', stiffness: 420, damping: 18, delay: i * 0.05 }}
          >
            <span
              className={`vpill${highlightFirst && i === 0 ? ' special' : ''}`}
              style={{ '--tilt': `${TILTS[i % TILTS.length]}deg` }}
            >
              <Icon className="vpill-icon" />
              {t(key)}
            </span>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}

export default function Preferences() {
  const { t } = useLang();

  return (
    <section className="vitals">
      <div className="chipbar-head">
        <Reveal as="h2">{t('vitalsEyebrow')}</Reveal>
      </div>

      <div className="vgroups">
        <PillGroup tone="up" Icon={Heart} titleKey="groupUp" countKey="countUp" keys={LIKES} highlightFirst />
        <PillGroup tone="down" Icon={BrokenHeart} titleKey="groupDown" countKey="countDown" keys={DISLIKES} />
      </div>
    </section>
  );
}
