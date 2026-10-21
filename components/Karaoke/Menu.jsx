'use client';

import { createContext, useContext, useEffect, useLayoutEffect, useRef, useState } from 'react';
import Modal from './Modal';

const WideCtx = createContext(false);

export function MenuItem({ icon, children, hint, onClick, href, danger = false }) {
  const wide = useContext(WideCtx);
  const cls = `kk-act ${danger ? 'is-danger' : ''}`;
  const body = (
    <>
      {icon}
      <span className="kk-act-label">{children}</span>
      {hint && <span className="kk-act-hint">{hint}</span>}
    </>
  );
  return (
    <li role={wide ? 'none' : undefined}>
      {href ? (
        <a className={cls} role={wide ? 'menuitem' : undefined} href={href} target="_blank" rel="noopener noreferrer" onClick={onClick}>
          {body}
        </a>
      ) : (
        <button type="button" className={cls} role={wide ? 'menuitem' : undefined} onClick={onClick}>
          {body}
        </button>
      )}
    </li>
  );
}

// Tablet/desktop: a popover menu anchored to the ⋮ button. Mobile: a bottom sheet. Either way Esc
// closes it and focus goes back to the button that opened it.
export default function Menu({ anchor, onClose, label, header, children }) {
  const wide = typeof window !== 'undefined' && window.matchMedia('(min-width: 768px)').matches;
  return (
    <WideCtx.Provider value={wide}>
      {wide ? (
        <Popover anchor={anchor} onClose={onClose} label={label}>
          {children}
        </Popover>
      ) : (
        <Modal variant="sheet" label={label} onClose={onClose} returnFocus={anchor}>
          <div className="kk-grab" aria-hidden="true" />
          {header}
          <ul className="kk-acts">{children}</ul>
        </Modal>
      )}
    </WideCtx.Provider>
  );
}

function Popover({ anchor, onClose, label, children }) {
  const box = useRef(null);
  const [pos, setPos] = useState(null);

  useLayoutEffect(() => {
    const r = anchor.getBoundingClientRect();
    const w = box.current.offsetWidth;
    const h = box.current.offsetHeight;
    const left = Math.min(Math.max(8, r.right - w), window.innerWidth - w - 8);
    let top = r.bottom + 4;
    if (top + h > window.innerHeight - 8) top = Math.max(8, r.top - h - 4);
    setPos({ left, top });
  }, [anchor]);

  // focus the first item once the popover is placed (a hidden element cannot take focus)
  useEffect(() => {
    if (pos) box.current.querySelector('[role="menuitem"]')?.focus();
  }, [pos]);

  useEffect(() => {
    const items = () => [...box.current.querySelectorAll('[role="menuitem"]')];
    const close = (refocus) => {
      onClose();
      if (refocus && document.contains(anchor)) anchor.focus({ preventScroll: true });
    };
    const onKey = (e) => {
      const list = items();
      const i = list.indexOf(document.activeElement);
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        close(true);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        list[(i + 1) % list.length].focus();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        list[(i - 1 + list.length) % list.length].focus();
      } else if (e.key === 'Home') {
        e.preventDefault();
        list[0].focus();
      } else if (e.key === 'End') {
        e.preventDefault();
        list[list.length - 1].focus();
      } else if (e.key === 'Tab') {
        e.preventDefault();
        close(true);
      }
    };
    const onDown = (e) => {
      if (!box.current.contains(e.target) && !anchor.contains(e.target)) close(false);
    };
    document.addEventListener('keydown', onKey, true);
    document.addEventListener('pointerdown', onDown, true);
    const onMove = () => close(false);
    window.addEventListener('resize', onMove);
    window.addEventListener('scroll', onMove, true);
    return () => {
      document.removeEventListener('keydown', onKey, true);
      document.removeEventListener('pointerdown', onDown, true);
      window.removeEventListener('resize', onMove);
      window.removeEventListener('scroll', onMove, true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ul
      ref={box}
      role="menu"
      aria-label={label}
      className="kk-pop"
      style={pos ? { left: pos.left, top: pos.top } : { left: 0, top: 0, visibility: 'hidden' }}
    >
      {children}
    </ul>
  );
}
