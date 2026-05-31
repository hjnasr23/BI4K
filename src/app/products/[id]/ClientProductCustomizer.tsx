'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Ruler, Palette, AlertCircle, Upload, Sparkles, ArrowLeft } from 'lucide-react';
import { useApp } from '@/lib/store';

export default function ClientProductCustomizer({ product }: { product: any }) {
  const router = useRouter();
  const { lang, profile } = useApp();
  
  // State for selections
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>(
    product.colors && product.colors.length > 0 ? product.colors[0] : ''
  );
  const [error, setError] = useState<string | null>(null);

  // Fallback for main image
  const mainImage = product.images && product.images.length > 0
    ? product.images[0]
    : (product.image_url || 'https://placehold.co/600x600/111116/FFF?text=No+Image');

  // Check if sale price is active
  const now = new Date();
  const isSaleActive =
    product.sale_price !== null &&
    product.sale_ends_at !== null &&
    new Date(product.sale_ends_at) > now;

  const hasValidDiscount = profile?.discount_rate > 0 && profile?.discount_expires_at && new Date(profile.discount_expires_at) > now;
  const originalPrice = product.price;
  const finalPrice = hasValidDiscount ? originalPrice * (1 - profile.discount_rate / 100) : originalPrice;

  const handleCustomize = (mode: 'upload' | 'ai') => {
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      setError(lang === 'fr' ? "Veuillez d'abord sélectionner une taille" : "Please select a size first");
      return;
    }
    setError(null);
    const sizeParam = selectedSize || 'Standard';
    const mockupParam = product.images?.[0] || product.image_url || '';
    const route = mode === 'upload' ? '/upload' : '/editor';
    const targetUrl = `${route}?productId=${product.id}&mockupUrl=${encodeURIComponent(mockupParam)}&size=${encodeURIComponent(sizeParam)}&color=${encodeURIComponent(selectedColor)}`;
    router.push(targetUrl);
  };

  return (
    <div className="min-h-screen pt-32 pb-20 bg-background px-4 text-foreground transition-colors duration-500">
      
      {/* Sleek <- Retour Back Navigation Link */}
      <div className="max-w-6xl mx-auto mb-8 animate-reveal">
        <button 
          type="button"
          onClick={() => router.back()} 
          className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-neutral-700 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" />
          {lang === 'fr' ? 'Retour au catalogue' : 'Back to Catalog'}
        </button>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-start animate-reveal">
        
        {/* Left: Product Image */}
        <div className="relative aspect-[4/5] w-full rounded-[3rem] bg-neutral-50 dark:bg-[#111116] border border-neutral-200 dark:border-white/5 shadow-2xl overflow-hidden flex items-center justify-center p-8">
          <img 
            src={mainImage} 
            alt={product.name} 
            className="w-full h-full object-contain drop-shadow-2xl transition-transform duration-700 hover:scale-105" 
          />
          {isSaleActive && (
            <div className="absolute top-8 left-8 bg-amber-500 text-[#111116] text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl shadow-lg border border-amber-400/20 backdrop-blur-md animate-pulse">
              🔥 Promotion
            </div>
          )}
        </div>

        {/* Right: Product Details & Options */}
        <div className="flex flex-col space-y-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-neutral-900 dark:text-white mb-4 leading-none">
              {product.name}
            </h1>
            
            {/* Price display (MAD) with discount logic */}
            <div className="flex items-center gap-4 mt-4">
              {hasValidDiscount ? (
                <>
                  <span className="text-3xl font-black text-red-500">{(finalPrice % 1 === 0 ? finalPrice : finalPrice.toFixed(2))} MAD</span>
                  <span className="text-lg font-bold text-neutral-500 line-through">{product.price} MAD</span>
                </>
              ) : isSaleActive ? (
                <>
                  <span className="text-3xl font-black text-green-600 dark:text-green-400">{product.sale_price} MAD</span>
                  <span className="text-lg font-bold text-neutral-500 line-through">{product.price} MAD</span>
                </>
              ) : (
                <span className="text-3xl font-black text-neutral-900 dark:text-brand-yellow">{product.price} MAD</span>
              )}
            </div>
          </div>
 
          {/* Description with refined elegant typography */}
          {product.description && (
            <div className="border-t border-neutral-200 dark:border-white/5 pt-6">
              <p className="text-neutral-600 dark:text-neutral-300 text-sm leading-relaxed font-medium tracking-wide">
                {product.description}
              </p>
            </div>
          )}

          {/* Interactive Color Selection */}
          {product.colors && product.colors.length > 0 && (
            <div className="border-t border-neutral-200 dark:border-white/5 pt-6">
              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mb-3">
                <Palette className="w-4 h-4 text-brand-yellow" /> {lang === 'fr' ? 'Couleur / Color' : 'Color / Color'}
              </label>
              <div className="flex flex-wrap gap-3">
                {product.colors.map((colorName: string) => {
                  const isSelected = selectedColor.toLowerCase() === colorName.toLowerCase();
                  return (
                    <button
                      key={colorName}
                      type="button"
                      onClick={() => setSelectedColor(colorName)}
                      className={`px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${
                        isSelected 
                          ? 'border-neutral-950 bg-neutral-950 text-white dark:border-white dark:bg-white dark:text-black scale-105 shadow-lg shadow-neutral-950/10 dark:shadow-white/10' 
                          : 'border border-neutral-300 text-neutral-900 bg-transparent dark:border-neutral-800 dark:text-neutral-300 hover:border-neutral-950 dark:hover:border-neutral-100'
                      }`}
                    >
                      {colorName}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Interactive Size Selection */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="border-t border-neutral-200 dark:border-white/5 pt-6">
              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mb-3">
                <Ruler className="w-4 h-4 text-brand-yellow" /> {lang === 'fr' ? 'Taille / Size *' : 'Size / Size *'}
              </label>
              <div className="flex flex-wrap gap-3">
                {product.sizes.map((size: string) => {
                  const isSelected = selectedSize === size;
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => {
                        setSelectedSize(size);
                        setError(null);
                      }}
                      className={`px-6 py-3.5 rounded-2xl font-black uppercase text-xs tracking-widest transition-all duration-300 ${
                        isSelected 
                          ? 'border-neutral-950 bg-neutral-950 text-white dark:border-white dark:bg-white dark:text-black scale-105 shadow-lg shadow-neutral-950/10 dark:shadow-white/10' 
                          : 'border border-neutral-300 text-neutral-900 bg-transparent dark:border-neutral-800 dark:text-neutral-300 hover:border-neutral-950 dark:hover:border-neutral-100'
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2.5 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold uppercase tracking-wider">
              <AlertCircle className="w-4.5 h-4.5 shrink-0" />
              {error}
            </div>
          )}

          {/* Action buttons with polished premium transitions */}
          <div className="pt-6 border-t border-neutral-200 dark:border-white/5 flex flex-col sm:flex-row gap-4">
            <button
              type="button"
              onClick={() => handleCustomize('upload')}
              className="flex-1 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl transition-all duration-300 flex items-center justify-center gap-2 hover:scale-105 active:scale-95 border border-neutral-950 text-neutral-950 bg-transparent hover:bg-neutral-50 dark:border-neutral-800 dark:text-white dark:hover:bg-neutral-900"
            >
              <Upload className="w-4 h-4 text-neutral-900 dark:text-white" />
              Upload Design
            </button>
            <button
              type="button"
              onClick={() => handleCustomize('ai')}
              className="flex-grow py-5 rounded-2xl bg-brand-blue hover:bg-blue-500 hover:brightness-110 text-white font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-brand-blue/20 transition-all duration-300 flex items-center justify-center gap-2 hover:scale-105 active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              Générer avec l'IA
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
