'use client';

import { useEffect, useRef, useState } from 'react';
import { CURATED_PLAYLIST, TRACK_IDS } from '@/lib/karaoke';
import { useLang } from '../LanguageProvider';
import { useKaraoke } from './KaraokePlayerProvider';
import TrackList from './TrackList';
import QueueView from './QueueView';
import UserPlaylists from './UserPlaylists';
import { ShuffleIcon } from './Icons';

export const SHOW_QUEUE_EVENT = 'jk:show-queue';

// Playlist · Antrean · Playlist Saya. The same three tabs sit on top of the list on every breakpoint.
export default function ListPanel() {
  const { t, tf } = useLang();
  const { queueCount, shuffle, toggleShuffle, play } = useKaraoke();
  const [tab, setTab] = useState('list');
  const root = useRef(null);

  useEffect(() => {
    const show = () => {
      setTab('queue');
      root.current?.scrollIntoView({ block: 'nearest' });
    };
    window.addEventListener(SHOW_QUEUE_EVENT, show);
    return () => window.removeEventListener(SHOW_QUEUE_EVENT, show);
  }, []);

  const tabs = [
    { id: 'list', label: t('kkTabPlaylist') },
    { id: 'queue', label: t('kkTabQueue'), badge: queueCount },
    { id: 'mine', label: t('kkTabMine') },
  ];

  const onKey = (e) => {
    const i = tabs.findIndex((x) => x.id === tab);
    const to = e.key === 'ArrowRight' ? (i + 1) % tabs.length : e.key === 'ArrowLeft' ? (i + tabs.length - 1) % tabs.length : -1;
    if (to < 0) return;
    e.preventDefault();
    setTab(tabs[to].id);
    document.getElementById(`kk-tab-${tabs[to].id}`)?.focus();
  };

  const shufflePlay = () => {
    if (!shuffle) toggleShuffle();
    play(CURATED_PLAYLIST.id, TRACK_IDS, TRACK_IDS[Math.floor(Math.random() * TRACK_IDS.length)]);
  };

  return (
    <div className="kk-panel" ref={root}>
      <div className="kk-tabs" role="tablist" aria-label={t('kkTabsLabel')} onKeyDown={onKey}>
        {tabs.map((x) => (
          <button
            key={x.id}
            id={`kk-tab-${x.id}`}
            type="button"
            role="tab"
            aria-selected={tab === x.id}
            aria-controls={`kk-pane-${x.id}`}
            tabIndex={tab === x.id ? 0 : -1}
            className="kk-tab"
            onClick={() => setTab(x.id)}
          >
            {x.label}
            {x.badge > 0 && <span className="kk-tab-badge">{x.badge}</span>}
          </button>
        ))}
      </div>

      <div id={`kk-pane-${tab}`} role="tabpanel" aria-labelledby={`kk-tab-${tab}`} className="kk-pane">
        {tab === 'list' && (
          <>
            <div className="kk-plhead">
              <div>
                <div className="kk-plname">{CURATED_PLAYLIST.name}</div>
                <div className="kk-plmeta">{tf('kkCurated', { n: TRACK_IDS.length })}</div>
              </div>
              <button type="button" className="kk-tbtn kk-skip" aria-label={t('kkShufflePlay')} onClick={shufflePlay}>
                <ShuffleIcon size={18} />
              </button>
            </div>
            <TrackList ids={TRACK_IDS} playlistId={CURATED_PLAYLIST.id} />
          </>
        )}
        {tab === 'queue' && <QueueView />}
        {tab === 'mine' && <UserPlaylists />}
      </div>

      <p className="kk-foot">{t('kkFooter')}</p>
    </div>
  );
}
