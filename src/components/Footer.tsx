'use client';

import { useState } from "react";
import Link from "next/link";
import { useApp } from "@/lib/store";
import { translations } from "@/lib/translations";
import { Boxes } from "lucide-react";

// Standardized, high-quality inline SVG icons matching design specifications
const XIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const LinkedInIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const InstagramIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const MailIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const PhoneIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

const MapPinIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

export function Footer() {
  const { lang } = useApp();
  const t = translations[lang];

  // State for controlling the Legal Documents Modal
  const [modalType, setModalType] = useState<'terms' | 'privacy' | null>(null);

  // Dynamic Translations & Slogans
  const isFr = lang === 'fr';
  const slogan = isFr 
    ? "Studio d'impression intelligent et de personnalisation sur mesure au Maroc."
    : "Intelligent printing studio and custom manufacturing in Morocco.";

  const navTitle = isFr ? "Navigation" : "Navigation";
  const contactTitle = t.footerContactTitle || (isFr ? "Contact" : "Contact");
  const termsLabel = isFr ? "Conditions d'utilisation" : "Terms of Service";
  const privacyLabel = isFr ? "Politique de confidentialité" : "Privacy Policy";
  const closeLabel = isFr ? "Fermer" : "Close";

  // Legal Content Dict
  const legalContent = {
    terms: {
      title: termsLabel,
      paragraphs: isFr ? [
        "Bienvenue sur BI4K. En utilisant nos services d'impression à la demande et de personnalisation assistée par IA, vous acceptez nos conditions générales d'utilisation.",
        "Toutes les créations réalisées via notre outil de génération par intelligence artificielle restent sous votre entière responsabilité. Vous garantissez détenir les droits nécessaires sur les contenus téléversés ou formulés.",
        "Nous nous engageons à fournir des produits de haute qualité fabriqués et livrés au Maroc dans les meilleurs délais. Les délais de livraison varient de 24h à 48h selon la ville de destination."
      ] : [
        "Welcome to BI4K. By using our on-demand printing and AI-assisted customization services, you agree to our general terms of service.",
        "All designs generated through our artificial intelligence suite remain your full responsibility. You warrant that you hold all necessary rights to any uploaded or prompted content.",
        "We are dedicated to delivering premium quality products manufactured and shipped across Morocco efficiently. Delivery times range from 24 to 48 hours depending on your city."
      ]
    },
    privacy: {
      title: privacyLabel,
      paragraphs: isFr ? [
        "Chez BI4K, nous accordons une importance primordiale au respect de votre vie privée et à la sécurité de vos données.",
        "Vos données personnelles (nom, adresse de livraison, numéro de téléphone, adresse email) sont collectées exclusivement dans le but de traiter vos commandes et de vous garantir une expédition sécurisée.",
        "Nous ne partageons, ne vendons et ne transférons en aucun cas vos informations à des tiers à des fins marketing ou publicitaires."
      ] : [
        "At BI4K, we place a paramount importance on protecting your privacy and securing your personal data.",
        "Your personal information (name, delivery address, phone number, email address) is collected exclusively for processing your custom orders and ensuring secure delivery.",
        "We never share, sell, or transfer your information to third parties for marketing or commercial advertising purposes."
      ]
    }
  };

  return (
    <footer id="contact" className="border-t border-neutral-200 dark:border-white/5 bg-white dark:bg-black pt-16 pb-12 w-full mt-20 relative">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Card 1: Branding & Description */}
          <div className="bg-neutral-50 dark:bg-neutral-900/30 border border-neutral-200/60 dark:border-white/5 rounded-2xl p-8 flex flex-col justify-between space-y-6">
            <div>
              <Link href="/" className="flex items-center gap-3 group w-fit">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-blue to-brand-yellow flex items-center justify-center shadow-sm group-hover:rotate-6 transition-transform">
                  <Boxes className="w-5 h-5 text-white" />
                </div>
                <span className="font-extrabold text-xl tracking-tight text-neutral-900 dark:text-white uppercase">BI4K</span>
              </Link>
              <p className="text-neutral-500 dark:text-neutral-400 text-sm leading-relaxed mt-4 max-w-sm">
                {slogan}
              </p>
            </div>
            
            <div className="flex gap-3">
              <a 
                href="https://x.com/bi4k" 
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400 hover:text-brand-blue hover:border-brand-blue/30 dark:hover:border-brand-blue/30 transition-colors flex items-center justify-center"
                aria-label="X"
              >
                <XIcon />
              </a>
              <a 
                href="https://linkedin.com/company/bi4k" 
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400 hover:text-brand-blue hover:border-brand-blue/30 dark:hover:border-brand-blue/30 transition-colors flex items-center justify-center"
                aria-label="LinkedIn"
              >
                <LinkedInIcon />
              </a>
              <a 
                href="https://instagram.com/bi4k" 
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400 hover:text-brand-blue hover:border-brand-blue/30 dark:hover:border-brand-blue/30 transition-colors flex items-center justify-center"
                aria-label="Instagram"
              >
                <InstagramIcon />
              </a>
            </div>
          </div>

          {/* Card 2: Quick Links */}
          <div className="bg-neutral-50 dark:bg-neutral-900/30 border border-neutral-200/60 dark:border-white/5 rounded-2xl p-8 flex flex-col justify-between">
            <div>
              <h4 className="text-neutral-900 dark:text-white font-semibold text-base mb-6 tracking-wide">
                {navTitle}
              </h4>
              <ul className="grid grid-cols-1 gap-4">
                <li>
                  <Link href="/" className="text-neutral-900 dark:text-white text-sm font-medium hover:text-brand-blue transition-colors duration-200">
                    {isFr ? "Accueil" : "Home"}
                  </Link>
                </li>
                <li>
                  <Link href="/help" className="text-neutral-900 dark:text-white text-sm font-medium hover:text-brand-blue transition-colors duration-200">
                    {isFr ? "Centre d'Aide" : "Help Center"}
                  </Link>
                </li>
                <li>
                  <button 
                    onClick={() => setModalType('terms')}
                    className="text-neutral-500 dark:text-neutral-400 text-sm font-medium hover:text-brand-blue transition-colors duration-200 text-left cursor-pointer"
                  >
                    {termsLabel}
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setModalType('privacy')}
                    className="text-neutral-500 dark:text-neutral-400 text-sm font-medium hover:text-brand-blue transition-colors duration-200 text-left cursor-pointer"
                  >
                    {privacyLabel}
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Card 3: Contact Info */}
          <div className="bg-neutral-50 dark:bg-neutral-900/30 border border-neutral-200/60 dark:border-white/5 rounded-2xl p-8">
            <h4 className="text-neutral-900 dark:text-white font-semibold text-base mb-6 tracking-wide">
              {contactTitle}
            </h4>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-neutral-500 dark:text-neutral-400 hover:text-brand-blue transition-colors group">
                <span className="text-neutral-400 dark:text-neutral-500 group-hover:text-brand-blue transition-colors">
                  <MailIcon />
                </span>
                <a href="mailto:studio@bi4k.com" className="text-neutral-900 dark:text-white text-sm font-medium">
                  studio@bi4k.com
                </a>
              </li>
              <li className="flex items-center gap-3 text-neutral-500 dark:text-neutral-400 hover:text-brand-blue transition-colors group">
                <span className="text-neutral-400 dark:text-neutral-500 group-hover:text-brand-blue transition-colors">
                  <PhoneIcon />
                </span>
                <a href="tel:+212600000000" className="text-neutral-900 dark:text-white text-sm font-medium">
                  +212 600-000000
                </a>
              </li>
              <li className="group">
                <a 
                  href="https://www.google.com/maps/search/?api=1&query=Casablanca+Morocco"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-neutral-500 dark:text-neutral-400 hover:text-brand-blue transition-colors"
                >
                  <span className="text-neutral-400 dark:text-neutral-500 group-hover:text-brand-blue transition-colors">
                    <MapPinIcon />
                  </span>
                  <span className="text-neutral-900 dark:text-white text-sm font-medium">
                    Casablanca, Morocco
                  </span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright Footer Row */}
        <div className="mt-8 pt-8 border-t border-neutral-200 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
          <p className="text-neutral-500 dark:text-neutral-400 text-xs tracking-wider uppercase font-medium">
            © 2026 BI4K DIGITAL MANUFACTURING STUDIO. TOUS DROITS RÉSERVÉS.
          </p>
        </div>
      </div>

      {/* Modern Fixed Legal Modal */}
      {modalType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 md:p-8 max-w-2xl w-full shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setModalType(null)}
              className="absolute top-4 right-4 p-2 rounded-xl text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
              aria-label={closeLabel}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-4 pr-8">
              {legalContent[modalType].title}
            </h3>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
              {legalContent[modalType].paragraphs.map((p, idx) => (
                <p key={idx}>{p}</p>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-neutral-100 dark:border-neutral-900 flex justify-end">
              <button
                onClick={() => setModalType(null)}
                className="px-5 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-black font-semibold text-sm transition-colors cursor-pointer"
              >
                {closeLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
}
