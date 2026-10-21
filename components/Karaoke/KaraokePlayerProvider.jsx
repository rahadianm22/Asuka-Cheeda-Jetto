'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { TRACKS, TRACK_MAP, TRACK_IDS, CURATED_PLAYLIST } from '@/lib/karaoke';
import usePlaylists from './usePlaylists';

const Ctx = createContext(null);
const STATE_KEY = 'jk:player:v1';
const THROTTLE_MS = 80;
const PREFETCH_BYTES = 'bytes=0-262143';
export const BGM_EVENT = 'jk:bgm-play';
export const KARAOKE_EVENT = 'jk:karaoke-play';

export function useKaraoke() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useKaraoke must be used inside KaraokePlayerProvider');
  return v;
}

// Playback position lives outside React state so the clock does not re-render the whole tree:
// only components that call useKaraokeTime() update, and only about every 80ms.
const TIME0 = { t: 0, d: 0, b: 0 };
function createTimeStore() {
  let v = TIME0;
  const subs = new Set();
  return {
    get: () => v,
    set(n) {
      if (n.t === v.t && n.d === v.d && n.b === v.b) return;
      v = n;
      subs.forEach((f) => f());
    },
    subscribe(f) {
      subs.add(f);
      return () => subs.delete(f);
    },
  };
}

export function useKaraokeTime() {
  const { timeStore } = useKaraoke();
  return useSyncExternalStore(timeStore.subscribe, timeStore.get, () => TIME0);
}

const uid = () => globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;

function shuffled(ids, notFirst) {
  const a = [...ids];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  if (a.length > 1 && a[0] === notFirst) [a[0], a[1]] = [a[1], a[0]];
  return a;
}

function move(arr, from, to) {
  const a = [...arr];
  const [x] = a.splice(from, 1);
  a.splice(to, 0, x);
  return a;
}

const INITIAL = {
  currentId: TRACK_IDS[0],
  ctx: { playlistId: CURATED_PLAYLIST.id, base: TRACK_IDS, order: TRACK_IDS, index: 0 },
  manual: [], // [{ uid, id }]: "Ditambahkan kamu"
  shuffle: false,
  repeat: 'off', // 'off' | 'all' | 'one'
  volume: 0.8,
  status: 'idle', // 'idle' | 'loading' | 'playing' | 'paused' | 'error'
  started: false,
  dismissed: false,
  sectionVisible: false,
  sheetOpen: false,
  menu: null, // { trackId, anchor, playlistId?, manualUid? }
  saveFor: null, // { trackId, anchor }
  toast: null, // { id, text, undo }
};

