import PEAKS from './karaoke-peaks.json';

// Where the MP3s live: a Vercel Blob public URL in production, public/audio/karaoke/ for local work.
// Each file is named after its track id (sesi-potret.mp3, ...).
const BASE = (process.env.NEXT_PUBLIC_KARAOKE_BASE_URL || '/audio/karaoke').replace(/\/$/, '');

export const KARAOKE_CHANNEL_URL = 'https://www.youtube.com/@JettoKaraokeClipsUnofficial';
export const CURATED_PLAYLIST = { id: 'viral', name: 'Viral Karaoke Moments' };

// `duration` is the fallback until the audio reports its own. `peaks` and the real duration come from
// scripts/prepare-karaoke.mjs (lib/karaoke-peaks.json). TODO: fill each youtubeUrl with the clip link.
const RAW = [
  { id: 'sesi-potret', title: 'Sesi Potret', originalArtist: 'Eñau feat. Ari Lesmana', duration: 237 },
  { id: 'remaja', title: 'Remaja', originalArtist: 'HIVI!', duration: 213 },
  { id: 'nina', title: 'Nina', originalArtist: '.Feast', duration: 277 },
  { id: 'kembali-pulang', title: 'Kembali Pulang', originalArtist: 'Suara Kayu feat. Feby Putri', duration: 205 },
  { id: 'iqro', title: 'IQRO', originalArtist: 'Raim Laode', duration: 230 },
  { id: 'hati-hati-di-jalan', title: 'Hati-Hati di Jalan', originalArtist: 'Tulus', duration: 241 },
  { id: 'ratok-pasaman', title: 'Ratok Pasaman', originalArtist: 'Beniqno', duration: 352 },
  { id: 'berpisah-itu-mudah', title: 'Berpisah Itu Mudah', originalArtist: 'Rizky Febian ft. Mikha Tambayong', duration: 243 },
  // TODO: confirm the original artist / version of this one
  { id: 'ayam-den-lapeh', title: 'Ayam Den Lapeh', originalArtist: 'Lagu daerah Minang', duration: 201 },
];

export const TRACKS = RAW.map((x) => ({
  ...x,
  src: `${BASE}/${x.id}.mp3`,
  youtubeUrl: undefined, // TODO
  ...(PEAKS[x.id] || {}),
}));

export const TRACK_MAP = Object.fromEntries(TRACKS.map((x) => [x.id, x]));
export const TRACK_IDS = TRACKS.map((x) => x.id);
export const TOTAL_MINUTES = Math.round(TRACKS.reduce((n, x) => n + x.duration, 0) / 60);

export const youtubeHref = (track) => track.youtubeUrl || KARAOKE_CHANNEL_URL;

export function fmt(sec) {
  const s = Math.max(0, Math.floor(sec || 0));
  const r = s % 60;
  return `${Math.floor(s / 60)}:${r < 10 ? '0' : ''}${r}`;
}

export const pad2 = (n) => (n < 10 ? '0' : '') + n;

// Real peaks when the prepare script has run; otherwise a stable pseudo-waveform per track so the
// player never shows an empty bar.
export function getPeaks(track, count) {
  let src = track.peaks;
  if (!src?.length) {
    let h = 0;
    for (const ch of track.id) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
    const ph = (h % 100) / 10;
    src = Array.from({ length: 120 }, (_, i) =>
      Math.min(1, 0.18 + Math.abs(Math.sin(i * 0.61 + ph) * 0.6 + Math.sin(i * 0.23 + ph * 0.5) * 0.4) * 0.8),
    );
  }
  return Array.from({ length: count }, (_, i) => src[Math.min(src.length - 1, Math.floor((i / count) * src.length))]);
}
