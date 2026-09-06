'use client';

import { motion } from 'framer-motion';
import { LIKES, DISLIKES } from '@/lib/data';
import { useLang } from './LanguageProvider';
import Reveal from './Reveal';

function PillGroup({ tone, arrow, titleKey, countKey, keys }) {
  const { t } = useLang();

  return (
    <div className={`vgroup ${tone}`}>
      <Reveal className="vgroup-head">
        <span className="arrow">{arrow}</span>
        <h3>{t(titleKey)}</h3>
        <span className="count">{t(countKey)}</span>
      </Reveal>

      <div className="vpills">
        {keys.map((key, i) => (
          <motion.span
            key={key}
            className="vpill"
            initial={{ opacity: 0, scale: 0.94, y: 8 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.38, delay: i * 0.045, ease: [0.2, 0.7, 0.3, 1] }}
            whileHover={{ y: -2 }}
          >
            {t(key)}
          </motion.span>
        ))}
      </div>
    </div>
  );
}

export default function Preferences() {
  const { t } = useLang();

  return (
    <section className="vitals">
      <div className="chipbar-head">
        <Reveal as="h2">{t('vitalsEyebrow')}</Reveal>
      </div>

      <PillGroup
        tone="up"
        arrow="+"
        titleKey="groupUp"
        countKey="countUp"
        keys={LIKES}
      />
      <PillGroup
        tone="down"
        arrow="−"
        titleKey="groupDown"
        countKey="countDown"
        keys={DISLIKES}
      />
    </section>
  );
}
