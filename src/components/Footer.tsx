'use client';
import Link from "next/link";
import { useApp } from "@/lib/store";
import { translations } from "@/lib/translations";
import { Boxes, X, Share2, Link as LinkIcon, GitBranch, Mail, MapPin, Phone } from "lucide-react";

export function Footer() {
  const { lang } = useApp();
  const t = translations[lang];

  return (
    <footer id="contact" className="relative border-t border-card-border bg-background pt-24 pb-12 mt-20 overflow-hidden">
      {/* Decorative Gradient */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-20">
          <div className="col-span-1 md:col-span-2 space-y-8">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform">
                <Boxes className="w-6 h-6 text-white" />
              </div>
              <span className="font-black text-2xl tracking-tighter uppercase">BI4K</span>
            </Link>
            <p className="text-foreground/40 text-lg font-medium max-w-sm leading-relaxed">
              {t.footerAbout}
            </p>
            <div className="flex gap-4">
              {[X, Share2, LinkIcon, GitBranch].map((Icon, i) => (
                <a 
                  key={i} 
                  href="#" 
                  className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-foreground/40 hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all group"
                >
                  <Icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-8">{t.footerContactTitle}</h4>
            <ul className="space-y-6">
              <li className="flex items-center gap-4 text-foreground/60 hover:text-primary transition-colors cursor-pointer group">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                  <Mail className="w-4 h-4" />
                </div>
                <span className="text-sm font-bold">studio@bi4k.com</span>
              </li>
              <li className="flex items-center gap-4 text-foreground/60 hover:text-primary transition-colors cursor-pointer group">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                  <Phone className="w-4 h-4" />
                </div>
                <span className="text-sm font-bold">+212 600-000000</span>
              </li>
              <li className="flex items-center gap-4 text-foreground/60 hover:text-primary transition-colors cursor-pointer group">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                  <MapPin className="w-4 h-4" />
                </div>
                <span className="text-sm font-bold">Casablanca, Morocco</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-8">Navigation</h4>
            <ul className="space-y-4">
              {['Services', 'Materials', 'Catalog', 'Help Center', 'Privacy Policy'].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-sm font-bold text-foreground/40 hover:text-foreground transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-12 border-t border-card-border flex flex-col md:flex-row justify-between items-center gap-8">
           <p className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/20">
             © 2026 BI4K Digital Manufacturing Studio. All Rights Reserved.
           </p>
           <div className="flex gap-8 items-center text-[10px] font-black uppercase tracking-[0.2em] text-foreground/20">
              <span className="hover:text-primary cursor-pointer transition-colors">Terms of Service</span>
              <span className="hover:text-primary cursor-pointer transition-colors">Cookie Policy</span>
           </div>
        </div>
      </div>
    </footer>
  );
}
