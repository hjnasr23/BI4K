'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/store';
import { translations } from '@/lib/translations';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Search, ChevronDown, HelpCircle, Lightbulb, Lock, Truck, ArrowLeft } from 'lucide-react';

interface FAQ {
  id: number;
  titleFr: string;
  titleEn: string;
  descFr: string;
  descEn: string;
  keywordsFr: string[];
  keywordsEn: string[];
  category: 'orders' | 'returns' | 'ai' | 'payment';
}

const faqData: FAQ[] = [
  {
    id: 1,
    titleFr: 'Combien de temps faut-il pour recevoir ma commande ?',
    titleEn: 'How long does it take to receive my order?',
    descFr: 'En général, nos délais de livraison sont de 24h à 48h partout au Maroc, après la validation de votre design. Pour les zones éloignées, comptez 48h à 72h.',
    descEn: 'Generally, our delivery times are 24 to 48 hours throughout Morocco, after your design is validated. For remote areas, allow 48 to 72 hours.',
    keywordsFr: ['délai', 'livraison', 'temps', 'commande', 'réception', 'expédition'],
    keywordsEn: ['delivery', 'time', 'order', 'shipping', 'receive', 'timeline'],
    category: 'orders',
  },
  {
    id: 2,
    titleFr: 'Comment fonctionne la personnalisation par IA ?',
    titleEn: 'How does AI customization work?',
    descFr: 'Il vous suffit de décrire l\'image que vous avez en tête (ex: "Un chat astronaute style cyberpunk"). Notre IA génère plusieurs options en quelques secondes. Vous choisissez la meilleure pour l\'imprimer. Vous pouvez affiner les résultats autant que vous le souhaitez.',
    descEn: 'Simply describe the image you have in mind (ex: "A cyberpunk astronaut cat"). Our AI generates several options in seconds. You choose the best one to print. You can refine the results as much as you like.',
    keywordsFr: ['IA', 'intelligence artificielle', 'personnalisation', 'design', 'génération', 'image'],
    keywordsEn: ['AI', 'artificial intelligence', 'customization', 'design', 'generation', 'image'],
    category: 'ai',
  },
  {
    id: 3,
    titleFr: 'Puis-je payer à la livraison ?',
    titleEn: 'Can I pay on delivery?',
    descFr: 'Oui, absolument ! Nous proposons le paiement sécurisé en ligne via carte bancaire, ou le paiement en espèces à la livraison (Amana / Livreur privé). Vous avez plusieurs options flexibles.',
    descEn: 'Yes, absolutely! We offer secure online payment via credit card, or cash payment on delivery (Amana / Private Courier). You have several flexible options.',
    keywordsFr: ['paiement', 'livraison', 'espèces', 'carte', 'facile', 'sécurisé'],
    keywordsEn: ['payment', 'delivery', 'cash', 'card', 'easy', 'secure'],
    category: 'payment',
  },
  {
    id: 4,
    titleFr: 'Quels sont les délais de rétractation ?',
    titleEn: 'What is the return deadline?',
    descFr: 'Vous avez 14 jours à partir de la date de réception pour retourner votre article non utilisé. Les articles personnalisés peuvent être échangés en cas de défaut de fabrication uniquement.',
    descEn: 'You have 14 days from the date of receipt to return your unused item. Personalized items can be exchanged only in case of manufacturing defect.',
    keywordsFr: ['retour', 'échange', 'rétractation', 'jours', 'remboursement', 'défaut'],
    keywordsEn: ['return', 'exchange', 'refund', 'days', 'defect', 'back'],
    category: 'returns',
  },
  {
    id: 5,
    titleFr: 'Comment puis-je suivre ma commande ?',
    titleEn: 'How can I track my order?',
    descFr: 'Un numéro de suivi vous sera envoyé par email dès l\'expédition. Vous pouvez le vérifier sur notre site ou directement sur le site du livreur (Amana, Maroc Poste, etc.).',
    descEn: 'A tracking number will be sent to you by email as soon as it ships. You can verify it on our website or directly on the courier\'s website (Amana, Morocco Post, etc.).',
    keywordsFr: ['suivi', 'tracking', 'expédition', 'numéro', 'email', 'livreur'],
    keywordsEn: ['tracking', 'order', 'shipment', 'number', 'email', 'courier'],
    category: 'orders',
  },
  {
    id: 6,
    titleFr: 'Puis-je modifier mon design après la commande ?',
    titleEn: 'Can I modify my design after ordering?',
    descFr: 'Vous pouvez modifier votre commande dans les 2 heures suivant la commande, tant qu\'elle n\'a pas été envoyée en impression. Après, veuillez nous contacter directement.',
    descEn: 'You can modify your order within 2 hours of placing it, as long as it has not been sent to print. After that, please contact us directly.',
    keywordsFr: ['modification', 'design', 'changer', 'éditer', 'après', 'commande'],
    keywordsEn: ['modify', 'change', 'edit', 'design', 'after', 'order'],
    category: 'ai',
  },
  {
    id: 7,
    titleFr: 'La qualité de mes designs sera-t-elle bonne ?',
    titleEn: 'Will my AI designs be high quality?',
    descFr: 'Nos modèles IA génèrent des images haute résolution (4K et plus). Tous les designs sont vérifiés pour assurer une qualité d\'impression optimale avant production.',
    descEn: 'Our AI models generate high resolution images (4K and beyond). All designs are verified to ensure optimal print quality before production.',
    keywordsFr: ['qualité', 'résolution', 'image', 'impression', 'haute', 'AI'],
    keywordsEn: ['quality', 'resolution', 'image', 'print', 'high', 'AI'],
    category: 'ai',
  },
  {
    id: 8,
    titleFr: 'Quels produits supportent la personnalisation ?',
    titleEn: 'Which products support customization?',
    descFr: 'Tous nos produits (T-shirts, Hoodies, Mugs, Casquettes, Canvas) supportent la personnalisation par IA. Vous pouvez aussi importer vos propres designs.',
    descEn: 'All our products (T-shirts, Hoodies, Mugs, Caps, Canvas) support AI customization. You can also upload your own designs.',
    keywordsFr: ['produits', 'personnalisation', 'catégories', 'tshirt', 'mug', 'hoodie'],
    keywordsEn: ['products', 'customization', 'categories', 'tshirt', 'mug', 'hoodie'],
    category: 'orders',
  },
];

