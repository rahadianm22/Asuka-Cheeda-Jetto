'use client';

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { MotionConfig } from 'framer-motion';
import { translate, translateVars } from '@/lib/i18n';

const LanguageContext = createContext(null);
const STORAGE_KEY = 'jetto-lang';

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState('id');

  // Read after mount so the server render (always Indonesian) matches the first client paint.
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved === 'id' || saved === 'en') setLangState(saved);
    } catch {}
    // Once React is running, animations take over from the no-JS fallback in globals.css.
    document.documentElement.classList.add('hydrated');
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((next) => {
    setLangState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {}
  }, []);

  const t = useCallback((key) => translate(key, lang), [lang]);
  const tf = useCallback((key, vars) => translateVars(key, lang, vars), [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, tf }}>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LanguageContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLang must be used inside LanguageProvider');
  return ctx;
}
