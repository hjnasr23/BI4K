'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { LayoutDashboard, Tag, Package, ShoppingCart, TrendingUp } from 'lucide-react';

interface Stats {
  categories: number;
  products: number;
  orders: number;
  designs: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats>({ categories: 0, products: 0, orders: 0, designs: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const [cats, prods, orders, designs] = await Promise.all([
        supabase.from('Category').select('*', { count: 'exact', head: true }),
        supabase.from('Product').select('*', { count: 'exact', head: true }),
        supabase.from('Commande').select('*', { count: 'exact', head: true }),
        supabase.from('designs').select('*', { count: 'exact', head: true }),
      ]);
      setStats({
        categories: cats.count ?? 0,
        products:   prods.count ?? 0,
        orders:     orders.count ?? 0,
        designs:    designs.count ?? 0,
      });
      setLoading(false);
    };
    fetchStats();
  }, []);

  const cards = [
    { label: 'Categories', value: stats.categories, icon: Tag,           color: 'from-violet-600/20 to-violet-600/5', border: 'border-violet-500/20', text: 'text-violet-400' },
    { label: 'Products',   value: stats.products,   icon: Package,        color: 'from-cyan-600/20 to-cyan-600/5',    border: 'border-cyan-500/20',   text: 'text-cyan-400' },
    { label: 'Orders',     value: stats.orders,     icon: ShoppingCart,   color: 'from-amber-600/20 to-amber-600/5',  border: 'border-amber-500/20',  text: 'text-amber-400' },
    { label: 'Designs',    value: stats.designs,    icon: TrendingUp,     color: 'from-rose-600/20 to-rose-600/5',    border: 'border-rose-500/20',   text: 'text-rose-400' },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <LayoutDashboard className="w-5 h-5 text-violet-400" />
          <h1 className="text-2xl font-black tracking-tight text-white">Dashboard</h1>
        </div>
        <p className="text-sm text-slate-500">Welcome back — here&apos;s a live snapshot of your store.</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map(({ label, value, icon: Icon, color, border, text }) => (
          <div key={label} className={`rounded-2xl bg-gradient-to-br ${color} border ${border} p-6`}>
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">{label}</p>
              <Icon className={`w-5 h-5 ${text}`} />
            </div>
            {loading
              ? <div className="h-8 w-16 bg-white/5 rounded-lg animate-pulse" />
              : <p className={`text-4xl font-black tracking-tight ${text}`}>{value}</p>
            }
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="mt-10">
        <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg">
          {[
            { href: '/admin/categories', label: 'Add New Category', icon: Tag },
            { href: '/admin/products',  label: 'Add New Product',  icon: Package },
          ].map(({ href, label, icon: Icon }) => (
            <a
              key={href}
              href={href}
              className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-violet-600/10 hover:border-violet-500/30 transition-all group"
            >
              <Icon className="w-4 h-4 text-slate-500 group-hover:text-violet-400 transition-colors" />
              <span className="text-sm font-semibold text-slate-400 group-hover:text-slate-200 transition-colors">{label}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
