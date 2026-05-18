'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { Sparkles, ArrowRight } from 'lucide-react';

const categories = [
  {
    id: 't-shirts',
    name: 'Premium T-Shirts',
    baseImage: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop',
    hoverImage: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=800&auto=format&fit=crop', // A design mockup placeholder
  },
  {
    id: 'hoodies',
    name: 'Comfort Hoodies',
    baseImage: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800&auto=format&fit=crop',
    hoverImage: 'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 'mugs',
    name: 'Ceramic Mugs',
    baseImage: 'https://images.unsplash.com/photo-1514228742587-6b1558fbed20?q=80&w=800&auto=format&fit=crop',
    hoverImage: 'https://images.unsplash.com/photo-1577937927133-66ef06ac9dfb?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 'tote-bags',
    name: 'Canvas Tote Bags',
    baseImage: 'https://images.unsplash.com/photo-1544816153-16ad4674ff30?q=80&w=800&auto=format&fit=crop',
    hoverImage: 'https://images.unsplash.com/photo-1597484662317-c87be846465c?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 'hats',
    name: 'Custom Hats',
    baseImage: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?q=80&w=800&auto=format&fit=crop',
    hoverImage: 'https://images.unsplash.com/photo-1576053139778-7e32f2ae3cfd?q=80&w=800&auto=format&fit=crop',
  },
];

export default function CategoryPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <header className="text-center mb-20 animate-reveal">
        <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.4em] mb-10 shadow-2xl">
          <Sparkles className="w-3.5 h-3.5" />
          Step 1: Choose Canvas
        </div>
        <h1 className="text-7xl md:text-8xl font-black mb-6 tracking-tighter uppercase italic leading-none">
          Select Your <span className="text-gradient">Base.</span>
        </h1>
        <p className="text-xl text-foreground/40 font-medium max-w-2xl mx-auto">
          Choose a premium product to start manifesting your design. Each piece is production-grade and ready for customization.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {categories.map((cat, idx) => (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="group"
          >
            <div className="relative h-[500px] rounded-[3rem] bg-[#0d0d12] border border-white/5 overflow-hidden transition-all duration-700 hover:border-primary/30 shadow-2xl">
              {/* Base Image */}
              <img 
                src={cat.baseImage} 
                alt={cat.name}
                className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 group-hover:opacity-0"
              />
              
              {/* Hover Image (Sample Design) */}
              <img 
                src={cat.hoverImage} 
                alt={`${cat.name} Sample`}
                className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-1000 group-hover:opacity-100 scale-110 group-hover:scale-100"
              />

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-700" />

              {/* Content Overlay */}
              <div className="absolute inset-0 p-10 flex flex-col justify-end">
                <h3 className="text-4xl font-black text-white mb-6 uppercase italic tracking-tighter transition-transform duration-700 group-hover:-translate-y-2">
                  {cat.name}
                </h3>
                
                <Link 
                  href={`/flow/variant/${cat.id}`}
                  className="inline-flex items-center justify-center gap-4 px-8 py-5 rounded-2xl bg-white text-black font-black text-[10px] uppercase tracking-[0.3em] transition-all duration-500 hover:bg-primary hover:text-white hover:scale-105 active:scale-95 group/btn"
                >
                  Start Creating
                  <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-2 transition-transform" />
                </Link>
              </div>

              {/* Decorative Corner Label */}
              <div className="absolute top-8 right-8 px-4 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-[8px] font-black uppercase tracking-widest text-white/40">
                Premium Grade
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
