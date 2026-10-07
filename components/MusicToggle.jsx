'use client';

import { useEffect, useState } from 'react';
import { useLang } from './LanguageProvider';

const SRC = '/audio/jettobgm.mp3';
const TITLE = 'Otsu Jetto';
const VOLUME = 0.4;

// One audio element for the whole site: navigating between the homepage and /kamar keeps the song
// going instead of restarting it, and every toggle shows the same state.
let bgm = null;
function getBgm() {
  if (!bgm) {
    bgm = new Audio(SRC);
    bgm.loop = true;
    bgm.volume = VOLUME;
    bgm.preload = 'none';
  }
  return bgm;
}

// Cancels an autoplay that is still waiting for the visitor's first gesture.
let cancelPending = () => {};

// Off until asked for, except with `autoplay`, which starts it every time the toggle mounts (each
// visit to /kamar). Coming in through a link still counts as the visitor's click, so that usually
// works; if the browser refuses, the music starts on the first click, tap or key press instead.
// Turning it off holds for as long as the visitor stays on the page. The pressed state follows the
// audio's own play/pause events, so a refused play() never leaves the button claiming it is on.
export default function MusicToggle({ autoplay = false }) {
  const { t } = useLang();
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const a = getBgm();
    const on = () => setPlaying(true);
    const off = () => setPlaying(false);
    a.addEventListener('play', on);
    a.addEventListener('pause', off);
    setPlaying(!a.paused);

    // Browsers only allow sound after one of these: pointerdown counts for a mouse, pointerup for a
    // tap, keydown for the keyboard. A press on the toggle itself is left to the toggle, or the two
    // would cancel each other out.
    const GESTURES = ['pointerdown', 'pointerup', 'keydown'];
    const stopWaiting = () => GESTURES.forEach((g) => window.removeEventListener(g, start));
    function start(e) {
      if (e.target.closest?.('.musicbtn')) return;
      if (!a.paused) return stopWaiting();
      a.play().then(stopWaiting, () => {});
    }
    if (autoplay && a.paused) {
      a.play().catch(() => {
        GESTURES.forEach((g) => window.addEventListener(g, start));
        cancelPending = stopWaiting;
      });
    }
    return () => {
      a.removeEventListener('play', on);
      a.removeEventListener('pause', off);
      stopWaiting();
    };
  }, [autoplay]);

  const toggle = () => {
    // the visitor has made their choice, so a still-pending autoplay must not override it
    cancelPending();
    const a = getBgm();
    if (a.paused) a.play().catch(() => {});
    else a.pause();
  };

  // the accessible name starts with the visible song title, so voice control users can say it
  const label = `${TITLE}: ${playing ? t('musicOff') : t('musicOn')}`;

  return (
    <button type="button" className="musicbtn" aria-pressed={playing} aria-label={label} title={label} onClick={toggle}>
      {playing ? (
        <span className="musicbtn-eq" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
      ) : (
        <svg className="musicbtn-note" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
          <path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z" />
        </svg>
      )}
      <span className="musicbtn-title">{TITLE}</span>
    </button>
  );
}
