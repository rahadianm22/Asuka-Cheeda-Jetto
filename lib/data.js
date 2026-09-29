// Fallback cover list, used when the YouTube API is unavailable. With a key set,
// lib/youtube.js reads every 【COVER】 upload straight from the channel instead.
export const COVERS = [
  {
    id: 'sg_01',
    yt: 'az-5QgmrOug',
    title: '【COVER】Perawan atau Janda - Cita Citata【Jetto x Rimu】',
    duration: '3:46',
    author: 'jetto and Pinku Rimu',
    releaseDate: '2026-07-16',
  },
  {
    id: 'sg_02',
    yt: 'jTWoIcFcsvY',
    title: '【COVER】LATHI - Weird Genius ft. Sara Fajira (Rap Arrange + Minang Inst.)',
    duration: '3:06',
    author: '@asukajetto',
    releaseDate: '2026-08-19',
  },
  {
    id: 'sg_03',
    yt: 'htiguBiGQ9s',
    title: 'Semua Aku Dirayakan - Nadin Amizah, cover oleh Jetto',
    duration: '5:11',
    author: '@asukajetto',
    releaseDate: '2026-06-06',
  },
  {
    id: 'sg_04',
    yt: 'Nv_X7gI_Qpo',
    title: '【COVER】Apa Mungkin - Bernadya (Pop Punk Version)',
    duration: '3:46',
    author: '@asukajetto',
    releaseDate: '2026-02-15',
  },
  {
    id: 'sg_05',
    yt: 'TMDC_y3akes',
    title: '【COVER】KING - Kanaria | Rap Arrange',
    duration: '2:17',
    author: '@asukajetto',
    releaseDate: '2025-12-26',
  },
  {
    id: 'sg_06',
    yt: 'R3xPveDapNU',
    title: '【COVER】Identity/アイデンティティ - Kanaria【Jetto x Boris】#UtaindoRelay #MBNUtaindoRelay',
    duration: '2:34',
    author: 'jetto and Boroboris',
    releaseDate: '2026-08-29',
  },
];

// Fallback VETTALK list (taken from the channel on 2026-09-29), used when the API is unavailable.
// With the API on, these topics still override the auto-cleaned titles, so acronyms like FIP stay intact.
export const VETTALKS = [
  { yt: '_FO1ZUXWNHU', topic: 'Helminthiasis: kucing buncit emangnya cacingan?', duration: '1:08:47', date: '2026-09-13' },
  { yt: 'uSjHheExKiE', topic: 'Kenalan dengan penyakit FIP pada kucing', duration: '1:44:50', date: '2026-08-21' },
  { yt: 'zl3Hg7ZJW4g', topic: 'Dok, tolong! Temanku rabies!', duration: '1:31:55', date: '2026-08-08' },
  { yt: 'F22CXQCgDhc', topic: 'Kenali tanda umum ketika anabul sakit', duration: '1:18:23', date: '2026-06-26' },
  { yt: 'yllLfFhxe5s', topic: 'Spesial Idul Adha: memastikan daging qurban itu ASUH', duration: '1:16:32', date: '2026-05-20' },
  { yt: 'zuSP3i6twf8', topic: 'Dok, kenapa ya kucingku sakit di musim hujan?', duration: '1:20:41', date: '2026-04-10' },
  { yt: 'To4ze211jQ4', topic: 'Ngobrolin mudik dan anabul', duration: '1:41:34', date: '2026-03-18' },
  { yt: 'B097EwHfEF4', topic: 'Dok, kucingku kawin mulu!', duration: '1:49:01', date: '2026-02-27' },
  { yt: 'fiuC-WEtgiw', topic: 'Pengaruh musim pancaroba dengan kesehatan anabul', duration: '1:48:14', date: '2026-01-20' },
  { yt: '6iqnqrkVyxc', topic: 'Absen dulu yang mau vaksin gratis langsung kena hati', duration: '1:06:16', date: '2025-12-20' },
];

