'use client';

import { useEffect, useState } from 'react';
import { useLang } from '../LanguageProvider';
import { useKaraoke } from './KaraokePlayerProvider';
import MiniPlayer from './MiniPlayer';
import PlayerSheet from './PlayerSheet';
import { SaveToPlaylistSheet, TrackMenu } from './TrackMenu';

// Everything that floats above the page. Mounted once in the root layout next to the provider.
export default function KaraokeOverlays() {
  const { tf, t } = useLang();
  const { current, started, menu, saveFor, sheetOpen, toast, ui } = useKaraoke();
  const [announce, setAnnounce] = useState('');

  // Polite announcement of track changes ("Sekarang: Nina"), only once playback has begun.
  useEffect(() => {
    if (started) setAnnounce(tf('kkAnnounce', { title: current.title }));
  }, [current.id, started]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <div className="kk-sr" role="status" aria-live="polite">
        {announce}
      </div>
      <MiniPlayer />
      {sheetOpen && <PlayerSheet />}
      {menu && <TrackMenu key={menu.trackId + (menu.manualUid || '')} />}
      {saveFor && <SaveToPlaylistSheet />}
      {toast && (
        <div className="kk-toast" role="status" key={toast.id}>
          <span>{toast.text}</span>
          {toast.undo && (
            <button
              type="button"
              className="kk-link"
              onClick={() => {
                toast.undo();
                ui.dismissToast();
              }}
            >
              {t('kkUndo')}
            </button>
          )}
        </div>
      )}
    </>
  );
}
