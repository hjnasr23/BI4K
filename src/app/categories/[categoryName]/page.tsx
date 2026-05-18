'use client';
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useApp } from "@/lib/store";
import { translations } from "@/lib/translations";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { UploadCloud, ShoppingBag, Loader2, Sparkles, Search, ChevronDown, Filter, LayoutGrid, List, Boxes, ArrowRight } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { motion } from "motion/react";

interface Product {
  id: string;
  name: string;
  price?: number;
  image: string;
  description?: string;
}

const FilterSection = ({ title, options }: { title: string, options: string[] }) => (
  <div className="border-b border-white/5 pb-8 mb-8 animate-reveal">
    <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-6 flex items-center gap-3">
      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
      {title}
    </h4>
    <div className="space-y-3">
      {options.map(opt => (
        <label key={opt} className="flex items-center gap-4 cursor-pointer group">
          <div className="relative flex items-center justify-center">
            <input 
              type="checkbox" 
              className="peer appearance-none w-5 h-5 rounded-lg border-2 border-white/10 bg-white/5 checked:bg-primary checked:border-primary transition-all cursor-pointer" 
            />
            <div className="absolute w-2 h-2 bg-white rounded-sm opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
          </div>
          <span className="text-xs font-black uppercase tracking-widest text-foreground/40 group-hover:text-foreground transition-colors">{opt}</span>
        </label>
      ))}
    </div>
  </div>
);

const ColorSwatchFilter = ({ title }: { title: string }) => {
  const colors = [
    { name: 'Black', hex: '#000000' },
    { name: 'White', hex: '#ffffff' },
    { name: 'Heather', hex: '#9ca3af' },
    { name: 'Navy', hex: '#1e3a8a' },
    { name: 'Red', hex: '#ef4444' },
    { name: 'Forest', hex: '#064e3b' },
    { name: 'Royal', hex: '#2563eb' },
    { name: 'Gold', hex: '#fbbf24' },
    { name: 'Maroon', hex: '#7f1d1d' },
    { name: 'Pink', hex: '#fbcfe8' },
  ];

  return (
    <div className="border-b border-white/5 pb-8 mb-8 animate-reveal">
      <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-6 flex items-center gap-3">
        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
        {title}
      </h4>
      <div className="grid grid-cols-5 gap-3">
        {colors.map(c => (
          <button 
            key={c.name} 
            title={c.name}
            className="w-8 h-8 rounded-full border-2 border-white/10 hover:border-primary hover:scale-110 transition-all shadow-lg active:scale-90"
            style={{ backgroundColor: c.hex }}
          />
        ))}
      </div>
    </div>
  );
};

