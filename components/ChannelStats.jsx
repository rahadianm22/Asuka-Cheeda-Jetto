'use client';

import { useEffect, useRef, useState } from 'react';
import { animate, motion, useInView, useReducedMotion } from 'framer-motion';
import { CHANNEL_STATS, YOUTUBE_CHANNEL, getTenure } from '@/lib/data';
import { useLang } from './LanguageProvider';
import SectionHead from './SectionHead';
import SocialIcon from './SocialIcon';
import Paw from './Paw';
import Reveal from './Reveal';

// Subscribers are the fam (a paw), views are eyes on Jetto, contents are what she uploads.
const ICONS = {
  subs: <Paw className="ytstat-badge-icon ytstat-badge-paw" />,
  views: (
    <svg className="ytstat-badge-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="3" fill="currentColor" />
    </svg>
  ),
  contents: <SocialIcon name="YouTube" className="ytstat-badge-icon" />,
  tenure: (
    <svg className="ytstat-badge-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3.5" y="5" width="17" height="16" rx="2" />
      <path d="M8 3v4M16 3v4M3.5 10h17" />
      <path d="M8.5 14h1M12 14h1M15.5 14h1M8.5 17h1M12 17h1" />
    </svg>
  ),
};

// A heartbeat line under each number: the page's clinic theme, drawn once as the card appears.
function Heartbeat({ delay }) {
  return (
    <svg className="ytstat-ecg" viewBox="0 0 200 32" preserveAspectRatio="none" aria-hidden="true">
      <motion.path
        d="M0 18 H78 l6 -5 l5 9 l7 -18 l8 26 l6 -16 l5 4 H200"
        vectorEffect="non-scaling-stroke"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 1.3, delay, ease: 'easeInOut' }}
      />
    </svg>
  );
}

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
  const { t, lang } = useLang();
  const isLive = Boolean(liveStats);

  // Live mode shows only what the API returned, so a hidden subscriber count
  // is dropped rather than filled with a stale hand-written number.
  const apiStats = isLive
    ? CHANNEL_STATS.filter((s) => liveStats[s.key]).map((s) => ({ ...s, value: liveStats[s.key] }))
    : CHANNEL_STATS;

  // Not from the API: computed locally from her real debut date, so it is never "manual".
  const tenureStat = {
    key: 'tenure', icon: 'tenure', value: getTenure(lang),
    labelKey: 'ytStatTenure', noteKey: 'ytStatTenureNote',
  };
  const stats = [...apiStats, tenureStat];

  return (
    <section className="ytstats">
      <SectionHead
        no="03"
        icon={<SocialIcon name="YouTube" className="shead-icon" />}
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
            <SocialIcon name="YouTube" className="yt-cta-icon" />
            {t('ytVisitChannel')}
          </span>
        </a>
      </Reveal>

      <Reveal className="ytstat-grid">
        {stats.map((s, i) => (
          <div key={s.key} className="ytstat-card">
            <div className="ytstat-top">
              <span className="ytstat-badge" aria-hidden="true">{ICONS[s.icon]}</span>
              <CountUp value={s.value} />
            </div>
            <span className="ytstat-label">{t(s.labelKey)}</span>
            <span className="ytstat-note">{t(s.noteKey)}</span>
            <Heartbeat delay={0.3 + i * 0.25} />
          </div>
        ))}
      </Reveal>
    </section>
  );
}
