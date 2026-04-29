'use client';
import Link from "next/link";
import { useApp } from "@/lib/store";
import { translations } from "@/lib/translations";
import { Boxes } from "lucide-react";

export function Footer() {
  const { lang } = useApp();
  const t = translations[lang];

  return (
    <footer id="contact" className="border-t border-card-border bg-card-bg py-12 mt-20">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="col-span-1 md:col-span-2">
          <div className="flex items-center gap-2 font-bold text-xl tracking-wider text-primary mb-4">
            <Boxes className="w-6 h-6" />
            BI4K
          </div>
          <p className="text-foreground/70 max-w-sm">{t.footerAbout}</p>
        </div>
        <div>
          <h4 className="font-bold mb-4">{t.footerContactTitle}</h4>
          <ul className="space-y-2 text-foreground/70">
            <li>contact@bi4k.com</li>
            <li>+212 555-0198</li>
            <li>
              <Link href="/help" className="hover:text-primary transition-colors">{t.support}</Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-4">{t.footerSocialTitle}</h4>
          <div className="flex gap-4">
            <a href="#" className="w-10 h-10 rounded-full bg-background flex items-center justify-center hover:text-primary transition-colors">X</a>
            <a href="#" className="w-10 h-10 rounded-full bg-background flex items-center justify-center hover:text-primary transition-colors">IG</a>
            <a href="#" className="w-10 h-10 rounded-full bg-background flex items-center justify-center hover:text-primary transition-colors">IN</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
