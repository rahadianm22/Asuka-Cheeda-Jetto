'use client';

import { Fragment, useRef } from 'react';
import {
  motion,
  useScroll,
  useVelocity,
  useSpring,
  useTransform,
  useMotionValue,
  useAnimationFrame,
  useReducedMotion,
} from 'framer-motion';
import { useLang } from './LanguageProvider';
import Paw from './Paw';

const wrap = (min, max, v) => {
  const r = max - min;
  return ((((v - min) % r) + r) % r) + min;
};

// Drifts on its own, then speeds up and flips direction with the reader's scroll.
function Band({ items, baseVelocity, className }) {
  const reduce = useReducedMotion();
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const velocity = useSpring(useVelocity(scrollY), { damping: 50, stiffness: 400 });
  const factor = useTransform(velocity, [0, 1000], [0, 4], { clamp: false });
  const x = useTransform(baseX, (v) => `${wrap(-25, -50, v)}%`);
  const dir = useRef(1);

  useAnimationFrame((_, delta) => {
    if (reduce) return;
    let move = dir.current * baseVelocity * (delta / 1000);
    const f = factor.get();
    if (f < 0) dir.current = -1;
    else if (f > 0) dir.current = 1;
    move += dir.current * move * f;
    baseX.set(baseX.get() + move);
  });

  return (
    <div className={`band ${className}`}>
      <motion.div className="band-track" style={{ x }}>
        {[0, 1, 2, 3].map((copy) => (
          <span className="band-copy" key={copy}>
            {items.map((text, i) => (
              <Fragment key={i}>
                <span>{text}</span>
                <Paw className="band-paw" />
              </Fragment>
            ))}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

export default function Ticker() {
  const { t } = useLang();
  const a = [t('tickerText'), t('tickerText2'), t('tickerText3')];

  return (
    <div className="bands" aria-hidden="true">
      <Band items={a} baseVelocity={-2} className="band-a" />
      <Band items={[...a].reverse()} baseVelocity={2} className="band-b" />
    </div>
  );
}
