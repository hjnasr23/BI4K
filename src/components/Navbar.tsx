'use client';
import Link from "next/link";
import { useApp } from "@/lib/store";
import { translations } from "@/lib/translations";
import { useTheme } from "next-themes";
import { Sun, Moon, Globe, Boxes, Menu, X } from "lucide-react";
import { useState } from "react";

export function Navbar() {
  const { lang, setLang } = useApp();
  const { theme, setTheme } = useTheme();
  const t = translations[lang];
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between p-4 bg-background/80 backdrop-blur-md border-b border-card-border transition-all duration-300">
      <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-wider text-primary hover:scale-110 transition-transform">
        <Boxes className="w-8 h-8" />
        BI4K
      </Link>
      
      <div className="hidden md:flex items-center gap-8 text-sm font-medium">
        <Link href="/categories" className="hover:text-primary transition-colors duration-300 relative group">
          {t.catalog || "Categories"}
          <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
        </Link>
        <Link href="/help" className="hover:text-primary transition-colors duration-300 relative group">
          {t.help}
          <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
        </Link>
        <Link href="/#contact" className="hover:text-primary transition-colors duration-300 relative group">
          {t.contact}
          <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <button 
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 rounded-full hover:bg-card-bg transition-all duration-300 hover:scale-110"
          title="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
        
        <button 
          onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')}
          className="flex items-center gap-1 p-2 rounded-full hover:bg-card-bg transition-all duration-300 text-sm font-bold uppercase hover:scale-110"
        >
          <Globe className="w-5 h-5" />
          {lang}
        </button>

        <div className="hidden md:flex gap-2">
          <Link href="/login" className="px-4 py-2 rounded-md font-medium hover:bg-card-bg border border-transparent transition-all duration-300">
            {t.login}
          </Link>
          <Link href="/signup" className="px-4 py-2 rounded-md font-medium bg-gradient-to-r from-primary to-primary-hover text-white hover:shadow-lg hover:shadow-primary/30 transition-all duration-300">
            {t.signup}
          </Link>
        </div>

        {/* Mobile menu button */}
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 rounded-full hover:bg-card-bg transition-colors"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 bg-background border-b border-card-border p-4 md:hidden animate-slideIn">
          <div className="flex flex-col gap-3">
            <Link href="/categories" className="py-2 px-3 hover:text-primary hover:bg-card-bg rounded transition-colors">{t.catalog}</Link>
            <Link href="/help" className="py-2 px-3 hover:text-primary hover:bg-card-bg rounded transition-colors">{t.help}</Link>
            <Link href="/#contact" className="py-2 px-3 hover:text-primary hover:bg-card-bg rounded transition-colors">{t.contact}</Link>
            <div className="flex gap-2 mt-2 pt-2 border-t border-card-border">
              <Link href="/login" className="flex-1 px-3 py-2 rounded text-sm text-center border border-card-border hover:bg-card-bg transition-colors">{t.login}</Link>
              <Link href="/signup" className="flex-1 px-3 py-2 rounded text-sm text-center font-bold bg-primary text-white hover:bg-primary-hover transition-colors">{t.signup}</Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
