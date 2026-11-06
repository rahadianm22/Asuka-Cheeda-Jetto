'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useLang } from '../LanguageProvider';
import photos from '@/lib/gallery-photos.json';

// Masonry of Jetto's photos from CF23: 5 columns on wide screens, 2 on phones. Each photo keeps its own shape, so
// heights vary. The list is in reading order (older upload first, newer one after it) and every photo goes into the
// currently shortest column, so the first photos stay at the top and the later ones fill in below them.
// Clicking a photo opens it large in the middle of the page; clicking outside it, the close button or Esc closes it.
// To add a photo: put it in /public/gallery and add { src, w, h } at the end of lib/gallery-photos.json.
const LAYOUTS = [5, 2];
// On phones the first photo is shown on its own, full width, above the two columns.
const FEATURED = 1;

function deal(count, skip) {
  const cols = Array.from({ length: count }, () => ({ h: 0, items: [] }));
  photos.forEach((p, i) => {
    if (i < skip) return;
    const col = cols.reduce((a, b) => (a.h <= b.h ? a : b));
    col.items.push({ p, i });
    col.h += p.h / p.w;
  });
  return cols;
}
const COLUMNS = { 5: deal(5, 0), 2: deal(2, FEATURED) };

function Tile({ p, i, onOpen }) {
  const { tf } = useLang();
  return (
    <li className="gcf-tile">
      {/* A real button: keyboard users get the same zoom on focus and can open it with Enter or Space. */}
      <button type="button" className="gcf-btn" aria-label={tf('galPhoto', { n: i + 1 })} onClick={(e) => onOpen(e.currentTarget, i)}>
        <img src={p.src} alt="" width={p.w} height={p.h} loading="lazy" decoding="async" />
      </button>
    </li>
  );
}

export default function GalleryGrid() {
  const { t, tf } = useLang();
  const [open, setOpen] = useState(null); // index of the photo shown large, or null
  const opener = useRef(null); // the tile that opened the viewer, so focus can go back to it

  const close = useCallback(() => {
    setOpen(null);
    opener.current?.focus();
  }, []);

  useEffect(() => {
    if (open === null) return;
    const onKey = (e) => e.key === 'Escape' && close();
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden'; // the page behind should not scroll
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, close]);

  const openPhoto = (el, i) => {
    opener.current = el;
    setOpen(i);
  };

  const shown = open === null ? null : photos[open];

  return (
    <>
      {/* Both layouts are in the page; CSS shows one. Hidden lazy images are not downloaded. */}
      {LAYOUTS.map((n) => (
        <div key={n} className={`gcf-layout gcf-layout-${n}`}>
          {n === 2 && (
            <ul className="gcf-feature">
              {photos.slice(0, FEATURED).map((p, i) => (
                <Tile key={p.src} p={p} i={i} onOpen={openPhoto} />
              ))}
            </ul>
          )}
          <div className="gcf-cols">
            {COLUMNS[n].map((col, c) => (
              <ul key={c} className="gcf-col">
                {col.items.map(({ p, i }) => (
                  <Tile key={p.src} p={p} i={i} onOpen={openPhoto} />
                ))}
              </ul>
            ))}
          </div>
        </div>
      ))}

      {shown && (
        <div className="gcf-lightbox" role="dialog" aria-modal="true" aria-label={tf('galPhoto', { n: open + 1 })} onClick={close}>
          <button type="button" className="gcf-close" aria-label={t('galClose')} autoFocus onClick={close}>
            ×
          </button>
          {/* Clicks on the picture itself do nothing; only the dark area around it closes the viewer. */}
          <img src={shown.src} alt="" width={shown.w} height={shown.h} onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </>
  );
}