export const STREAMS_URL = 'https://www.youtube.com/@asukajetto/streams';

export const SOCIALS = [
  { name: 'YouTube', href: 'https://www.youtube.com/@asukajetto', key: 'rlYoutube' },
  { name: 'Instagram', href: 'https://www.instagram.com/asukajetto/', key: 'rlInstagram' },
  { name: 'X', href: 'https://x.com/asukajetto', key: 'rlX' },
  { name: 'TikTok', href: 'https://www.tiktok.com/@asukajetto', key: 'rlTiktok' },
  { name: 'Facebook', href: 'https://www.facebook.com/profile.php?id=61563759818590', key: 'rlFacebook' },
  { name: 'Carrd', href: 'https://asukajetto.carrd.co/', key: 'rlCarrd' },
  { name: 'Twitch', href: 'https://www.twitch.tv/asukajetto', key: 'rlTwitch' },
  { name: 'Discord', href: 'https://discord.com/invite/zc4MkEaB9e', key: 'rlDiscord' },
];

export const SUPPORTS = [
  {
    name: 'Trakteer',
    href: 'https://trakteer.id/asukajetto',
    key: 'rlTrakteer',
    logo: '/logo-trakteer.png',
    mark: '/trakteer-mark.png',
  },
  {
    name: 'Saweria',
    href: 'https://saweria.co/asukajetto',
    key: 'rlSaweria',
    logo: '/logo-saweria.png',
    mark: '/saweria-mark.ico',
  },
];

export const YOUTUBE_CHANNEL = {
  name: 'Asuka Jetto',
  handle: '@asukajetto',
  href: 'https://www.youtube.com/@asukajetto',
  avatar: '/jettoyoutube.png',
};

export const CHANNEL_STATS = [
  { key: 'subs', value: '18,4K', labelKey: 'ytStatSubs', noteKey: 'ytStatSubsNote', icon: 'subs' },
  { key: 'views', value: '998K', labelKey: 'ytStatViews', noteKey: 'ytStatViewsNote', icon: 'views' },
  { key: 'contents', value: '224', labelKey: 'ytStatContents', noteKey: 'ytStatContentsNote', icon: 'contents' },
];

export const PROFILE_ROWS = [
  { labelKey: 'rowNickname', value: 'Asuka · Cheeda · Budawg · Jetto · Tejo' },
  { labelKey: 'rowSpecies', valueKey: 'valSpecies' },
  { labelKey: 'rowNationality', value: 'Eldergarian' },
  { labelKey: 'rowWeight', value: '42 kg · 165 cm' },
  { labelKey: 'rowBlood', valueKey: 'valBlood' },
  { labelKey: 'rowAlter', valueKey: 'valAlter' },
  { labelKey: 'rowAssistant', value: 'Cipet' },
  { labelKey: 'rowFamName', value: 'Suaka' },
];

export const LIKES = ['pUp1', 'pUp2', 'pUp3', 'pUp4', 'pUp5', 'pUp6', 'pUp7'];
export const DISLIKES = [
  'pDown1', 'pDown2', 'pDown3', 'pDown4', 'pDown5',
  'pDown6', 'pDown7', 'pDown8', 'pDown9',
];

export const thumb = (id) => `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;
// Not every upload has a maxres thumbnail; hqdefault always exists.
export const thumbFallback = (id) => `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
export const watchUrl = (id) => `https://www.youtube.com/watch?v=${id}`;
export const embedUrl = (id) =>
  `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`;

const MONTHS = {
  id: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'],
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
};

// Renders '20 Agu 2026' (id) / 'Aug 20, 2026' (en) from an ISO date string.
export function formatDate(iso, lang = 'id') {
  const [y, m, d] = iso.split('-').map(Number);
  const month = (MONTHS[lang] || MONTHS.id)[m - 1];
  return lang === 'en' ? `${month} ${d}, ${y}` : `${d} ${month} ${y}`;
}