const helpCategories = [
  {
    icon: Truck,
    titleFr: 'Commandes & Livraison',
    titleEn: 'Orders & Shipping',
    descFr: 'Suivi, délais et frais d\'expédition au Maroc.',
    descEn: 'Tracking, delivery times, and shipping fees in Morocco.',
    category: 'orders',
    color: 'from-blue-500/20 to-blue-600/20 border-blue-500/30',
  },
  {
    icon: ArrowLeft,
    titleFr: 'Retours & Remboursements',
    titleEn: 'Returns & Refunds',
    descFr: 'Conditions pour échanger ou retourner un article.',
    descEn: 'Conditions for exchanging or returning an item.',
    category: 'returns',
    color: 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/30',
  },
  {
    icon: Lightbulb,
    titleFr: 'Design & IA',
    titleEn: 'Design & AI',
    descFr: 'Comment utiliser notre outil de création IA.',
    descEn: 'How to use our AI creation tool.',
    category: 'ai',
    color: 'from-purple-500/20 to-purple-600/20 border-purple-500/30',
  },
  {
    icon: Lock,
    titleFr: 'Paiement Sécurisé',
    titleEn: 'Secure Payment',
    descFr: 'Moyens de paiement acceptés et sécurité.',
    descEn: 'Accepted payment methods and security.',
    category: 'payment',
    color: 'from-green-500/20 to-green-600/20 border-green-500/30',
  },
];

