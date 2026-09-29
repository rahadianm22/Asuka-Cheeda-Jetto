import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';

export const alt = 'Website Asuka Jetto: Asuka Cheeda Jetto, dokter hewan virtual';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const PAW = (
  <svg width="44" height="44" viewBox="0 0 100 100">
    <g fill="#c1a1cf" transform="rotate(28 50 50)">
      <ellipse cx="30" cy="42" rx="9" ry="12" transform="rotate(-18 30 42)" />
      <ellipse cx="70" cy="42" rx="9" ry="12" transform="rotate(18 70 42)" />
      <ellipse cx="42" cy="26" rx="8" ry="11" transform="rotate(-8 42 26)" />
      <ellipse cx="58" cy="26" rx="8" ry="11" transform="rotate(8 58 26)" />
      <path d="M50 52c10 0 18 8 18 17 0 7-6 11-18 11s-18-4-18-11c0-9 8-17 18-17z" />
    </g>
  </svg>
);

export default async function Image() {
  const [hero, bold, heavy] = await Promise.all([
    readFile(join(process.cwd(), 'public', 'hero.jpg')),
    readFile(join(process.cwd(), 'app', 'fonts', 'archivo-700.woff')),
    readFile(join(process.cwd(), 'app', 'fonts', 'archivo-800.woff')),
  ]);
  const heroSrc = `data:image/jpeg;base64,${hero.toString('base64')}`;

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex', width: '100%', height: '100%', position: 'relative',
          background: '#0c0812', fontFamily: 'Archivo',
        }}
      >
        <img
          src={heroSrc}
          width={1200}
          height={825}
          style={{ position: 'absolute', left: 0, top: -120, width: 1200, height: 825, objectFit: 'cover' }}
        />
        <div
          style={{
            position: 'absolute', left: 0, top: 0, width: 1200, height: 630, display: 'flex',
            backgroundImage: 'linear-gradient(90deg, rgba(12,8,18,0.94) 0%, rgba(12,8,18,0.7) 45%, rgba(12,8,18,0) 78%)',
          }}
        />
        <div
          style={{
            position: 'absolute', left: 0, bottom: 0, width: 1200, height: 260, display: 'flex',
            backgroundImage: 'linear-gradient(0deg, rgba(12,8,18,0.92), rgba(12,8,18,0))',
          }}
        />
        <div
          style={{
            position: 'absolute', left: 72, top: 0, bottom: 0,
            display: 'flex', flexDirection: 'column', justifyContent: 'center', color: '#ede6ec',
          }}
        >
          <div style={{ display: 'flex', fontSize: 30, fontWeight: 700, letterSpacing: 4, color: '#dcc4e6' }}>
            ASUKA CHEEDA
          </div>
          <div style={{ display: 'flex', fontSize: 150, fontWeight: 800, lineHeight: 1, letterSpacing: -4 }}>JETTO</div>
          <div style={{ display: 'flex', marginTop: 18, fontSize: 32, color: '#d8cede', maxWidth: 560 }}>
            Dokter hewan virtual favoritmu. Woof woof~
          </div>
        </div>
        <div
          style={{
            position: 'absolute', left: 72, bottom: 48, display: 'flex', alignItems: 'center', gap: 14,
            fontSize: 26, fontWeight: 700, letterSpacing: 3, color: '#dcc4e6',
          }}
        >
          {PAW}
          WEBSITE ASUKA JETTO
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: 'Archivo', data: bold, weight: 700, style: 'normal' },
        { name: 'Archivo', data: heavy, weight: 800, style: 'normal' },
      ],
    },
  );
}
