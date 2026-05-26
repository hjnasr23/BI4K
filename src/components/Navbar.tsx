'use client';

import Link from "next/link";
import { useApp } from "@/lib/store";
import { translations } from "@/lib/translations";
import { Sun, Moon, Globe, Boxes, ShoppingCart, User as UserIcon, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useState, useEffect } from "react";
import { Clipboard } from "lucide-react";
import { useCartStore } from "@/lib/store/cartStore";

export function Navbar() {
  const { lang, setLang, theme, setTheme, user, setIsAuthModalOpen, showToast, openAuthModal } = useApp();
  const t = translations[lang];
  const supabase = createClient();
  const [scrolled, setScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  // Dynamic Zustand Cart count
  const [mounted, setMounted] = useState(false);
  const items = useCartStore((state) => state.items);
  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let hideTimer: NodeJS.Timeout;

    const resetHideTimer = () => {
      setIsVisible(true);
      clearTimeout(hideTimer);
      hideTimer = setTimeout(() => {
        setIsVisible(false);
      }, 5000);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (e.clientY < 80) {
        resetHideTimer();
      }
    };

    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
      resetHideTimer();
    };

    hideTimer = setTimeout(() => {
      setIsVisible(false);
    }, 5000);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(hideTimer);
    };
  }, []);

  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    showToast(lang === 'fr' ? 'Déconnexion réussie !' : 'Successfully signed out!', 'info');
    setDropdownOpen(false);
  };

  useEffect(() => {
    if (!dropdownOpen) return;
    const close = () => setDropdownOpen(false);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [dropdownOpen]);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'} ${scrolled ? 'py-3' : 'py-5'}`}>
      <div className={`container mx-auto px-4 transition-all duration-500 ${scrolled ? 'max-w-5xl' : 'max-w-7xl'}`}>
        <div className={`glass rounded-2xl flex items-center justify-between px-6 py-2 transition-all duration-500 ${scrolled ? 'shadow-2xl shadow-brand-blue/10 border-brand-blue/20 bg-background/80' : 'bg-transparent border-transparent shadow-none'}`}>
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-blue to-brand-yellow flex items-center justify-center shadow-lg shadow-brand-blue/25 group-hover:rotate-12 transition-transform duration-500">
              <Boxes className="w-6 h-6 text-white" />
            </div>
            <span className="font-black text-2xl tracking-tighter text-foreground group-hover:text-brand-blue transition-colors">
              BI4K
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-10 text-[11px] font-black uppercase tracking-[0.2em] text-foreground/60">
            <Link href="/#services" className="hover:text-brand-yellow transition-colors">Services</Link>
            <Link href="/categories" className="hover:text-brand-yellow transition-colors">{t.catalog || "Categories"}</Link>
            <Link href="/help" className="hover:text-brand-yellow transition-colors">{t.help}</Link>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-card-bg rounded-full p-1 border border-card-border">
              <button
                onClick={() => setTheme('dark')}
                className={`p-2 rounded-full transition-all ${theme === 'dark' ? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/20' : 'hover:bg-white/10 text-foreground/40'}`}
              >
                <Moon className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setTheme('light')}
                className={`p-2 rounded-full transition-all ${theme === 'light' ? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/20' : 'hover:bg-black/10 text-foreground/40'}`}
              >
                <Sun className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')}
              className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-card-bg transition-all text-xs font-black uppercase tracking-tighter hover:text-brand-yellow"
            >
              <Globe className="w-4 h-4 text-brand-blue" />
              {lang}
            </button>

            <div className="w-px h-6 bg-card-border mx-2" />

            <Link
              href="/cart"
              className="relative p-2.5 rounded-xl group hover:bg-card-bg transition-colors"
              title="Shopping Cart"
            >
              <ShoppingCart className="w-5 h-5 text-foreground/70 group-hover:text-brand-yellow transition-colors" />
              {mounted && cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-brand-yellow text-white text-[10px] flex items-center justify-center rounded-full font-black shadow-lg border-2 border-background">
                  {cartCount}
                </span>
              )}
            </Link>

            <div className="flex gap-2 items-center ml-2">
              {user ? (
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDropdownOpen(!dropdownOpen);
                    }}
                    className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-blue/20 to-brand-yellow/20 border border-brand-blue/30 flex items-center justify-center hover:scale-[1.05] transition-all shadow-lg hover:shadow-brand-blue/10"
                    title="User profile"
                  >
                    <UserIcon className="w-5 h-5 text-brand-blue" />
                  </button>
                  
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-3 w-64 bg-background/95 backdrop-blur-3xl border border-white/10 rounded-[1.5rem] shadow-2xl p-4 flex flex-col gap-2 z-[999] animate-reveal">
                      <div className="px-3 py-2.5 border-b border-white/10 mb-1.5 text-left">
                        <span className="block text-[9px] font-black uppercase tracking-widest text-slate-500">Compte</span>
                        <span className="block text-xs font-bold text-white truncate max-w-full mt-0.5" title={user.email}>{user.email}</span>
                      </div>
                      
                      <Link
                        href="/account/orders"
                        className="flex items-center gap-3 px-3 py-3 rounded-xl text-left text-xs font-black uppercase tracking-wider text-slate-400 hover:text-white hover:bg-white/5 transition-all"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <Clipboard className="w-4 h-4 text-brand-blue" />
                        {lang === 'fr' ? 'Mes commandes' : 'My Orders'}
                      </Link>
                      
                      <button
                        onClick={handleSignOut}
                        className="flex items-center gap-3 px-3 py-3 rounded-xl text-left text-xs font-black uppercase tracking-wider text-rose-400 hover:text-rose-300 hover:bg-rose-500/5 transition-all w-full"
                      >
                        <LogOut className="w-4 h-4" />
                        {lang === 'fr' ? 'Déconnexion' : 'Sign Out'}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <button
                    onClick={() => openAuthModal('login')}
                    className="px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-card-bg hover:text-brand-blue transition-all"
                  >
                    {t.login}
                  </button>
                  <button
                    onClick={() => openAuthModal('signup')}
                    className="px-5 py-2.5 rounded-xl text-sm font-black bg-brand-blue text-white hover:bg-brand-blue/80 shadow-lg shadow-brand-blue/20 hover:scale-[1.05] active:scale-[0.98] transition-all"
                  >
                    {t.signup}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
