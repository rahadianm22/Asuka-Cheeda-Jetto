'use client';

import { memo, useMemo, useRef, useState } from 'react';
import { fmt, getPeaks } from '@/lib/karaoke';
import { useLang } from '../LanguageProvider';
import { useKaraoke, useKaraokeTime } from './KaraokePlayerProvider';

const Bars = memo(function Bars({ peaks, cls }) {
  return (
    <div className={`kk-bars ${cls}`} aria-hidden="true">
      {peaks.map((p, i) => (
        <i key={i} style={{ height: `${Math.round(14 + p * 86)}%` }} />
      ))}
    </div>
  );
});

// Click, drag or use the keyboard to seek. Three stacked layers (unplayed, buffered, played) are clipped
// by percentage, so the bars render once per track and only the clip changes as the song plays.
export default function Waveform({ count = 120, className = '' }) {
  const { current, seek, status } = useKaraoke();
  const { t, d, b } = useKaraokeTime();
  const { t: tr } = useLang();
  const peaks = useMemo(() => getPeaks(current, count), [current, count]);
  const [drag, setDragState] = useState(null);
  // a ref too: a quick tap fires pointerup before React has re-rendered with the new state
  const dragging = useRef(false);
  const setDrag = (v) => {
    dragging.current = v !== null;
    setDragState(v);
  };
  const box = useRef(null);

  const shown = drag ?? t;
  const pct = d ? Math.min(100, (shown / d) * 100) : 0;
  const bufPct = d ? Math.min(100, (b / d) * 100) : 0;

  const at = (e) => {
    const r = box.current.getBoundingClientRect();
    return Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)) * d;
  };

  const onKeyDown = (e) => {
    const step = { ArrowLeft: -5, ArrowDown: -5, ArrowRight: 5, ArrowUp: 5 }[e.key];
    if (step != null) seek(t + step);
    else if (e.key === 'Home') seek(0);
    else if (e.key === 'End') seek(d);
    else return;
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div
      ref={box}
      className={`kk-wave ${status === 'loading' ? 'is-loading' : ''} ${className}`}
      role="slider"
      tabIndex={0}
      aria-label={tr('kkSeek')}
      aria-valuemin={0}
      aria-valuemax={Math.round(d)}
      aria-valuenow={Math.round(shown)}
      aria-valuetext={`${fmt(shown)} ${tr('kkOf')} ${fmt(d)}`}
      onKeyDown={onKeyDown}
      onPointerDown={(e) => {
        if (!d || e.button > 0) return;
        e.currentTarget.setPointerCapture(e.pointerId);
        setDrag(at(e));
      }}
      onPointerMove={(e) => dragging.current && setDrag(at(e))}
      onPointerUp={(e) => {
        if (!dragging.current) return;
        seek(at(e));
        setDrag(null);
      }}
      onPointerCancel={() => setDrag(null)}
    >
      <Bars peaks={peaks} cls="kk-bars-base" />
      <div className="kk-clip" style={{ clipPath: `inset(0 ${100 - bufPct}% 0 0)` }}>
        <Bars peaks={peaks} cls="kk-bars-buf" />
      </div>
      <div className="kk-clip" style={{ clipPath: `inset(0 ${100 - pct}% 0 0)` }}>
        <Bars peaks={peaks} cls="kk-bars-played" />
      </div>
    </div>
  );
}
