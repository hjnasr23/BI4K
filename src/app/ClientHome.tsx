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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.3 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" as any } }
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-500">
      <Navbar />

      <main className="relative pt-32 pb-20">
        {/* Animated Mesh Gradients */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
          <motion.div 
            animate={{ scale: [1, 1.2, 1], x: [-20, 20, -20], y: [-20, 20, -20] }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-primary/20 rounded-full mix-blend-screen filter blur-[120px]" 
          />
          <motion.div 
            animate={{ scale: [1, 1.1, 1], x: [20, -20, 20], y: [20, -20, 20] }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute top-[10%] right-[-5%] w-[50%] h-[50%] bg-accent/20 rounded-full mix-blend-screen filter blur-[120px]" 
          />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          {/* Spatial Hero Section */}
          <motion.section 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="flex flex-col items-center text-center space-y-12 max-w-6xl mx-auto mb-48"
          >
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.4em] shadow-2xl shadow-primary/10">
              <Sparkles className="w-3.5 h-3.5" />
              {t.badge || "BI4K Next-Gen"}
            </motion.div>
            
            <motion.p variants={itemVariants} className="text-xl md:text-2xl text-foreground/40 leading-relaxed max-w-3xl font-medium tracking-tight">
              {t.heroDesc || "Design the future of apparel using our advanced AI studio."}
            </motion.p>
            
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-6 pt-8 w-full sm:w-auto">
              <Link href="/categories" className="group relative flex items-center justify-center gap-4 px-12 py-6 rounded-2xl font-black text-white bg-primary shadow-[0_20px_50px_rgba(99,102,241,0.4)] hover:shadow-primary/60 hover:-translate-y-1 transition-all duration-500 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                {lang === 'fr' ? 'Commencer' : 'Start Creating'}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-500" />
              </Link>
              <Link href="/help" className="flex items-center justify-center gap-4 px-12 py-6 rounded-2xl font-black bg-white/5 border border-white/10 backdrop-blur-2xl hover:bg-white/10 transition-all duration-500 group">
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Play className="w-3 h-3 fill-white text-white translate-x-0.5" />
                </div>
                {lang === 'fr' ? 'Guide Studio' : 'Studio Guide'}
              </Link>
            </motion.div>

            <motion.div variants={itemVariants} className="flex flex-wrap justify-center items-center gap-10 opacity-30 pt-10">
               {['DALL·E 3 Core', 'Production Grade', 'Global Fulfillment', 'WebP Optimized'].map((tag) => (
                 <div key={tag} className="flex items-center gap-2.5 font-black uppercase tracking-[0.3em] text-[9px]">
                   <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                   {tag}
                 </div>
               ))}
            </motion.div>
          </motion.section>

          {/* Catalog Teaser Section (Dynamic Categories) */}
          <section className="mb-24">
             <div className="flex flex-col items-center mb-12 text-center space-y-4">
                <span className="text-primary font-black uppercase tracking-[0.5em] text-[10px]">Collections</span>
                <h2 className="text-4xl font-black tracking-tighter uppercase">Browse Categories</h2>
             </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {categories.slice(0, 3).map((cat, idx) => (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  className="col-span-1"
                >
                  <Link 
                    href={`/categories/${cat.id}`} 
                    className="relative block group h-[400px] overflow-hidden rounded-[3rem] border border-white/5 shadow-2xl"
                  >
                    {cat.image_url ? (
                      <img src={cat.image_url} className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt={cat.name} />
                    ) : (
                      <div className="absolute inset-0 bg-white/5 flex items-center justify-center transition-transform duration-1000 group-hover:scale-110">
                        <span className="text-white/20 uppercase tracking-widest font-black text-sm">No Image</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                    <div className="absolute bottom-10 left-10">
                      <h3 className="text-3xl font-black text-white mb-2 uppercase italic tracking-tighter">{cat.name}</h3>
                      <div className="flex items-center gap-3 text-primary font-black uppercase tracking-[0.3em] text-[10px] opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                        View Collection <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Featured Products Section */}
          <section className="mb-48">
             <div className="flex flex-col items-center mb-12 text-center space-y-4">
                <span className="text-primary font-black uppercase tracking-[0.5em] text-[10px]">Studio Items</span>
                <h2 className="text-4xl font-black tracking-tighter uppercase">Featured Products</h2>
             </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                {products.slice(0, 4).map((prod) => (
                  <Link key={prod.id} href={`/products/${prod.id}`} className="group block bg-white/5 border border-white/10 rounded-3xl p-4 hover:bg-white/10 transition-colors">
                    <div className="aspect-square bg-black/50 rounded-2xl mb-4 overflow-hidden relative">
                      {prod.base_image_url ? (
                        <img src={prod.base_image_url} alt={prod.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-white/20 uppercase tracking-widest font-bold text-xs">No Image</span>
                        </div>
                      )}
                    </div>
                    <h3 className="font-bold text-white text-sm mb-1">{prod.name}</h3>
                    <p className="text-primary font-black text-xs">${prod.base_price}</p>
                  </Link>
                ))}
             </div>
          </section>

          {/* Premium Bento Grid - Features */}
          <section className="max-w-7xl mx-auto mb-48">
             <div className="flex flex-col items-center mb-20 text-center space-y-4">
                <span className="text-primary font-black uppercase tracking-[0.5em] text-[10px]">Architecture</span>
                <h2 className="text-5xl font-black tracking-tighter uppercase">Studio Systems</h2>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-auto md:h-[800px]">
                {/* Main Feature - Bento Large */}
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  className="md:col-span-8 md:row-span-2 glass rounded-[3rem] p-12 relative overflow-hidden group border-white/5"
                >
                   <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                   <div className="relative z-10 h-full flex flex-col justify-between">
                      <div>
                        <div className="w-20 h-20 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-10 group-hover:rotate-12 transition-transform duration-500">
                          <Cpu className="w-10 h-10 text-primary" />
                        </div>
                        <h3 className="text-5xl font-black mb-6 leading-[0.9] uppercase italic tracking-tighter">Neural Design <br/> Synthesis</h3>
                        <p className="text-xl text-foreground/40 max-w-md font-medium leading-relaxed">Our advanced AI bridge transforms linguistic prompts into production-grade vector aesthetics in milliseconds.</p>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-6 pt-20 border-t border-white/5">
                         {[
                           { label: 'Latency', val: '240ms' },
                           { label: 'Precision', val: '600 DPI' },
                           { label: 'Uptime', val: '99.9%' },
                         ].map(stat => (
                           <div key={stat.label}>
                             <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">{stat.label}</p>
                             <p className="text-2xl font-black italic">{stat.val}</p>
                           </div>
                         ))}
                      </div>
                   </div>
                   {/* Decorative Elements */}
                   <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-primary/20 rounded-full blur-[100px] pointer-events-none group-hover:bg-primary/30 transition-colors duration-1000" />
                </motion.div>

                {/* Secondary Feature - Bento Square */}
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  className="md:col-span-4 glass rounded-[3rem] p-10 relative overflow-hidden group border-white/5"
                >
                   <div className="w-14 h-14 rounded-2xl bg-secondary/10 border border-secondary/20 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                      <Shield className="w-6 h-6 text-secondary" />
                   </div>
                   <h3 className="text-3xl font-black mb-4 uppercase tracking-tighter">Vault <br/> Encryption</h3>
                   <p className="text-foreground/40 font-medium leading-relaxed">Every design is secured with high-level encryption in your private studio vault.</p>
                   <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-secondary/10 rounded-full blur-3xl" />
                </motion.div>

                {/* Third Feature - Bento Small */}
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  className="md:col-span-4 glass rounded-[3rem] p-10 relative overflow-hidden group border-white/5"
                >
                   <div className="w-14 h-14 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center mb-8 group-hover:-rotate-12 transition-transform">
                      <Globe className="w-6 h-6 text-accent" />
                   </div>
                   <h3 className="text-3xl font-black mb-4 uppercase tracking-tighter">Global <br/> Reach</h3>
                   <p className="text-foreground/40 font-medium leading-relaxed">Fulfilled by local artisan hubs to reduce carbon and delivery lag.</p>
                   <div className="absolute -right-10 top-0 w-32 h-32 bg-accent/10 rounded-full blur-3xl" />
                </motion.div>

                {/* Fourth Feature - Bento Long */}
                <motion.div 
                   initial={{ opacity: 0, y: 20 }}
                   whileInView={{ opacity: 1, y: 0 }}
                   className="md:col-span-12 glass rounded-[3rem] p-12 flex flex-col md:flex-row items-center justify-between gap-10 group border-white/5 overflow-hidden"
                >
                   <div className="flex-1">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest mb-6">
                         <Star className="w-3 h-3 text-yellow-500" />
                         Premium Experience
                      </div>
                      <h3 className="text-5xl font-black uppercase tracking-tighter mb-4 italic leading-none">Limitless Customization</h3>
                      <p className="text-xl text-foreground/40 max-w-xl font-medium">From fabric textures to complex neural patterns, the Studio gives you complete control over your creative expression.</p>
                   </div>
                   <Link href="/categories" className="group/btn relative px-10 py-5 rounded-2xl bg-white text-black font-black uppercase text-xs tracking-[0.3em] overflow-hidden transition-transform active:scale-95 shrink-0">
                      <span className="relative z-10">Enter Studio</span>
                      <div className="absolute inset-0 bg-primary translate-y-full group-hover/btn:translate-y-0 transition-transform duration-500" />
                      <span className="absolute inset-0 flex items-center justify-center text-white translate-y-full group-hover/btn:translate-y-0 transition-transform duration-500 font-black z-20">Enter Studio</span>
                   </Link>
                </motion.div>
             </div>
          </section>

          {/* Immersive CTA Footer */}
          <motion.section 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="relative p-24 rounded-[5rem] bg-[#0d0d12] border border-white/5 overflow-hidden group shadow-2xl"
          >
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-50" />
             <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
             
             <div className="relative z-10 flex flex-col items-center text-center space-y-10">
                <div className="w-24 h-24 rounded-full bg-primary/5 flex items-center justify-center border border-primary/20 group-hover:scale-110 transition-transform duration-700">
                   <Sparkles className="w-10 h-10 text-primary animate-pulse" />
                </div>
                <h2 className="text-6xl md:text-8xl font-black text-white leading-[0.8] tracking-tighter uppercase italic">Ready to <br/> manifest?</h2>
                <p className="text-foreground/40 text-xl font-medium max-w-xl leading-relaxed">Join the global frontier of AI-assisted creation. Production grade assets, delivered to your door.</p>
                <Link href="/categories" className="px-16 py-7 rounded-full bg-primary text-white font-black text-xs uppercase tracking-[0.4em] hover:scale-105 active:scale-95 shadow-[0_20px_50px_rgba(99,102,241,0.3)] transition-all duration-500">
                  Initialize Studio
                </Link>
             </div>

             <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary/10 rounded-full blur-[120px] group-hover:bg-primary/20 transition-colors duration-1000" />
             <div className="absolute -top-40 -right-40 w-96 h-96 bg-accent/10 rounded-full blur-[120px] group-hover:bg-accent/20 transition-colors duration-1000" />
          </motion.section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