export default function HelpPage() {
  const { lang } = useApp();
  const t = translations[lang];
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // Filter FAQs based on search and category
  const filteredFAQs = useMemo(() => {
    return faqData.filter((faq) => {
      const query = searchQuery.toLowerCase();
      const title = lang === 'fr' ? faq.titleFr : faq.titleEn;
      const desc = lang === 'fr' ? faq.descFr : faq.descEn;
      const keywords = lang === 'fr' ? faq.keywordsFr : faq.keywordsEn;

      const matchesSearch =
        title.toLowerCase().includes(query) ||
        desc.toLowerCase().includes(query) ||
        keywords.some((kw) => kw.toLowerCase().includes(query));

      const matchesCategory = !selectedCategory || faq.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory, lang]);

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <Navbar />

      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <section className="max-w-3xl mx-auto text-center mb-16 animate-fadeInUp">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium mb-6">
            <HelpCircle className="w-4 h-4" />
            {lang === 'fr' ? 'Centre d\'aide' : 'Help Center'}
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            {t.helpHeroTitle}
          </h1>
          <p className="text-lg text-foreground/70 mb-8">{t.helpHeroDesc}</p>

          {/* Search Bar */}
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-4 w-5 h-5 text-foreground/40 pointer-events-none" />
            <input
              type="text"
              placeholder={t.helpSearch}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSelectedCategory(null);
              }}
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-card-bg border border-card-border focus:border-primary outline-none transition-colors placeholder:text-foreground/40"
            />
          </div>
        </section>

        {/* Category Cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          {helpCategories.map((cat, idx) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.category;
            const title = lang === 'fr' ? cat.titleFr : cat.titleEn;
            const desc = lang === 'fr' ? cat.descFr : cat.descEn;

            return (
              <button
                key={idx}
                onClick={() =>
                  setSelectedCategory(isSelected ? null : cat.category)
                }
                className={`p-5 rounded-2xl border-2 text-left transition-all duration-300 group ${
                  isSelected
                    ? `border-primary/50 bg-gradient-to-br ${cat.color}`
                    : `border-card-border hover:border-primary/30 bg-card-bg/40`
                }`}
              >
                <Icon className={`w-6 h-6 mb-3 transition-transform ${
                  isSelected ? 'text-primary scale-110' : 'text-foreground/60 group-hover:scale-110'
                }`} />
                <h3 className="font-bold text-sm mb-1">{title}</h3>
                <p className="text-xs text-foreground/60">{desc}</p>
              </button>
            );
          })}
        </section>

        {/* FAQ Section */}
        <section className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-2">{t.faqTitle}</h2>
            <p className="text-foreground/60">
              {filteredFAQs.length} {lang === 'fr' ? 'article(s) trouvé(s)' : 'article(s) found'}
            </p>
          </div>

          {filteredFAQs.length > 0 ? (
            <div className="space-y-3">
              {filteredFAQs.map((faq) => {
                const isExpanded = expandedId === faq.id;
                const title = lang === 'fr' ? faq.titleFr : faq.titleEn;
                const desc = lang === 'fr' ? faq.descFr : faq.descEn;

                return (
                  <div
                    key={faq.id}
                    className="rounded-xl border border-card-border bg-card-bg/50 overflow-hidden hover:border-primary/30 transition-all"
                  >
                    <button
                      onClick={() =>
                        setExpandedId(isExpanded ? null : faq.id)
                      }
                      className="w-full px-6 py-4 flex items-center justify-between hover:bg-card-bg transition-colors"
                    >
                      <h3 className="font-semibold text-left">{title}</h3>
                      <ChevronDown
                        className={`w-5 h-5 text-primary flex-shrink-0 transition-transform ${
                          isExpanded ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {isExpanded && (
                      <div className="px-6 pb-4 border-t border-card-border bg-background/20">
                        <p className="text-foreground/70 leading-relaxed">{desc}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 rounded-xl bg-card-bg/30 border border-card-border">
              <p className="text-foreground/60 mb-2">
                {lang === 'fr' ? 'Aucun résultat trouvé' : 'No results found'}
              </p>
              <p className="text-sm text-foreground/40">
                {lang === 'fr'
                  ? 'Essayez d\'autres mots-clés'
                  : 'Try different keywords'}
              </p>
            </div>
          )}
        </section>

        {/* Contact Section */}
        <section className="max-w-3xl mx-auto mt-20 p-8 rounded-2xl bg-gradient-to-r from-primary/10 to-accent/10 border border-card-border text-center">
          <h3 className="text-2xl font-bold mb-2">{t.contactSectionTitle}</h3>
          <p className="text-foreground/70 mb-6">{t.contactSectionDesc}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:contact@bi4k.com"
              className="px-6 py-3 rounded-xl font-bold bg-primary text-white hover:bg-primary-hover transition-colors"
            >
              {lang === 'fr' ? 'Nous écrire' : 'Email Us'}
            </a>
            <a
              href="#"
              className="px-6 py-3 rounded-xl font-bold border border-card-border hover:border-primary/50 transition-colors"
            >
              {lang === 'fr' ? 'Chat en direct' : 'Live Chat'}
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
