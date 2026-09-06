'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { PROFILE_ROWS } from '@/lib/data';
import { useLang } from './LanguageProvider';
import Reveal from './Reveal';

export default function Masthead() {
  const { t } = useLang();

  return (
    <section className="mast">
      <div className="mast-left">
        <Reveal className="mast-copy">
          <h1>
            {t('mastH1a')}
            <em>{t('mastH1em')}</em>
            {t('mastH1b')}
          </h1>
          <p className="sub">{t('mastSub')}</p>
          <motion.a
            className="cta"
            href="#feed"
            whileHover={{ y: -2, backgroundColor: '#dcc4e6' }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.18 }}
          >
            {t('mastCta')}
          </motion.a>
        </Reveal>

        <motion.div
          className="mast-pose"
          initial={{ opacity: 0, x: 40, y: 20 }}
          whileInView={{ opacity: 1, x: 0, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, delay: 0.25, ease: [0.2, 0.7, 0.3, 1] }}
          aria-hidden="true"
        >
          <Image src="/pose.png" alt="" width={703} height={900} priority={false} />
        </motion.div>
      </div>

      <Reveal className="file" delay={0.12}>
        <div className="eyebrow">{t('fileEyebrow')}</div>
        <h3>Asuka Cheeda Jetto</h3>
        <div className="binom">{t('fileBinom')}</div>
        <dl className="rows">
          {PROFILE_ROWS.map((row, i) => (
            <motion.div
              key={row.labelKey}
              initial={{ opacity: 0, x: 10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.2 + i * 0.05 }}
            >
              <dt>{t(row.labelKey)}</dt>
              <dd>{row.valueKey ? t(row.valueKey) : row.value}</dd>
            </motion.div>
          ))}
        </dl>
      </Reveal>
    </section>
  );
}
