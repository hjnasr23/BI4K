'use client';

import { useState } from "react";
import { useApp } from "@/lib/store";
import { translations } from "@/lib/translations";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { HelpCircle, Truck, RefreshCcw, ShieldCheck, Mail, Search, X } from "lucide-react";

// Robust local Moroccan AI-powered customized printing FAQ dataset
interface FAQ {
  id: number;
  category: string;
  questionFr: string;
  questionEn: string;
  answerFr: string;
  answerEn: string;
}

const faqDataset: FAQ[] = [
  {
    id: 1,
    category: "IA & Design",
    questionFr: "Comment utiliser l'IA pour créer mon design ?",
    questionEn: "How to use AI to create my design?",
    answerFr: "Décrivez simplement votre idée en français ou anglais dans notre studio de création IA (ex: 'un astronaute de style cyberpunk sur fond noir'). Notre moteur génère plusieurs designs uniques en quelques secondes. Sélectionnez votre préféré pour l'appliquer sur le produit.",
    answerEn: "Simply describe your concept in French or English in our AI creation studio (e.g., 'a cyberpunk astronaut on a black background'). Our engine generates several unique designs in seconds. Choose your favorite to place on the product."
  },
  {
    id: 2,
    category: "Livraison",
    questionFr: "Quels sont les délais de livraison au Maroc ?",
    questionEn: "What are the delivery times in Morocco?",
    answerFr: "Nous livrons partout au Maroc en 24h à 48h ouvrables pour les grandes villes (Casablanca, Rabat, Marrakech, Tanger, Fès), et sous 3 à 4 jours pour les autres régions après production.",
    answerEn: "We ship all across Morocco. Shipping takes 24 to 48 business hours for major cities (Casablanca, Rabat, Marrakech, Tangier, Fez), and 3 to 4 days for other regions after production."
  },
  {
    id: 3,
    category: "Retours",
    questionFr: "Puis-je retourner un article personnalisé ?",
    questionEn: "Can I return a customized item?",
    answerFr: "Les articles personnalisés étant fabriqués sur mesure avec vos designs uniques, ils ne peuvent pas être retournés sauf en cas de défaut de fabrication évident ou d'erreur de taille de notre part.",
    answerEn: "Because customized products are manufactured on demand with your unique design, they cannot be returned unless there is an obvious manufacturing defect or a sizing error from our side."
  },
  {
    id: 4,
    category: "Paiement",
    questionFr: "Quels sont les moyens de paiement acceptés ?",
    questionEn: "What payment methods are accepted?",
    answerFr: "Nous acceptons le paiement en espèces à la livraison partout au Maroc (Cash on Delivery), ainsi que le paiement en ligne sécurisé par carte bancaire marocaine (CMI) et internationale.",
    answerEn: "We accept Cash on Delivery (COD) anywhere in Morocco, as well as secure online credit card payments (domestic Moroccan CMI and international cards)."
  },
  {
    id: 5,
    category: "Commandes",
    questionFr: "Comment suivre ma commande ?",
    questionEn: "How do I track my order?",
    answerFr: "Dès que votre commande est expédiée, un numéro de suivi Amana ou par notre livreur privé vous est envoyé par SMS et e-mail. Vous pouvez également la suivre sur votre profil BI4K.",
    answerEn: "As soon as your order is shipped, a tracking number from Amana or our private courier will be sent to you via SMS and email. You can also monitor it in your BI4K profile page."
  },
  {
    id: 6,
    category: "Produits",
    questionFr: "Quelle est la qualité des t-shirts et hoodies ?",
    questionEn: "What is the quality of the t-shirts and hoodies?",
    answerFr: "Nous utilisons exclusivement du coton 100% premium peigné (280g/m² pour les hoodies, 190g/m² pour les t-shirts) offrant un confort optimal et une excellente longévité d'impression.",
    answerEn: "We exclusively use 100% premium combed cotton (280gsm for hoodies, 190gsm for t-shirts), offering optimal comfort and outstanding print longevity."
  },
  {
    id: 7,
    category: "IA & Design",
    questionFr: "Quels formats d'images puis-je téléverser ?",
    questionEn: "What image formats can I upload?",
    answerFr: "Vous pouvez téléverser des fichiers au format PNG (recommandé avec fond transparent), JPG, ou SVG. La taille maximale conseillée est de 15 Mo pour garantir une haute résolution.",
    answerEn: "You can upload files in PNG format (recommended with transparent background), JPG, or SVG. The recommended maximum file size is 15MB to ensure high resolution."
  },
  {
    id: 8,
    category: "Commandes",
    questionFr: "Puis-je modifier ma commande après validation ?",
    questionEn: "Can I modify my order after confirmation?",
    answerFr: "Étant donné que notre système lance la production de manière automatisée, vous disposez d'un délai maximal de 2 heures après la validation pour modifier ou annuler votre commande en contactant le support.",
    answerEn: "Since our automated systems launch production quickly, you have a maximum window of 2 hours after confirmation to modify or cancel your order by contacting support."
  },
  {
    id: 9,
    category: "Livraison",
    questionFr: "La livraison est-elle gratuite ?",
    questionEn: "Is delivery free?",
    answerFr: "La livraison est gratuite au Maroc pour toute commande supérieure à 500 MAD. Pour les commandes inférieures, les frais d'expédition fixes s'élèvent à 35 MAD.",
    answerEn: "Shipping is free in Morocco for all orders above 500 MAD. For orders below this threshold, a flat delivery fee of 35 MAD applies."
  },
  {
    id: 10,
    category: "Produits",
    questionFr: "Quelles technologies d'impression utilisez-vous ?",
    questionEn: "What printing technologies do you use?",
    answerFr: "Nous combinons l'impression Direct-to-Garment (DTG) haut de gamme et le Direct-to-Film (DTF) de pointe pour reproduire fidèlement les détails fins et les couleurs éclatantes de vos designs IA.",
    answerEn: "We combine high-end Direct-to-Garment (DTG) and advanced Direct-to-Film (DTF) technologies to faithfully reproduce the fine details and vibrant colors of your AI designs."
  },
  {
    id: 11,
    category: "Produits",
    questionFr: "Comment laver mon vêtement personnalisé ?",
    questionEn: "How should I wash my customized garment?",
    answerFr: "Nous vous conseillons de laver vos vêtements à l'envers, à 30°C maximum en cycle délicat. Évitez le sèche-linge et repassez à l'envers pour protéger l'impression.",
    answerEn: "We recommend washing your garments inside out, at a maximum of 30°C on a delicate cycle. Avoid tumble drying and iron inside out to preserve the print."
  },
  {
    id: 12,
    category: "IA & Design",
    questionFr: "Comment l'IA garantit-elle une haute résolution ?",
    questionEn: "How does the AI guarantee high resolution?",
    answerFr: "Toutes les images générées par notre IA passent automatiquement par notre outil d'upscaling de pointe qui multiplie par 4 la résolution (jusqu'à 4K) avant l'impression.",
    answerEn: "All AI-generated images automatically pass through our state-of-the-art upscaler, which quadruples the resolution (up to 4K quality) prior to production."
  },
  {
    id: 13,
    category: "Paiement",
    questionFr: "Fournissez-vous des factures pour les entreprises ?",
    questionEn: "Do you provide corporate invoices?",
    answerFr: "Oui, absolument. Lors de la validation, cochez l'option entreprise pour ajouter vos coordonnées de facturation (ICE, Identifiant Fiscal, etc.) pour recevoir votre facture conforme par email.",
    answerEn: "Yes, absolutely. During checkout, tick the business option to input your corporate details (ICE, tax ID, etc.) and receive a compliant invoice automatically by email."
  },
  {
    id: 14,
    category: "Support",
    questionFr: "Que faire si l'impression a un défaut ?",
    questionEn: "What should I do if the print is defective?",
    answerFr: "Si vous constatez le moindre défaut à la réception, prenez une photo nette du produit et contactez notre support client sous 48h. Nous réimprimerons et réexpédierons votre article gratuitement.",
    answerEn: "If you notice any defect upon delivery, take a clear photo of the product and contact our support team within 48h. We will reprint and reship your item free of charge."
  },
  {
    id: 15,
    category: "Commandes",
    questionFr: "Puis-je commander en gros ?",
    questionEn: "Can I place a bulk order?",
    answerFr: "Oui! Pour les commandes de plus de 10 pièces (événements, associations, startups), contactez notre service commercial pour bénéficier de tarifs dégressifs avantageux.",
    answerEn: "Yes! For orders exceeding 10 items (corporate events, student groups, startups), contact our sales team to receive volume discount pricing."
  },
  {
    id: 16,
    category: "Produits",
    questionFr: "Proposez-vous d'autres produits que des vêtements ?",
    questionEn: "Do you offer products other than clothing?",
    answerFr: "Oui, notre catalogue comprend également des mugs en céramique, des coques de protection 3D pour mobiles, et des toiles canvas artistiques de haute qualité.",
    answerEn: "Yes, our catalog also includes premium ceramic mugs, 3D protective mobile phone cases, and high-quality artistic canvas art frames."
  }
];

