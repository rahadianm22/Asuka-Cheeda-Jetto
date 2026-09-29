'use client';

import { useState } from 'react';
import { motion, useAnimationControls } from 'framer-motion';
import { useLang } from './LanguageProvider';
import SectionHead from './SectionHead';
import Reveal from './Reveal';
import Pops, { usePops } from './Pops';

// Cheeda asks to have her head patted, so her portrait is a button that does exactly that.
function Cheeda({ t, tf }) {
  const [pats, setPats] = useState(0);
  const [pops, addPop, removePop] = usePops();
  const controls = useAnimationControls();

  const pat = () => {
    setPats((n) => n + 1);
    addPop(t('patPop'));
    controls.start({
      rotate: [0, -9, 8, -6, 4, 0],
      scaleY: [1, 0.86, 1.06, 1],
      transition: { duration: 0.6 },
    });
  };

  return (
    <div className="charrow" style={{ '--char-accent': '#c1a1cf' }}>
      <button type="button" className="char-portrait" onClick={pat}>
        <motion.img src="/cheeda.png" alt="" animate={controls} style={{ originY: 1 }} />
        <Pops pops={pops} onDone={removePop} />
        <span className="char-action">{t('patAction')}</span>
      </button>
      <div className="char-bubble">
        <div className="char-id">
          <span className="char-name">{t('cheedaName')}</span>
          <span className="char-tag">{t('cheedaTag')}</span>
          <span className="char-count" aria-live="polite">
            {pats > 0 ? tf('patCount', { n: pats }) : ''}
          </span>
        </div>
        <p>{t('cheedaLine')}</p>
      </div>
    </div>
  );
}

// Cipet always wants to be carried, so her portrait toggles being picked up.
function Cipet({ t }) {
  const [up, setUp] = useState(false);
  const [pops, addPop, removePop] = usePops();

  const toggle = () => {
    if (!up) addPop(t('carryPop'));
    setUp((v) => !v);
  };

  return (
    <div className="charrow rev" style={{ '--char-accent': '#f2a6c4' }}>
      <button type="button" className="char-portrait" aria-pressed={up} onClick={toggle}>
        <motion.img
          src="/cipet.png"
          alt=""
          animate={up ? { y: -26, rotate: -7, scale: 1.1 } : { y: 0, rotate: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 380, damping: 13 }}
        />
        <Pops pops={pops} onDone={removePop} />
        <span className="char-action">{t('carryAction')}</span>
      </button>
      <div className="char-bubble">
        <div className="char-id">
          <span className="char-name">{t('cipetName')}</span>
          <span className="char-tag">{t('cipetTag')}</span>
        </div>
        <p>{t('cipetLine')}</p>
      </div>
    </div>
  );
}

export default function CharacterIntro() {
  const { t, tf } = useLang();

  return (
    <section className="charintro">
      <SectionHead no="01" title={t('charEyebrow')} sub={t('charSub')} />
      <Reveal className="charrow-list" y={40}>
        <Cheeda t={t} tf={tf} />
        <Cipet t={t} />
      </Reveal>
    </section>
  );
}
