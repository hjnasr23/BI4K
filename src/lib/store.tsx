'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Lang } from './translations';
import { ThemeProvider } from 'next-themes';

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
    <ThemeProvider attribute="class" defaultTheme="dark">
      <Ctx.Provider value={{ lang, setLang }}>
        {children}
      </Ctx.Provider>
    </ThemeProvider>
  );
}

export const useApp = () => useContext(Ctx);
