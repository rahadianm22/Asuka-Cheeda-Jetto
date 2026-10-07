'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import MusicToggle from '@/components/MusicToggle';

// Jetto's setup, grouped by section, shown in the "Spek PC" drawer. A null value shows as a dash:
// fill these in as she shares the rest of her gear.
const SETUP = [
  ['PC', [
    ['CPU', 'Intel Core i5 gen 14'],
    ['GPU', 'GeForce RTX 5060'],
    ['RAM', '16 GB'],
    ['Storage', '1 TB'],
    ['Motherboard', null],
    ['PSU', null],
    ['Casing', 'Cube Gaming'],
    ['Kipas', null],
  ]],
  ['Monitor', [
    ['Kiri (portrait)', 'Samsung'],
    ['Kanan (landscape)', 'MSI MAG'],
  ]],
  ['Peripheral', [
    ['Mouse (baru)', null],
    ['Keyboard', null],
    ['Mousepad', null],
  ]],
  ['Audio', [
    ['Headset (putih, baru)', null],
    ['Mic kondensor', null],
    ['Audio interface/mixer', null],
  ]],
  ['Streaming', [
    ['Kamera/webcam', null],
    ['Capture card', null],
    ['Software', null],
  ]],
  ['Kamar', [
    ['Kursi', 'Gaming, ungu'],
    ['Meja', null],
    ['Lampu', 'LED strip + neon paw'],
    ['Dekor', 'Rak figur, awan, tanaman, poster'],
    ['Penghuni', '7 anak kucing + 3 boneka pup'],
  ]],
];

// Entrance, in the same motion language as the homepage hero: the room settles in from a slight
// zoom, the kicker slides in, the title words spring up out of a mask, then the controls follow.
const EASE = [0.2, 0.8, 0.2, 1];
const TITLE = [['Kamar'], ['Main'], ['Jetto', true]];
const rise = (delay) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: EASE },
});

export default function Room() {
  const stageRef = useRef(null);
  const bubbleRef = useRef(null);
  const lightboxRef = useRef(null);
  const lbImgRef = useRef(null);
  const waveRef = useRef(null);
  const roomRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [playing, setPlaying] = useState(false);
  // the room loads three.js on demand, so its entrance waits until the scene actually exists
  const [ready, setReady] = useState(false);

  const togglePlay = () => {
    const next = !playing;
    setPlaying(next);
    roomRef.current?.setPlaying(next);
  };

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
    let cancelled = false;
    // Three.js touches the DOM, so load it only on the client.
    import('@/lib/room').then(({ createRoom }) => {
      if (cancelled) return;
      roomRef.current = createRoom({
        stage: stageRef.current,
        bubble: bubbleRef.current,
        lightbox: lightboxRef.current,
        lbImg: lbImgRef.current,
        btnWave: waveRef.current,
      });
      setReady(true);
    });
    return () => {
      cancelled = true;
      roomRef.current?.dispose();
      roomRef.current = null;
    };
  }, []);

  return (
    <div className="kamar-page">
      <motion.div
        className="stage"
        ref={stageRef}
        initial={{ opacity: 0, scale: 1.1 }}
        animate={ready ? { opacity: 1, scale: 1 } : undefined}
        transition={{ duration: 1.4, ease: EASE }}
      >
        <div className="bubble" ref={bubbleRef}>Awoo Suakatachi</div>
      </motion.div>
      <div className="shade" />

      <div className="top">
        <div>
          <motion.div
            className="kicker"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: EASE }}
          >
            Diorama 3D · ruang kerja
          </motion.div>
          <h1>
            {TITLE.map(([word, accent], i) => (
              <span className="title-mask" key={word}>
                <motion.span
                  className="title-word"
                  initial={{ y: '115%' }}
                  animate={{ y: '0%' }}
                  transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.45 + i * 0.1 }}
                >
                  {accent ? <em>{word}</em> : word}
                </motion.span>
              </span>
            ))}
          </h1>
        </div>
        <motion.span className="status" {...rise(0.8)}><i />{playing ? 'Sedang main' : 'Lagi santai'}</motion.span>
      </div>

      <div className="dock">
        <motion.span className="hint" {...rise(1.05)}>
          Geser untuk memutar · scroll untuk zoom · ketuk Jetto, hewan, atau poster
        </motion.span>
        <motion.div className="controls" {...rise(0.95)}>
          <MusicToggle autoplay />
          <button type="button" aria-pressed={playing} onClick={togglePlay}>{playing ? 'Udahan main' : 'Main'}</button>
          <button ref={waveRef} type="button">Awoo Jetto</button>
          <button type="button" aria-pressed={open} onClick={() => setOpen((v) => !v)}>Spek PC</button>
          <Link className="kamar-back" href="/">← Balik ke website</Link>
        </motion.div>
      </div>

      <aside className={`drawer${open ? ' on' : ''}`} aria-label="Setup Jetto">
        <button className="close" type="button" onClick={() => setOpen(false)}>Tutup</button>
        <h2>Setup Jetto</h2>
        {SETUP.map(([section, rows]) => (
          <section className="spec-group" key={section}>
            <h3>{section}</h3>
            <ul>
              {rows.map(([k, v]) => (
                <li key={k}><span>{k}</span><span className={v ? undefined : 'spec-empty'}>{v || '—'}</span></li>
              ))}
            </ul>
          </section>
        ))}
        <p className="note">
          Setup yang dipakai Jetto buat streaming dan main game. Di kamar ini, ketuk Jetto buat ngobrol, ketuk
          kucing dan anjingnya buat dengar mereka mengeong dan menggonggong.
        </p>
      </aside>

      <div className="lightbox" ref={lightboxRef} role="dialog" aria-label="Poster">
        <img ref={lbImgRef} alt="Poster di dinding" />
        <span>Klik untuk menutup</span>
      </div>
    </div>
  );
}
