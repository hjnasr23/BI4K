'use client';
import Link from "next/link";
import { useEffect, useState } from "react";
import { useApp } from "@/lib/store";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Sparkles, ArrowRight, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { supabase } from "@/lib/supabase";

interface Category {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
}

// Gradient accents cycled across cards for visual variety
const GRADIENT_ACCENTS = [
  'from-brand-blue/40',
  'from-rose-500/40',
  'from-amber-500/40',
  'from-emerald-500/40',
  'from-brand-blue/40',
  'from-brand-yellow/40',
  'from-brand-yellow/40',
  'from-teal-500/40',
];

// ── Skeleton Card ────────────────────────────────────────────
const SkeletonCard = ({ index }: { index: number }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay: index * 0.06 }}
    className="relative h-[400px] rounded-[3rem] bg-[#0d0d12] border border-white/5 overflow-hidden"
  >
    {/* Shimmer */}
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/[0.03] to-transparent" />
    </div>
    <div className="relative z-10 p-10 flex flex-col justify-between h-full">
      <div>
        <div className="w-3/4 h-8 bg-white/5 rounded-2xl mb-4" />
        <div className="w-1/2 h-4 bg-white/5 rounded-xl" />
      </div>
      <div className="w-1/3 h-4 bg-white/5 rounded-xl" />
    </div>
  </motion.div>
);

// ── Category Card ────────────────────────────────────────────
const CategoryCard = ({ category, index, lang }: { category: Category; index: number; lang: string }) => {
  const gradient = GRADIENT_ACCENTS[index % GRADIENT_ACCENTS.length];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      viewport={{ once: true }}
    >
      <Link
        href={`/categories/${category.slug}`}
        className="group relative h-[400px] rounded-[3rem] bg-[#0d0d12] border border-white/5 flex flex-col justify-between overflow-hidden hover:border-brand-blue/30 transition-all duration-700 shadow-2xl"
      >
        {/* Background Image */}
        {category.image_url && (
          <img
            src={category.image_url}
            alt={category.name}
            className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-opacity duration-700 scale-100 group-hover:scale-105"
          />
        )}

        {/* Gradient Orb */}
        <div className={`absolute -right-20 -top-20 w-80 h-80 bg-gradient-to-br ${gradient} to-transparent rounded-full blur-[100px] opacity-20 group-hover:opacity-40 transition-opacity duration-1000`} />

        {/* Dark Overlay for Readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none" />

        <div className="relative z-10 p-10">
          <h3 className="text-4xl font-black text-white mb-4 leading-none uppercase italic tracking-tighter">
            {category.name}
          </h3>
        </div>

        <div className="relative z-10 p-10 flex items-center justify-between">
          <div className="flex items-center gap-3 text-brand-yellow font-black uppercase tracking-[0.3em] text-[10px] opacity-0 group-hover:opacity-100 translate-x-[-20px] group-hover:translate-x-0 transition-all duration-500">
            {lang === 'fr' ? 'Explorer' : 'Explore'} <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

// ── Main Page ────────────────────────────────────────────────
export default function CategoriesPage() {
  const { lang } = useApp();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const { data, error: dbError } = await supabase
          .from('categories')
          .select('id, name, slug, image_url')
          .order('created_at', { ascending: true });

        if (dbError) throw dbError;
        setCategories(data || []);
      } catch (err: any) {
        console.error('Failed to fetch categories:', err);
        setError(err.message || 'Failed to load categories');
      } finally {
        setLoading(false);
      }
    }
    fetchCategories();
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-500">
      <Navbar />

      <main className="relative pt-48 pb-20">
        {/* Spatial Background Blobs */}
        <div className="absolute top-0 right-[-10%] w-[60%] h-[60%] bg-brand-blue/5 rounded-full blur-[160px] animate-blob pointer-events-none opacity-50" />
        <div className="absolute bottom-0 left-[-10%] w-[60%] h-[60%] bg-brand-yellow/5 rounded-full blur-[160px] animate-blob animation-delay-2000 pointer-events-none opacity-50" />

        <div className="container mx-auto px-6 relative z-10">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-16"
          >
            <div className="flex items-center justify-between mb-12">
              <h1 className="text-5xl md:text-6xl font-black tracking-tighter uppercase italic flex items-center gap-5">
                <div className="w-1.5 h-12 bg-brand-blue rounded-full shadow-[0_0_20px_rgba(74,144,226,0.5)]" />
                {lang === 'fr' ? 'Catalogue' : 'Catalogue'}
              </h1>
              {!loading && categories.length > 0 && (
                <div className="px-5 py-2 rounded-full bg-brand-blue/5 border border-brand-blue/20 text-brand-yellow text-[9px] font-black uppercase tracking-[0.3em]">
                  {categories.length} {lang === 'fr' ? 'Catégories' : 'Categories'}
                </div>
              )}
            </div>
          </motion.div>

          {/* Loading Skeleton */}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} index={i} />
              ))}
            </div>
          )}

          {/* Error State */}
          {!loading && error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-32 glass rounded-[3rem]"
            >
              <div className="w-20 h-20 rounded-3xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-8">
                <Sparkles className="w-10 h-10 text-red-400" />
              </div>
              <p className="text-xl font-black text-foreground/40 uppercase tracking-tighter mb-4">
                {lang === 'fr' ? 'Erreur de chargement' : 'Failed to Load'}
              </p>
              <p className="text-sm text-foreground/30 mb-8">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-brand-blue hover:bg-brand-blue/90 text-white font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-brand-blue/20"
              >
                {lang === 'fr' ? 'Réessayer' : 'Retry'}
              </button>
            </motion.div>
          )}

          {/* Empty State */}
          {!loading && !error && categories.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-32 glass rounded-[3rem]"
            >
              <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-8">
                <Sparkles className="w-10 h-10 text-foreground/20" />
              </div>
              <p className="text-2xl font-black text-foreground/40 uppercase tracking-tighter">
                {lang === 'fr' ? 'Aucune catégorie disponible' : 'No categories available'}
              </p>
            </motion.div>
          )}

          {/* Categories Grid */}
          {!loading && !error && categories.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {categories.map((cat, idx) => (
                  <CategoryCard key={cat.id} category={cat} index={idx} lang={lang} />
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
