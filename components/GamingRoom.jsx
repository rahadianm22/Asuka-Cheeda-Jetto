'use client';

import Link from 'next/link';
import { useLang } from './LanguageProvider';
import Reveal from './Reveal';
import SectionHead from './SectionHead';

function GamepadIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <rect x="2" y="7" width="20" height="11" rx="4" />
      <path d="M7 10v4M5 12h4" />
      <circle cx="16" cy="10.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="18.5" cy="13" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

// A real, explorable room instead of a screenshot: it is its own fullscreen page (/kamar)
// so the drag-to-orbit canvas never has to fight the fansite's own scroll.
export default function GamingRoom() {
  const { t } = useLang();

  return (
    <section className="room-teaser">
      <SectionHead no="08" icon={<GamepadIcon className="shead-icon" />} title={t('roomTitle')} sub={t('roomSub')} />
      <Reveal y={30}>
        <Link href="/kamar" className="cta room-teaser-cta">
          <GamepadIcon className="cta-icon" />
          {t('roomCta')}
        </Link>
      </Reveal>
    </section>
  );
}
