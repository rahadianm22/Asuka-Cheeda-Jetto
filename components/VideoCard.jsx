'use client';

import { useState } from 'react';
import { thumb, thumbFallback, watchUrl, embedUrl, formatDate } from '@/lib/data';
import { useLang } from './LanguageProvider';

export default function VideoCard({ video, featured = false }) {
  const { t, lang } = useLang();
  const [playing, setPlaying] = useState(false);
  const serial = `JT-${String(video.serialNumber).padStart(4, '0')}`;

  return (
    <article className={`card${featured ? ' featured' : ''}`}>
      <div className="rail">
        <span className="src">{featured ? t('latestTag') : 'youtube'}</span>
        <span>{serial}</span>
      </div>

      <div className="plate">
        {playing ? (
          <iframe
            src={embedUrl(video.yt)}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
            allowFullScreen
            title={`${t('ytPlayerTitle')}: ${video.title}`}
          />
        ) : (
          <>
            {/* Plain <img>: YouTube thumbnails need no API key and no loader. */}
            <img
              src={thumb(video.yt)}
              alt=""
              loading={featured ? 'eager' : 'lazy'}
              onError={(e) => {
                const fallback = thumbFallback(video.yt);
                if (e.currentTarget.src !== fallback) e.currentTarget.src = fallback;
              }}
            />
            <button
              type="button"
              className="play"
              aria-label={`${t('playAria')}: ${video.title}`}
              onClick={() => setPlaying(true)}
            />
            <span className="dur">{video.duration}</span>
          </>
        )}
      </div>

      <div className="body">
        <h3 className="card-title">
          <a
            className="card-link"
            href={watchUrl(video.yt)}
            target="_blank"
            rel="noopener noreferrer"
          >
            {video.title}
          </a>
        </h3>
        {featured && <span className="card-serial-big" aria-hidden="true">{serial}</span>}
        <div className="meta">
          <span className="tagpill">{t('coverTag')}</span>
          <span>{formatDate(video.releaseDate, lang)}</span>
        </div>
      </div>
    </article>
  );
}
