'use client';

import Link from "next/link";
import { useApp } from "@/lib/store";
import { translations } from "@/lib/translations";
import { Shield, Sparkles, ArrowRight, Play, Star, Cpu, Globe } from "lucide-react";
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
          <div className="border-b border-neutral-100 dark:border-neutral-900 mb-24" />

          {/* Catalog Teaser Section (Dynamic Categories) */}
          <section className="mb-24">
            <div className="flex flex-col items-start mb-12 space-y-2">
              <span className="text-xs font-bold uppercase tracking-widest text-neutral-400 dark:text-neutral-500">BROWSE CATEGORIES</span>
              <h2 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white uppercase">
                {isFr ? "Parcourir les catégories" : "Browse Categories"}
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {categories.slice(0, 3).map((cat, idx) => (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  viewport={{ once: true }}
                  className="col-span-1"
                >
                  <Link 
                    href={`/categories/${cat.id}`} 
                    className="group relative block overflow-hidden rounded-3xl bg-neutral-50 dark:bg-[#111111] border border-neutral-200 dark:border-white/5 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-amber-500/40 hover:shadow-[0_0_20px_rgba(245,158,11,0.15)] h-[380px]"
                  >
                    <div className="h-[240px] rounded-2xl overflow-hidden relative bg-neutral-100 dark:bg-neutral-900 border border-neutral-200/40 dark:border-white/5">
                      {cat.image_url ? (
                        <img src={cat.image_url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt={cat.name} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-neutral-400 dark:text-neutral-600 uppercase tracking-widest font-semibold text-xs">No Image</span>
                        </div>
                      )}
                    </div>
                    <div className="mt-6 flex justify-between items-center">
                      <div>
                        <h3 className="text-xl font-bold text-neutral-900 dark:text-white tracking-tight">{cat.name}</h3>
                        <p className="text-neutral-500 dark:text-neutral-400 text-xs mt-1 uppercase tracking-wider font-semibold">
                          {isFr ? 'Découvrir la collection' : 'Discover collection'}
                        </p>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-900 text-amber-500 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-white transition-colors duration-200">
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Clean Thin Divider */}
          <div className="border-b border-neutral-100 dark:border-neutral-900 mb-24" />

          {/* Featured Products Section */}
          <section className="mb-24">
            <div className="flex flex-col items-start mb-12 space-y-2">
              <span className="text-xs font-bold uppercase tracking-widest text-neutral-400 dark:text-neutral-500">FEATURED PRODUCTS</span>
              <h2 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white uppercase">
                {isFr ? "Produits Vedettes" : "Featured Products"}
              </h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {products.slice(0, 4).map((prod) => (
                <Link 
                  key={prod.id} 
                  href={`/products/${prod.id}`} 
                  className="group block bg-neutral-50 dark:bg-[#111111] border border-neutral-200 dark:border-white/5 rounded-3xl p-4 transition-all duration-300 hover:-translate-y-1 hover:border-amber-500/40 hover:shadow-[0_0_20px_rgba(245,158,11,0.15)]"
                >
                  <div className="aspect-square bg-neutral-100 dark:bg-neutral-900 border border-neutral-200/40 dark:border-white/5 rounded-2xl mb-4 overflow-hidden relative">
                    {prod.base_image_url ? (
                      <img src={prod.base_image_url} alt={prod.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-neutral-400 dark:text-neutral-600 uppercase tracking-widest font-semibold text-xs">No Image</span>
                      </div>
                    )}
                  </div>
                  <h3 className="font-bold text-neutral-900 dark:text-white text-base mb-1 truncate">{prod.name}</h3>
                  <p className="text-amber-500 font-bold text-sm">{prod.base_price} MAD</p>
                </Link>
              ))}
            </div>
          </section>

          {/* Clean Thin Divider */}
          <div className="border-b border-neutral-100 dark:border-neutral-900 mb-24" />

          {/* Premium Bento Grid - Features */}
          <section className="max-w-7xl mx-auto mb-24">
             <div className="flex flex-col items-start mb-12 space-y-2">
                <span className="text-xs font-bold uppercase tracking-widest text-neutral-400 dark:text-neutral-500">STUDIO SYSTEMS</span>
                <h2 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white uppercase">
                  {isFr ? "Systèmes du Studio" : "Studio Systems"}
                </h2>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Main Feature - Bento Large */}
                <motion.div 
                   initial={{ opacity: 0, scale: 0.98 }}
                   whileInView={{ opacity: 1, scale: 1 }}
                   className="md:col-span-8 p-8 md:p-10 rounded-3xl bg-neutral-50 dark:bg-[#111111] border border-neutral-200 dark:border-white/5 transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/40 hover:shadow-[0_0_20px_rgba(59,130,246,0.15)] flex flex-col justify-between space-y-12"
                >
                   <div>
                      <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-8">
                        <Cpu className="w-6 h-6 text-blue-500" />
                      </div>
                      <h3 className="text-3xl md:text-4xl font-extrabold text-neutral-900 dark:text-white tracking-tight mb-4 uppercase">
                        Neural Design Synthesis
                      </h3>
                      <p className="text-neutral-500 dark:text-neutral-400 text-base leading-relaxed max-w-lg font-medium">
                        Our advanced AI bridge transforms linguistic prompts into production-grade vector aesthetics in milliseconds.
                      </p>
                   </div>
                      
                   <div className="grid grid-cols-3 gap-6 pt-8 border-t border-neutral-200 dark:border-neutral-800">
                      {[
                        { label: 'Latency', val: '240ms', color: 'text-blue-500' },
                        { label: 'Precision', val: '600 DPI', color: 'text-amber-500' },
                        { label: 'Uptime', val: '99.9%', color: 'text-blue-500' },
                      ].map(stat => (
                        <div key={stat.label}>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 dark:text-neutral-500 mb-1">{stat.label}</p>
                          <p className={`text-xl font-bold ${stat.color}`}>{stat.val}</p>
                        </div>
                      ))}
                   </div>
                </motion.div>

                {/* Secondary & Third Column container */}
                <div className="md:col-span-4 flex flex-col gap-6">
                  {/* Secondary Feature - Bento Square */}
                  <motion.div 
                     initial={{ opacity: 0, y: 10 }}
                     whileInView={{ opacity: 1, y: 0 }}
                     className="p-8 rounded-3xl bg-neutral-50 dark:bg-[#111111] border border-neutral-200 dark:border-white/5 transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/40 hover:shadow-[0_0_20px_rgba(59,130,246,0.15)]"
                  >
                     <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-6">
                        <Shield className="w-5 h-5 text-blue-500" />
                     </div>
                     <h3 className="text-2xl font-bold text-neutral-900 dark:text-white tracking-tight mb-3 uppercase">Vault Encryption</h3>
                     <p className="text-neutral-500 dark:text-neutral-400 text-sm leading-relaxed font-medium">Every design is secured with high-level encryption in your private studio vault.</p>
                  </motion.div>

                  {/* Third Feature - Bento Small */}
                  <motion.div 
                     initial={{ opacity: 0, y: 10 }}
                     whileInView={{ opacity: 1, y: 0 }}
                     className="p-8 rounded-3xl bg-neutral-50 dark:bg-[#111111] border border-neutral-200 dark:border-white/5 transition-all duration-300 hover:-translate-y-1 hover:border-amber-500/40 hover:shadow-[0_0_20px_rgba(245,158,11,0.15)]"
                  >
                     <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-6">
                        <Globe className="w-5 h-5 text-amber-500" />
                     </div>
                     <h3 className="text-2xl font-bold text-neutral-900 dark:text-white tracking-tight mb-3 uppercase">Global Reach</h3>
                     <p className="text-neutral-500 dark:text-neutral-400 text-sm leading-relaxed font-medium">Fulfilled by local artisan hubs to reduce carbon and delivery lag.</p>
                  </motion.div>
                </div>

                {/* Fourth Feature - Bento Long */}
                <motion.div 
                   initial={{ opacity: 0, y: 10 }}
                   whileInView={{ opacity: 1, y: 0 }}
                   className="md:col-span-12 p-8 md:p-10 rounded-3xl bg-neutral-50 dark:bg-[#111111] border border-neutral-200 dark:border-white/5 transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/40 hover:shadow-[0_0_20px_rgba(59,130,246,0.15)] flex flex-col md:flex-row items-center justify-between gap-8 overflow-hidden"
                >
                   <div className="flex-1">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-4">
                         <Star className="w-3 h-3 text-amber-500 animate-pulse" />
                         Premium Experience
                      </div>
                      <h3 className="text-3xl md:text-4xl font-extrabold text-neutral-900 dark:text-white tracking-tight mb-3 uppercase">Limitless Customization</h3>
                      <p className="text-neutral-500 dark:text-neutral-400 text-base leading-relaxed max-w-xl font-medium">From fabric textures to complex neural patterns, the Studio gives you complete control over your creative expression.</p>
                   </div>
                   <Link 
                     href="/categories" 
                     className="bg-blue-600 text-white hover:bg-blue-500 shadow-md shadow-blue-500/20 active:scale-95 transition-all rounded-xl px-8 py-4 font-semibold text-sm tracking-wide uppercase shrink-0"
                   >
                      {isFr ? 'Entrer dans le Studio' : 'Enter Studio'}
                   </Link>
                </motion.div>
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
