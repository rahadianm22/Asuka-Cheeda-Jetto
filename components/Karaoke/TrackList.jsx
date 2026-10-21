'use client';

import { TRACK_MAP, fmt, pad2 } from '@/lib/karaoke';
import { useLang } from '../LanguageProvider';
import { useKaraoke } from './KaraokePlayerProvider';
import { KebabIcon } from './Icons';

export function Equalizer() {
  return (
    <span className="kk-eq" aria-hidden="true">
      <i />
      <i />
      <i />
    </span>
  );
}

export function KebabButton({ trackId, opts }) {
  const { tf } = useLang();
  const { ui } = useKaraoke();
  const title = TRACK_MAP[trackId].title;
  return (
    <button
      type="button"
      className="kk-kebab"
      aria-label={tf('kkTrackOptions', { title })}
      aria-haspopup="menu"
      onClick={(e) => ui.openMenu(trackId, e.currentTarget, opts)}
    >
      <KebabIcon size={20} />
    </button>
  );
}

// The playlist as an <ol> of buttons. Tapping the active row toggles play/pause.
export default function TrackList({ ids, playlistId, className = '' }) {
  const { current, status, play, toggle } = useKaraoke();
  return (
    <ol className={`kk-list ${className}`}>
      {ids.map((id, i) => {
        const tr = TRACK_MAP[id];
        const on = current.id === id;
        return (
          <li key={id} className={`kk-li ${on ? 'is-on' : ''}`}>
            <button
              type="button"
              className="kk-row"
              aria-current={on ? 'true' : undefined}
              onClick={() => (on ? toggle() : play(playlistId, ids, id))}
            >
              <span className="kk-num">{on && status === 'playing' ? <Equalizer /> : pad2(i + 1)}</span>
              <span className="kk-meta">
                <span className="kk-name">{tr.title}</span>
                <span className="kk-artist">{tr.originalArtist}</span>
              </span>
              <span className="kk-dur">{fmt(tr.duration)}</span>
            </button>
            <KebabButton trackId={id} opts={{ playlistId }} />
          </li>
        );
      })}
    </ol>
  );
}
