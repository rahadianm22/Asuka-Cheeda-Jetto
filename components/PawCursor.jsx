'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import Paw from './Paw';

const INTERACTIVE = 'a, button, [role="button"]';
const STEP = 64;

// The paw itself is a native CSS cursor (no lag). This layer adds the springy
// ring around it and the footprint trail, only for mouse users who allow motion.
export default function PawCursor() {
  const [enabled, setEnabled] = useState(false);
  const [hover, setHover] = useState(false);
  const [down, setDown] = useState(false);
  const [visible, setVisible] = useState(false);
  const [prints, setPrints] = useState([]);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 520, damping: 38, mass: 0.5 });
  const sy = useSpring(y, { stiffness: 520, damping: 38, mass: 0.5 });

  const hoverRef = useRef(false);
  const visibleRef = useRef(false);
  const last = useRef(null);
  const side = useRef(1);

  useEffect(() => {
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setEnabled(fine.matches && !reduce.matches);
    update();
    fine.addEventListener('change', update);
    reduce.addEventListener('change', update);
    return () => {
      fine.removeEventListener('change', update);
      reduce.removeEventListener('change', update);
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const show = (v) => {
      if (visibleRef.current !== v) {
        visibleRef.current = v;
        setVisible(v);
      }
    };

    const onMove = (e) => {
      x.set(e.clientX);
      y.set(e.clientY);
      show(true);

      const h = Boolean(e.target.closest?.(INTERACTIVE));
      if (hoverRef.current !== h) {
        hoverRef.current = h;
        setHover(h);
      }

      const p = last.current;
      if (!p) {
        last.current = { x: e.clientX, y: e.clientY };
        return;
      }
      const dx = e.clientX - p.x;
      const dy = e.clientY - p.y;
      const d = Math.hypot(dx, dy);
      if (d < STEP) return;

      // Alternate left and right of the path, toes pointing where the mouse went.
      side.current *= -1;
      const off = 9 * side.current;
      const id = `${e.timeStamp}-${side.current}`;
      const print = {
        id,
        x: e.clientX + (-dy / d) * off,
        y: e.clientY + (dx / d) * off,
        r: (Math.atan2(dy, dx) * 180) / Math.PI + 62,
      };
      setPrints((ps) => [...ps.slice(-12), print]);
      setTimeout(() => setPrints((ps) => ps.filter((q) => q.id !== id)), 1100);
      last.current = { x: e.clientX, y: e.clientY };
    };

    // relatedTarget is null when the mouse leaves the window or enters an iframe.
    const onOut = (e) => {
      if (!e.relatedTarget) {
        show(false);
        last.current = null;
      }
    };
    const onDown = () => setDown(true);
    const onUp = () => setDown(false);

    window.addEventListener('pointermove', onMove);
    document.addEventListener('mouseout', onOut);
    window.addEventListener('pointerdown', onDown);
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('mouseout', onOut);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
    };
  }, [enabled, x, y]);

  if (!enabled) return null;

  return (
    <div className="pawcursor" aria-hidden="true">
      {prints.map((p) => (
        <span key={p.id} className="paw-print" style={{ left: p.x, top: p.y, '--r': `${p.r}deg` }}>
          <Paw />
        </span>
      ))}
      <motion.div className="cursor-ring" style={{ x: sx, y: sy }}>
        <span
          className="cursor-ring-inner"
          data-hover={hover}
          data-down={down}
          data-visible={visible}
        />
      </motion.div>
    </div>
  );
}
