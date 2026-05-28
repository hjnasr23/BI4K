'use client';

import Link from "next/link";
import { useApp } from "@/lib/store";
import { translations } from "@/lib/translations";
import { ShieldCheck, Sparkles, ArrowRight, Play, ShoppingBag, Truck } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { motion } from "motion/react";
import type { Category, Product } from "@/lib/db/types";

export default function ClientHome({ categories, products }: { categories: Category[], products: Product[] }) {
  const { lang } = useApp();
  const t = translations[lang];

  // Strip emojis from translations to maintain clean, professional typography
  const cleanBadge = (t.badge || "BI4K Next-Gen")
    .replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]/g, "")
    .trim();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const isFr = lang === 'fr';

  const renderHeroTitle = () => {
    if (isFr) {
      return (
        <>
          Sublimez votre <span className="bg-gradient-to-r from-blue-500 to-amber-500 bg-clip-text text-transparent font-extrabold">style</span> grâce à <span className="bg-gradient-to-r from-blue-500 to-amber-500 bg-clip-text text-transparent font-extrabold">l'IA</span>
        </>
      );
    }
    return (
      <>
        Elevate Your <span className="bg-gradient-to-r from-blue-500 to-amber-500 bg-clip-text text-transparent font-extrabold">Style</span> with <span className="bg-gradient-to-r from-blue-500 to-amber-500 bg-clip-text text-transparent font-extrabold">AI</span>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] text-neutral-900 dark:text-white transition-colors duration-500">
      <Navbar />

      <main className="relative pt-32 pb-20">
        <div className="container mx-auto px-6 relative z-10">
          
          {/* Spatial Hero Section */}
          <motion.section 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="flex flex-col items-center text-center space-y-8 max-w-4xl mx-auto pt-10 pb-20"
          >
            {/* Soft Blue/Amber Accent Badge */}
            <motion.div 
              variants={itemVariants} 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-950/30 text-amber-600 dark:text-amber-400 border border-blue-100 dark:border-blue-900/30 text-xs font-semibold uppercase tracking-wider"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-500" />
              {cleanBadge}
            </motion.div>
            
            {/* Large Accent-Driven Heading */}
            <motion.h1 
              variants={itemVariants} 
              className="text-4xl sm:text-6xl md:text-7xl font-extrabold text-neutral-900 dark:text-white tracking-tight leading-none"
            >
              {renderHeroTitle()}
            </motion.h1>

            {/* Subtle Subheading */}
            <motion.p 
              variants={itemVariants} 
              className="text-lg md:text-xl text-neutral-500 dark:text-neutral-400 leading-relaxed max-w-2xl font-medium"
            >
              {t.heroDesc || (isFr 
                ? "Créez des designs uniques avec notre intelligence artificielle. Paiement sécurisé à la commande ou à la livraison au Maroc." 
                : "Create unique designs with our artificial intelligence. Secure payment on order or delivery in Morocco.")}
            </motion.p>
            
            {/* Sleek Brand Buttons */}
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 pt-4 w-full sm:w-auto justify-center">
              <Link 
                href="/categories" 
                className="group flex items-center justify-center gap-2 bg-blue-600 text-white hover:bg-blue-500 shadow-md shadow-blue-500/20 active:scale-95 transition-all rounded-xl px-8 py-4 font-medium text-base"
              >
                {isFr ? 'Commencer' : 'Start Creating'}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                href="/help" 
                className="flex items-center justify-center gap-2 border border-neutral-300 dark:border-neutral-800 text-neutral-900 dark:text-white hover:border-blue-500/50 hover:text-blue-500 rounded-xl px-8 py-4 font-medium text-base transition-colors group"
              >
                <div className="w-6 h-6 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Play className="w-2.5 h-2.5 fill-current text-neutral-900 dark:text-white translate-x-0.5" />
                </div>
                {isFr ? 'Guide Studio' : 'Studio Guide'}
              </Link>
            </motion.div>

            {/* Professional Tags */}
            <motion.div variants={itemVariants} className="flex flex-wrap justify-center items-center gap-8 text-neutral-400 dark:text-neutral-500 pt-8">
               {['DALL·E 3 Core', 'Production Grade', 'Global Fulfillment', 'WebP Optimized'].map((tag) => (
                 <div key={tag} className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider">
                   <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                   {tag}
                 </div>
               ))}
            </motion.div>
          </motion.section>

          {/* Clean Thin Divider */}
          <div className="border-b border-neutral-100 dark:border-neutral-900 mb-16" />

          {/* Redesigned Bento Grid Content Section */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[250px] my-16 max-w-7xl mx-auto px-4">
             
             {/* Card 1: Browse Categories (md:col-span-2 md:row-span-2) */}
             <div className="md:col-span-2 md:row-span-2 rounded-3xl overflow-hidden relative group border border-neutral-200 dark:border-white/5 transition-all duration-300 hover:-translate-y-1 hover:border-amber-500/40 hover:shadow-[0_0_20px_rgba(245,158,11,0.15)]">
                <img 
                  src="/images/categories-bg.jpg" 
                  alt="Parcourir les Catégories" 
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10 z-10" />
                <div className="relative z-20 flex flex-col justify-end h-full p-8 md:p-10">
                   <h3 className="text-white text-3xl font-bold tracking-tight mb-2">Parcourir les Catégories</h3>
                   <p className="text-neutral-300 text-sm max-w-md">Explorez nos supports de qualité supérieure prêts pour vos créations</p>
                   <Link 
                     href="/catalog" 
                     className="bg-blue-600 text-white hover:bg-blue-500 rounded-xl px-6 py-3 mt-4 inline-flex items-center gap-2 font-medium transition-all hover:scale-105 w-fit"
                   >
                     {isFr ? 'Découvrir' : 'Discover'} <ArrowRight className="w-4 h-4" />
                   </Link>
                </div>
             </div>

             {/* Card 2: Featured Products (md:col-span-1 md:row-span-2) */}
             <div className="md:col-span-1 md:row-span-2 rounded-3xl overflow-hidden relative group border border-neutral-200 dark:border-white/5 transition-all duration-300 hover:-translate-y-1 hover:border-amber-500/40 hover:shadow-[0_0_20px_rgba(245,158,11,0.15)]">
                <img 
                  src="/images/featured-product.jpg" 
                  alt="Produits Vedettes" 
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent z-10" />
                <div className="absolute top-6 right-6 z-20">
                   <ShoppingBag className="w-6 h-6 text-amber-500" />
                </div>
                <div className="relative z-20 flex flex-col justify-end h-full p-8">
                   <h3 className="text-white text-xl font-bold mb-2">Produits Vedettes</h3>
                   <p className="text-neutral-300 text-sm">Découvrez les créations tendances.</p>
                </div>
             </div>

             {/* Card 3: Neural Design Synthesis (md:col-span-2 md:row-span-1) */}
             <div className="md:col-span-2 md:row-span-1 rounded-3xl overflow-hidden relative group border border-white/10 transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/50 hover:shadow-[0_0_20px_rgba(59,130,246,0.2)]">
                <img 
                  src="/images/ai-synthesis.jpg" 
                  alt="Intelligence Artificielle" 
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                />
                <div className="absolute inset-0 bg-black/70 z-10" />
                <div className="relative z-20 flex flex-col justify-center h-full p-8">
                   <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-6 h-6 text-blue-400" />
                      <span className="bg-gradient-to-r from-blue-400 to-amber-400 bg-clip-text text-transparent font-extrabold text-2xl uppercase tracking-wider">
                         Intelligence Artificielle
                      </span>
                   </div>
                   <p className="text-neutral-200 text-sm max-w-xl">
                      Générez des designs uniques en un clic grâce à notre IA.
                   </p>
                </div>
             </div>

             {/* Card 4: Vault Encryption (md:col-span-1 md:row-span-1) */}
             <div className="md:col-span-1 md:row-span-1 rounded-3xl overflow-hidden bg-neutral-50 dark:bg-[#111111] border border-neutral-200 dark:border-white/5 p-6 flex flex-col justify-center transition-all duration-300 hover:-translate-y-1 hover:border-amber-500/40 hover:shadow-[0_0_20px_rgba(245,158,11,0.15)]">
                <ShieldCheck className="w-8 h-8 text-amber-500 mb-3" />
                <h3 className="text-neutral-900 dark:text-white font-bold text-lg mb-1">Sécurité</h3>
                <p className="text-neutral-500 dark:text-neutral-400 text-sm">Paiement 100% sécurisé.</p>
             </div>

             {/* Card 5: Global Reach (md:col-span-1 md:row-span-1) */}
             <div className="md:col-span-1 md:row-span-1 rounded-3xl overflow-hidden bg-neutral-50 dark:bg-[#111111] border border-neutral-200 dark:border-white/5 p-6 flex flex-col justify-center transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/40 hover:shadow-[0_0_20px_rgba(59,130,246,0.15)]">
                <Truck className="w-8 h-8 text-blue-500 mb-3" />
                <h3 className="text-neutral-900 dark:text-white font-bold text-lg mb-1">Livraison</h3>
                <p className="text-neutral-500 dark:text-neutral-400 text-sm">Partout au Maroc.</p>
             </div>
          </section>

          {/* Clean Thin Divider */}
          <div className="border-b border-neutral-100 dark:border-neutral-900 mb-24" />

          {/* Immersive CTA Footer */}
          <motion.section 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="p-12 md:p-20 rounded-3xl bg-neutral-50 dark:bg-[#111111] border border-neutral-200 dark:border-white/5 transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/40 hover:shadow-[0_0_20px_rgba(59,130,246,0.15)] text-center flex flex-col items-center justify-center space-y-8 relative overflow-hidden"
          >
             <div className="w-16 h-16 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-blue-500" />
             </div>
             <h2 className="text-4xl md:text-6xl font-extrabold text-neutral-900 dark:text-white tracking-tight leading-none uppercase">
                {isFr ? (
                  <>
                    Prêt à <span className="bg-gradient-to-r from-blue-500 to-amber-500 bg-clip-text text-transparent font-black">créer ?</span>
                  </>
                ) : (
                  <>
                    Ready to <span className="bg-gradient-to-r from-blue-500 to-amber-500 bg-clip-text text-transparent font-black">create?</span>
                  </>
                )}
             </h2>
             <p className="text-neutral-500 dark:text-neutral-400 text-base leading-relaxed max-w-xl font-medium">
                {isFr 
                  ? "Rejoignez la nouvelle frontière de la création assistée par IA. Vos vêtements personnalisés premium, livrés directement chez vous."
                  : "Join the global frontier of AI-assisted creation. Production grade assets, delivered to your door."}
             </p>
             <Link 
               href="/categories" 
               className="bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-500/25 active:scale-95 transition-all rounded-xl px-10 py-5 font-semibold text-sm tracking-wider uppercase"
             >
               {isFr ? "Initialiser le Studio" : "Initialize Studio"}
             </Link>
          </motion.section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
