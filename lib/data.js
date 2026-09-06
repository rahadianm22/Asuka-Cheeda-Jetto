// Cover songs — YouTube IDs are real, thumbnails are pulled straight from
// img.youtube.com so no API key is needed.
export const COVERS = [
  {
    id: 'sg_01',
    yt: 'az-5QgmrOug',
    title: '【COVER】Perawan atau Janda - Cita Citata【Jetto x Rimu】',
    duration: '3:46',
    author: 'jetto and Pinku Rimu',
    releaseDate: '2026-07-30',
  },
  {
    id: 'sg_02',
    yt: 'jTWoIcFcsvY',
    title: '【COVER】LATHI - Weird Genius ft. Sara Fajira (Rap Arrange + Minang Inst.)',
    duration: '3:06',
    author: '@asukajetto',
    releaseDate: '2026-08-20',
  },
  {
    id: 'sg_03',
    yt: 'htiguBiGQ9s',
    title: 'Semua Aku Dirayakan - Nadin Amizah, cover oleh Jetto',
    duration: '5:11',
    author: '@asukajetto',
    releaseDate: '2026-06-29',
  },
  {
    id: 'sg_04',
    yt: 'Nv_X7gI_Qpo',
    title: '【COVER】Apa Mungkin - Bernadya (Pop Punk Version)',
    duration: '3:46',
    author: '@asukajetto',
    releaseDate: '2026-02-27',
  },
  {
    id: 'sg_05',
    yt: 'TMDC_y3akes',
    title: '【COVER】KING - Kanaria | Rap Arrange',
    duration: '2:17',
    author: '@asukajetto',
    releaseDate: '2025-12-29',
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

export const SOCIALS = [
  { name: 'YouTube', href: 'https://www.youtube.com/@asukajetto/videos', key: 'rlYoutube' },
  { name: 'Instagram', href: 'https://www.instagram.com/asukajetto/', key: 'rlInstagram' },
  { name: 'X', href: 'https://x.com/asukajetto', key: 'rlX' },
  { name: 'TikTok', href: 'https://www.tiktok.com/@asukajetto', key: 'rlTiktok' },
  { name: 'Facebook', href: 'https://www.facebook.com/profile.php?id=61563759818590', key: 'rlFacebook' },
  { name: 'Carrd', href: 'https://asukajetto.carrd.co/', key: 'rlCarrd' },
  { name: 'Twitch', href: 'https://www.twitch.tv/asukajetto', key: 'rlTwitch' },
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
