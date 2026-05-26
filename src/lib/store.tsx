'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
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
  profile: any | null;
  setProfile: (p: any | null) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (o: boolean) => void;
  authModalView: 'login' | 'signup';
  setAuthModalView: (v: 'login' | 'signup') => void;
  openAuthModal: (view: 'login' | 'signup') => void;
  toasts: Toast[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  dismissToast: (id: string) => void;
}

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

const defaultTheme: Theme = 'dark';

const Ctx = createContext<AppCtx>({
  lang: 'fr',
  setLang: () => {},
  theme: defaultTheme,
  setTheme: () => {},
  user: null,
  setUser: () => {},
  profile: null,
  setProfile: () => {},
  isAuthModalOpen: false,
  setIsAuthModalOpen: () => {},
  authModalView: 'login',
  setAuthModalView: () => {},
  openAuthModal: () => {},
  toasts: [],
  showToast: () => {},
  dismissToast: () => {},
});

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle('light', theme === 'light');
  document.documentElement.classList.toggle('dark', theme === 'dark');
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [supabase] = useState(() => createClient());
  const [lang, setLangState] = useState<Lang>('fr');
  const [theme, setThemeState] = useState<Theme>(defaultTheme);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalView, setAuthModalView] = useState<'login' | 'signup'>('login');
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      dismissToast(id);
    }, 4000);
  }, [dismissToast]);

  const openAuthModal = useCallback((view: 'login' | 'signup') => {
    setAuthModalView(view);
    setIsAuthModalOpen(true);
  }, []);

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      setProfile(data ?? null);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setProfile(null);
    }
  }, [supabase]);

  useEffect(() => {
    const storedLang = (localStorage.getItem('bi4k-lang') as Lang) || 'fr';
    const storedTheme = (localStorage.getItem('bi4k-theme') as Theme) || defaultTheme;

    setLangState(storedLang);
    setThemeState(storedTheme);
    document.documentElement.setAttribute('lang', storedLang);
    applyTheme(storedTheme);
    
    // Initial fetch
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) {
        fetchProfile(user.id);
      } else {
        setProfile(null);
      }
    });

    // Listen to changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const sbUser = session?.user || null;
      setUser(sbUser);
      if (sbUser) {
        fetchProfile(sbUser.id);
      } else {
        setProfile(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, fetchProfile]);

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
    <Ctx.Provider value={{ 
      lang, 
      setLang, 
      theme, 
      setTheme, 
      user, 
      setUser, 
      profile, 
      setProfile, 
      isAuthModalOpen, 
      setIsAuthModalOpen, 
      authModalView, 
      setAuthModalView, 
      openAuthModal, 
      toasts, 
      showToast, 
      dismissToast 
    }}>
      {children}
    </Ctx.Provider>
  );
}

export const useApp = () => useContext(Ctx);
