'use client';

import { COVERS } from '@/lib/data';
import { useLang } from './LanguageProvider';
import Reveal from './Reveal';
import VideoCard from './VideoCard';

export default function Feed() {
  const { t } = useLang();
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
          videos.map((v, i) => <VideoCard key={v.id} video={v} index={i} />)
        ) : (
          <div className="empty">
            <h4>{t('emptyFeed')}</h4>
          </div>
        )}
      </main>
    </>
  );
}
