'use client';

import { useState, useEffect } from 'react';
import { useApp } from '@/lib/store';
import { createClient } from '@/lib/supabase/client';
import { Sparkles, Plus, Clock, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface Creation {
  id: string;
  user_id: string;
  product_id: string;
  prompt: string;
  image_url: string;
  created_at: string;
  products?: {
    name: string;
    price: number;
    category?: string;
  } | null;
}

export default function CreationsPage() {
  const { showToast } = useApp();
  const [creations, setCreations] = useState<Creation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCreations() {
      try {
        const supabase = createClient();
        const { data: { user }, error: userErr } = await supabase.auth.getUser();

        if (userErr || !user) {
          throw new Error('Authentication required');
        }

        // Relational query joining products to creations table
        const { data, error } = await supabase
          .from('creations')
          .select('*, products(name, price)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        setCreations((data as unknown as Creation[]) || []);
      } catch (err: any) {
        console.error('Failed to fetch creations:', err);
        showToast('Erreur lors du chargement de vos créations.', 'error');
      } finally {
        setLoading(false);
      }
    }

    fetchCreations();
  }, [showToast]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex items-center justify-between animate-pulse">
          <div>
            <div className="h-3 w-16 bg-neutral-200 dark:bg-neutral-800 rounded mb-2"></div>
            <div className="h-8 w-48 bg-neutral-200 dark:bg-neutral-800 rounded mb-1"></div>
            <div className="h-4 w-60 bg-neutral-200 dark:bg-neutral-800 rounded mt-2"></div>
          </div>
          <div className="w-36 h-10 bg-neutral-200 dark:bg-neutral-800 rounded-xl"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-white/5 rounded-2xl overflow-hidden animate-pulse flex flex-col h-full">
              <div className="aspect-square bg-neutral-200 dark:bg-neutral-800"></div>
              <div className="p-5 flex-1 space-y-4">
                <div className="h-5 w-3/4 bg-neutral-200 dark:bg-neutral-800 rounded"></div>
                <div className="space-y-2">
                  <div className="h-3 w-full bg-neutral-200 dark:bg-neutral-800 rounded"></div>
                  <div className="h-3 w-5/6 bg-neutral-200 dark:bg-neutral-800 rounded"></div>
                </div>
                <div className="pt-3 border-t border-neutral-100 dark:border-white/5 h-4 w-28 bg-neutral-200 dark:bg-neutral-800 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">Dashboard</p>
          <h1 className="text-2xl font-extrabold text-neutral-900 dark:text-white tracking-tight">Mes Créations</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">Vos designs créés avec notre IA.</p>
        </div>
        <Link
          href="/categories"
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          Nouveau design
        </Link>
      </div>

      {creations.length === 0 ? (
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-white/5 rounded-2xl p-12 text-center shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/20 to-blue-500/20 flex items-center justify-center mx-auto mb-4 border border-amber-500/10">
            <Sparkles className="w-7 h-7 text-amber-500 animate-pulse" />
          </div>
          <p className="font-bold text-neutral-900 dark:text-white">Aucune création</p>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1 mb-6">
            Commencez à créer des designs uniques avec notre IA.
          </p>
          <Link
            href="/categories"
            className="inline-flex items-center gap-2 px-5 py-3 bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Sparkles className="w-4 h-4" />
            Créer mon premier design
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {creations.map((c) => (
            <div
              key={c.id}
              className="group bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-white/5 rounded-2xl overflow-hidden shadow-md hover:shadow-xl hover:border-neutral-300 dark:hover:border-white/10 transition-all duration-300 flex flex-col h-full"
            >
              {/* Image Container with Hover Zoom */}
              <div className="aspect-square bg-neutral-100 dark:bg-neutral-800/40 relative overflow-hidden shrink-0">
                {c.image_url ? (
                  <img
                    src={c.image_url}
                    alt={c.prompt || 'Création'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-neutral-200 dark:bg-neutral-800 text-neutral-400">
                    <AlertCircle className="w-8 h-8 mb-2" />
                    <span className="text-xs">Aperçu indisponible</span>
                  </div>
                )}
                {/* Product Category/Badge Overlay */}
                {c.products?.category && (
                  <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-[9px] font-extrabold uppercase tracking-widest text-white px-2.5 py-1 rounded-lg border border-white/10">
                    {c.products.category}
                  </div>
                )}
                {/* Price Tag Overlay */}
                {c.products?.price && (
                  <div className="absolute bottom-3 right-3 bg-blue-600/90 dark:bg-blue-500/80 backdrop-blur-sm text-xs font-black italic text-white px-2.5 py-1.5 rounded-lg shadow">
                    {c.products.price.toFixed(2)} $
                  </div>
                )}
              </div>

              {/* Text / Metadata Section */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  {/* Joined Product Name */}
                  <h3 className="font-bold text-neutral-900 dark:text-white text-base tracking-tight mb-2 group-hover:text-blue-500 transition-colors line-clamp-1">
                    {c.products?.name || 'Produit personnalisé'}
                  </h3>
                  
                  {/* Truncated Prompt */}
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2 leading-relaxed mb-4" title={c.prompt}>
                    &ldquo;{c.prompt || 'Design généré sans prompt'}&rdquo;
                  </p>
                </div>

                {/* Footer with date */}
                <div className="pt-3 border-t border-neutral-100 dark:border-white/5 flex items-center justify-between text-[10px] text-neutral-400 dark:text-neutral-500 uppercase tracking-widest font-extrabold">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 shrink-0" />
                    {new Date(c.created_at).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
