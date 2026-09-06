const CHANNEL_HANDLE = 'asukajetto';

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

// Public channel statistics only — no OAuth, no channel-owner access needed.
export async function getLiveChannelStats() {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) return null;

  try {
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=statistics&forHandle=${CHANNEL_HANDLE}&key=${key}`,
      { next: { revalidate: 21600 } },
    );
    if (!res.ok) return null;

    const data = await res.json();
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
