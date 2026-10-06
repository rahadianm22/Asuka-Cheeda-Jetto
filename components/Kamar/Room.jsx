'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

const ROWS = [
  ['Monitor', 'Portrait kiri, landscape kanan'],
  ['Kursi', 'Gaming, ungu'],
  ['PC', 'Casing kaca, kipas RGB'],
  ['Audio', 'Headset putih + mic kondensor'],
  ['Lampu', 'LED strip + neon paw'],
  ['Dekor', 'Rak figur, awan, tanaman, poster'],
  ['Penghuni', '7 anak kucing + 3 boneka pup'],
];

export default function Room() {
  const stageRef = useRef(null);
  const bubbleRef = useRef(null);
  const lightboxRef = useRef(null);
  const lbImgRef = useRef(null);
  const waveRef = useRef(null);
  const rgbRef = useRef(null);
  const [open, setOpen] = useState(false);

  // This page is a fullscreen, drag-to-orbit diorama: lock page scroll while it's
  // mounted instead of hiding overflow in shared CSS, so leaving the page restores it.
  useEffect(() => {
    const { overflow } = document.documentElement.style;
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.documentElement.style.overflow = overflow;
    };
  }, []);

  useEffect(() => {
    let dispose;
    let cancelled = false;
    // Three.js touches the DOM, so load it only on the client.
    import('@/lib/room').then(({ createRoom }) => {
      if (cancelled) return;
      dispose = createRoom({
        stage: stageRef.current,
        bubble: bubbleRef.current,
        lightbox: lightboxRef.current,
        lbImg: lbImgRef.current,
        btnWave: waveRef.current,
        btnRgb: rgbRef.current,
      });
    });
    return () => {
      cancelled = true;
      if (dispose) dispose();
    };
  }, []);

  return (
    <div className="kamar-page">
      <div className="stage" ref={stageRef}>
        <div className="bubble" ref={bubbleRef}>Awoo Suakatachi</div>
      </div>
      <div className="shade" />

      <div className="top">
        <div>
          <Link className="kamar-back" href="/">← Balik ke website</Link>
          <div className="kicker">Diorama 3D · ruang kerja</div>
          <h1>Kamar main <em>malam</em></h1>
        </div>
        <span className="status"><i />Sedang main</span>
      </div>

      <div className="dock">
        <span className="hint">Geser untuk memutar · ketuk orang, kucing, atau poster</span>
        <div className="controls">
          <button ref={waveRef} type="button">Lambai</button>
          <button ref={rgbRef} type="button">Ganti warna RGB</button>
          <button type="button" aria-pressed={open} onClick={() => setOpen((v) => !v)}>Isi kamar</button>
        </div>
      </div>

      <aside className={`drawer${open ? ' on' : ''}`} aria-label="Isi kamar">
        <button className="close" type="button" onClick={() => setOpen(false)}>Tutup</button>
        <h2>Isi kamar</h2>
        <ul>
          {ROWS.map(([k, v]) => (
            <li key={k}><span>{k}</span><span>{v}</span></li>
          ))}
        </ul>
        <p className="note">
          Ketuk anak kucingnya buat dengar mereka mengeong. Karakter dan kamar ini rancangan orisinal;
          dua gambar poster di dinding adalah gambar asli Jetto.
        </p>
      </aside>

      <div className="lightbox" ref={lightboxRef} role="dialog" aria-label="Poster">
        <img ref={lbImgRef} alt="Poster di dinding" />
        <span>Klik untuk menutup</span>
      </div>
    </div>
  );
}
