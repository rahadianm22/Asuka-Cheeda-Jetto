'use client';

import { useEffect, useRef, useState } from 'react';
import { CURATED_PLAYLIST, TRACK_MAP, fmt, youtubeHref } from '@/lib/karaoke';
import { useLang } from '../LanguageProvider';
import { useKaraoke, useKaraokeTime } from './KaraokePlayerProvider';
import { SHOW_QUEUE_EVENT } from './ListPanel';
import useMedia from './useMedia';
import Modal from './Modal';
import CoverTile from './CoverTile';
import Waveform from './Waveform';
import Transport from './Transport';
import { ChevronDownIcon, QueueIcon, YoutubeIcon } from './Icons';

function SheetClock() {
  const { t, d } = useKaraokeTime();
  return (
    <div className="kk-clock">
      <span className="kk-clock-now">{fmt(t)}</span>
      <span>-{fmt(d - t)}</span>
    </div>
  );
}

// Mobile-only full-screen player. Close it with the chevron, Esc, or by swiping the top bar down.
export default function PlayerSheet() {
  const { t } = useLang();
  const { current, manual, upcoming, ui } = useKaraoke();
  const narrow = useMedia('(max-width: 767px)');
  const [dy, setDy] = useState(0);
  const start = useRef(null);
  const dyRef = useRef(0);
  const nextId = manual[0]?.id ?? upcoming[0];

  // If the phone is rotated wide while it is open, the sheet has no place any more.
  useEffect(() => {
    const wide = window.matchMedia('(min-width: 768px)');
    const check = () => wide.matches && ui.closeSheet();
    check();
    wide.addEventListener('change', check);
    return () => wide.removeEventListener('change', check);
  }, [ui]);

  const down = (e) => {
    if (e.target.closest('button, a')) return;
    start.current = e.clientY;
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const move = (e) => {
    if (start.current == null) return;
    dyRef.current = Math.max(0, e.clientY - start.current);
    setDy(dyRef.current);
  };
  const up = () => {
    if (start.current == null) return;
    start.current = null;
    if (dyRef.current > 110) ui.closeSheet();
    dyRef.current = 0;
    setDy(0);
  };

  const showQueue = () => {
    ui.closeSheet();
    requestAnimationFrame(() => {
      document.getElementById('karaoke')?.scrollIntoView({ block: 'start' });
      window.dispatchEvent(new Event(SHOW_QUEUE_EVENT));
    });
  };

  return (
    <Modal variant="full" label={t('kkPlayerLabel')} onClose={ui.closeSheet}>
      <div className="kk-sheet-full" style={dy ? { transform: `translateY(${dy}px)`, transition: 'none' } : undefined}>
        <div className="kk-sheet-bar" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
          <button type="button" className="kk-x" aria-label={t('kkClosePlayer')} onClick={ui.closeSheet}>
            <ChevronDownIcon size={22} />
          </button>
          <div className="kk-sheet-bar-title">
            <span>No. 09 · {t('kkTitle').toUpperCase()}</span>
            <span className="kk-sheet-bar-sub">{CURATED_PLAYLIST.name}</span>
          </div>
          <button type="button" className="kk-x" aria-label={t('kkShowQueue')} onClick={showQueue}>
            <QueueIcon size={20} />
          </button>
        </div>

        <div className="kk-sheet-body">
          <CoverTile track={current} size={narrow ? Math.min(342, Math.max(200, window.innerWidth - 48)) : 342} />
          <div className="kk-sheet-titlerow">
            <div className="kk-meta">
              <span className="kk-sheet-song">{current.title}</span>
              <span className="kk-sheet-orig">
                {t('kkOriginal')}: {current.originalArtist}
              </span>
            </div>
            <a className="kk-x" href={youtubeHref(current)} target="_blank" rel="noopener noreferrer" aria-label={t('kkWatchClip')}>
              <YoutubeIcon size={20} />
            </a>
          </div>
          <div className="kk-sheet-wave">
            <Waveform count={64} />
            <SheetClock />
          </div>
          <Transport size="lg" />
          {nextId && (
            <div className="kk-sheet-next">
              <span className="kk-eyebrow kk-eyebrow-mut">{t('kkNextUp')}</span>
              <span className="kk-sheet-next-name">
                {TRACK_MAP[nextId].title} <span>— {TRACK_MAP[nextId].originalArtist}</span>
              </span>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
