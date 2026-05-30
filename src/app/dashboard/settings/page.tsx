'use client';

import { useState } from 'react';
import { Settings, Globe, Moon, Sun, Bell, ShieldCheck, X, Loader2 } from 'lucide-react';
import { useApp } from '@/lib/store';
import { createClient } from '@/lib/supabase/client';

// Translations Dictionary Object
const translations = {
  fr: {
    dashboard: "Dashboard",
    title: "Paramètres",
    subtitle: "Gérez vos préférences et la sécurité de votre compte.",
    appearance: "Apparence",
    theme: "Thème",
    themeDark: "Mode sombre activé",
    themeLight: "Mode clair activé",
    themeDarkBtn: "Sombre",
    themeLightBtn: "Clair",
    language: "Langue",
    langActive: "Français actif",
    security: "Sécurité",
    password: "Mot de passe",
    passwordDesc: "Modifiez votre mot de passe de connexion.",
    modify: "Modifier",
    notifications: "Notifications",
    emailNotifications: "Notifications email",
    emailNotificationsDesc: "Recevoir des mises à jour sur vos commandes.",
    passwordModalTitle: "Modifier le mot de passe",
    newPasswordLabel: "Nouveau mot de passe",
    confirmPasswordLabel: "Confirmer le mot de passe",
    cancel: "Annuler",
    save: "Enregistrer",
    passwordPlaceholder: "Au moins 6 caractères",
    passwordsDoNotMatch: "Les mots de passe ne correspondent pas.",
    passwordTooShort: "Le mot de passe doit contenir au moins 6 caractères.",
    updating: "Mise à jour...",
    passwordSuccess: "Mot de passe mis à jour avec succès !",
    passwordError: "Impossible de mettre à jour le mot de passe."
  },
  en: {
    dashboard: "Dashboard",
    title: "Settings",
    subtitle: "Manage your preferences and account security.",
    appearance: "Appearance",
    theme: "Theme",
    themeDark: "Dark mode enabled",
    themeLight: "Light mode enabled",
    themeDarkBtn: "Dark",
    themeLightBtn: "Light",
    language: "Language",
    langActive: "English active",
    security: "Security",
    password: "Password",
    passwordDesc: "Change your login password.",
    modify: "Modify",
    notifications: "Notifications",
    emailNotifications: "Email notifications",
    emailNotificationsDesc: "Receive updates on your orders.",
    passwordModalTitle: "Change Password",
    newPasswordLabel: "New Password",
    confirmPasswordLabel: "Confirm Password",
    cancel: "Cancel",
    save: "Save",
    passwordPlaceholder: "At least 6 characters",
    passwordsDoNotMatch: "Passwords do not match.",
    passwordTooShort: "Password must be at least 6 characters.",
    updating: "Updating...",
    passwordSuccess: "Password updated successfully!",
    passwordError: "Failed to update password."
  }
};

