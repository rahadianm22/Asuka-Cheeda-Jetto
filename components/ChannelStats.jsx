'use client';

import { useEffect, useRef, useState } from 'react';
import { animate, useInView, useReducedMotion } from 'framer-motion';
import { CHANNEL_STATS, YOUTUBE_CHANNEL } from '@/lib/data';
import { useLang } from './LanguageProvider';
import SectionHead from './SectionHead';
import Reveal from './Reveal';

const ICONS = {
  subs: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8.5" r="3.2" />
      <path d="M5.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6" />
    </svg>
  ),
  views: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 19V11" />
      <path d="M12 19V5" />
      <path d="M19 19v-6" />
    </svg>
  ),
  contents: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 3.5h7l4 4V20a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1Z" />
      <path d="M14 3.5V8h4" />
      <path d="M9 13h6M9 16.5h6" />
    </svg>
  ),
};

// Counts up from zero the first time the number scrolls into view.
// The server renders the final value, so no-JS readers still get the real number.
function CountUp({ value }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const reduce = useReducedMotion();
  const [shown, setShown] = useState(value);

  useEffect(() => {
    const m = /^(\d+)(?:,(\d))?([KM]?)$/.exec(value);
    if (!m || !inView || reduce) {
      setShown(value);
      return;
    }
    const target = Number(m[2] ? `${m[1]}.${m[2]}` : m[1]);
    const decimals = m[2] ? 1 : 0;
    const controls = animate(0, target, {
      duration: 1.6,
      ease: [0.2, 0.8, 0.2, 1],
      onUpdate: (v) => setShown(`${v.toFixed(decimals).replace('.', ',')}${m[3]}`),
    });
    return () => controls.stop();
  }, [value, inView, reduce]);

  return (
    <span ref={ref} className="ytstat-value">
      {shown}
    </span>
  );
}

export default function ChannelStats({ liveStats = null }) {
  const { t } = useLang();
  const isLive = Boolean(liveStats);

  // Live mode shows only what the API returned, so a hidden subscriber count
  // is dropped rather than filled with a stale hand-written number.
  const stats = isLive
    ? CHANNEL_STATS.filter((s) => liveStats[s.key]).map((s) => ({ ...s, value: liveStats[s.key] }))
    : CHANNEL_STATS;

  return (
    <section className="ytstats">
      <SectionHead
        no="03"
        title={t('ytStatsEyebrow')}
        sub={t(isLive ? 'ytStatsSub' : 'ytStatsSubManual')}
      />

      <Reveal>
        <a className="ytprofile tactile" href={YOUTUBE_CHANNEL.href} target="_blank" rel="noopener noreferrer">
          <span className="ytprofile-id">
            <span className="ytprofile-avatar">
              <img src={YOUTUBE_CHANNEL.avatar} alt="" />
            </span>
            <span className="ytprofile-text">
              <span className="ytprofile-name">{YOUTUBE_CHANNEL.name}</span>
              <span className="ytprofile-handle">{YOUTUBE_CHANNEL.handle}</span>
            </span>
          </span>
          <span className="yt-cta">
            <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14" aria-hidden="true">
              <path d="M9.5 7.5v9l7.5-4.5-7.5-4.5Z" />
            </svg>
            {t('ytVisitChannel')}
          </span>
        </a>
      </Reveal>

      <Reveal className="ytstat-grid">
        {stats.map((s) => (
          <div key={s.key} className="ytstat-card">
            <CountUp value={s.value} />
            <span className="ytstat-label">
              <span className="ytstat-icon" aria-hidden="true">{ICONS[s.icon]}</span>
              {t(s.labelKey)}
            </span>
          </div>
        ))}
      </Reveal>
    </section>
  );
}
