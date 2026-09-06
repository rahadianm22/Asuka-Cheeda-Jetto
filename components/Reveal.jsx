'use client';

import { motion } from 'framer-motion';

// Fades + lifts content into view once, when it scrolls into frame.
// `delay` staggers siblings; keep it small so nothing feels sluggish.
export default function Reveal({ children, delay = 0, y = 18, className, as = 'div' }) {
  const MotionTag = motion[as] || motion.div;

  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.55, delay, ease: [0.2, 0.7, 0.3, 1] }}
    >
      {children}
    </MotionTag>
  );
}