export default function SettingsPage() {
  const { lang, setLang, theme, setTheme, showToast } = useApp();
  const supabase = createClient();

  // Password Modal States
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordErrorMsg, setPasswordErrorMsg] = useState("");

  // Email Notifications Toggle State
  const [emailNotifications, setEmailNotifications] = useState(true);

  // Safe Cast translation helper
  const t = translations[lang as 'fr' | 'en'] || translations.fr;

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordErrorMsg("");

    if (newPassword.length < 6) {
      setPasswordErrorMsg(t.passwordTooShort);
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordErrorMsg(t.passwordsDoNotMatch);
      return;
    }

    setIsUpdatingPassword(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      showToast(t.passwordSuccess, "success");
      setIsPasswordModalOpen(false);
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      console.error("Password change failed:", err);
      setPasswordErrorMsg(err.message || t.passwordError);
      showToast(err.message || t.passwordError, "error");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">{t.dashboard}</p>
        <h1 className="text-2xl font-extrabold text-neutral-900 dark:text-white tracking-tight">{t.title}</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">{t.subtitle}</p>
      </div>

      <div className="space-y-4">
        {/* Appearance */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-white/5 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-neutral-100 dark:border-white/5 flex items-center gap-3">
            <Settings className="w-4 h-4 text-neutral-400" />
            <span className="font-bold text-neutral-900 dark:text-white text-sm">{t.appearance}</span>
          </div>
          {/* Theme */}
          <div className="px-6 py-4 flex items-center justify-between border-b border-neutral-100 dark:border-white/5">
            <div className="flex items-center gap-3">
              {theme === 'dark' ? <Moon className="w-4 h-4 text-neutral-500" /> : <Sun className="w-4 h-4 text-neutral-500" />}
              <div>
                <p className="text-sm font-semibold text-neutral-900 dark:text-white">{t.theme}</p>
                <p className="text-[10px] text-neutral-500 dark:text-neutral-400">{theme === 'dark' ? t.themeDark : t.themeLight}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 bg-neutral-100 dark:bg-white/5 rounded-xl p-1">
              <button
                onClick={() => setTheme('dark')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${theme === 'dark' ? 'bg-white dark:bg-neutral-700 shadow text-neutral-900 dark:text-white' : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'}`}
              >
                <Moon className="w-3 h-3" /> {t.themeDarkBtn}
              </button>
              <button
                onClick={() => setTheme('light')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${theme === 'light' ? 'bg-white dark:bg-neutral-700 shadow text-neutral-900 dark:text-white' : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'}`}
              >
                <Sun className="w-3 h-3" /> {t.themeLightBtn}
              </button>
            </div>
          </div>
          {/* Language */}
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Globe className="w-4 h-4 text-neutral-500" />
              <div>
                <p className="text-sm font-semibold text-neutral-900 dark:text-white">{t.language}</p>
                <p className="text-[10px] text-neutral-500 dark:text-neutral-400">{t.langActive}</p>
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
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-white/5 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-neutral-100 dark:border-white/5 flex items-center gap-3">
            <ShieldCheck className="w-4 h-4 text-neutral-400" />
            <span className="font-bold text-neutral-900 dark:text-white text-sm">{t.security}</span>
          </div>
          <div className="px-6 py-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-neutral-900 dark:text-white">{t.password}</p>
              <p className="text-[10px] text-neutral-500 dark:text-neutral-400">{t.passwordDesc}</p>
            </div>
            <button 
              onClick={() => setIsPasswordModalOpen(true)}
              className="px-4 py-2 bg-neutral-100 dark:bg-white/5 hover:bg-neutral-200 dark:hover:bg-white/10 text-neutral-700 dark:text-neutral-300 text-xs font-bold rounded-xl transition-all"
            >
              {t.modify}
            </button>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-white/5 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-neutral-100 dark:border-white/5 flex items-center gap-3">
            <Bell className="w-4 h-4 text-neutral-400" />
            <span className="font-bold text-neutral-900 dark:text-white text-sm">{t.notifications}</span>
          </div>
          <div className="px-6 py-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-neutral-900 dark:text-white">{t.emailNotifications}</p>
              <p className="text-[10px] text-neutral-500 dark:text-neutral-400">{t.emailNotificationsDesc}</p>
            </div>
            <div 
              onClick={() => setEmailNotifications(!emailNotifications)}
              className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors duration-300 ${emailNotifications ? 'bg-blue-500' : 'bg-neutral-200 dark:bg-white/10'}`}
            >
              <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-300 ${emailNotifications ? 'right-0.5' : 'left-0.5'}`} />
            </div>
          </div>
        </div>
      </div>

      {/* Password Change Dialog Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-sm overflow-hidden bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-white/10 shadow-2xl rounded-3xl p-6 animate-scaleIn">
            
            {/* Close Button */}
            <button 
              onClick={() => setIsPasswordModalOpen(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-600 dark:hover:text-white bg-neutral-100 dark:bg-white/5 hover:bg-neutral-200 dark:hover:bg-white/10 rounded-xl p-2 transition-colors z-20"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            {/* Title */}
            <div className="mb-5 text-center">
              <h3 className="text-lg font-extrabold text-neutral-900 dark:text-white tracking-tight">{t.passwordModalTitle}</h3>
            </div>

            <form onSubmit={handlePasswordUpdate} className="space-y-4">
              {passwordErrorMsg && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-bold text-center">
                  {passwordErrorMsg}
                </div>
              )}

              {/* New Password */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 ml-1">{t.newPasswordLabel}</label>
                <input 
                  type="password"
                  required
                  placeholder={t.passwordPlaceholder}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-neutral-50 dark:bg-black/50 border border-neutral-200 dark:border-white/10 rounded-xl py-3 px-4 text-neutral-900 dark:text-white text-sm font-medium outline-none focus:border-blue-500 dark:focus:border-white/20 transition-colors"
                />
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 ml-1">{t.confirmPasswordLabel}</label>
                <input 
                  type="password"
                  required
                  placeholder={t.passwordPlaceholder}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-neutral-50 dark:bg-black/50 border border-neutral-200 dark:border-white/10 rounded-xl py-3 px-4 text-neutral-900 dark:text-white text-sm font-medium outline-none focus:border-blue-500 dark:focus:border-white/20 transition-colors"
                />
              </div>

              {/* Form Buttons */}
              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="flex-1 py-3 border border-neutral-200 dark:border-white/10 text-neutral-700 dark:text-neutral-300 font-bold rounded-xl text-xs uppercase tracking-wider hover:bg-neutral-50 dark:hover:bg-white/5 transition-all"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingPassword}
                  className="flex-1 py-3 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-bold rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-md shadow-blue-500/10 hover:scale-[1.02] active:scale-[0.98]"
                >
                  {isUpdatingPassword ? (
                    <><Loader2 className="w-3.5 h-3.5 animate-spin" /> {t.updating}</>
                  ) : (
                    t.save
                  )}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  );
}
