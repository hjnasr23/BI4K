'use client';
import Link from "next/link";
import { useApp } from "@/lib/store";
import { translations } from "@/lib/translations";
import { useTheme } from "next-themes";
import { Sun, Moon, Globe, Boxes } from "lucide-react";

export function Navbar() {
  const { lang, setLang } = useApp();
  const { theme, setTheme } = useTheme();
  const t = translations[lang];

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between p-4 bg-background/80 backdrop-blur-md border-b border-card-border">
      <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-wider text-primary">
        <Boxes className="w-8 h-8" />
        BI4K
      </Link>
      
      <div className="hidden md:flex items-center gap-6 text-sm font-medium">
        <Link href="/#services" className="hover:text-primary transition-colors">Services</Link>
        <Link href="/#materials" className="hover:text-primary transition-colors">Materials</Link>
        <Link href="/categories" className="hover:text-primary transition-colors">{t.catalog || "Categories"}</Link>
        <Link href="/help" className="hover:text-primary transition-colors">{t.help}</Link>
        <Link href="/#contact" className="hover:text-primary transition-colors">{t.contact}</Link>
      </div>

      <div className="flex items-center gap-4">
        <button 
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 rounded-full hover:bg-card-bg transition-colors"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
        
        <button 
          onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')}
          className="flex items-center gap-1 p-2 rounded-full hover:bg-card-bg transition-colors text-sm font-bold uppercase"
        >
          <Globe className="w-5 h-5" />
          {lang}
        </button>

        <div className="hidden md:flex gap-2">
          <Link href="/login" className="px-4 py-2 rounded-md font-medium hover:bg-card-bg border border-transparent transition-colors">
            {t.login}
          </Link>
          <Link href="/signup" className="px-4 py-2 rounded-md font-medium bg-primary text-white hover:bg-primary-hover transition-colors">
            {t.signup}
          </Link>
        </div>
      </div>
    </nav>
  );
}
