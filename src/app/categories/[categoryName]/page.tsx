'use client';

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useApp } from "@/lib/store";
import { translations } from "@/lib/translations";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { UploadCloud, Loader2, Sparkles, Search, Filter, Boxes } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  sale_price: number | null;
  sale_ends_at: string | null;
  stock: number;
  colors: string[];
  sizes: string[];
  image_url: string | null;
  images: string[];
  created_at: string;
}

const COLOR_MAP: Record<string, string> = {
  black: '#000000',
  white: '#ffffff',
  navy: '#1e3a8a',
  red: '#ef4444',
  gray: '#9ca3af',
  grey: '#9ca3af',
  olive: '#3f6212',
  blue: '#2563eb',
  green: '#16a34a',
  yellow: '#eab308',
  pink: '#db2777',
  gold: '#fbbf24',
  maroon: '#7f1d1d',
  heather: '#9ca3af',
  forest: '#064e3b',
  royal: '#2563eb',
};

const getColorHex = (colorName: string) => {
  const norm = colorName.toLowerCase().trim();
  return COLOR_MAP[norm] || norm;
};

/* ─────────── ProductCard Component ─────────── */
const ProductCard = ({ product, lang }: { product: Product; lang: string }) => {
  const [isHovered, setIsHovered] = useState(false);

  // Fallback: if images is empty, use the old image_url property for backward compatibility
  const defaultImage = product.images && product.images.length > 0
    ? product.images[0]
    : (product.image_url || '');

  const hoverImage = product.images && product.images.length > 1
    ? product.images[1]
    : defaultImage;

  const activeImage = isHovered ? hoverImage : defaultImage;

  // Calculate dynamic sale values
  const now = new Date();
  const isSaleActive = 
    product.sale_price !== null && 
    product.sale_ends_at !== null && 
    new Date(product.sale_ends_at) > now;

  const getCountdownText = () => {
    if (!product.sale_ends_at) return '';
    const diffMs = new Date(product.sale_ends_at).getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) return '';
    if (diffDays === 1) return lang === 'fr' ? 'Finit dans 1 jour' : 'Ends in 1 day';
    return lang === 'fr' ? `Finit dans ${diffDays} jours` : `Ends in ${diffDays} days`;
  };

  const countdownText = getCountdownText();

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <div 
      className="group relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="absolute -inset-4 bg-gradient-to-tr from-brand-blue/20 to-brand-yellow/20 rounded-[2.5rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
      
      <div className="relative rounded-[2rem] bg-card-bg border border-card-border overflow-hidden group-hover:border-brand-blue/50 transition-all duration-500 shadow-2xl bg-[#111116] flex flex-col h-full">
        <Link href={`/products/${product.slug}`}>
          <div className="aspect-[4/5] relative overflow-hidden bg-background/50 p-8 flex items-center justify-center cursor-pointer">
            {/* Image with transition crossfade */}
            <img 
              src={activeImage || "https://placehold.co/400x400/222/FFF?text=No+Image"} 
              alt={product.name}
              className="w-full h-full object-contain transition-all duration-500 ease-out drop-shadow-2xl"
            />
            <div className="absolute inset-0 bg-brand-blue/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            
            {/* Sale Ends Countdown badge */}
            {isSaleActive && countdownText && (
              <div className="absolute top-4 left-4 bg-amber-500/90 text-[#111116] text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl shadow-lg border border-amber-400/20 backdrop-blur-md animate-pulse z-20">
                🔥 {countdownText}
              </div>
            )}
          </div>
        </Link>
        
        <div className="p-8 flex flex-col justify-between flex-grow">
          <div className="flex justify-between items-start gap-4">
            <Link href={`/products/${product.slug}`} className="hover:text-brand-yellow transition-colors flex-1">
              <h3 className="font-black text-lg leading-tight uppercase tracking-tighter text-slate-100 group-hover:text-brand-yellow transition-colors">
                {product.name}
              </h3>
            </Link>
            
            {/* Pricing logic (MAD) */}
            <div className="text-right flex-shrink-0">
              {isSaleActive ? (
                <>
                  <p className="text-xl font-black text-green-400">{product.sale_price} MAD</p>
                  <p className="text-xs font-bold text-gray-500 line-through mt-0.5">{product.price} MAD</p>
                </>
              ) : (
                <p className="text-xl font-black text-brand-yellow">{product.price} MAD</p>
              )}
            </div>
          </div>
          
          {/* View Details Link */}
          <Link href={`/products/${product.slug}`} className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-brand-yellow transition-all">
            <span>{lang === 'fr' ? 'Voir les détails' : 'View details'}</span>
            <span className="w-5 h-5 rounded-full bg-white/5 group-hover:bg-brand-blue group-hover:text-white flex items-center justify-center transition-all group-hover:translate-x-1">
              &rarr;
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
};

