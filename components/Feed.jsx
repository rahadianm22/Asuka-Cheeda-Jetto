'use client';

import { COVERS } from '@/lib/data';
import { useLang } from './LanguageProvider';
import Reveal from './Reveal';
import VideoCard from './VideoCard';

export default function Feed() {
  const { t } = useLang();

  // Serial numbers follow upload order, oldest first — JT-0001 is the
  // very first cover, regardless of which order the feed displays them in.
  const byOldest = [...COVERS].sort((a, b) => a.releaseDate.localeCompare(b.releaseDate));
  const serialById = {};
  byOldest.forEach((v, i) => { serialById[v.id] = i + 1; });

  const videos = [...COVERS].sort((a, b) => b.releaseDate.localeCompare(a.releaseDate));

  return (
    <>
      <div className="chipbar" id="feed">
        <Reveal className="chipbar-head">
          <h2>{t('feedTitle')}</h2>
        </Reveal>
      </div>

      <main className="feed">
        {videos.length ? (
          videos.map((v, i) => (
            <VideoCard key={v.id} video={{ ...v, serialNumber: serialById[v.id] }} index={i} />
          ))
        ) : (
          <div className="empty">
            <h4>{t('emptyFeed')}</h4>
          </div>
        )}
      </main>
    </>
  );
}