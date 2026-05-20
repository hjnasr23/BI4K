'use client';
import Link from "next/link";
import { useApp } from "@/lib/store";
import { translations } from "@/lib/translations";
import { Sun, Moon, Globe, Boxes, ShoppingCart, User as UserIcon, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useState, useEffect } from "react";
import { Clipboard } from "lucide-react";

export function Navbar() {
  const { lang, setLang, theme, setTheme, user, setIsAuthModalOpen } = useApp();
  const t = translations[lang];
  const supabase = createClient();
  const [scrolled, setScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

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
      // If mouse is within top 80px, show navbar and reset timer
      if (e.clientY < 80) {
        resetHideTimer();
      }
    };

    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
      resetHideTimer(); // Show on scroll as well
    };

    // Initial timer
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

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'} ${scrolled ? 'py-3' : 'py-5'}`}>
      <div className={`container mx-auto px-4 transition-all duration-500 ${scrolled ? 'max-w-5xl' : 'max-w-7xl'}`}>
        <div className={`glass rounded-2xl flex items-center justify-between px-6 py-2 transition-all duration-500 ${scrolled ? 'shadow-2xl shadow-primary/10 border-primary/20 bg-background/80' : 'bg-transparent border-transparent shadow-none'}`}>
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/25 group-hover:rotate-12 transition-transform duration-500">
              <Boxes className="w-6 h-6 text-white" />
            </div>
            <span className="font-black text-2xl tracking-tighter text-foreground group-hover:text-primary transition-colors">
              BI4K
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-10 text-[11px] font-black uppercase tracking-[0.2em] text-foreground/60">
            <Link href="/#services" className="hover:text-primary transition-colors">Services</Link>
            <Link href="/categories" className="hover:text-primary transition-colors">{t.catalog || "Categories"}</Link>
            <Link href="/help" className="hover:text-primary transition-colors">{t.help}</Link>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-card-bg rounded-full p-1 border border-card-border">
              <button
                onClick={() => setTheme('dark')}
                className={`p-2 rounded-full transition-all ${theme === 'dark' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'hover:bg-white/10 text-foreground/40'}`}
              >
                <Moon className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setTheme('light')}
                className={`p-2 rounded-full transition-all ${theme === 'light' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'hover:bg-black/10 text-foreground/40'}`}
              >
                <Sun className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')}
              className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-card-bg transition-all text-xs font-black uppercase tracking-tighter"
            >
              <Globe className="w-4 h-4 text-primary" />
              {lang}
            </button>

            <div className="w-px h-6 bg-card-border mx-2" />

            <button
              disabled
              className="relative p-2.5 rounded-xl cursor-not-allowed opacity-50 group"
              title="Cart feature coming soon"
            >
              <ShoppingCart className="w-5 h-5 text-foreground/70 group-hover:text-primary transition-colors" />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-white text-[10px] flex items-center justify-center rounded-full font-black shadow-lg border-2 border-background">
                0
              </span>
            </button>

            <div className="flex gap-2 items-center ml-2">
              {user ? (
                <div className="flex items-center gap-3 pl-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary/20 to-accent/20 border border-primary/30 flex items-center justify-center">
                    <UserIcon className="w-4 h-4 text-primary" />
                  </div>
                  <Link
                    href="/orders"
                    className="p-2 rounded-xl text-foreground/40 hover:text-primary hover:bg-primary/5 transition-all"
                    title="Orders"
                  >
                    <Clipboard className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="p-2 rounded-xl text-foreground/40 hover:text-accent hover:bg-accent/5 transition-all"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => setIsAuthModalOpen(true)}
                    className="px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-card-bg transition-all"
                  >
                    {t.login}
                  </button>
                  <button
                    onClick={() => setIsAuthModalOpen(true)}
                    className="px-5 py-2.5 rounded-xl text-sm font-black bg-primary text-white hover:bg-primary-hover shadow-lg shadow-primary/20 hover:scale-[1.05] active:scale-[0.98] transition-all"
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
