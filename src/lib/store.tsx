'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { Lang } from './translations';

type Theme = 'light' | 'dark';

interface AppCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  user: User | null;
  setUser: (u: User | null) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (o: boolean) => void;
}

const defaultTheme: Theme = 'dark';

const Ctx = createContext<AppCtx>({
  lang: 'fr',
  setLang: () => {},
  theme: defaultTheme,
  setTheme: () => {},
  user: null,
  setUser: () => {},
  isAuthModalOpen: false,
  setIsAuthModalOpen: () => {},
});

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle('light', theme === 'light');
  document.documentElement.classList.toggle('dark', theme === 'dark');
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('fr');
  const [theme, setThemeState] = useState<Theme>(defaultTheme);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    const storedLang = (localStorage.getItem('bi4k-lang') as Lang) || 'fr';
    const storedTheme = (localStorage.getItem('bi4k-theme') as Theme) || defaultTheme;

    setLangState(storedLang);
    setThemeState(storedTheme);
    document.documentElement.setAttribute('lang', storedLang);
    applyTheme(storedTheme);

    const supabase = createClient();
    
    // Initial fetch
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    // Listen to changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem('bi4k-lang', l);
    document.documentElement.setAttribute('lang', l);
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('bi4k-theme', newTheme);
    applyTheme(newTheme);
  };

  return (
    <Ctx.Provider value={{ lang, setLang, theme, setTheme, user, setUser, isAuthModalOpen, setIsAuthModalOpen }}>
      {children}
    </Ctx.Provider>
  );
}

export const useApp = () => useContext(Ctx);
