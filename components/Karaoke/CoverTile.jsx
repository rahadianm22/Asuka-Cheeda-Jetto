import { TRACKS } from '@/lib/karaoke';
import { PawIcon } from './Icons';

// The typographic cover: no images, just the paper tile, the title and a stamp. Everything scales from
// `size` through --s so one component covers 44px up to 342px.
export default function CoverTile({ track, size = 240 }) {
  const no = String(TRACKS.findIndex((x) => x.id === track.id) + 1).padStart(2, '0');
  const tier = size >= 160 ? 'lg' : size >= 80 ? 'md' : 'sm';
  return (
    <div className={`kk-cover kk-cover-${tier}`} style={{ '--s': `${size}px`, width: size, height: size }} aria-hidden="true">
      {tier !== 'sm' && (
        <div className="kk-cover-top">
          {tier === 'lg' && <span>KARAOKE CLIP</span>}
          <span>No. {no}</span>
        </div>
      )}
      <div className="kk-cover-title">{track.title}</div>
      {tier === 'lg' && (
        <div className="kk-cover-foot">
          <span>
            ASUKA JETTO
            <br />
            vers. stream
          </span>
          <PawIcon size={Math.round(size * 0.17)} />
        </div>
      )}
      {tier === 'lg' && <div className="kk-cover-stamp">WOOF~</div>}
    </div>
  );
}