/* ─────────── Main CategoryDetailsPage Component ─────────── */
export default function CategoryDetailsPage({ params }: { params?: { categoryName?: string; slug?: string } }) {
  const { lang } = useApp();
  const t = translations[lang];
  const pathname = usePathname();
  
  const categorySlug = pathname.split('/').pop() || '';
  const resolvedSlug = params?.slug || params?.categoryName || categorySlug;

  const [products, setProducts] = useState<Product[]>([]);
  const [categoryName, setCategoryName] = useState('');
  const [loading, setLoading] = useState(true);

  /* Sidebar Filters State */
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "price-asc" | "price-desc">("name");

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*, categories!inner(*)')
          .eq('categories.slug', resolvedSlug);

        if (error) {
          console.error("Supabase Error:", error.message);
          setProducts([]);
        } else if (data) {
          setProducts(data);
          if (data.length > 0 && data[0].categories) {
            setCategoryName((data[0].categories as any).name);
          }
        }
      } catch (err) {
        console.error('Failed to fetch category products:', err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [resolvedSlug]);

  /* Toggle Handlers */
  const toggleSize = (size: string) => {
    setSelectedSizes(prev => 
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
  };

  const toggleColor = (color: string) => {
    setSelectedColors(prev => 
      prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]
    );
  };

  const resetAllFilters = () => {
    setSelectedColors([]);
    setSelectedSizes([]);
    setSearchQuery("");
  };

  // Dynamically extract unique colors and sizes from the fetched products
  const uniqueColors = Array.from(
    new Set(products.flatMap(p => p.colors || []).map(c => c.trim()))
  ).filter(Boolean);

  const uniqueSizes = Array.from(
    new Set(products.flatMap(p => p.sizes || []).map(s => s.trim()))
  ).filter(Boolean);

  /* Client-Side Filtering & Sorting */
  const filteredProducts = products.filter(product => {
    // 1. Color filter
    if (selectedColors.length > 0) {
      const productColors = product.colors || [];
      const hasIntersectingColor = productColors.some(c => 
        selectedColors.some(sc => sc.toLowerCase() === c.toLowerCase())
      );
      if (!hasIntersectingColor) return false;
    }

    // 2. Size filter
    if (selectedSizes.length > 0) {
      const productSizes = product.sizes || [];
      const hasIntersectingSize = productSizes.some(s => 
        selectedSizes.some(ss => ss.toLowerCase() === s.toLowerCase())
      );
      if (!hasIntersectingSize) return false;
    }

    // 3. Search query filter
    if (searchQuery.trim()) {
      if (!product.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
    }

    return true;
  });

  // Apply sorting
  if (sortBy === "price-asc") {
    filteredProducts.sort((a, b) => a.price - b.price);
  } else if (sortBy === "price-desc") {
    filteredProducts.sort((a, b) => b.price - a.price);
  } else {
    filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
  }

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-500 flex flex-col">
      <Navbar />

      <main className="container mx-auto px-4 pt-32 pb-16 flex-grow relative z-10">
        {/* Header Section */}
        <div className="mb-12 animate-reveal">
           <Link href="/categories" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.4em] text-brand-blue/60 hover:text-brand-yellow transition-colors mb-6 group">
             <div className="w-5 h-5 rounded-full bg-brand-blue/10 flex items-center justify-center group-hover:-translate-x-1 transition-transform">
               &larr;
             </div>
             {lang === 'fr' ? 'Retour aux catégories' : 'Back to Categories'}
           </Link>
           
           <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
              <div className="max-w-3xl">
                 <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white uppercase">
                   {categoryName || resolvedSlug.replace('-', ' ')}
                 </h1>
              </div>
              
              <Link href="/upload" className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md font-black text-xs uppercase tracking-[0.2em] hover:bg-brand-blue hover:text-white hover:border-brand-blue hover:scale-[1.05] active:scale-[0.95] transition-all group shadow-xl shadow-black/20">
                <UploadCloud className="w-5 h-5 group-hover:animate-bounce" />
                {lang === 'fr' ? 'Upload Design' : 'Upload Design'}
              </Link>
           </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 mt-8">
          
          {/* Left Sidebar - Filters */}
          <aside className="w-full lg:w-72 flex-shrink-0 hidden lg:block">
            <div className="sticky top-32 space-y-2">
              <div className="flex items-center gap-3 mb-10">
                <Filter className="w-5 h-5 text-brand-yellow" />
                <h3 className="font-black uppercase tracking-[0.5em] text-xs">Filter Assets</h3>
              </div>

              {/* Sizes Filter */}
              {uniqueSizes.length > 0 && (
                <div className="border-b border-white/5 pb-8 mb-8 animate-reveal">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-yellow mb-6 flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-yellow" />
                    {lang === 'fr' ? 'Tailles' : 'Sizes'}
                  </h4>
                  <div className="space-y-3">
                    {uniqueSizes.map(size => {
                      const isSelected = selectedSizes.includes(size);
                      return (
                        <label key={size} className="flex items-center gap-4 cursor-pointer group" onClick={() => toggleSize(size)}>
                          <div className="relative flex items-center justify-center">
                            <input 
                              type="checkbox" 
                              checked={isSelected}
                              onChange={() => {}}
                              className="peer appearance-none w-5 h-5 rounded-lg border-2 border-white/10 bg-white/5 checked:bg-brand-blue checked:border-brand-blue transition-all cursor-pointer" 
                            />
                            <div className={`absolute w-2 h-2 bg-white rounded-sm transition-opacity pointer-events-none ${isSelected ? 'opacity-100' : 'opacity-0'}`} />
                          </div>
                          <span className={`text-xs font-black uppercase tracking-widest transition-colors ${isSelected ? 'text-foreground' : 'text-foreground/40 group-hover:text-foreground'}`}>{size}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Colors Filter */}
              {uniqueColors.length > 0 && (
                <div className="border-b border-white/5 pb-8 mb-8 animate-reveal">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-yellow mb-6 flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-yellow" />
                    {lang === 'fr' ? 'Couleurs' : 'Colors'}
                  </h4>
                  <div className="grid grid-cols-5 gap-3">
                    {uniqueColors.map(colorName => {
                      const isSelected = selectedColors.includes(colorName);
                      return (
                        <button 
                          key={colorName} 
                          type="button"
                          onClick={() => toggleColor(colorName)}
                          title={colorName}
                          className={`w-8 h-8 rounded-full border-2 transition-all shadow-lg active:scale-90 relative ${isSelected ? 'border-brand-blue scale-110' : 'border-white/10 hover:border-white/40 hover:scale-105'}`}
                          style={{ backgroundColor: getColorHex(colorName) }}
                        >
                          {isSelected && (
                            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-white mix-blend-difference">✓</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
              
              <button 
                type="button"
                onClick={resetAllFilters}
                className="w-full py-4 mt-10 rounded-2xl bg-white/5 border border-white/10 font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all text-slate-300"
              >
                Reset All Filters
              </button>
            </div>
          </aside>

          {/* Right Content Area */}
          <div className="flex-1">
            {/* Filter & Search Bar */}
            <div className="glass rounded-[2rem] p-4 mb-12 flex flex-col xl:flex-row gap-4 items-center justify-between bg-white/5 border border-white/10 backdrop-blur-md">
              <div className="relative w-full xl:w-96 group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-foreground/30 group-focus-within:text-brand-blue transition-colors">
                  <Search className="w-5 h-5" />
                </div>
                <input 
                  type="text" 
                  placeholder={lang === 'fr' ? "Rechercher un modèle..." : "Search mockups..."}
                  className="w-full pl-14 pr-6 py-4 bg-background/50 border border-card-border rounded-2xl focus:ring-4 focus:ring-brand-blue/10 focus:border-brand-blue outline-none transition-all font-medium text-sm text-slate-100 placeholder:text-slate-600"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-4 w-full xl:w-auto overflow-x-auto pb-2 xl:pb-0">
                  <div className="flex items-center gap-2 px-4 py-2 bg-background/50 border border-card-border rounded-xl flex-shrink-0">
                    <Filter className="w-4 h-4 text-brand-yellow" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-foreground/40">{lang === 'fr' ? "Trier" : "Sort"}</span>
                  </div>
                  <div className="flex gap-2 bg-background/50 border border-card-border p-1.5 rounded-2xl">
                    {[
                      { id: 'name', label: lang === 'fr' ? 'Nom' : 'Name' },
                      { id: 'price-asc', label: lang === 'fr' ? 'Prix ↑' : 'Price ↑' },
                      { id: 'price-desc', label: lang === 'fr' ? 'Prix ↓' : 'Price ↓' },
                    ].map((option) => (
                      <button
                        key={option.id}
                        onClick={() => setSortBy(option.id as any)}
                        className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                          sortBy === option.id 
                          ? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/20' 
                          : 'hover:bg-card-bg text-foreground/50'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col justify-center items-center py-40 gap-6">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full border-4 border-brand-blue/20 border-t-brand-blue animate-spin"></div>
                  <Sparkles className="absolute inset-0 m-auto w-6 h-6 text-brand-yellow animate-pulse" />
                </div>
                <p className="font-black uppercase tracking-[0.4em] text-brand-blue/60 text-xs">Loading Catalog</p>
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8 animate-reveal">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} lang={lang} />
                ))}
              </div>
            ) : (
              <div className="text-center py-32 glass rounded-[3rem] animate-reveal bg-white/5 border border-white/10 backdrop-blur-md">
                <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-8">
                  <Boxes className="w-10 h-10 text-foreground/20" />
                </div>
                <p className="text-2xl font-black text-foreground/40 uppercase tracking-tighter mb-8">{t.noProducts || 'AUCUN PRODUIT TROUVÉ'}</p>
                <Link href="/upload" className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-brand-blue hover:bg-brand-blue/90 text-white font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-brand-blue/20">
                  {lang === 'fr' ? 'Créer un design personnalisé' : 'Create custom design instead'} &rarr;
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
