'use client';

import { COVERS } from '@/lib/data';
import { useLang } from './LanguageProvider';
import Reveal from './Reveal';
import SectionHead from './SectionHead';
import VideoCard from './VideoCard';

export default function Feed({ covers = COVERS }) {
  const { t } = useLang();

  // Serial numbers follow upload order, oldest first: JT-0001 is the
  // very first cover, regardless of which order the feed displays them in.
  const byOldest = [...covers].sort((a, b) => a.releaseDate.localeCompare(b.releaseDate));
  const serialById = {};
  byOldest.forEach((v, i) => { serialById[v.id] = i + 1; });

  const videos = [...covers].sort((a, b) => b.releaseDate.localeCompare(a.releaseDate));

  return (
    <section id="feed" className="feed-section">
      <SectionHead no="04" title={t('feedTitle')} sub={t('feedSub')} />

      <Reveal className="feed" y={40}>
        {videos.length ? (
          videos.map((v, i) => (
            <VideoCard
              key={v.id}
              video={{ ...v, serialNumber: serialById[v.id] }}
              featured={i === 0}
            />
          ))
        ) : (
          <div className="empty">
            <h3>{t('emptyFeed')}</h3>
          </div>
        )}
      </Reveal>
    </section>
  );
}
