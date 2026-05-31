'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/lib/store';
import { createClient } from '@/lib/supabase/client';
import {
  User,
  Sparkles,
  Package,
  Settings,
  LogOut,
  Boxes,
  LayoutDashboard,
  ChevronRight,
} from 'lucide-react';

const navItems = [
  { label: 'Vue d\'ensemble', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Mon Profil', href: '/dashboard/profile', icon: User },
  { label: 'Mes Créations', href: '/dashboard/creations', icon: Sparkles },
  { label: 'Mes Commandes', href: '/dashboard/orders', icon: Package },
  { label: 'Paramètres', href: '/dashboard/settings', icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, profile, showToast, lang } = useApp();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    showToast(lang === 'fr' ? 'Déconnexion réussie !' : 'Successfully signed out!', 'info');
    window.location.href = '/';
  };

  const userInitial = (
    profile?.full_name?.charAt(0) ||
    user?.user_metadata?.full_name?.charAt(0) ||
    user?.email?.charAt(0) ||
    '?'
  ).toUpperCase();

  const userEmail = user?.email ?? '';
  const displayName = profile?.full_name || user?.user_metadata?.full_name || 'Creator';

  return (
    <div className="min-h-screen flex bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white">
      
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 shrink-0 flex-col bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-white/5 h-screen sticky top-0">
        
        {/* Sidebar Header / Logo */}
        <div className="p-6 border-b border-neutral-100 dark:border-white/5">
          <Link href="/" className="flex items-center gap-3 group">
            <img src="/logo.png" alt="Business Intelligence 4K" className="h-8 w-auto object-contain group-hover:scale-105 transition-transform duration-300" />
            <span className="font-black text-lg tracking-tighter text-neutral-900 dark:text-white group-hover:text-blue-500 transition-colors truncate">
              Business Intelligence 4K
            </span>
          </Link>
        </div>

        {/* User Profile Block */}
        <div className="p-4 border-b border-neutral-100 dark:border-white/5">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-amber-500 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-lg">
              {userInitial}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-neutral-900 dark:text-white truncate">{displayName}</p>
              <p className="text-[10px] text-neutral-500 dark:text-neutral-400 truncate">{userEmail}</p>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {navItems.map(({ label, href, icon: Icon }) => {
            const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 group ${
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400'
                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-white/5 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-blue-500' : 'text-neutral-400 dark:text-neutral-500 group-hover:text-neutral-700 dark:group-hover:text-neutral-300'}`} />
                <span className="flex-1">{label}</span>
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-blue-400" />}
              </Link>
            );
          })}
        </nav>

        {/* Sign Out Footer */}
        <div className="p-3 border-t border-neutral-100 dark:border-white/5">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all duration-200"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl border-b border-neutral-200 dark:border-white/10">
        <Link href="/" className="flex items-center gap-2 min-w-0">
          <img src="/logo.png" alt="Business Intelligence 4K" className="h-8 w-auto object-contain shrink-0" />
          <span className="font-black text-lg tracking-tighter truncate">Business Intelligence 4K</span>
        </Link>
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-amber-500 flex items-center justify-center text-white font-bold text-xs shadow">
          {userInitial}
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-8 bg-neutral-50 dark:bg-neutral-950 min-h-screen pt-20 md:pt-8">
        {children}
      </main>
    </div>
  );
}