export default function HelpPage() {
  const { lang } = useApp();
  const t = translations[lang];

  const isFr = lang === 'fr';

  // Search logic and modal states
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFaq, setActiveFaq] = useState<FAQ | null>(null);

  // Dynamic filter logic based on matching active language fields
  const filteredFaqs = faqDataset.filter((faq) => {
    const query = searchQuery.toLowerCase();
    const qText = (isFr ? faq.questionFr : faq.questionEn).toLowerCase();
    const aText = (isFr ? faq.answerFr : faq.answerEn).toLowerCase();
    return qText.includes(query) || aText.includes(query);
  });

  const helpCards = [
    { 
      title: t.helpCard1Title, 
      desc: t.helpCard1Desc, 
      icon: Truck,
      iconBg: "bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400"
    },
    { 
      title: t.helpCard2Title, 
      desc: t.helpCard2Desc, 
      icon: RefreshCcw,
      iconBg: "bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400"
    },
    { 
      title: t.helpCard3Title, 
      desc: t.helpCard3Desc, 
      icon: HelpCircle,
      iconBg: "bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400"
    },
    { 
      title: t.helpCard4Title, 
      desc: t.helpCard4Desc, 
      icon: ShieldCheck,
      iconBg: "bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400"
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] text-neutral-900 dark:text-white transition-colors duration-500">
      <Navbar />
      
      <style>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient {
          animation: gradient 6s ease infinite;
        }
      `}</style>

      <main className="max-w-7xl mx-auto px-6 lg:px-8 pt-32 pb-24">
        
        {/* Hero Section & Background glows */}
        <div className="text-center max-w-3xl mx-auto mb-20 relative py-12">
          {/* Subtle Background Glows */}
          <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-72 h-72 rounded-full bg-blue-500 blur-[120px] opacity-20 pointer-events-none z-0" />
          <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-72 h-72 rounded-full bg-amber-500 blur-[120px] opacity-20 pointer-events-none z-0" />

          {/* Heading with Animated Brand Gradient */}
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight leading-tight relative z-10 mb-4">
            <span className="bg-gradient-to-r from-blue-500 via-amber-500 to-blue-500 bg-[length:200%_auto] bg-clip-text text-transparent font-extrabold animate-gradient">
              {t.helpHeroTitle}
            </span>
          </h1>
          
          <p className="text-neutral-500 dark:text-neutral-400 text-lg md:text-xl font-medium max-w-2xl mx-auto relative z-10">
            {t.helpHeroDesc}
          </p>

          {/* Functional Search Bar with premium Dropdown */}
          <div className="mt-10 max-w-2xl mx-auto relative z-30">
            <div className="backdrop-blur-md bg-neutral-50/80 dark:bg-white/5 border border-neutral-300 dark:border-white/10 rounded-full px-6 py-4 flex items-center shadow-sm dark:shadow-none focus-within:border-blue-500/50 transition-colors">
              <Search className="w-5 h-5 text-neutral-400 dark:text-neutral-500 mr-3" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isFr ? "Rechercher une question (ex: Livraison, IA...)" : "Search a question (e.g. Delivery, AI...)"} 
                className="bg-transparent border-none outline-none w-full text-sm text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500"
              />
              {searchQuery.length > 0 && (
                <button 
                  onClick={() => setSearchQuery("")}
                  className="p-1 rounded-full text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200 dark:hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Premium Results Dropdown */}
            {searchQuery.length > 0 && (
              <div className="absolute w-full left-0 mt-2 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl border border-neutral-200 dark:border-white/10 shadow-2xl rounded-2xl max-h-[400px] overflow-y-auto z-50 text-left p-2 animate-in fade-in slide-in-from-top-2 duration-200">
                {filteredFaqs.length > 0 ? (
                  filteredFaqs.map((faq) => {
                    const question = isFr ? faq.questionFr : faq.questionEn;
                    const answer = isFr ? faq.answerFr : faq.answerEn;
                    return (
                      <div 
                        key={faq.id} 
                        onClick={() => {
                          setActiveFaq(faq);
                          setSearchQuery("");
                        }}
                        className="p-4 hover:bg-neutral-100 dark:hover:bg-white/5 rounded-xl transition-colors cursor-pointer border-b border-neutral-100 dark:border-white/5 last:border-0"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-extrabold text-neutral-900 dark:text-white text-sm">
                            {question}
                          </span>
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400">
                            {faq.category}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-1">
                          {answer}
                        </p>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-8 text-center text-neutral-500 dark:text-neutral-400 text-sm">
                    {isFr ? (
                      <>Aucun résultat trouvé pour "{searchQuery}"</>
                    ) : (
                      <>No results found for "{searchQuery}"</>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-24 relative z-10">
          {helpCards.map((card, i) => {
            const Icon = card.icon;
            return (
              <div 
                key={i} 
                className="backdrop-blur-md bg-white dark:bg-white/5 border border-neutral-200 dark:border-white/10 rounded-3xl p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:hover:bg-white/10 cursor-pointer group text-center"
              >
                <div className={`${card.iconBg} p-3 rounded-full mb-6 inline-block transition-transform group-hover:scale-110`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-lg text-neutral-900 dark:text-white mb-2 tracking-tight">
                  {card.title}
                </h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed font-medium">
                  {card.desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* Contact Support Premium Banner */}
        <section className="bg-gradient-to-r from-blue-600/10 to-amber-500/10 dark:from-blue-900/40 dark:to-amber-900/20 border border-blue-200 dark:border-blue-500/20 rounded-[2.5rem] p-12 md:p-16 text-center max-w-5xl mx-auto shadow-sm relative overflow-hidden">
          {/* Subtle overlay decorative circle */}
          <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -top-16 -right-16 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

          <h2 className="text-3xl md:text-4xl font-extrabold text-neutral-900 dark:text-white mb-4 tracking-tight uppercase">
            {t.contactSectionTitle}
          </h2>
          
          <p className="text-neutral-500 dark:text-neutral-400 text-base md:text-lg font-medium max-w-xl mx-auto">
            {t.contactSectionDesc}
          </p>
          
          <a 
            href="mailto:support@bi4k.com" 
            className="bg-blue-600 text-white rounded-full px-8 py-4 font-semibold shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 hover:-translate-y-1 transition-all duration-300 inline-flex items-center gap-2 mt-8 text-sm uppercase tracking-wide cursor-pointer"
          >
            <Mail className="w-4 h-4" />
            {isFr ? "Contacter le Support" : "Contact Support"}
          </a>
        </section>
      </main>

      {/* Modern Interactive Modal popup for reading full FAQ details */}
      {activeFaq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 md:p-8 max-w-xl w-full shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setActiveFaq(null)}
              className="absolute top-4 right-4 p-2 rounded-xl text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
              aria-label={isFr ? "Fermer" : "Close"}
            >
              <X className="w-5 h-5" />
            </button>

            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 inline-block mb-3">
              {activeFaq.category}
            </span>

            <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-4 pr-8">
              {isFr ? activeFaq.questionFr : activeFaq.questionEn}
            </h3>

            <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
              {isFr ? activeFaq.answerFr : activeFaq.answerEn}
            </p>

            <div className="mt-6 pt-4 border-t border-neutral-100 dark:border-neutral-900 flex justify-end">
              <button
                onClick={() => setActiveFaq(null)}
                className="px-5 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-black font-semibold text-sm transition-colors cursor-pointer"
              >
                {isFr ? "Fermer" : "Close"}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
