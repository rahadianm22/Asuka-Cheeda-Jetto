'use client';

import { useState } from 'react';
import { TRACK_MAP, youtubeHref } from '@/lib/karaoke';
import { useLang } from '../LanguageProvider';
import { useKaraoke } from './KaraokePlayerProvider';
import { MAX_NAME, MAX_PLAYLISTS } from './usePlaylists';
import Menu, { MenuItem } from './Menu';
import Modal from './Modal';
import CoverTile from './CoverTile';
import { BookmarkIcon, CloseIcon, PlayIcon, PlayNextIcon, PlusIcon, QueueAddIcon, ShareIcon, TrashIcon, YoutubeIcon } from './Icons';

// The ⋮ menu for any track row: the six actions, plus "remove" when the row belongs to a saved
// playlist or to the manual queue.
export function TrackMenu() {
  const { t, tf } = useLang();
  const { menu, ui, playNow, playNext, addToQueue, removeManual, playlists } = useKaraoke();
  const tr = TRACK_MAP[menu.trackId];
  const saved = playlists.savedCount(tr.id);
  const userList = menu.playlistId && playlists.lists.find((p) => p.id === menu.playlistId);

  // The menu closes first; any follow-up dialog gets the original ⋮ button back as its focus target.
  const run = (fn) => () => {
    ui.closeMenu();
    fn();
    if (document.contains(menu.anchor)) menu.anchor.focus({ preventScroll: true });
  };

  const share = async () => {
    const url = `${location.origin}/#karaoke?track=${tr.id}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: tr.title, text: `${tr.title} — Asuka Jetto`, url });
        return;
      }
    } catch (e) {
      if (e?.name === 'AbortError') return;
    }
    try {
      await navigator.clipboard.writeText(url);
      ui.showToast(t('kkLinkCopied'));
    } catch {
      ui.showToast(url);
    }
  };

  return (
    <Menu
      anchor={menu.anchor}
      onClose={ui.closeMenu}
      label={tf('kkTrackOptions', { title: tr.title })}
      header={
        <div className="kk-sheet-head">
          <CoverTile track={tr} size={56} />
          <div className="kk-sheet-head-text">
            <div className="kk-sheet-title">{tr.title}</div>
            <div className="kk-sheet-sub">
              Asuka Jetto · {t('kkOriginalLc')} {tr.originalArtist}
            </div>
          </div>
          <button type="button" className="kk-x" aria-label={t('kkClose')} onClick={ui.closeMenu}>
            <CloseIcon size={18} />
          </button>
        </div>
      }
    >
      <MenuItem
        icon={<PlayIcon size={22} />}
        onClick={run(() => {
          if (menu.manualUid) removeManual(menu.manualUid);
          playNow(tr.id);
        })}
      >
        {t('kkPlayNow')}
      </MenuItem>
      <MenuItem icon={<PlayNextIcon size={22} />} onClick={run(() => (playNext(tr.id), ui.showToast(t('kkPlayNextDone'))))}>
        {t('kkPlayNext')}
      </MenuItem>
      <MenuItem icon={<QueueAddIcon size={22} />} onClick={run(() => (addToQueue(tr.id), ui.showToast(t('kkQueued'))))}>
        {t('kkAddQueue')}
      </MenuItem>
      <MenuItem
        icon={<BookmarkIcon size={22} />}
        hint={saved > 0 ? tf('kkSavedIn', { n: saved }) : undefined}
        onClick={run(() => ui.openSave(tr.id, menu.anchor))}
      >
        {t('kkSaveTo')}
      </MenuItem>
      <MenuItem icon={<YoutubeIcon size={22} />} hint="↗" href={youtubeHref(tr)} onClick={ui.closeMenu}>
        {t('kkWatchClip')}
      </MenuItem>
      <MenuItem icon={<ShareIcon size={22} />} onClick={run(share)}>
        {t('kkShare')}
      </MenuItem>
      {menu.manualUid && (
        <MenuItem danger icon={<TrashIcon size={22} />} onClick={run(() => removeManual(menu.manualUid))}>
          {t('kkRemoveQueue')}
        </MenuItem>
      )}
      {userList && (
        <MenuItem
          danger
          icon={<TrashIcon size={22} />}
          onClick={run(() => {
            playlists.removeTrack(userList.id, tr.id);
            ui.showToast(tf('kkRemovedFrom', { name: userList.name }), () => playlists.addTrack(userList.id, tr.id));
          })}
        >
          {t('kkRemoveFromPlaylist')}
        </MenuItem>
      )}
    </Menu>
  );
}

// "Simpan ke playlist…": a checkbox per playlist plus an inline "Playlist baru" field.
export function SaveToPlaylistSheet() {
  const { t, tf } = useLang();
  const { saveFor, ui, playlists } = useKaraoke();
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');
  const tr = TRACK_MAP[saveFor.trackId];
  const full = playlists.lists.length >= MAX_PLAYLISTS;

  const toggle = (p, on) => {
    if (on) {
      playlists.addTrack(p.id, tr.id);
      ui.showToast(tf('kkSavedTo', { name: p.name }), () => playlists.removeTrack(p.id, tr.id));
    } else {
      playlists.removeTrack(p.id, tr.id);
      ui.showToast(tf('kkRemovedFrom', { name: p.name }), () => playlists.addTrack(p.id, tr.id));
    }
  };

  const create = (e) => {
    e.preventDefault();
    const p = playlists.create(name, tr.id);
    if (!p) return;
    ui.showToast(tf('kkSavedTo', { name: p.name }), () => playlists.remove(p.id));
    setName('');
    setCreating(false);
  };

  return (
    <Modal variant="sheet" label={t('kkSaveTo')} onClose={ui.closeSave} returnFocus={saveFor.anchor}>
      <div className="kk-grab" aria-hidden="true" />
      <div className="kk-sheet-head">
        <div className="kk-sheet-head-text">
          <div className="kk-eyebrow kk-eyebrow-mut">{tf('kkSaveHead', { title: tr.title.toUpperCase() })}</div>
          <div className="kk-sheet-title">{t('kkMyPlaylists')}</div>
        </div>
        <button type="button" className="kk-x" aria-label={t('kkClose')} onClick={ui.closeSave}>
          <CloseIcon size={18} />
        </button>
      </div>

      {playlists.lists.length === 0 && !creating && <p className="kk-empty">{t('kkNoPlaylistsYet')}</p>}
      <ul className="kk-checks">
        {playlists.lists.map((p) => (
          <li key={p.id}>
            <label className="kk-check">
              <span className="kk-plcover" style={{ background: p.color }} aria-hidden="true">
                {p.name.slice(0, 2).toUpperCase()}
              </span>
              <span className="kk-meta">
                <span className="kk-name">{p.name}</span>
                <span className="kk-artist">{tf('kkSongCount', { n: p.trackIds.length })}</span>
              </span>
              <input type="checkbox" checked={p.trackIds.includes(tr.id)} onChange={(e) => toggle(p, e.target.checked)} />
            </label>
          </li>
        ))}
      </ul>

      {creating ? (
        <form className="kk-newform" onSubmit={create}>
          <label>
            <span className="kk-eyebrow kk-eyebrow-mut">{t('kkPlaylistName')}</span>
            <input
              data-autofocus
              type="text"
              value={name}
              maxLength={MAX_NAME}
              placeholder={t('kkPlaylistPlaceholder')}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          <button type="submit" className="kk-solid" disabled={!name.trim()}>
            {t('kkCreate')}
          </button>
        </form>
      ) : (
        <button type="button" className="kk-ghost kk-newbtn" disabled={full} onClick={() => setCreating(true)}>
          <PlusIcon size={16} />
          {full ? tf('kkPlaylistLimit', { n: MAX_PLAYLISTS }) : t('kkNewPlaylist')}
        </button>
      )}
      <button type="button" className="kk-solid kk-done" onClick={ui.closeSave}>
        {t('kkDone')}
      </button>
      <p className="kk-foot">{t('kkDeviceOnly')}</p>
    </Modal>
  );
}
