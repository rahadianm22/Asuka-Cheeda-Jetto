'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { TRACK_MAP } from '@/lib/karaoke';

export const PLAYLIST_KEY = 'jk:playlists:v1';
export const MAX_PLAYLISTS = 20;
export const MAX_NAME = 50;
export const PLAYLIST_COLORS = ['#c1a1cf', '#7be0b4', '#e8b04b'];

const cleanName = (s) => String(s || '').trim().replace(/\s+/g, ' ').slice(0, MAX_NAME);
const uid = () => (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`);

function read() {
  try {
    const raw = JSON.parse(localStorage.getItem(PLAYLIST_KEY) || '[]');
    if (!Array.isArray(raw)) return [];
    return raw
      .filter((p) => p && typeof p.id === 'string' && typeof p.name === 'string')
      .map((p) => ({ ...p, trackIds: (p.trackIds || []).filter((id) => TRACK_MAP[id]) }));
  } catch {
    return [];
  }
}

// Guest playlists: they live in this browser only. The returned actions are the seam a signed-in
// (server-backed) version would replace; every caller goes through them.
export default function usePlaylists() {
  const [lists, setLists] = useState([]);
  const ref = useRef([]);

  useEffect(() => {
    ref.current = read();
    setLists(ref.current);
    const onStorage = (e) => {
      if (e.key !== PLAYLIST_KEY) return;
      ref.current = read();
      setLists(ref.current);
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const commit = useCallback((next) => {
    ref.current = next;
    setLists(next);
    try {
      localStorage.setItem(PLAYLIST_KEY, JSON.stringify(next));
    } catch {}
  }, []);

  const create = useCallback(
    (name, trackId) => {
      const n = cleanName(name);
      const cur = ref.current;
      if (!n || cur.length >= MAX_PLAYLISTS) return null;
      const now = Date.now();
      const p = {
        id: uid(),
        name: n,
        color: PLAYLIST_COLORS[cur.length % PLAYLIST_COLORS.length],
        trackIds: trackId && TRACK_MAP[trackId] ? [trackId] : [],
        createdAt: now,
        updatedAt: now,
      };
      commit([...cur, p]);
      return p;
    },
    [commit],
  );

  const rename = useCallback(
    (id, name) => {
      const n = cleanName(name);
      if (!n) return;
      commit(ref.current.map((p) => (p.id === id ? { ...p, name: n, updatedAt: Date.now() } : p)));
    },
    [commit],
  );

  const remove = useCallback((id) => commit(ref.current.filter((p) => p.id !== id)), [commit]);

  const restore = useCallback(
    (playlist, index) => {
      if (ref.current.some((p) => p.id === playlist.id)) return;
      const next = [...ref.current];
      next.splice(Math.min(index, next.length), 0, playlist);
      commit(next);
    },
    [commit],
  );

  const addTrack = useCallback(
    (id, trackId) => {
      if (!TRACK_MAP[trackId]) return;
      commit(
        ref.current.map((p) =>
          p.id === id && !p.trackIds.includes(trackId)
            ? { ...p, trackIds: [...p.trackIds, trackId], updatedAt: Date.now() }
            : p,
        ),
      );
    },
    [commit],
  );

  const removeTrack = useCallback(
    (id, trackId) =>
      commit(
        ref.current.map((p) =>
          p.id === id ? { ...p, trackIds: p.trackIds.filter((t) => t !== trackId), updatedAt: Date.now() } : p,
        ),
      ),
    [commit],
  );

  const savedCount = useCallback((trackId) => ref.current.filter((p) => p.trackIds.includes(trackId)).length, []);

  return { lists, create, rename, remove, restore, addTrack, removeTrack, savedCount };
}
