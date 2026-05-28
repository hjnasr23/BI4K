'use client';

import Link from "next/link";
import { useEffect, useState } from "react";
import { useApp } from "@/lib/store";
import { translations } from "@/lib/translations";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Sparkles, ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import { supabase } from "@/lib/supabase";

interface Category {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
}

// ── Skeleton Card ────────────────────────────────────────────
const SkeletonCard = ({ index }: { index: number }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay: index * 0.06 }}
    className="relative h-[400px] rounded-3xl bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-white/5 overflow-hidden"
  >
    {/* Shimmer */}
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-neutral-200/10 dark:via-white/[0.03] to-transparent" />
    </div>
    <div className="relative z-10 p-8 flex flex-col justify-end h-full">
      <div>
        <div className="w-3/4 h-8 bg-neutral-200/50 dark:bg-white/5 rounded-xl mb-4" />
        <div className="w-1/2 h-4 bg-neutral-200/50 dark:bg-white/5 rounded-lg" />
      </div>
    </div>
  </motion.div>
);

// ── Category Card ────────────────────────────────────────────
const CategoryCard = ({ category, index, lang }: { category: Category; index: number; lang: string }) => {
  const t = translations[lang];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.5 }}
      viewport={{ once: true }}
    >
      <Link
        href={`/categories/${category.slug}`}
        className="relative block h-[400px] rounded-3xl overflow-hidden group cursor-pointer shadow-md dark:shadow-none border border-neutral-200 dark:border-white/10 transition-all duration-300 hover:-translate-y-1"
      >
        {/* Background Image */}
        {category.image_url ? (
          <img
            src={category.image_url}
            alt={category.name}
            className="absolute inset-0 w-full h-full object-cover opacity-100 transition-transform duration-700 ease-out group-hover:scale-110 z-0"
          />
        ) : (
          <div className="absolute inset-0 bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center z-0">
            <span className="text-neutral-400 dark:text-neutral-600 uppercase tracking-widest font-semibold text-xs">No Image</span>
          </div>
        )}

        {/* Gradient Overlay for contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent z-10 transition-opacity duration-300" />

        {/* Text Details strictly at bottom */}
        <div className="absolute bottom-0 left-0 p-8 z-20 w-full text-left">
          <h3 className="text-3xl font-bold text-white mb-2 tracking-wide uppercase">
            {category.name}
          </h3>
          
          <div className="text-neutral-300 opacity-0 transform translate-y-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 text-xs font-semibold uppercase tracking-wider flex items-center gap-2">
            {t.catalogDiscoverModels} <ArrowRight className="w-4 h-4 text-blue-400" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

// ── Main Page ────────────────────────────────────────────────
export default function CategoriesPage() {
  const { lang } = useApp();
  const t = translations[lang];
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
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] text-neutral-900 dark:text-white transition-colors duration-500">
      <Navbar />
      
      <style>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient {
          animation: gradient 6s ease infinite;
        }
      `}</style>

      <main className="relative pt-36 pb-24 max-w-7xl mx-auto px-6 lg:px-8">
        
        {/* Centered Header Section & Background Glow */}
        <div className="text-center max-w-3xl mx-auto mb-16 relative py-8 flex flex-col items-center justify-center">
          {/* Subtle Background Glows */}
          <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-72 h-72 rounded-full bg-blue-500 blur-[120px] opacity-20 pointer-events-none z-0" />
          <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-72 h-72 rounded-full bg-amber-500 blur-[120px] opacity-20 pointer-events-none z-0" />

          {/* Dynamic dynamic total badge */}
          {!loading && categories.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[10px] tracking-widest text-neutral-500 dark:text-neutral-400 font-medium uppercase border border-neutral-300 dark:border-neutral-800 rounded-full px-4 py-1.5 mx-auto w-fit mb-6 relative z-10 bg-neutral-50/50 dark:bg-[#111111]/50 backdrop-blur-sm"
            >
              {categories.length} {t.catalogCategoriesCount}
            </motion.div>
          )}

          {/* Center-aligned Gradient Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-5xl md:text-6xl font-extrabold tracking-tight text-neutral-900 dark:text-white mb-4 relative z-10"
          >
            <span className="bg-gradient-to-r from-blue-500 via-amber-500 to-blue-500 bg-[length:200%_auto] bg-clip-text text-transparent font-extrabold animate-gradient">
              {t.catalog}
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-neutral-500 dark:text-neutral-400 text-lg font-medium relative z-10"
          >
            {t.catalogSubtitle}
          </motion.p>
        </div>

        {/* Loading Skeleton */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
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
            className="text-center py-20 bg-neutral-50 dark:bg-[#111111] border border-neutral-200 dark:border-white/10 rounded-3xl max-w-2xl mx-auto shadow-sm"
          >
            <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-8 h-8 text-red-500" />
            </div>
            <p className="text-xl font-bold text-neutral-900 dark:text-white mb-2 uppercase tracking-wide">
              {t.catalogFailedToLoad}
            </p>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-all cursor-pointer"
            >
              {t.catalogRetry}
            </button>
          </motion.div>
        )}

        {/* Empty State */}
        {!loading && !error && categories.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20 bg-neutral-50 dark:bg-[#111111] border border-neutral-200 dark:border-white/10 rounded-3xl max-w-2xl mx-auto shadow-sm"
          >
            <div className="w-16 h-16 rounded-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-8 h-8 text-neutral-400" />
            </div>
            <p className="text-2xl font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
              {t.catalogNoCategories}
            </p>
          </motion.div>
        )}

        {/* Premium Responsive Categories Grid */}
        {!loading && !error && categories.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12 relative z-10">
            {categories.map((cat, idx) => (
              <CategoryCard key={cat.id} category={cat} index={idx} lang={lang} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
