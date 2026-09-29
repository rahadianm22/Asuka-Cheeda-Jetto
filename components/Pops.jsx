'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Little words that float up and fade when a character is clicked.
export function usePops() {
  const [pops, setPops] = useState([]);
  const add = (text) => setPops((p) => [...p, { id: `${Date.now()}-${Math.random()}`, text }]);
  const remove = (id) => setPops((p) => p.filter((x) => x.id !== id));
  return [pops, add, remove];
}

export default function Pops({ pops, onDone }) {
  return (
    <AnimatePresence>
      {pops.map((p) => (
        <motion.span
          key={p.id}
          className="char-pop"
          aria-hidden="true"
          initial={{ opacity: 1, y: 0, scale: 0.8 }}
          animate={{ opacity: 0, y: -80, scale: 1.15 }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
          onAnimationComplete={() => onDone(p.id)}
        >
          {p.text}
        </motion.span>
      ))}
    </AnimatePresence>
  );
}
