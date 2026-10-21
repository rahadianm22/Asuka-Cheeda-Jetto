'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { fmt } from '@/lib/karaoke';
import { useLang } from '../LanguageProvider';
import { useKaraoke, useKaraokeTime } from './KaraokePlayerProvider';
import useMedia from './useMedia';
import CoverTile from './CoverTile';
import { CloseIcon, NextIcon, PauseIcon, PlayIcon, PrevIcon } from './Icons';

function Progress() {
  const { t, d } = useKaraokeTime();
  return (
    <div className="kk-mini-line" aria-hidden="true">
      <i style={{ width: `${d ? Math.min(100, (t / d) * 100) : 0}%` }} />
    </div>
  );
}

function MiniTime() {
  const { t, d } = useKaraokeTime();
  return (
    <div className="kk-mini-time">
      <span>{fmt(t)}</span> / {fmt(d)}
    </div>
  );
}

// Fixed bar that appears once something has played and this section has scrolled out of view.
export default function MiniPlayer() {
  const { t } = useLang();
  const { current, started, dismissed, sectionVisible, isPlaying, status, toggle, next, prev, ui } = useKaraoke();
  const narrow = useMedia('(max-width: 767px)');
  const show = started && !dismissed && !sectionVisible;

  // Reserve room at the bottom of the page while the bar is up, so it never covers the footer.
  useEffect(() => {
    document.documentElement.classList.toggle('kk-mini-on', show);
    return () => document.documentElement.classList.remove('kk-mini-on');
  }, [show]);

  if (!started || dismissed) return null;

  const info = (
    <>
      <span className="kk-mini-name">{current.title}</span>
      <span className="kk-mini-sub">
        Asuka Jetto · <span className="kk-mini-orig">{t('kkOriginalLc')} </span>
        {current.originalArtist}
      </span>
    </>
  );

  return (
    <div className={`kk-mini ${show ? 'is-in' : ''}`} role="region" aria-label={t('kkMiniLabel')}>
      <Progress />
      <CoverTile track={current} size={48} />
      {narrow ? (
        <button type="button" className="kk-mini-info" onClick={ui.openSheet} aria-label={`${current.title}. ${t('kkOpenPlayer')}`}>
          {info}
        </button>
      ) : (
        <div className="kk-mini-info">{info}</div>
      )}
      <div className="kk-mini-ctrl">
        <button type="button" className="kk-mini-btn kk-mini-prev" aria-label={t('kkPrev')} onClick={prev}>
          <PrevIcon size={20} />
        </button>
        <button type="button" className="kk-play kk-play-mini" aria-label={isPlaying ? t('kkPause') : t('kkPlay')} onClick={toggle}>
          {isPlaying ? <PauseIcon size={22} /> : <PlayIcon size={22} />}
        </button>
        <button type="button" className="kk-mini-btn" aria-label={t('kkNext')} onClick={next}>
          <NextIcon size={20} />
        </button>
      </div>
      <MiniTime />
      <div className="kk-mini-end">
        <span className="kk-onair kk-mini-air">
          <span className={`kk-dot ${status === 'playing' ? 'is-on' : ''}`} />
          {status === 'playing' ? t('kkOnAir') : t('kkStandby')}
        </span>
        <Link className="kk-ghost kk-mini-open" href="/#karaoke">
          {t('kkOpenRoom')}
        </Link>
        <button type="button" className="kk-mini-btn kk-mini-close" aria-label={t('kkCloseMini')} onClick={ui.dismissMini}>
          <CloseIcon size={18} />
        </button>
      </div>
    </div>
  );
}
