'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { ChevronLeft, ArrowRight, Palette, Ruler, ShoppingBag, Sparkles, Shirt } from 'lucide-react';

const productsData: Record<string, any> = {
  't-shirts': {
    name: 'Premium T-Shirt',
    basePrice: 24,
    colors: [
      { id: 'black', label: 'Black', hex: '#111827', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop' },
      { id: 'white', label: 'White', hex: '#f9fafb', image: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?q=80&w=800&auto=format&fit=crop' },
      { id: 'navy', label: 'Navy', hex: '#1e40af', image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=800&auto=format&fit=crop' },
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    styles: ['Crew Neck', 'V-Neck'],
  },
  'hoodies': {
    name: 'Comfort Hoodie',
    basePrice: 45,
    colors: [
      { id: 'black', label: 'Black', hex: '#111827', image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800&auto=format&fit=crop' },
      { id: 'gray', label: 'Gray', hex: '#6b7280', image: 'https://images.unsplash.com/photo-1556821840-4c07981503e1?q=80&w=800&auto=format&fit=crop' },
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    styles: ['Pullover', 'Zip-up'],
  },
};

export default function VariantPage() {
  const params = useParams();
  const router = useRouter();
  const categoryId = params.categoryId as string;
  
  const product = productsData[categoryId] || productsData['t-shirts'];
  
  const [selectedColor, setSelectedColor] = useState(product.colors[0]);
  const [selectedSize, setSelectedSize] = useState(product.sizes[1]);
  const [selectedStyle, setSelectedStyle] = useState(product.styles[0]);

  useEffect(() => {
    // Sync to localStorage
    const state = {
      categoryId,
      productName: product.name,
      color: selectedColor,
      size: selectedSize,
      style: selectedStyle,
    };
    localStorage.setItem('pod_flow_state', JSON.stringify(state));
  }, [selectedColor, selectedSize, selectedStyle, categoryId, product.name]);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-12">
        <button 
          onClick={() => router.back()}
          className="group inline-flex items-center gap-3 text-xs font-black uppercase tracking-[0.3em] text-foreground/30 hover:text-primary transition-colors"
        >
          <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:-translate-x-1 transition-transform">
            <ChevronLeft className="w-5 h-5" />
          </div>
          Back to Categories
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_450px] gap-12 items-start">
        {/* Left: Product Preview */}
        <div className="relative aspect-[4/5] lg:aspect-auto lg:h-[700px] rounded-[4rem] bg-[#0d0d12] border border-white/5 overflow-hidden shadow-2xl flex items-center justify-center p-12 group">
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
          
          <motion.img 
            key={selectedColor.id}
            src={selectedColor.image}
            alt={product.name}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative z-10 w-full h-full object-contain drop-shadow-[0_40px_80px_rgba(0,0,0,0.5)]"
          />

          {/* Perspective Guides */}
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-4 z-20">
             {['Front', 'Back'].map(view => (
               <button key={view} className="px-6 py-2.5 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 text-[9px] font-black uppercase tracking-widest text-white/40 hover:text-white hover:border-primary/50 transition-all">
                 {view} View
               </button>
             ))}
          </div>
        </div>

        {/* Right: Configuration Panel */}
        <div className="space-y-10 animate-reveal">
          <header>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-primary/10 border border-primary/20 text-primary text-[9px] font-black uppercase tracking-[0.3em] mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              Elite Customization
            </div>
            <h1 className="text-5xl font-black tracking-tighter uppercase italic leading-none mb-4">
              {product.name}
            </h1>
            <div className="flex items-center gap-4">
              <span className="text-3xl font-black text-primary">${product.basePrice}.00</span>
              <span className="text-[10px] font-black text-foreground/20 uppercase tracking-[0.3em]">Inclusive of Production</span>
            </div>
          </header>

          <div className="space-y-10 p-10 rounded-[3rem] bg-[#0d0d12] border border-white/5 relative overflow-hidden">
            <div className="absolute -right-20 -top-20 w-80 h-80 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

            {/* Color Selector */}
            <div className="space-y-4 relative z-10">
              <div className="flex items-center gap-3">
                <Palette className="w-4 h-4 text-primary" />
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40">Select Primary Color</label>
              </div>
              <div className="flex flex-wrap gap-4">
                {product.colors.map((color: any) => (
                  <button
                    key={color.id}
                    onClick={() => setSelectedColor(color)}
                    className={`group relative w-12 h-12 rounded-2xl border-2 transition-all duration-500 ${selectedColor.id === color.id ? 'border-primary scale-110 shadow-[0_0_20px_rgba(99,102,241,0.3)]' : 'border-white/5 hover:border-white/20'}`}
                  >
                    <div 
                      className="absolute inset-1.5 rounded-xl"
                      style={{ backgroundColor: color.hex }}
                    />
                    {selectedColor.id === color.id && (
                      <motion.div layoutId="color-active" className="absolute -inset-1 border-2 border-primary rounded-2xl pointer-events-none" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Size Selector */}
            <div className="space-y-4 relative z-10">
              <div className="flex items-center gap-3">
                <Ruler className="w-4 h-4 text-secondary" />
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40">Select Size</label>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size: string) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`min-w-[60px] h-12 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-500 ${selectedSize === size ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white/5 text-foreground/40 hover:bg-white/10 hover:text-foreground'}`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Style Selector */}
            <div className="space-y-4 relative z-10">
              <div className="flex items-center gap-3">
                <Shirt className="w-4 h-4 text-accent" />
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40">Select Style</label>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {product.styles.map((style: string) => (
                  <button
                    key={style}
                    onClick={() => setSelectedStyle(style)}
                    className={`h-14 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-500 border ${selectedStyle === style ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' : 'bg-white/5 border-white/5 text-foreground/40 hover:border-white/20'}`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={() => router.push('/flow/editor')}
            className="w-full group relative flex items-center justify-center gap-4 px-12 py-7 rounded-[2.5rem] bg-primary text-white font-black text-xs uppercase tracking-[0.4em] shadow-[0_20px_50px_rgba(99,102,241,0.3)] hover:shadow-primary/60 hover:-translate-y-1 transition-all duration-500 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            <ShoppingBag className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            Next: Add Your Design
            <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
          </button>

          <div className="flex items-center justify-center gap-3 opacity-20">
             <div className="w-1.5 h-1.5 rounded-full bg-foreground" />
             <p className="text-[9px] font-black uppercase tracking-[0.5em]">Real-time Inventory Sync</p>
             <div className="w-1.5 h-1.5 rounded-full bg-foreground" />
          </div>
        </div>
      </div>
    </div>
  );
}
