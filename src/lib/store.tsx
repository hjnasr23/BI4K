'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Lang } from './translations';

interface AppCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
}

const Ctx = createContext<AppCtx>({
  lang: 'fr', setLang: () => {},
});

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('fr');

  useEffect(() => {
    const l = (localStorage.getItem('bi4k-lang') as Lang) || 'fr';
    setLangState(l);
    document.documentElement.setAttribute('lang', l);
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem('bi4k-lang', l);
    document.documentElement.setAttribute('lang', l);
  };

  return (
    <Ctx.Provider value={{ lang, setLang }}>
      {children}
    </Ctx.Provider>
  );
}

export const useApp = () => useContext(Ctx);