export function KaraokePlayerProvider({ children }) {
  const [st, setSt] = useState(INITIAL);
  const stRef = useRef(INITIAL);
  const audioRef = useRef(null);
  const loadedId = useRef(null);
  const pendingSeek = useRef(0);
  const prefetched = useRef(null);
  const saveRef = useRef(() => {});
  const toastTimer = useRef(null);
  const timeStore = useMemo(createTimeStore, []);
  const playlists = usePlaylists();

  // The ref is the source of truth so actions fired back-to-back see each other's changes.
  const update = useCallback((patch) => {
    stRef.current = { ...stRef.current, ...patch };
    setSt(stRef.current);
  }, []);

  // ---------- audio plumbing ----------
  const publishTime = useCallback(
    (tOverride) => {
      const a = audioRef.current;
      const tr = TRACK_MAP[stRef.current.currentId];
      const live = a && loadedId.current === stRef.current.currentId;
      const d = live && isFinite(a.duration) && a.duration > 0 ? a.duration : tr.duration;
      const b = live && a.buffered.length ? a.buffered.end(a.buffered.length - 1) : 0;
      const t = tOverride ?? (live ? a.currentTime : timeStore.get().t);
      timeStore.set({ t, d, b });
    },
    [timeStore],
  );

  const load = useCallback(
    (seek) => {
      const a = audioRef.current;
      const id = stRef.current.currentId;
      a.preload = 'auto';
      a.src = TRACK_MAP[id].src;
      loadedId.current = id;
      pendingSeek.current = seek || 0;
      timeStore.set({ t: seek || 0, d: TRACK_MAP[id].duration, b: 0 });
      a.load();
    },
    [timeStore],
  );

  const playCurrent = useCallback(() => {
    const a = audioRef.current;
    if (!a) return;
    const s = stRef.current;
    if (loadedId.current !== s.currentId || s.status === 'error') {
      load(loadedId.current === s.currentId ? 0 : timeStore.get().t);
    }
    window.dispatchEvent(new Event(KARAOKE_EVENT));
    update({ started: true, dismissed: false, status: 'loading' });
    a.play().catch((e) => {
      if (e?.name === 'AbortError') return;
      update({ status: e?.name === 'NotAllowedError' ? 'paused' : 'error' });
    });
  }, [load, update, timeStore]);

  const startTrack = useCallback(
    (id, patch = {}) => {
      update({ currentId: id, ...patch });
      load(0);
      playCurrent();
    },
    [load, playCurrent, update],
  );

  const seek = useCallback(
    (sec) => {
      const a = audioRef.current;
      const d = timeStore.get().d || TRACK_MAP[stRef.current.currentId].duration;
      const t = Math.min(Math.max(0, sec), Math.max(0, d - 0.05));
      if (a && loadedId.current === stRef.current.currentId && a.readyState > 0) a.currentTime = t;
      else pendingSeek.current = t;
      publishTime(t);
    },
    [publishTime, timeStore],
  );

  // End of the queue with repeat off: back to the first track, paused.
  const stop = useCallback(() => {
    audioRef.current?.pause();
    const { ctx } = stRef.current;
    loadedId.current = null;
    pendingSeek.current = 0;
    update({ currentId: ctx.order[0], ctx: { ...ctx, index: 0 }, status: 'paused' });
    timeStore.set({ t: 0, d: TRACK_MAP[ctx.order[0]].duration, b: 0 });
  }, [update, timeStore]);

  // ---------- transport ----------
  const toggle = useCallback(() => {
    const a = audioRef.current;
    if (!a) return;
    if (!a.paused && stRef.current.status !== 'error') a.pause();
    else playCurrent();
  }, [playCurrent]);

  const advance = useCallback(
    (auto) => {
      const s = stRef.current;
      if (auto && s.repeat === 'one') {
        seek(0);
        audioRef.current.play().catch(() => {});
        return;
      }
      if (s.manual.length) {
        const [head, ...rest] = s.manual;
        startTrack(head.id, { manual: rest });
        return;
      }
      const { ctx } = s;
      const i = ctx.index + 1;
      if (i >= ctx.order.length) {
        if (auto && s.repeat === 'off') return stop();
        const order = s.shuffle ? shuffled(ctx.base, ctx.order[ctx.order.length - 1]) : ctx.base;
        startTrack(order[0], { ctx: { ...ctx, order, index: 0 } });
        return;
      }
      startTrack(ctx.order[i], { ctx: { ...ctx, index: i } });
    },
    [seek, startTrack, stop],
  );

  const next = useCallback(() => advance(false), [advance]);
  const onEnded = useCallback(() => advance(true), [advance]);

  const prev = useCallback(() => {
    const s = stRef.current;
    if (timeStore.get().t > 3) return seek(0);
    const { ctx } = s;
    // From a queued ("Ditambahkan kamu") track, back returns to the playlist position.
    const onContext = ctx.order[ctx.index] === s.currentId;
    let i = onContext ? ctx.index - 1 : ctx.index;
    if (i < 0) {
      if (s.repeat === 'all') i = ctx.order.length - 1;
      else return seek(0);
    }
    startTrack(ctx.order[i], { ctx: { ...ctx, index: i } });
  }, [seek, startTrack, timeStore]);

  // Play `id` from a playlist (`ids` is its track list); that playlist becomes the queue context.
  const playFrom = useCallback(
    (playlistId, ids, id) => {
      const s = stRef.current;
      if (s.currentId === id && s.ctx.playlistId === playlistId && ids.join() === s.ctx.base.join()) return toggle();
      let order = ids;
      let index = ids.indexOf(id);
      if (s.shuffle) {
        order = [id, ...shuffled(ids.filter((x) => x !== id))];
        index = 0;
      }
      startTrack(id, { ctx: { playlistId, base: ids, order, index } });
    },
    [startTrack, toggle],
  );

  const playNow = useCallback(
    (id) => {
      const s = stRef.current;
      const i = s.ctx.order.indexOf(id);
      startTrack(id, i >= 0 ? { ctx: { ...s.ctx, index: i } } : {});
    },
    [startTrack],
  );

  const playNext = useCallback((id) => update({ manual: [{ uid: uid(), id }, ...stRef.current.manual] }), [update]);
  const addToQueue = useCallback((id) => update({ manual: [...stRef.current.manual, { uid: uid(), id }] }), [update]);
  const clearManual = useCallback(() => update({ manual: [] }), [update]);
  const removeManual = useCallback((u) => update({ manual: stRef.current.manual.filter((x) => x.uid !== u) }), [update]);

  const moveManual = useCallback(
    (from, to) => {
      const m = stRef.current.manual;
      if (from === to || to < 0 || to >= m.length) return;
      update({ manual: move(m, from, to) });
    },
    [update],
  );

  // `from`/`to` count within the upcoming part of the playlist (after the current position).
  const moveContext = useCallback(
    (from, to) => {
      const { ctx } = stRef.current;
      const up = ctx.order.slice(ctx.index + 1);
      if (from === to || to < 0 || to >= up.length) return;
      update({ ctx: { ...ctx, order: [...ctx.order.slice(0, ctx.index + 1), ...move(up, from, to)] } });
    },
    [update],
  );

  // Shuffle only reorders the playlist context; the manual queue is never touched.
  const toggleShuffle = useCallback(() => {
    const { shuffle, ctx } = stRef.current;
    if (!shuffle) {
      const played = ctx.order.slice(0, ctx.index + 1);
      update({ shuffle: true, ctx: { ...ctx, order: [...played, ...shuffled(ctx.order.slice(ctx.index + 1))] } });
    } else {
      const here = ctx.order[ctx.index];
      update({ shuffle: false, ctx: { ...ctx, order: ctx.base, index: Math.max(0, ctx.base.indexOf(here)) } });
    }
  }, [update]);

  const cycleRepeat = useCallback(() => {
    const r = stRef.current.repeat;
    update({ repeat: r === 'off' ? 'all' : r === 'all' ? 'one' : 'off' });
  }, [update]);

  const setVolume = useCallback(
    (v) => {
      const vol = Math.min(1, Math.max(0, v));
      if (audioRef.current) audioRef.current.volume = vol;
      update({ volume: vol });
    },
    [update],
  );

  const retry = useCallback(() => {
    loadedId.current = null;
    pendingSeek.current = 0;
    playCurrent();
  }, [playCurrent]);

  // ---------- overlay state (menu, sheets, toast) ----------
  const showToast = useCallback(
    (text, undo) => {
      clearTimeout(toastTimer.current);
      update({ toast: { id: uid(), text, undo } });
      toastTimer.current = setTimeout(() => update({ toast: null }), 6000);
    },
    [update],
  );

  const ui = useMemo(
    () => ({
      setSectionVisible: (v) => update({ sectionVisible: v }),
      openSheet: () => update({ sheetOpen: true }),
      closeSheet: () => update({ sheetOpen: false }),
      // opts: { playlistId } for a row of a saved playlist, { manualUid } for a queued row
      openMenu: (trackId, anchor, opts = {}) => update({ menu: { trackId, anchor, ...opts } }),
      closeMenu: () => update({ menu: null }),
      openSave: (trackId, anchor) => update({ saveFor: { trackId, anchor } }),
      closeSave: () => update({ saveFor: null }),
      dismissMini: () => {
        audioRef.current?.pause();
        update({ dismissed: true, sheetOpen: false });
      },
      showToast,
      dismissToast: () => {
        clearTimeout(toastTimer.current);
        update({ toast: null });
      },
    }),
    [update, showToast],
  );

  // ---------- the one audio element ----------
  const actions = useRef({});
  actions.current = { toggle, next, prev, seek, onEnded, publishTime };

  useEffect(() => {
    const a = new Audio();
    a.preload = 'none';
    audioRef.current = a;

    // Restore the last session paused, and without touching the network until play is pressed.
    try {
      const saved = JSON.parse(localStorage.getItem(STATE_KEY) || 'null');
      if (saved && TRACK_MAP[saved.currentId]) {
        const known = (x) => (Array.isArray(x) ? x.filter((i) => TRACK_MAP[i]) : []);
        const base = known(saved.ctx?.base);
        const order = known(saved.ctx?.order);
        const patch = {
          currentId: saved.currentId,
          shuffle: !!saved.shuffle,
          repeat: ['off', 'all', 'one'].includes(saved.repeat) ? saved.repeat : 'off',
          volume: typeof saved.volume === 'number' ? Math.min(1, Math.max(0, saved.volume)) : INITIAL.volume,
          manual: known((saved.manual || []).map((m) => m?.id)).map((id) => ({ uid: uid(), id })),
        };
        if (base.length && order.length === base.length) {
          patch.ctx = {
            playlistId: String(saved.ctx.playlistId || CURATED_PLAYLIST.id),
            base,
            order,
            index: Math.min(order.length - 1, Math.max(0, saved.ctx.index | 0)),
          };
        }
        update(patch);
        pendingSeek.current = Math.max(0, Number(saved.t) || 0);
        timeStore.set({ t: pendingSeek.current, d: TRACK_MAP[saved.currentId].duration, b: 0 });
      }
    } catch {}
    a.volume = stRef.current.volume;
    if (!timeStore.get().d) timeStore.set({ t: 0, d: TRACK_MAP[stRef.current.currentId].duration, b: 0 });

    // A shared link (/#karaoke?track=id) selects that song, paused.
    const m = /track=([\w-]+)/.exec(location.hash);
    if (m && TRACK_MAP[m[1]]) {
      const s = stRef.current;
      const i = s.ctx.order.indexOf(m[1]);
      update({ currentId: m[1], ...(i >= 0 ? { ctx: { ...s.ctx, index: i } } : {}) });
      pendingSeek.current = 0;
      timeStore.set({ t: 0, d: TRACK_MAP[m[1]].duration, b: 0 });
      requestAnimationFrame(() => document.getElementById('karaoke')?.scrollIntoView({ block: 'start' }));
    }

    const on = (ev, fn) => a.addEventListener(ev, fn);
    on('loadedmetadata', () => {
      if (pendingSeek.current > 0) a.currentTime = pendingSeek.current;
      pendingSeek.current = 0;
      actions.current.publishTime();
    });
    on('waiting', () => !a.paused && update({ status: 'loading' }));
    on('playing', () => update({ status: 'playing' }));
    on('pause', () => {
      const cur = stRef.current.status;
      if (cur !== 'error' && cur !== 'idle') update({ status: 'paused' });
    });
    on('error', () => {
      if (loadedId.current != null) update({ status: 'error' });
    });
    on('ended', () => actions.current.onEnded());
    ['timeupdate', 'progress', 'durationchange'].forEach((ev) => on(ev, () => actions.current.publishTime()));

    // The site's background music and the karaoke never play over each other.
    const onBgm = () => a.pause();
    window.addEventListener(BGM_EVENT, onBgm);

    saveRef.current = () => {
      const s = stRef.current;
      try {
        localStorage.setItem(
          STATE_KEY,
          JSON.stringify({
            currentId: s.currentId,
            t: Math.floor(timeStore.get().t),
            volume: s.volume,
            shuffle: s.shuffle,
            repeat: s.repeat,
            manual: s.manual.map((x) => ({ id: x.id })),
            ctx: s.ctx,
          }),
        );
      } catch {}
    };
    const onHide = () => saveRef.current();
    window.addEventListener('pagehide', onHide);
    return () => {
      window.removeEventListener(BGM_EVENT, onBgm);
      window.removeEventListener('pagehide', onHide);
      a.pause();
      a.removeAttribute('src');
      loadedId.current = null;
      audioRef.current = null;
    };
  }, [update, timeStore]);

  useEffect(() => {
    saveRef.current();
  }, [st.currentId, st.ctx, st.manual, st.shuffle, st.repeat, st.volume]);

  // A smooth clock while playing; the slow interval also saves and prefetches when the tab is hidden.
  const active = st.status === 'playing';
  useEffect(() => {
    if (!active) return;
    let raf;
    let last = 0;
    const tick = (now) => {
      if (now - last >= THROTTLE_MS) {
        last = now;
        actions.current.publishTime();
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    const iv = setInterval(() => {
      saveRef.current();
      actions.current.publishTime();
      const { t, d } = timeStore.get();
      if (!d || t / d < 0.8) return;
      const s = stRef.current;
      const nextId = s.manual[0]?.id ?? s.ctx.order[s.ctx.index + 1] ?? (s.repeat === 'all' ? s.ctx.base[0] : null);
      if (nextId && prefetched.current !== nextId) {
        prefetched.current = nextId;
        fetch(TRACK_MAP[nextId].src, { headers: { Range: PREFETCH_BYTES } }).catch(() => {});
      }
    }, 1000);
    return () => {
      cancelAnimationFrame(raf);
      clearInterval(iv);
    };
  }, [active, timeStore]);

  // ---------- Media Session ----------
  useEffect(() => {
    if (!('mediaSession' in navigator)) return;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: TRACK_MAP[st.currentId].title,
      artist: 'Asuka Jetto',
      album: CURATED_PLAYLIST.name,
      artwork: [{ src: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' }],
    });
  }, [st.currentId]);

  useEffect(() => {
    if (!('mediaSession' in navigator)) return;
    const ms = navigator.mediaSession;
    const set = (name, fn) => {
      try {
        ms.setActionHandler(name, fn);
      } catch {}
    };
    set('play', () => audioRef.current?.paused && actions.current.toggle());
    set('pause', () => audioRef.current?.pause());
    set('previoustrack', () => actions.current.prev());
    set('nexttrack', () => actions.current.next());
    set('seekto', (d) => d.seekTime != null && actions.current.seek(d.seekTime));
    return () => ['play', 'pause', 'previoustrack', 'nexttrack', 'seekto'].forEach((n) => set(n, null));
  }, []);

  useEffect(() => {
    if (!('mediaSession' in navigator)) return;
    navigator.mediaSession.playbackState = st.status === 'playing' || st.status === 'loading' ? 'playing' : 'paused';
  }, [st.status]);

  useEffect(() => {
    if (!('mediaSession' in navigator) || !navigator.mediaSession.setPositionState) return;
    const id = setInterval(() => {
      const { t, d } = timeStore.get();
      if (!d) return;
      try {
        navigator.mediaSession.setPositionState({ duration: d, position: Math.min(t, d), playbackRate: 1 });
      } catch {}
    }, 2000);
    return () => clearInterval(id);
  }, [timeStore]);

  // ---------- context value ----------
  const upcoming = st.ctx.order.slice(st.ctx.index + 1);
  const value = {
    ...st,
    current: TRACK_MAP[st.currentId],
    index: TRACKS.findIndex((x) => x.id === st.currentId),
    isPlaying: st.status === 'playing' || st.status === 'loading',
    upcoming,
    queueCount: st.manual.length + upcoming.length,
    timeStore,
    playlists,
    ui,
    play: playFrom,
    playNow,
    playNext,
    addToQueue,
    clearManual,
    removeManual,
    moveManual,
    moveContext,
    toggle,
    next,
    prev,
    seek,
    setVolume,
    toggleShuffle,
    cycleRepeat,
    retry,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
