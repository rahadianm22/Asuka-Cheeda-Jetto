'use client';

import { motion } from 'framer-motion';
import { CHANNEL_STATS, YOUTUBE_CHANNEL } from '@/lib/data';
import { useLang } from './LanguageProvider';
import Reveal from './Reveal';

const ICONS = {
  subs: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8.5" r="3.2" />
      <path d="M5.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6" />
    </svg>
  ),
  views: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 19V11" />
      <path d="M12 19V5" />
      <path d="M19 19v-6" />
    </svg>
  ),
  contents: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 3.5h7l4 4V20a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1Z" />
      <path d="M14 3.5V8h4" />
      <path d="M9 13h6M9 16.5h6" />
    </svg>
  ),
};

export default function ChannelStats() {
  const { t } = useLang();

  return (
    <section className="ytstats">
      <Reveal className="sectionbar-head">
        <h2>{t('ytStatsEyebrow')}</h2>
        <span className="mono mut">{t('ytStatsSub')}</span>
      </Reveal>

      <Reveal>
        <motion.a
          className="ytprofile"
          href={YOUTUBE_CHANNEL.href}
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ y: -2 }}
        >
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
            <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
              <path d="M9.5 7.5v9l7.5-4.5-7.5-4.5Z" />
            </svg>
            {t('ytVisitChannel')}
          </span>
        </motion.a>
      </Reveal>

      <div className="ytstat-grid">
        {CHANNEL_STATS.map((s, i) => (
          <motion.div
            key={s.key}
            className="ytstat-card"
            style={{ '--stat-accent': s.accent }}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.45, delay: i * 0.06, ease: [0.2, 0.7, 0.3, 1] }}
          >
            <div className="ytstat-text">
              <span className="ytstat-value">{s.value}</span>
              <span className="ytstat-label">{t(s.labelKey)}</span>
            </div>
            <div className="ytstat-icon">{ICONS[s.icon]}</div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
