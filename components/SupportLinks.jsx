'use client';

import { motion } from 'framer-motion';
import { SUPPORTS } from '@/lib/data';
import { useLang } from './LanguageProvider';
import Reveal from './Reveal';

export default function SupportLinks() {
  const { t } = useLang();

  return (
    <section className="sectionbar">
      <Reveal className="sectionbar-head">
        <h2>{t('supportTitle')}</h2>
        <span className="mono mut">{t('supportSub')}</span>
      </Reveal>

      <div className="supportlinks">
        {SUPPORTS.map((s, i) => (
          <motion.a
            key={s.name}
            className="supportlink"
            style={{ '--support-accent': s.accent }}
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.45, delay: i * 0.05, ease: [0.2, 0.7, 0.3, 1] }}
            whileHover={{ y: -3 }}
          >
            <span className="support-avatar">
              <img src={s.logo} alt="" width={56} height={56} />
            </span>
            <span className="support-text">
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
