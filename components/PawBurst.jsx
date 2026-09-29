'use client';

import { useEffect, useState } from 'react';
import Paw from './Paw';

const ANGLES = [18, 90, 162, 234, 306];

export default function PawBurst() {
  const [bursts, setBursts] = useState([]);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onClick = (e) => {
      // detail 0 = keyboard-triggered click, which has no pointer position.
      if (reduce.matches || e.detail === 0) return;
      const id = `${e.timeStamp}-${Math.random()}`;
      setBursts((b) => [...b, { id, x: e.clientX, y: e.clientY }]);
      setTimeout(() => setBursts((b) => b.filter((p) => p.id !== id)), 800);
    };
    window.addEventListener('click', onClick);
    return () => window.removeEventListener('click', onClick);
  }, []);

  return (
    <div className="pawburst" aria-hidden="true">
      {bursts.map((b) => (
        <span key={b.id} className="pawburst-at" style={{ left: b.x, top: b.y }}>
          {ANGLES.map((a) => (
            <span key={a} className="pawburst-paw" style={{ '--a': `${a}deg` }}>
              <Paw />
            </span>
          ))}
        </span>
      ))}
    </div>
  );
}
