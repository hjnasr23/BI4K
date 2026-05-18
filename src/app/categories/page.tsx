'use client';
import Link from "next/link";
import { useApp } from "@/lib/store";
import { translations } from "@/lib/translations";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Shirt, Coffee, Smartphone, Image as ImageIcon, Boxes, Users, Baby, User, Eye, ArrowLeftRight, Sparkles, ArrowRight } from "lucide-react";
import { motion } from "motion/react";

const CategorySection = ({ title, items, badge, lang }: { title: string, items: any[], badge?: string, lang: string }) => (
  <motion.div 
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.8 }}
    viewport={{ once: true }}
    className="mb-32"
  >
    <div className="flex items-center justify-between mb-12">
      <h2 className="text-5xl font-black tracking-tighter uppercase italic flex items-center gap-5">
        <div className="w-1.5 h-12 bg-primary rounded-full shadow-[0_0_20px_rgba(99,102,241,0.5)]"></div>
        {title}
      </h2>
      {badge && (
        <div className="px-5 py-2 rounded-full bg-primary/5 border border-primary/20 text-primary text-[9px] font-black uppercase tracking-[0.3em]">
          {badge}
        </div>
      )}
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {items.map((cat, idx) => (
        <motion.div
          key={cat.id}
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ delay: idx * 0.05 }}
          viewport={{ once: true }}
        >
          <Link 
            href={`/categories/${cat.id}`} 
            className="group relative h-[400px] rounded-[3rem] bg-[#0d0d12] border border-white/5 flex flex-col justify-between overflow-hidden hover:border-primary/30 transition-all duration-700 shadow-2xl"
          >
            {/* Hover Background Image */}
            {cat.image && (
              <img 
                src={cat.image} 
                alt="" 
                className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-opacity duration-700 scale-100 group-hover:scale-105"
              />
            )}

            {/* Spatial Depth Background */}
            <div className={`absolute -right-20 -top-20 w-80 h-80 bg-gradient-to-br ${cat.bg} to-transparent rounded-full blur-[100px] opacity-20 group-hover:opacity-40 transition-opacity duration-1000`} />
            
            <div className="relative z-10 p-10">
              <h3 className="text-4xl font-black text-white mb-4 leading-none uppercase italic tracking-tighter">{cat.name}</h3>
            </div>

            <div className="relative z-10 p-10 flex items-center justify-between">
              <div className="flex items-center gap-3 text-primary font-black uppercase tracking-[0.3em] text-[10px] opacity-0 group-hover:opacity-100 translate-x-[-20px] group-hover:translate-x-0 transition-all duration-500">
                Initialize <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  </motion.div>
);

export default function CategoriesPage() {
  const { lang } = useApp();
  const t = translations[lang];

  const productCategories = [
    { id: 'tshirts', name: t.cat1Title, desc: t.cat1Desc, icon: Shirt, color: 'text-primary', bg: 'from-primary/40', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop' },
    { id: 'hoodies', name: t.cat2Title, desc: t.cat2Desc, icon: Shirt, color: 'text-secondary', bg: 'from-secondary/40', image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800&auto=format&fit=crop' },
    { id: 'mugs', name: t.cat3Title, desc: t.cat3Desc, icon: Coffee, color: 'text-accent', bg: 'from-accent/40', image: 'https://images.unsplash.com/photo-1514228742587-6b1558fbed20?q=80&w=800&auto=format&fit=crop' },
    { id: 'phone-cases', name: t.cat4Title, desc: t.cat4Desc, icon: Smartphone, color: 'text-primary', bg: 'from-primary/40', image: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?q=80&w=800&auto=format&fit=crop' },
    { id: 'caps', name: t.cat5Title, desc: t.cat5Desc, icon: Boxes, color: 'text-secondary', bg: 'from-secondary/40', image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?q=80&w=800&auto=format&fit=crop' },
    { id: 'canvas', name: t.cat6Title, desc: t.cat6Desc, icon: ImageIcon, color: 'text-accent', bg: 'from-accent/40', image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=800&auto=format&fit=crop' },
  ];

  const audienceCategories = [
    { id: 'men', name: t.catMenTitle, desc: t.catMenDesc, icon: User, color: 'text-blue-500', bg: 'from-blue-500/40', image: 'https://images.unsplash.com/photo-1488161628813-04466f872be2?q=80&w=800&auto=format&fit=crop' },
    { id: 'women', name: t.catWomenTitle, desc: t.catWomenDesc, icon: Users, color: 'text-pink-500', bg: 'from-pink-500/40', image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop' },
    { id: 'kids', name: t.catKidsTitle, desc: t.catKidsDesc, icon: Baby, color: 'text-yellow-500', bg: 'from-yellow-500/40', image: 'https://images.unsplash.com/photo-1519457439532-6b050019b45a?q=80&w=800&auto=format&fit=crop' },
  ];

  const viewCategories = [
    { id: 'front', name: t.catFrontTitle, desc: t.catFrontDesc, icon: Eye, color: 'text-green-500', bg: 'from-green-500/40', image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=800&auto=format&fit=crop' },
    { id: 'back', name: t.catBackTitle, desc: t.catBackDesc, icon: ArrowLeftRight, color: 'text-purple-500', bg: 'from-purple-500/40', image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=800&auto=format&fit=crop' },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-500">
      <Navbar />

      <main className="relative pt-48 pb-20">
        {/* Spatial Background Blobs */}
        <div className="absolute top-0 right-[-10%] w-[60%] h-[60%] bg-primary/5 rounded-full blur-[160px] animate-blob pointer-events-none opacity-50"></div>
        <div className="absolute bottom-0 left-[-10%] w-[60%] h-[60%] bg-accent/5 rounded-full blur-[160px] animate-blob animation-delay-2000 pointer-events-none opacity-50"></div>

        <div className="container mx-auto px-6 relative z-10">


          <CategorySection title={lang === 'fr' ? "Par Produit" : "By Product"} items={productCategories} badge="Popular" lang={lang} />
          <CategorySection title={lang === 'fr' ? "Par Public" : "By Audience"} items={audienceCategories} lang={lang} />
          <CategorySection title={lang === 'fr' ? "Par Vue" : "By View"} items={viewCategories} lang={lang} />
        </div>
      </main>

      <Footer />
    </div>
  );
}