export default function CategoryDetailsPage() {
  const { lang } = useApp();
  const t = translations[lang];
  const pathname = usePathname();
  
  const categoryId = pathname.split('/').pop() || '';
  
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "price-asc" | "price-desc">("name");

  // Dummy products as fallback
  const dummyProducts = [
    { id: '1', name: "Premium Heavyweight Tee", price: 300, image: "https://placehold.co/400x400/222/FFF?text=Heavyweight+Tee", description: "" },
    { id: '2', name: "Essential Comfort Hoodie", price: 350, image: "https://placehold.co/400x400/222/FFF?text=Comfort+Hoodie", description: "" },
    { id: '3', name: "Streetwear Oversized Sweat", price: 450, image: "https://placehold.co/400x400/222/FFF?text=Oversized+Sweat", description: "" },
    { id: '4', name: "Classic Cotton V-Neck", price: 400, image: "https://placehold.co/400x400/222/FFF?text=V-Neck+Tee", description: "" },
  ];

  useEffect(() => {
    async function fetchData() {
      try {
        let query;
        const audienceList = ['men', 'women', 'kids'];
        const viewList = ['front', 'back'];
        
        if (audienceList.includes(categoryId)) {
          query = supabase.from('Mockup').select('*').eq('target_audience', categoryId);
        } else if (viewList.includes(categoryId)) {
          query = supabase.from('Mockup').select('*').eq('view', categoryId);
        } else {
          let clothType = categoryId;
          if (categoryId === 'tshirts') clothType = 't-shirt';
          if (categoryId === 'phone-cases') clothType = 'phone-case';
          
          const { data: prodData } = await supabase.from('Product').select('*').eq('categoryId', categoryId);
          if (prodData && prodData.length > 0) {
            setProducts(prodData.map(p => ({ ...p, image: p.image || '' })));
            setLoading(false);
            return;
          }
          query = supabase.from('Mockup').select('*').eq('cloth_type', clothType);
        }
        
        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          setProducts(data.map(m => ({
            id: m.id,
            name: m.name,
            image: m.url,
            price: 25.00
          })));
        } else {
          setProducts(dummyProducts);
        }
      } catch (err) {
        setProducts(dummyProducts);
      }
      setLoading(false);
    }
    fetchData();
  }, [categoryId]);

  useEffect(() => {
    let result = [...products];
    if (searchQuery) {
      result = result.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    if (sortBy === "price-asc") {
      result.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sortBy === "price-desc") {
      result.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }
    setFilteredProducts(result);
  }, [searchQuery, sortBy, products]);

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-500 flex flex-col">
      <Navbar />

      <main className="container mx-auto px-4 pt-32 pb-16 flex-grow relative z-10">
        {/* Header Section */}
        <div className="mb-12 animate-reveal">
           <Link href="/categories" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.4em] text-primary/60 hover:text-primary transition-colors mb-6 group">
             <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center group-hover:-translate-x-1 transition-transform">
               &larr;
             </div>
             {lang === 'fr' ? 'Retour aux catégories' : 'Back to Categories'}
           </Link>
           
           <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
              <div className="max-w-3xl">
                 {/* Titles removed per request */}
              </div>
              
              <Link href="/upload" className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md font-black text-xs uppercase tracking-[0.2em] hover:bg-primary hover:text-white hover:border-primary hover:scale-[1.05] active:scale-[0.95] transition-all group shadow-xl shadow-black/20">
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
                <Filter className="w-5 h-5 text-primary" />
                <h3 className="font-black uppercase tracking-[0.5em] text-xs">Filter Assets</h3>
              </div>

              <FilterSection title="Categories" options={['T-Shirts', 'Hoodies', 'Sweatshirts', 'Accessories']} />
              <FilterSection title="Fabric Weight" options={['Heavyweight', 'Midweight', 'Lightweight']} />
              <ColorSwatchFilter title="Color Palette" />
              <FilterSection title="Size Range" options={['XS-XL', 'S-2XL', 'S-5XL', 'One Size']} />
              
              <button className="w-full py-4 mt-10 rounded-2xl bg-white/5 border border-white/10 font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all">
                Reset All Filters
              </button>
            </div>
          </aside>

          {/* Right Content Area */}
          <div className="flex-1">
            {/* Filter & Search Bar */}
            <div className="glass rounded-[2rem] p-4 mb-12 flex flex-col xl:flex-row gap-4 items-center justify-between">
              <div className="relative w-full xl:w-96 group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-foreground/30 group-focus-within:text-primary transition-colors">
                  <Search className="w-5 h-5" />
                </div>
                <input 
                  type="text" 
                  placeholder={lang === 'fr' ? "Rechercher un modèle..." : "Search mockups..."}
                  className="w-full pl-14 pr-6 py-4 bg-background/50 border border-card-border rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-medium text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-4 w-full xl:w-auto overflow-x-auto pb-2 xl:pb-0">
                  <div className="flex items-center gap-2 px-4 py-2 bg-background/50 border border-card-border rounded-xl flex-shrink-0">
                    <Filter className="w-4 h-4 text-primary" />
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
                          ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                          : 'hover:bg-card-bg text-foreground/50'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
              </div>
            </div>

            {/* Mobile Filter Trigger (Only visible on small screens) */}
            <button className="lg:hidden w-full mb-8 py-5 rounded-2xl border-2 border-dashed border-white/10 flex items-center justify-center gap-3 font-black uppercase tracking-[0.3em] text-[10px] hover:bg-white/5 transition-all">
              <Filter className="w-4 h-4" />
              Toggle Mobile Filters
            </button>

            {loading ? (
              <div className="flex flex-col justify-center items-center py-40 gap-6">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
                  <Sparkles className="absolute inset-0 m-auto w-6 h-6 text-primary animate-pulse" />
                </div>
                <p className="font-black uppercase tracking-[0.4em] text-primary/60 text-xs">Loading Catalog</p>
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8 animate-reveal">
                {filteredProducts.map((product) => (
                  <div key={product.id} className="group relative">
                    {/* Glow effect on hover */}
                    <div className="absolute -inset-4 bg-gradient-to-tr from-primary/20 to-accent/20 rounded-[2.5rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    
                    <div className="relative rounded-[2rem] bg-card-bg border border-card-border overflow-hidden group-hover:border-primary/50 transition-all duration-500 shadow-2xl">
                      <div className="aspect-[4/5] relative overflow-hidden bg-background/50 p-8 flex items-center justify-center">
                        <img 
                          src={product.image || "https://placehold.co/400x400/222/FFF?text=No+Image"} 
                          alt={product.name}
                          className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700 ease-out drop-shadow-2xl"
                        />
                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                      </div>
                      
                      <div className="p-8">
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="font-black text-lg leading-tight group-hover:text-primary transition-colors line-clamp-2 uppercase tracking-tighter">
                            {product.name}
                          </h3>
                          <p className="text-xl font-black text-primary ml-4">{product.price} MAD</p>
                        </div>
                        
                        <Link 
                          href={`/customize/${product.id}?mockupUrl=${encodeURIComponent(product.image)}`}
                          className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-foreground text-background font-black text-xs uppercase tracking-[0.2em] hover:bg-primary hover:text-white transition-all active:scale-[0.95] shadow-xl group/btn"
                        >
                          <ShoppingBag className="w-4 h-4 group-hover/btn:rotate-12 transition-transform" />
                          {lang === 'fr' ? 'Personnaliser' : 'Customize'}
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-32 glass rounded-[3rem] animate-reveal">
                <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-8">
                  <Boxes className="w-10 h-10 text-foreground/20" />
                </div>
                <p className="text-2xl font-black text-foreground/40 uppercase tracking-tighter mb-8">{t.noProducts}</p>
                <Link href="/upload" className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20">
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
