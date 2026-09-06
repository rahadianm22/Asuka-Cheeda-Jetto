'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { thumb, watchUrl, embedUrl, formatDate } from '@/lib/data';
import { useLang } from './LanguageProvider';

function serial(id) {
  let s = 0;
  for (const c of id) s = (s * 31 + c.charCodeAt(0)) % 9000;
  return `EG-${s + 1000}`;
}

export default function VideoCard({ video, index }) {
  const { t, lang } = useLang();
  const [playing, setPlaying] = useState(false);

  return (
    <motion.article
      className="card"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.07, 0.4), ease: [0.2, 0.7, 0.3, 1] }}
      whileHover={{ y: -4, borderColor: 'rgba(193,161,207,0.4)' }}
    >
      <a
        className="card-link"
        href={watchUrl(video.yt)}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${t('cardOpenIn')} YouTube: ${video.title}`}
      >
        <div className="rail">
          <span className="src">youtube</span>
          <span>{serial(video.id)}</span>
        </div>

        <div className="plate">
          {playing ? (
            <iframe
              src={embedUrl(video.yt)}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
              allowFullScreen
              title={t('ytPlayerTitle')}
            />
          ) : (
            <>
              {/* Plain <img>: YouTube thumbnails need no API key and no loader. */}
              <img src={thumb(video.yt)} alt="" loading="lazy" />
              <span className="glow" style={{ opacity: 0.35 }} />
              <motion.button
                className="play"
                aria-label={t('playAria')}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.94 }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setPlaying(true);
                }}
              />
              <span className="dur">{video.duration}</span>
            </>
          )}
        </div>

        <div className="body">
          <h4>{video.title}</h4>
          <div className="meta">
            <span className="tagpill">{t('coverTag')}</span>
            <span>{formatDate(video.releaseDate, lang)}</span>
          </div>
        </div>
      </a>
    </motion.article>
  );
}
