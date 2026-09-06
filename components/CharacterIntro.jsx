'use client';

import { motion } from 'framer-motion';
import { useLang } from './LanguageProvider';
import Reveal from './Reveal';

const CHARACTERS = [
  {
    id: 'cheeda',
    img: '/cheeda.png',
    accent: '#c1a1cf',
    nameKey: 'cheedaName',
    tagKey: 'cheedaTag',
    lineKey: 'cheedaLine',
  },
  {
    id: 'cipet',
    img: '/cipet.png',
    accent: '#f2a6c4',
    nameKey: 'cipetName',
    tagKey: 'cipetTag',
    lineKey: 'cipetLine',
  },
];

export default function CharacterIntro() {
  const { t } = useLang();

  return (
    <section className="charintro">
      <Reveal className="sectionbar-head">
        <h2>{t('charEyebrow')}</h2>
        <span className="mono mut">{t('charSub')}</span>
      </Reveal>

      <div className="charrow-list">
        {CHARACTERS.map((c, i) => (
          <motion.div
            key={c.id}
            className={`charrow${i % 2 === 1 ? ' rev' : ''}`}
            style={{ '--char-accent': c.accent }}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5, delay: i * 0.12, ease: [0.2, 0.7, 0.3, 1] }}
          >
            <div className="char-portrait">
              <img src={c.img} alt="" />
            </div>
            <div className="char-bubble">
              <div className="char-id">
                <span className="char-name">{t(c.nameKey)}</span>
                <span className="char-tag">{t(c.tagKey)}</span>
              </div>
              <p>{t(c.lineKey)}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
