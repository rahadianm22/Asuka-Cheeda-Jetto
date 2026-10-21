'use client';

import { useState } from 'react';
import { TRACK_MAP, fmt } from '@/lib/karaoke';
import { useLang } from '../LanguageProvider';
import { useKaraoke } from './KaraokePlayerProvider';
import { MAX_NAME, MAX_PLAYLISTS } from './usePlaylists';
import Menu, { MenuItem } from './Menu';
import Modal from './Modal';
import TrackList from './TrackList';
import { BackIcon, CloseIcon, KebabIcon, PauseIcon, PencilIcon, PlayIcon, PlusIcon, TrashIcon } from './Icons';

const Cover = ({ p }) => (
  <span className="kk-plcover" style={{ background: p.color }} aria-hidden="true">
    {p.name.slice(0, 2).toUpperCase()}
  </span>
);

// Rename and delete-confirmation share one small dialog.
function PlaylistDialog({ mode, playlist, anchor, onClose }) {
  const { t, tf } = useLang();
  const { playlists, ui } = useKaraoke();
  const [name, setName] = useState(playlist.name);

  if (mode === 'delete') {
    return (
      <Modal variant="center" label={t('kkDelete')} onClose={onClose} returnFocus={anchor}>
        <h4 className="kk-dlg-title">{tf('kkDeleteAsk', { name: playlist.name })}</h4>
        <p className="kk-dlg-text">{t('kkDeleteText')}</p>
        <div className="kk-dlg-actions">
          <button type="button" className="kk-ghost" onClick={onClose}>
            {t('kkCancel')}
          </button>
          <button
            type="button"
            className="kk-solid kk-danger"
            data-autofocus
            onClick={() => {
              const idx = playlists.lists.findIndex((x) => x.id === playlist.id);
              playlists.remove(playlist.id);
              ui.showToast(tf('kkDeleted', { name: playlist.name }), () => playlists.restore(playlist, idx));
              onClose(true);
            }}
          >
            {t('kkDelete')}
          </button>
        </div>
      </Modal>
    );
  }
  return (
    <Modal variant="center" label={t('kkRename')} onClose={onClose} returnFocus={anchor}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          playlists.rename(playlist.id, name);
          onClose();
        }}
      >
        <label className="kk-dlg-field">
          <span className="kk-eyebrow kk-eyebrow-mut">{t('kkPlaylistName')}</span>
          <input data-autofocus type="text" value={name} maxLength={MAX_NAME} onChange={(e) => setName(e.target.value)} />
        </label>
        <div className="kk-dlg-actions">
          <button type="button" className="kk-ghost" onClick={onClose}>
            {t('kkCancel')}
          </button>
          <button type="submit" className="kk-solid" disabled={!name.trim()}>
            {t('kkSave')}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function PlaylistRow({ p, onOpen, onAction }) {
  const { t, tf } = useLang();
  const { play, ctx, isPlaying, toggle } = useKaraoke();
  const [menu, setMenu] = useState(null);
  const active = ctx.playlistId === p.id;

  return (
    <li className="kk-li kk-plrow">
      <button type="button" className="kk-row" onClick={() => onOpen(p.id)}>
        <Cover p={p} />
        <span className="kk-meta">
          <span className="kk-name">{p.name}</span>
          <span className="kk-artist">{tf('kkSongCount', { n: p.trackIds.length })}</span>
        </span>
      </button>
      <button
        type="button"
        className="kk-kebab"
        aria-label={tf('kkPlayPlaylist', { name: p.name })}
        disabled={!p.trackIds.length}
        onClick={() => (active && p.trackIds.includes(ctx.order?.[ctx.index]) ? toggle() : play(p.id, p.trackIds, p.trackIds[0]))}
      >
        {active && isPlaying ? <PauseIcon size={18} /> : <PlayIcon size={18} />}
      </button>
      <button
        type="button"
        className="kk-kebab"
        aria-haspopup="menu"
        aria-label={tf('kkPlaylistOptions', { name: p.name })}
        onClick={(e) => setMenu(e.currentTarget)}
      >
        <KebabIcon size={20} />
      </button>
      {menu && (
        <Menu
          anchor={menu}
          label={tf('kkPlaylistOptions', { name: p.name })}
          onClose={() => setMenu(null)}
          header={
            <div className="kk-sheet-head">
              <Cover p={p} />
              <div className="kk-sheet-head-text">
                <div className="kk-sheet-title">{p.name}</div>
              </div>
              <button type="button" className="kk-x" aria-label={t('kkClose')} onClick={() => setMenu(null)}>
                <CloseIcon size={18} />
              </button>
            </div>
          }
        >
          <MenuItem
            icon={<PencilIcon size={22} />}
            onClick={() => {
              onAction('rename', p, menu);
              setMenu(null);
            }}
          >
            {t('kkRename')}
          </MenuItem>
          <MenuItem
            danger
            icon={<TrashIcon size={22} />}
            onClick={() => {
              onAction('delete', p, menu);
              setMenu(null);
            }}
          >
            {t('kkDelete')}
          </MenuItem>
        </Menu>
      )}
    </li>
  );
}

