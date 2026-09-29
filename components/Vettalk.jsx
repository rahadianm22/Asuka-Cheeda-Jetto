'use client';

import { useRef, useState } from 'react';
import { VETTALKS, STREAMS_URL, thumb, thumbFallback, watchUrl, embedUrl, formatDate } from '@/lib/data';
import { useLang } from './LanguageProvider';
import Reveal from './Reveal';
import SectionHead from './SectionHead';

const smallThumb = (id) => `https://img.youtube.com/vi/${id}/mqdefault.jpg`;

export default function Vettalk({ episodes: list = VETTALKS }) {
  const { t, tf, lang } = useLang();
  const episodes = [...list].sort((a, b) => b.date.localeCompare(a.date));
  const total = episodes.length;
  const [selected, setSelected] = useState(0);
  const [playing, setPlaying] = useState(false);
  const mainRef = useRef(null);

  if (!total) return null;

  // Episode numbers follow air order: the first VETTALK is EP-01.
  const epNo = (i) => `EP-${String(total - i).padStart(2, '0')}`;
  const current = episodes[selected];

  const pick = (i) => {
    setSelected(i);
    setPlaying(false);
    // On one-column layouts the player sits above the list, so bring it back into view.
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    mainRef.current?.scrollIntoView({ block: 'nearest', behavior: reduce ? 'auto' : 'smooth' });
  };

  return (
    <section className="vettalk" id="vettalk">
      <SectionHead no="05" title="VETTALK" sub={t('vettalkSub')} />

      <Reveal className="vt-layout" y={40}>
        <div className="vt-main" ref={mainRef}>
          <div className="vt-rail">
            <span className="vt-rail-ep">{epNo(selected)}</span>
            <span>{t('vettalkLive')}</span>
          </div>

          <div className="plate vt-plate">
            {playing ? (
              <iframe
                key={current.yt}
                src={embedUrl(current.yt)}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
                allowFullScreen
                title={`${t('ytPlayerTitle')}: ${current.topic}`}
              />
            ) : (
              <>
                <img
                  key={current.yt}
                  src={thumb(current.yt)}
                  alt=""
                  onError={(e) => {
                    const fallback = thumbFallback(current.yt);
                    if (e.currentTarget.src !== fallback) e.currentTarget.src = fallback;
                  }}
                />
                <button
                  type="button"
                  className="play"
                  aria-label={`${t('vettalkPlay')}: ${current.topic}`}
                  onClick={() => setPlaying(true)}
                />
                <span className="dur">{current.duration}</span>
              </>
            )}
          </div>

          <div className="vt-info">
            <h3 className="vt-title">{current.topic}</h3>
            <p className="vt-meta">
              {formatDate(current.date, lang)} · {current.duration}
            </p>
            <a className="vt-watch tactile" href={watchUrl(current.yt)} target="_blank" rel="noopener noreferrer">
              {t('vettalkWatch')}
            </a>
          </div>
        </div>

        <div className="vt-side">
          <div className="vt-side-head">
            <span>{tf('vettalkCount', { n: total })}</span>
            <a href={STREAMS_URL} target="_blank" rel="noopener noreferrer">
              {t('vettalkAll')}
            </a>
          </div>
          <ol className="vt-list">
            {episodes.map((ep, i) => (
              <li key={ep.yt}>
                <button
                  type="button"
                  className="vt-row"
                  aria-current={i === selected ? 'true' : undefined}
                  onClick={() => pick(i)}
                >
                  <span className="vt-ep">{epNo(i)}</span>
                  <img className="vt-thumb" src={smallThumb(ep.yt)} alt="" loading="lazy" />
                  <span className="vt-row-text">
                    <span className="vt-row-title">{ep.topic}</span>
                    <span className="vt-row-meta">
                      {formatDate(ep.date, lang)} · {ep.duration}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </div>
      </Reveal>
    </section>
  );
}
