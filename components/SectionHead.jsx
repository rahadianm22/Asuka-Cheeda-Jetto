'use client';

import Reveal from './Reveal';

export default function SectionHead({ no, title, sub, icon = null }) {
  return (
    <Reveal className="shead" y={40}>
      <span className="shead-no">No. {no}</span>
      <h2 className="shead-title">
        {icon}
        {title}
      </h2>
      {sub && <p className="shead-sub">{sub}</p>}
    </Reveal>
  );
}
