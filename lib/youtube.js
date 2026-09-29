import { VETTALKS } from './data';

const CHANNEL_HANDLE = 'asukajetto';
const API = 'https://www.googleapis.com/youtube/v3';
const CACHE = { next: { revalidate: 21600 } };

function formatCount(n) {
  if (n >= 1_000_000) {
    const v = n / 1_000_000;
    return `${v % 1 === 0 ? v.toFixed(0) : v.toFixed(1).replace('.', ',')}M`;
  }
  if (n >= 1_000) {
    const v = n / 1_000;
    return `${v % 1 === 0 ? v.toFixed(0) : v.toFixed(1).replace('.', ',')}K`;
  }
  return `${n}`;
}

async function api(path, key) {
  const res = await fetch(`${API}/${path}&key=${key}`, CACHE);
  if (!res.ok) throw new Error(`YouTube API ${res.status}`);
  return res.json();
}

// Public channel statistics only: no OAuth, no channel-owner access needed.
export async function getLiveChannelStats() {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) return null;

  try {
    const data = await api(`channels?part=statistics&forHandle=${CHANNEL_HANDLE}`, key);
    const stats = data.items?.[0]?.statistics;
    if (!stats) return null;

    return {
      subs: stats.hiddenSubscriberCount ? null : formatCount(Number(stats.subscriberCount)),
      views: formatCount(Number(stats.viewCount)),
      contents: formatCount(Number(stats.videoCount)),
    };
  } catch {
    return null;
  }
}

function formatDuration(iso) {
  const m = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/.exec(iso) || [];
  const [h, min, s] = [m[1], m[2], m[3]].map((x) => Number(x || 0));
  const ss = String(s).padStart(2, '0');
  return h ? `${h}:${String(min).padStart(2, '0')}:${ss}` : `${min}:${ss}`;
}

// Jetto streams on WIB, so a 23:00 WIB premiere belongs to that day, not the UTC one.
const wibDate = (iso) => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta' }).format(new Date(iso));

// Only titles that start with the 【COVER】 tag: shorts that merely mention #cover are not covers.
const COVER_TAG = /^【\s*COVER\s*】/i;
const VETTALK_TAG = /【\s*VETTALK\s*】/i;

function vettalkTopic(title) {
  const topic = title.replace(/【[^】]*】/g, '').replace(/\s+/g, ' ').trim();
  if (topic !== topic.toUpperCase()) return topic;
  const lower = topic.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

// Every upload on the channel, sorted into covers and VETTALK episodes.
// Returns null when the key is missing or the API fails, so callers fall back to lib/data.js.
export async function getChannelVideos() {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) return null;

  try {
    const ch = await api(`channels?part=contentDetails&forHandle=${CHANNEL_HANDLE}`, key);
    const uploads = ch.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
    if (!uploads) return null;

    const ids = [];
    let page = '';
    do {
      const r = await api(
        `playlistItems?part=contentDetails&maxResults=50&playlistId=${uploads}` +
          `&fields=nextPageToken,items(contentDetails(videoId))${page ? `&pageToken=${page}` : ''}`,
        key,
      );
      ids.push(...(r.items || []).map((i) => i.contentDetails.videoId));
      page = r.nextPageToken;
    } while (page);

    const videos = [];
    for (let i = 0; i < ids.length; i += 50) {
      const r = await api(
        `videos?part=snippet,contentDetails,liveStreamingDetails&id=${ids.slice(i, i + 50).join(',')}` +
          '&fields=items(id,snippet(title,publishedAt,liveBroadcastContent),contentDetails(duration),liveStreamingDetails(actualStartTime))',
        key,
      );
      videos.push(...(r.items || []));
    }

    // Hand-written topics (with their acronyms intact) win over the auto-cleaned title.
    const topicById = Object.fromEntries(VETTALKS.map((v) => [v.yt, v.topic]));
    const covers = [];
    const vettalks = [];

    for (const v of videos) {
      // Skip streams that are scheduled or still live: they have no final length yet.
      if (v.snippet.liveBroadcastContent !== 'none') continue;
      const title = v.snippet.title;
      const date = wibDate(v.liveStreamingDetails?.actualStartTime || v.snippet.publishedAt);
      const duration = formatDuration(v.contentDetails.duration);

      if (COVER_TAG.test(title)) {
        covers.push({ id: v.id, yt: v.id, title, duration, releaseDate: date });
      } else if (VETTALK_TAG.test(title)) {
        vettalks.push({ yt: v.id, topic: topicById[v.id] ?? vettalkTopic(title), duration, date });
      }
    }

    return { covers, vettalks };
  } catch {
    return null;
  }
}