export default function UserPlaylists() {
  const { t, tf } = useLang();
  const { playlists, ui } = useKaraoke();
  const { lists } = playlists;
  const [openId, setOpenId] = useState(null);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');
  const [dlg, setDlg] = useState(null);
  const open = lists.find((p) => p.id === openId);
  const full = lists.length >= MAX_PLAYLISTS;

  const create = (e) => {
    e.preventDefault();
    const p = playlists.create(name);
    if (!p) return;
    ui.showToast(tf('kkCreated', { name: p.name }), () => playlists.remove(p.id));
    setName('');
    setCreating(false);
  };

  return (
    <div className="kk-mine">
      {/* TODO phase 2: swap for the Discord sign-in card once Auth.js + the database are in. */}
      <div className="kk-guest">
        <div className="kk-eyebrow">{t('kkGuest')}</div>
        <p>{t('kkGuestText')}</p>
      </div>

      {open ? (
        <>
          <div className="kk-mine-head">
            <button type="button" className="kk-back" aria-label={t('kkBack')} onClick={() => setOpenId(null)}>
              <BackIcon size={20} />
            </button>
            <h4 className="kk-mine-title">{open.name}</h4>
            <span className="kk-dur">{tf('kkSongCount', { n: open.trackIds.length })}</span>
          </div>
          {open.trackIds.length ? (
            <TrackList ids={open.trackIds} playlistId={open.id} />
          ) : (
            <p className="kk-empty">{t('kkPlaylistEmpty')}</p>
          )}
        </>
      ) : (
        <>
          <div className="kk-mine-head">
            <h4 className="kk-mine-title">{t('kkMyPlaylists')}</h4>
            <button type="button" className="kk-ghost kk-new" disabled={full} onClick={() => setCreating((v) => !v)}>
              <PlusIcon size={16} />
              {t('kkNew')}
            </button>
          </div>
          {creating && (
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
          )}
          {lists.length ? (
            <ul className="kk-list">
              {lists.map((p) => (
                <PlaylistRow key={p.id} p={p} onOpen={setOpenId} onAction={(mode, pl, anchor) => setDlg({ mode, pl, anchor })} />
              ))}
            </ul>
          ) : (
            !creating && <p className="kk-empty">{t('kkNoPlaylistsYet')}</p>
          )}
          {full && <p className="kk-empty">{tf('kkPlaylistLimit', { n: MAX_PLAYLISTS })}</p>}
          <p className="kk-tip">{t('kkTip')}</p>
        </>
      )}

      {dlg && (
        <PlaylistDialog
          mode={dlg.mode}
          playlist={dlg.pl}
          anchor={dlg.anchor}
          onClose={(deleted) => {
            setDlg(null);
            if (deleted && openId === dlg.pl.id) setOpenId(null);
          }}
        />
      )}
    </div>
  );
}
