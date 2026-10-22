'use client';

import { useEffect, useState } from 'react';
import { COPY } from '@/lib/merch-copy';

const pad = (n) => String(n).padStart(2, '0');

function split(ms) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return { d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60, done: s === 0 };
}

// Counts down to the PO close time. The server renders dashes so the first client paint matches, then it ticks every second.
export default function Countdown({ closeAt }) {
  const target = new Date(closeAt).getTime();
  const [left, setLeft] = useState(null);

  useEffect(() => {
    const tick = () => setLeft(split(target - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);

  const units = [
    ['d', COPY.cdDays],
    ['h', COPY.cdHours],
    ['m', COPY.cdMinutes],
    ['s', COPY.cdSeconds],
  ];

  if (left?.done) return <p className="m-cd-done">{COPY.cdDone}</p>;

  return (
    <div className="m-cd" role="timer" aria-label={left ? `${COPY.cdLabel}: ${left.d} ${COPY.cdDays}, ${left.h} ${COPY.cdHours}, ${left.m} ${COPY.cdMinutes}` : COPY.cdLabel}>
      {units.map(([k, label]) => (
        <div key={k} className="m-cd-unit" aria-hidden="true">
          <strong>{left ? (k === 'd' ? left.d : pad(left[k])) : '--'}</strong>
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}
