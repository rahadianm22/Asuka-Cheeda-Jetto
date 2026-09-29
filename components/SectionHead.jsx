'use client';

import Reveal from './Reveal';

export default function SectionHead({ no, title, sub, align = 'left' }) {
  return (
    <Reveal className={`shead shead-${align}`} y={40}>
      <span className="shead-no">No. {no}</span>
      <h2 className="shead-title">{title}</h2>
      {sub && <p className="shead-sub">{sub}</p>}
    </Reveal>
  );
}
