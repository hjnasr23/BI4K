'use client';

import { useApp } from '@/lib/store';
import { Package, Sparkles, User, Settings, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const quickLinks = [
  { label: 'Mon Profil', description: 'Gérer vos informations personnelles', href: '/dashboard/profile', icon: User, color: 'from-blue-500 to-blue-600' },
  { label: 'Mes Créations', description: 'Voir et gérer vos designs IA', href: '/dashboard/creations', icon: Sparkles, color: 'from-amber-500 to-orange-500' },
  { label: 'Mes Commandes', description: 'Suivre vos commandes en cours', href: '/dashboard/orders', icon: Package, color: 'from-green-500 to-emerald-600' },
  { label: 'Paramètres', description: 'Préférences et sécurité du compte', href: '/dashboard/settings', icon: Settings, color: 'from-purple-500 to-violet-600' },
];

export default function DashboardPage() {
  const { user, profile, lang } = useApp();
  const displayName = profile?.full_name || user?.user_metadata?.full_name || 'Creator';
  const userInitial = displayName.charAt(0).toUpperCase();

  return (
    <div className="max-w-4xl mx-auto">
      {/* Welcome Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-amber-500 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-500/20">
            {userInitial}
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">Tableau de Bord</p>
            <h1 className="text-2xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
              Bonjour, {displayName}
            </h1>
          </div>
        </div>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-3">
          Gérez vos créations, commandes et paramètres depuis votre espace personnel.
        </p>
      </div>

      {/* Quick Links Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {quickLinks.map(({ label, description, href, icon: Icon, color }) => (
          <Link
            key={href}
            href={href}
            className="group relative bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-white/5 rounded-2xl p-5 hover:border-blue-200 dark:hover:border-white/10 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300"
          >
            <div className="flex items-start gap-4">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-md shrink-0`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-neutral-900 dark:text-white text-sm">{label}</p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">{description}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-neutral-300 dark:text-neutral-600 group-hover:text-blue-500 group-hover:translate-x-1 transition-all shrink-0 mt-0.5" />
            </div>
          </Link>
        ))}
      </div>

      {/* Account info strip */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-500/5 border border-blue-100 dark:border-blue-500/10 rounded-2xl flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
        <p className="text-xs text-neutral-600 dark:text-neutral-400 font-medium">
          Connecté en tant que <span className="font-bold text-neutral-900 dark:text-white">{user?.email}</span>
        </p>
      </div>
    </div>
  );
}
