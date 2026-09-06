'use client';

import { createContext, useContext, useState, useCallback } from 'react';
import { translate, translateVars } from '@/lib/i18n';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('id');

  const t = useCallback((key) => translate(key, lang), [lang]);
  const tf = useCallback((key, vars) => translateVars(key, lang, vars), [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, tf }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLang must be used inside LanguageProvider');
  return ctx;
}
