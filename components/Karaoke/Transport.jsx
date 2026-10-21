'use client';

import { useLang } from '../LanguageProvider';
import { useKaraoke } from './KaraokePlayerProvider';
import { NextIcon, PauseIcon, PlayIcon, PrevIcon, RepeatIcon, ShuffleIcon } from './Icons';

// shuffle · prev · play/pause · next · repeat. `size` only changes the button dimensions (CSS).
export default function Transport({ size = 'lg', className = '' }) {
  const { t } = useLang();
  const { isPlaying, shuffle, repeat, toggle, next, prev, toggleShuffle, cycleRepeat } = useKaraoke();
  const repeatLabel = `${t('kkRepeat')}: ${t(repeat === 'off' ? 'kkRepeatOff' : repeat === 'all' ? 'kkRepeatAll' : 'kkRepeatOne')}`;
  const icon = size === 'lg' ? 28 : 24;

  return (
    <div className={`kk-transport kk-transport-${size} ${className}`}>
      <button type="button" className="kk-tbtn kk-toggle" aria-label={t('kkShuffle')} aria-pressed={shuffle} onClick={toggleShuffle}>
        <ShuffleIcon size={20} />
      </button>
      <button type="button" className="kk-tbtn kk-skip" aria-label={t('kkPrev')} onClick={prev}>
        <PrevIcon size={icon - 4} />
      </button>
      <button type="button" className="kk-play" aria-label={isPlaying ? t('kkPause') : t('kkPlay')} onClick={toggle}>
        {isPlaying ? <PauseIcon size={icon} /> : <PlayIcon size={icon} />}
      </button>
      <button type="button" className="kk-tbtn kk-skip" aria-label={t('kkNext')} onClick={next}>
        <NextIcon size={icon - 4} />
      </button>
      <button type="button" className="kk-tbtn kk-toggle" aria-label={repeatLabel} aria-pressed={repeat !== 'off'} onClick={cycleRepeat}>
        <RepeatIcon size={20} />
        {repeat === 'one' && <span className="kk-badge">1</span>}
      </button>
    </div>
  );
}
