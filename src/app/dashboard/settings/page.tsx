'use client';

import { Settings, Globe, Moon, Sun, Bell, ShieldCheck } from 'lucide-react';
import { useApp } from '@/lib/store';

export default function SettingsPage() {
  const { lang, setLang, theme, setTheme } = useApp();

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">Dashboard</p>
        <h1 className="text-2xl font-extrabold text-neutral-900 dark:text-white tracking-tight">Paramètres</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">Gérez vos préférences et la sécurité de votre compte.</p>
      </div>

      <div className="space-y-4">
        {/* Appearance */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-white/5 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-neutral-100 dark:border-white/5 flex items-center gap-3">
            <Settings className="w-4 h-4 text-neutral-400" />
            <span className="font-bold text-neutral-900 dark:text-white text-sm">Apparence</span>
          </div>
          {/* Theme */}
          <div className="px-6 py-4 flex items-center justify-between border-b border-neutral-100 dark:border-white/5">
            <div className="flex items-center gap-3">
              {theme === 'dark' ? <Moon className="w-4 h-4 text-neutral-500" /> : <Sun className="w-4 h-4 text-neutral-500" />}
              <div>
                <p className="text-sm font-semibold text-neutral-900 dark:text-white">Thème</p>
                <p className="text-[10px] text-neutral-500 dark:text-neutral-400">{theme === 'dark' ? 'Mode sombre activé' : 'Mode clair activé'}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 bg-neutral-100 dark:bg-white/5 rounded-xl p-1">
              <button
                onClick={() => setTheme('dark')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${theme === 'dark' ? 'bg-white dark:bg-neutral-700 shadow text-neutral-900 dark:text-white' : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'}`}
              >
                <Moon className="w-3 h-3" /> Sombre
              </button>
              <button
                onClick={() => setTheme('light')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${theme === 'light' ? 'bg-white dark:bg-neutral-700 shadow text-neutral-900 dark:text-white' : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'}`}
              >
                <Sun className="w-3 h-3" /> Clair
              </button>
            </div>
          </div>
          {/* Language */}
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Globe className="w-4 h-4 text-neutral-500" />
              <div>
                <p className="text-sm font-semibold text-neutral-900 dark:text-white">Langue</p>
                <p className="text-[10px] text-neutral-500 dark:text-neutral-400">{lang === 'fr' ? 'Français actif' : 'English active'}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 bg-neutral-100 dark:bg-white/5 rounded-xl p-1">
              <button
                onClick={() => setLang('fr')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${lang === 'fr' ? 'bg-white dark:bg-neutral-700 shadow text-neutral-900 dark:text-white' : 'text-neutral-500'}`}
              >
                FR
              </button>
              <button
                onClick={() => setLang('en')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${lang === 'en' ? 'bg-white dark:bg-neutral-700 shadow text-neutral-900 dark:text-white' : 'text-neutral-500'}`}
              >
                EN
              </button>
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-white/5 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-neutral-100 dark:border-white/5 flex items-center gap-3">
            <ShieldCheck className="w-4 h-4 text-neutral-400" />
            <span className="font-bold text-neutral-900 dark:text-white text-sm">Sécurité</span>
          </div>
          <div className="px-6 py-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-neutral-900 dark:text-white">Mot de passe</p>
              <p className="text-[10px] text-neutral-500 dark:text-neutral-400">Modifiez votre mot de passe de connexion.</p>
            </div>
            <button className="px-4 py-2 bg-neutral-100 dark:bg-white/5 hover:bg-neutral-200 dark:hover:bg-white/10 text-neutral-700 dark:text-neutral-300 text-xs font-bold rounded-xl transition-all">
              Modifier
            </button>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-white/5 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-neutral-100 dark:border-white/5 flex items-center gap-3">
            <Bell className="w-4 h-4 text-neutral-400" />
            <span className="font-bold text-neutral-900 dark:text-white text-sm">Notifications</span>
          </div>
          <div className="px-6 py-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-neutral-900 dark:text-white">Notifications email</p>
              <p className="text-[10px] text-neutral-500 dark:text-neutral-400">Recevoir des mises à jour sur vos commandes.</p>
            </div>
            <div className="w-10 h-5 bg-blue-500 rounded-full relative cursor-pointer">
              <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
