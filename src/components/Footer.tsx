'use client';
import Link from "next/link";
import { useApp } from "@/lib/store";
import { translations } from "@/lib/translations";
import { Boxes, Mail, Phone, MapPin } from "lucide-react";

export function Footer() {
  const { lang } = useApp();
  const t = translations[lang];

  // Social media links with custom rendering
  const socialLinks = [
    { name: "X", href: "https://twitter.com", emoji: "𝕏", color: "hover:text-blue-400" },
    { name: "Facebook", href: "https://facebook.com", emoji: "f", color: "hover:text-blue-600" },
    { name: "Instagram", href: "https://instagram.com", emoji: "📷", color: "hover:text-pink-500" },
    { name: "LinkedIn", href: "https://linkedin.com", emoji: "in", color: "hover:text-blue-700" },
    { name: "YouTube", href: "https://youtube.com", emoji: "▶", color: "hover:text-red-600" },
  ];

  return (
    <footer id="contact" className="border-t border-card-border bg-card-bg py-16 mt-20">
      <div className="container mx-auto px-4">
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 font-bold text-xl tracking-wider text-primary mb-4">
              <Boxes className="w-6 h-6" />
              BI4K
            </div>
            <p className="text-foreground/70 max-w-sm leading-relaxed mb-6">{t.footerAbout}</p>
            
            {/* Social Icons */}
            <div>
              <h4 className="font-semibold text-sm mb-3 uppercase tracking-wide">{t.footerSocialTitle}</h4>
              <div className="flex gap-3">
                {socialLinks.map((social) => {
                  return (
                    <a
                      key={social.name}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`w-10 h-10 rounded-full bg-background border border-card-border flex items-center justify-center transition-all duration-300 hover:scale-110 font-bold text-xs ${social.color}`}
                      title={social.name}
                      aria-label={social.name}
                    >
                      <span>{social.emoji}</span>
                    </a>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Contact Section */}
          <div>
            <h4 className="font-bold mb-4 text-sm uppercase tracking-wide">{t.footerContactTitle}</h4>
            <ul className="space-y-3 text-foreground/70">
              <li className="flex items-center gap-2 hover:text-primary transition-colors">
                <Mail className="w-4 h-4 text-primary flex-shrink-0" />
                <a href="mailto:contact@bi4k.com">contact@bi4k.com</a>
              </li>
              <li className="flex items-center gap-2 hover:text-primary transition-colors">
                <Phone className="w-4 h-4 text-primary flex-shrink-0" />
                <a href="tel:+212555198">+212 555-0198</a>
              </li>
              <li className="flex items-center gap-2 hover:text-primary transition-colors">
                <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                <span>Maroc</span>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold mb-4 text-sm uppercase tracking-wide">{lang === 'fr' ? 'Ressources' : 'Resources'}</h4>
            <ul className="space-y-2 text-foreground/70">
              <li>
                <Link href="/help" className="hover:text-primary transition-colors">{t.help}</Link>
              </li>
              <li>
                <Link href="/categories" className="hover:text-primary transition-colors">{t.catalog}</Link>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">{lang === 'fr' ? 'Conditions' : 'Terms'}</a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">{lang === 'fr' ? 'Confidentialité' : 'Privacy'}</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-card-border pt-8 flex flex-col md:flex-row items-center justify-between text-sm text-foreground/60">
          <p>&copy; 2024 BI4K. {lang === 'fr' ? 'Tous droits réservés.' : 'All rights reserved.'}</p>
          <p>{lang === 'fr' ? 'Fabriqué avec ❤️ au Maroc' : 'Made with ❤️ in Morocco'}</p>
        </div>
      </div>
    </footer>
  );
}
