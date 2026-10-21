'use client';

import { useRef } from 'react';
import { CURATED_PLAYLIST, TRACK_MAP, fmt } from '@/lib/karaoke';
import { useLang } from '../LanguageProvider';
import { useKaraoke, useKaraokeTime } from './KaraokePlayerProvider';
import { Equalizer, KebabButton } from './TrackList';
import { GripIcon } from './Icons';

// Drag with the pointer, or focus the handle and press ↑/↓. Rows keep a stable key, so React moves the
// existing nodes; listeners sit on window (not the handle) because a moved node drops pointer capture.
function Handle({ id, index, listRef, onMove, label }) {
  const at = useRef(index);
  at.current = index;

  const down = (e) => {
    if (e.button > 0) return;
    e.preventDefault();
    const onPointerMove = (ev) => {
      const rows = [...listRef.current.children];
      let to = rows.findIndex((li) => ev.clientY < li.getBoundingClientRect().bottom);
      if (to < 0) to = rows.length - 1;
      if (to !== at.current) {
        onMove(at.current, to);
        at.current = to;
      }
    };
    const up = () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
    };
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
  };

  const key = (e) => {
    const d = e.key === 'ArrowUp' ? -1 : e.key === 'ArrowDown' ? 1 : 0;
    if (!d) return;
    e.preventDefault();
    onMove(index, index + d);
    // moving the row remounts its DOM position, which drops focus; put it back on the same handle
    requestAnimationFrame(() => listRef.current?.querySelector(`[data-hid="${id}"]`)?.focus());
  };

  return (
    <button type="button" className="kk-grip" data-hid={id} aria-label={label} onPointerDown={down} onKeyDown={key}>
      <GripIcon size={18} />
    </button>
  );
}

function Row({ id, hid, index, listRef, onMove, menuOpts }) {
  const { tf } = useLang();
  const tr = TRACK_MAP[id];
  return (
    <li className="kk-li kk-qli">
      <Handle id={hid} index={index} listRef={listRef} onMove={onMove} label={tf('kkReorder', { title: tr.title })} />
      <span className="kk-meta">
        <span className="kk-name">{tr.title}</span>
        <span className="kk-artist">{tr.originalArtist}</span>
      </span>
      <span className="kk-dur">{fmt(tr.duration)}</span>
      <KebabButton trackId={id} opts={menuOpts} />
    </li>
  );
}

function NowClock() {
  const { t, d } = useKaraokeTime();
  return (
    <span className="kk-dur">
      {fmt(t)} / {fmt(d)}
    </span>
  );
}

export default function QueueView() {
  const { t, tf } = useLang();
  const { current, status, manual, upcoming, ctx, clearManual, moveManual, moveContext, playlists } = useKaraoke();
  const manualRef = useRef(null);
  const ctxRef = useRef(null);
  const listName =
    ctx.playlistId === CURATED_PLAYLIST.id ? CURATED_PLAYLIST.name : playlists.lists.find((p) => p.id === ctx.playlistId)?.name || '';

  return (
    <div className="kk-queue">
      <section aria-labelledby="kk-q-now">
        <h4 className="kk-qhead" id="kk-q-now">
          <span className={`kk-dot ${status === 'playing' ? 'is-on' : ''}`} />
          {t('kkNowShort')}
        </h4>
        <div className="kk-qnow">
          {status === 'playing' && <Equalizer />}
          <span className="kk-meta">
            <span className="kk-name">{current.title}</span>
            <span className="kk-artist">{current.originalArtist}</span>
          </span>
          <NowClock />
        </div>
      </section>

      {manual.length > 0 && (
        <section aria-labelledby="kk-q-man">
          <div className="kk-qhead-row">
            <h4 className="kk-qhead" id="kk-q-man">
              {t('kkAddedByYou')}
            </h4>
            <button type="button" className="kk-link" onClick={clearManual}>
              {t('kkClear')}
            </button>
          </div>
          <ol className="kk-list" ref={manualRef}>
            {manual.map((m, i) => (
              <Row key={m.uid} id={m.id} hid={m.uid} index={i} listRef={manualRef} onMove={moveManual} menuOpts={{ manualUid: m.uid }} />
            ))}
          </ol>
        </section>
      )}

      <section aria-labelledby="kk-q-next">
        <h4 className="kk-qhead" id="kk-q-next">
          {tf('kkNextFrom', { name: listName })}
        </h4>
        {upcoming.length ? (
          <ol className="kk-list" ref={ctxRef}>
            {upcoming.map((id, i) => (
              <Row key={id} id={id} hid={id} index={i} listRef={ctxRef} onMove={moveContext} menuOpts={{ playlistId: ctx.playlistId }} />
            ))}
          </ol>
        ) : (
          <p className="kk-empty">{t('kkQueueEnd')}</p>
        )}
      </section>
    </div>
  );
}
