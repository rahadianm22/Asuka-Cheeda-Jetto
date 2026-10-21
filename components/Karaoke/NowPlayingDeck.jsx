'use client';

import { TRACKS, fmt, pad2, youtubeHref } from '@/lib/karaoke';
import { useLang } from '../LanguageProvider';
import { useKaraoke, useKaraokeTime } from './KaraokePlayerProvider';
import CoverTile from './CoverTile';
import Waveform from './Waveform';
import Transport from './Transport';
import { NextIcon, PauseIcon, PlayIcon, PrevIcon, VolumeIcon } from './Icons';

function ErrorNote() {
  const { t } = useLang();
  const { retry } = useKaraoke();
  return (
    <div className="kk-error" role="alert">
      <span>{t('kkError')}</span>
      <button type="button" className="kk-ghost" onClick={retry}>
        {t('kkRetry')}
      </button>
    </div>
  );
}

function Clock() {
  const { t, d } = useKaraokeTime();
  const { t: tr } = useLang();
  return (
    <div className="kk-clock">
      <span className="kk-clock-now">{fmt(t)}</span>
      <span className="kk-clock-mid">{tr('kkBeat')}</span>
      <span>-{fmt(d - t)}</span>
    </div>
  );
}

// Tablet and desktop: the big deck. Mobile gets NowPlayingCard instead (the section's CSS swaps them).
export default function NowPlayingDeck() {
  const { t, tf } = useLang();
  const { current, index, status, volume, setVolume } = useKaraoke();
  const no = pad2(index + 1);

  return (
    <div className="kk-deck">
      <div className="kk-deck-top">
        <CoverTile track={current} size={240} />
        <div className="kk-deck-info">
          <div className="kk-deck-head">
            <div className="kk-eyebrow">{tf('kkNowPlaying', { no, total: pad2(TRACKS.length) })}</div>
            <h3 className="kk-deck-title">{current.title}</h3>
            <div className="kk-deck-artist">
              {t('kkOriginal')}: {current.originalArtist}
            </div>
          </div>
          {status === 'error' && <ErrorNote />}
          <dl className="kk-facts">
            <div>
              <dt>{t('kkSinger')}</dt>
              <dd>Asuka Jetto</dd>
            </div>
            <div>
              <dt>{t('kkSource')}</dt>
              <dd>{t('kkSourceVal')}</dd>
            </div>
            <div>
              <dt>{t('kkDuration')}</dt>
              <dd>{fmt(current.duration)}</dd>
            </div>
          </dl>
          <a className="kk-ghost kk-yt" href={youtubeHref(current)} target="_blank" rel="noopener noreferrer">
            {t('kkWatch')} ↗
          </a>
        </div>
      </div>

      <div className="kk-deck-wave">
        <Waveform count={96} />
        <Clock />
      </div>

      <div className="kk-deck-controls">
        <Transport size="lg" />
        <label className="kk-vol">
          <VolumeIcon size={20} />
          <span className="kk-vol-label">VOL</span>
          <input
            type="range"
            min={0}
            max={100}
            value={Math.round(volume * 100)}
            aria-label={t('kkVolume')}
            onChange={(e) => setVolume(Number(e.target.value) / 100)}
          />
          <span className="kk-vol-val">{Math.round(volume * 100)}</span>
        </label>
      </div>
    </div>
  );
}

// Mobile: a compact card; the full controls live in the PlayerSheet.
export function NowPlayingCard() {
  const { t } = useLang();
  const { current, status, isPlaying, toggle, next, prev, ui } = useKaraoke();
  return (
    <div className="kk-card">
      <div className="kk-card-top">
        <CoverTile track={current} size={88} />
        <div className="kk-card-info">
          <div className="kk-onair">
            <span className={`kk-dot ${isPlaying ? 'is-on' : ''}`} />
            {isPlaying ? t('kkOnAir') : t('kkStandby')}
          </div>
          <div className="kk-card-title">{current.title}</div>
          <div className="kk-card-artist">
            {t('kkOriginal')}: {current.originalArtist}
          </div>
        </div>
        <button type="button" className="kk-play kk-play-card" aria-label={isPlaying ? t('kkPause') : t('kkPlay')} onClick={toggle}>
          {isPlaying ? <PauseIcon size={24} /> : <PlayIcon size={24} />}
        </button>
      </div>
      {status === 'error' && <ErrorNote />}
      <div className="kk-card-wave">
        <Waveform count={48} className="kk-wave-thin" />
        <Clock />
      </div>
      <div className="kk-card-actions">
        <button type="button" className="kk-tbtn kk-skip" aria-label={t('kkPrev')} onClick={prev}>
          <PrevIcon size={20} />
        </button>
        <button type="button" className="kk-tbtn kk-skip" aria-label={t('kkNext')} onClick={next}>
          <NextIcon size={20} />
        </button>
        <button type="button" className="kk-ghost kk-open" onClick={ui.openSheet}>
          {t('kkOpenPlayer')} ↑
        </button>
      </div>
    </div>
  );
}
