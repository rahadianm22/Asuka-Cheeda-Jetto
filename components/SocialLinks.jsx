'use client';

import { motion } from 'framer-motion';
import { SOCIALS } from '@/lib/data';
import { useLang } from './LanguageProvider';
import Reveal from './Reveal';

export default function SocialLinks() {
  const { t } = useLang();

  return (
    <section className="sectionbar">
      <Reveal className="sectionbar-head">
        <h2>{t('sosmedTitle')}</h2>
        <span className="mono mut">{t('sosmedSub')}</span>
      </Reveal>

      <div className="relaylinks">
        {SOCIALS.map((s, i) => (
          <motion.a
            key={s.name}
            className="relaylink"
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.45, delay: i * 0.05, ease: [0.2, 0.7, 0.3, 1] }}
            whileHover={{
              y: -3,
              borderColor: 'rgba(193,161,207,0.75)',
              backgroundColor: 'rgba(193,161,207,0.07)',
            }}
          >
            <span>
              <span className="rl-name">{s.name}</span>
              <span className="rl-sub">{t(s.key)}</span>
            </span>
            <span className="rl-arrow">↗</span>
          </motion.a>
        ))}
      </div>
    </section>
  );
}
