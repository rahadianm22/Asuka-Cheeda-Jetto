'use client';

import { useEffect, useRef } from 'react';
import { TOTAL_MINUTES, TRACKS } from '@/lib/karaoke';
import { useLang } from '../LanguageProvider';
import Reveal from '../Reveal';
import SectionHead from '../SectionHead';
import { useKaraoke } from './KaraokePlayerProvider';
import NowPlayingDeck, { NowPlayingCard } from './NowPlayingDeck';
import ListPanel from './ListPanel';

// No. 09. The audio itself lives in KaraokePlayerProvider (root layout), so leaving this section, or
// the page, never stops the music; this section only draws and drives it.
export default function KaraokeSection() {
  const { t, tf } = useLang();
  const { isPlaying, ui, timeStore, seek, toggle, next, prev } = useKaraoke();
  const root = useRef(null);

  // The mini player takes over exactly while this section is out of view.
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => ui.setSectionVisible(e.isIntersecting));
    io.observe(root.current);
    return () => {
      io.disconnect();
      ui.setSectionVisible(false);
    };
  }, [ui]);

  // Shortcuts only count while focus is inside the player; nothing is bound globally.
  const onKeyDown = (e) => {
    if (e.target.closest('input, textarea, select') || e.altKey || e.ctrlKey || e.metaKey) return;
    if (e.key === ' ') {
      if (e.target.closest('button, a')) return;
      toggle();
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      const fwd = e.key === 'ArrowRight';
      if (e.shiftKey) (fwd ? next : prev)();
      else seek(timeStore.get().t + (fwd ? 5 : -5));
    } else return;
    e.preventDefault();
  };

  return (
    <section id="karaoke" className="kk" ref={root} aria-label={t('kkTitle')}>
      <SectionHead no="09" title={t('kkTitle')} sub={t('kkSub')} />
      <Reveal y={30}>
        <div className="kk-chips">
          <span className="kk-chip">{tf('kkSongs', { n: TRACKS.length })}</span>
          <span className="kk-chip">{tf('kkMinutes', { n: TOTAL_MINUTES })}</span>
          <span className="kk-chip">
            <span className={`kk-dot ${isPlaying ? 'is-on' : ''}`} />
            {isPlaying ? t('kkOnAir') : t('kkStandby')}
          </span>
        </div>
        <div className="kk-grid">
          <div className="kk-player" onKeyDown={onKeyDown}>
            <div className="kk-only-wide">
              <NowPlayingDeck />
            </div>
            <div className="kk-only-narrow">
              <NowPlayingCard />
            </div>
          </div>
          <ListPanel />
        </div>
      </Reveal>
    </section>
  );
}
