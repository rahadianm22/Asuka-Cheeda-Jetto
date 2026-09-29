'use client';

import { SOCIALS } from '@/lib/data';
import { useLang } from './LanguageProvider';
import Reveal from './Reveal';
import SectionHead from './SectionHead';
import SocialIcon from './SocialIcon';

export default function SocialLinks() {
  const { t } = useLang();

  return (
    <section className="sosmed">
      <SectionHead no="07" title={t('sosmedTitle')} sub={t('sosmedSub')} />

      <Reveal className="relaylinks" y={30}>
        {SOCIALS.map((s) => (
          <a
            key={s.name}
            className="relaylink tactile"
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
          >
            <SocialIcon name={s.name} className="rl-icon" />
            <span className="rl-text">
              <span className="rl-name">{s.name}</span>
              <span className="rl-sub">{t(s.key)}</span>
            </span>
          </a>
        ))}
      </Reveal>
    </section>
  );
}
