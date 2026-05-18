'use client';
import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    { q: "Comment fonctionne la génération IA ?", a: "Notre IA utilise Stable Diffusion pour créer un design unique basé sur votre description." },
    { q: "Quels formats d'image sont acceptés ?", a: "Vous pouvez uploader des images au format PNG ou JPEG, avec une taille maximale de 5 Mo." },
    { q: "Combien de temps prend la livraison ?", a: "La livraison standard prend de 3 à 5 jours ouvrés en France métropolitaine." },
    { q: "Puis-je retourner un produit personnalisé ?", a: "Les produits personnalisés ne peuvent être retournés sauf en cas de défaut de fabrication." },
    { q: "Comment suivre ma commande ?", a: "Une fois votre commande expédiée, vous recevrez un numéro de suivi par email." },
    { q: "L'IA génère-t-elle du contenu illégal ?", a: "Non, notre IA est configurée avec des filtres de sécurité pour éviter de générer du contenu inapproprié ou protégé." }
  ];

  return (
    <div className="container mx-auto px-4 py-16 max-w-3xl">
      <h1 className="text-4xl font-bold mb-12 text-center">Questions Fréquentes</h1>
      <div className="space-y-4">
        {faqs.map((faq, idx) => (
          <div key={idx} className="bg-card-bg border border-card-border rounded-xl overflow-hidden">
            <button
              onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
              className="w-full px-6 py-4 text-left font-bold flex items-center justify-between hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              <span>{faq.q}</span>
              {openIndex === idx ? <ChevronUp className="w-5 h-5 text-primary" /> : <ChevronDown className="w-5 h-5 text-foreground/50" />}
            </button>
            {openIndex === idx && (
              <div className="px-6 pb-4 text-foreground/70">
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
