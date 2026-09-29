'use client';

import { SUPPORTS } from '@/lib/data';
import { useLang } from './LanguageProvider';
import Reveal from './Reveal';
import SectionHead from './SectionHead';
import Paw from './Paw';

export default function SupportLinks() {
  const { t } = useLang();

  return (
    <section className="support-panel">
      <Paw className="support-watermark" />
      <SectionHead no="06" title={t('supportTitle')} sub={t('supportSub')} />

      <Reveal className="supportlinks" y={30}>
        {SUPPORTS.map((s) => (
          <a
            key={s.name}
            className="supportlink tactile"
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="support-avatar">
              <img src={s.logo} alt="" width={56} height={56} />
            </span>
            <span className="support-text">
              <span className="rl-name">{s.name}</span>
              <span className="rl-sub">{t(s.key)}</span>
            </span>
            {/* Official platform mark in its own colours, so visitors recognise where the link goes. */}
            <img className="support-mark" src={s.mark} alt="" width={28} height={28} />
          </a>
        ))}
      </Reveal>
    </section>
  );
}
