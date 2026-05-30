'use client';

import { Sparkles, Plus } from 'lucide-react';
import Link from 'next/link';

export default function CreationsPage() {
  // Placeholder — wire to real Supabase designs table later
  const creations: any[] = [];

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">Dashboard</p>
          <h1 className="text-2xl font-extrabold text-neutral-900 dark:text-white tracking-tight">Mes Créations</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">Vos designs créés avec notre IA.</p>
        </div>
        <Link
          href="/categories"
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-blue-500/20"
        >
          <Plus className="w-4 h-4" />
          Nouveau design
        </Link>
      </div>

      {creations.length === 0 ? (
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-white/5 rounded-2xl p-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/20 to-blue-500/20 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-7 h-7 text-amber-500" />
          </div>
          <p className="font-bold text-neutral-900 dark:text-white">Aucune création</p>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1 mb-4">
            Commencez à créer des designs uniques avec notre IA.
          </p>
          <Link
            href="/categories"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-amber-500/20"
          >
            <Sparkles className="w-4 h-4" />
            Créer mon premier design
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {creations.map((c) => (
            <div key={c.id} className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-white/5 rounded-2xl overflow-hidden" />
          ))}
        </div>
      )}
    </div>
  );
}
