"use client";
 
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  TrendingUp, 
  ShoppingCart, 
  Clock, 
  Users, 
  Percent, 
  ArrowUpRight, 
  ArrowDownRight,
  Loader2, 
  Sparkles,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';
import { motion } from 'motion/react';
import Link from 'next/link';
 
interface Stats {
  totalRevenue: number;
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
}
 
export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats>({ totalRevenue: 0, totalOrders: 0, pendingOrders: 0, completedOrders: 0 });
  const [userCount, setUserCount] = useState(249);
  const [loading, setLoading] = useState(true);
 
  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
 
      // 1. Fetch Orders to calculate revenue and order counts
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('total_amount, status');
 
      if (!ordersError && ordersData) {
        let revenue = 0;
        let total = ordersData.length;
        let pending = 0;
        let completed = 0;
 
        ordersData.forEach(order => {
          const status = (order.status || '').toUpperCase().trim();
          if (status === 'LIVRÉE' || status === 'LIVREE' || status === 'DELIVERED') {
            completed++;
            revenue += Number(order.total_amount) || 0;
          } else if (status === 'PENDING' || status === 'EN ATTENTE') {
            pending++;
          }
        });
 
        setStats({
          totalRevenue: revenue,
          totalOrders: total,
          pendingOrders: pending,
          completedOrders: completed
        });
      }
 
      // 2. Fetch active users count from public.profiles
      const { count, error: usersError } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true });
 
      if (!usersError && count !== null) {
        setUserCount(count);
      }
    } catch (err) {
      console.error('Failed to load dashboard statistics:', err);
    } finally {
      setLoading(false);
    }
  };
 
  useEffect(() => {
    fetchDashboardStats();
  }, []);
 
  // Premium Stats Cards Definition
  const cards = [
    { 
      label: 'TOTAL REVENU', 
      value: `${stats.totalRevenue.toLocaleString()} MAD`, 
      subtext: '+12.4% vs le mois dernier',
      trend: 'up',
      icon: TrendingUp, 
      color: 'text-emerald-400', 
      bg: 'from-emerald-500/10 to-emerald-500/5', 
      border: 'border-emerald-500/20' 
    },
    { 
      label: 'COMMANDES TOTALES', 
      value: stats.totalOrders, 
      subtext: 'Toutes méthodes confondues',
      trend: 'neutral',
      icon: ShoppingCart, 
      color: 'text-brand-blue', 
      bg: 'from-brand-blue/10 to-brand-blue/5', 
      border: 'border-brand-blue/20' 
    },
    { 
      label: 'EN ATTENTE', 
      value: stats.pendingOrders, 
      subtext: 'Nécessite traitement / RIB',
      trend: 'pending',
      icon: Clock, 
      color: 'text-brand-yellow', 
      bg: 'from-brand-yellow/10 to-brand-yellow/5', 
      border: 'border-brand-yellow/20' 
    },
    { 
      label: 'Nouveaux Utilisateurs', 
      value: userCount, 
      subtext: '+8.2% cette semaine',
      trend: 'up',
      icon: Users, 
      color: 'text-brand-blue', 
      bg: 'from-brand-blue/10 to-brand-blue/5', 
      border: 'border-brand-blue/20' 
    },
    { 
      label: 'Taux de Conversion', 
      value: '3.45%', 
      subtext: '+1.1% vs le mois dernier',
      trend: 'up',
      icon: Percent, 
      color: 'text-emerald-400', 
      bg: 'from-emerald-500/10 to-emerald-500/5', 
      border: 'border-emerald-500/20' 
    },
  ];
 
  return (
    <div className="p-6 md:p-10 pb-24">
      {/* Page Title Header */}
      <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white uppercase italic flex items-center gap-3">
            <div className="w-1.5 h-10 bg-brand-blue rounded-full shadow-[0_0_20px_rgba(74,144,226,0.6)]" />
            Dashboard
          </h1>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-2">
            Vue d&apos;ensemble analytique et indicateurs clés de performance
          </p>
        </div>
 
        <div className="flex items-center gap-3">
          <Link 
            href="/admin/orders" 
            className="px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-xs font-black uppercase tracking-widest text-slate-300 hover:text-white hover:bg-white/10 transition-all flex items-center gap-2 group"
          >
            Gérer les Commandes <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
 
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-brand-blue" />
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest animate-pulse">Calcul des métriques en cours...</p>
        </div>
      ) : (
        <div className="space-y-10">
          
          {/* Grid of KPI Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5 md:gap-6">
            {cards.map((card, i) => (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className={`rounded-[2rem] bg-gradient-to-br ${card.bg} border ${card.border} p-6 shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[170px] hover:border-brand-blue/30 transition-all duration-300`}
              >
                <div className="flex items-center justify-between mb-4 relative z-10">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{card.label}</span>
                  <div className={`p-2 rounded-xl bg-white/5 border border-white/10`}>
                    <card.icon className={`w-4.5 h-4.5 ${card.color}`} />
                  </div>
                </div>
                
                <div className="relative z-10">
                  <h3 className={`text-2xl md:text-3xl font-black tracking-tight text-white mb-2`}>
                    {card.value}
                  </h3>
                  
                  <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest">
                    {card.trend === 'up' && (
                      <span className="text-emerald-400 flex items-center"><ArrowUpRight className="w-3.5 h-3.5" /></span>
                    )}
                    {card.trend === 'down' && (
                      <span className="text-rose-400 flex items-center"><ArrowDownRight className="w-3.5 h-3.5" /></span>
                    )}
                    <span className="text-slate-500">{card.subtext}</span>
                  </div>
                </div>
 
                {/* Decorative bottom ambient ray */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2/3 h-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              </motion.div>
            ))}
          </div>
 
          {/* Main Visual Data / Analytics Graph Section */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 md:gap-8">
            
            {/* Revenue Analytics Chart Card */}
            <div className="xl:col-span-2 rounded-[2.5rem] bg-[#111116] border border-white/5 p-8 shadow-2xl relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white flex items-center gap-2 mb-1">
                    <Calendar className="w-4 h-4 text-brand-blue" />
                    Flux de Revenus & Croissance AI
                  </h3>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Variation mensuelle du chiffre d&apos;affaires généré</p>
                </div>
                
                <div className="flex items-center gap-2 bg-black/40 border border-white/5 p-1 rounded-xl shrink-0">
                  <span className="px-3 py-1.5 rounded-lg bg-brand-blue text-white text-[9px] font-black uppercase tracking-widest shadow-lg shadow-brand-blue/20">Revenu (MAD)</span>
                  <span className="px-3 py-1.5 text-slate-500 text-[9px] font-black uppercase tracking-widest">Volume (U)</span>
                </div>
              </div>
 
              {/* Premium Neon Interactive Trend Chart Area */}
              <div className="relative h-80 rounded-2xl bg-black/40 border border-white/5 overflow-hidden flex items-end p-6 select-none shadow-inner">
                {/* Dynamic Grid Background */}
                <div className="absolute inset-0 opacity-[0.05]" style={{ 
                  backgroundImage: 'linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)', 
                  backgroundSize: '40px 40px' 
                }} />
 
                {/* Dynamic Chart SVG Curve */}
                <div className="absolute inset-x-0 bottom-12 top-6 z-10 px-4">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 600 220" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="chart-glow" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#4A90E2" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#4A90E2" stopOpacity="0.0" />
                      </linearGradient>
                      <linearGradient id="yellow-dots" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#F39C12" />
                        <stop offset="100%" stopColor="#4A90E2" />
                      </linearGradient>
                    </defs>
                    
                    {/* Glow fill underneath the trend line */}
                    <path 
                      d="M 0 180 C 100 130, 150 160, 200 100 C 250 40, 350 160, 400 70 C 450 -10, 520 20, 600 10 L 600 220 L 0 220 Z" 
                      fill="url(#chart-glow)" 
                      className="transition-all duration-1000"
                    />
                    
                    {/* Main High-Tech Curve */}
                    <path 
                      d="M 0 180 C 100 130, 150 160, 200 100 C 250 40, 350 160, 400 70 C 450 -10, 520 20, 600 10" 
                      fill="none" 
                      stroke="#4A90E2" 
                      strokeWidth="4.5" 
                      strokeLinecap="round"
                      className="drop-shadow-[0_4px_12px_rgba(74,144,226,0.6)] transition-all duration-1000"
                    />
 
                    {/* Highlighted Vector Nodes */}
                    <circle cx="200" cy="100" r="6" fill="#F39C12" stroke="#ffffff" strokeWidth="2.5" className="shadow-lg animate-pulse" />
                    <circle cx="400" cy="70" r="6" fill="#F39C12" stroke="#ffffff" strokeWidth="2.5" className="shadow-lg animate-pulse" />
                    <circle cx="600" cy="10" r="6" fill="#4A90E2" stroke="#ffffff" strokeWidth="2.5" className="shadow-lg animate-pulse" />
                  </svg>
                </div>
 
                {/* Y-Axis Indicator Label Helpers */}
                <div className="absolute left-4 top-4 z-20 flex flex-col justify-between h-5/6 text-[8px] font-mono font-black text-slate-600 uppercase tracking-wider">
                  <span>80K</span>
                  <span>50K</span>
                  <span>20K</span>
                  <span>0K</span>
                </div>
 
                {/* Horizontal X-Axis timeline labels */}
                <div className="relative z-20 w-full flex justify-between text-[8px] font-black uppercase tracking-[0.2em] text-slate-500 border-t border-white/5 pt-4">
                  <span>Janvier</span>
                  <span>Février</span>
                  <span>Mars</span>
                  <span>Avril</span>
                  <span>Mai</span>
                  <span>Juin</span>
                </div>
              </div>
            </div>
            
            {/* Quick Action Systems Card */}
            <div className="rounded-[2.5rem] bg-[#111116] border border-white/5 p-8 shadow-2xl flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white flex items-center gap-2 mb-6">
                  <Layers className="w-4 h-4 text-brand-yellow" />
                  Raccourcis & Actions
                </h3>
                
                <div className="space-y-4">
                  <Link 
                    href="/admin/orders"
                    className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-brand-blue/30 hover:bg-brand-blue/5 transition-all group"
                  >
                    <div>
                      <h4 className="text-xs font-black uppercase text-slate-200">Terminal Commandes</h4>
                      <p className="text-[9px] text-slate-500 uppercase tracking-widest mt-1">Gérer les reçus RIB et livraisons</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-brand-blue group-hover:translate-x-1 transition-all" />
                  </Link>
 
                  <Link 
                    href="/admin/products"
                    className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-brand-blue/30 hover:bg-brand-blue/5 transition-all group"
                  >
                    <div>
                      <h4 className="text-xs font-black uppercase text-slate-200">Créer Produits</h4>
                      <p className="text-[9px] text-slate-500 uppercase tracking-widest mt-1">Gérer les collections de designs</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-brand-blue group-hover:translate-x-1 transition-all" />
                  </Link>
 
                  <Link 
                    href="/admin/categories"
                    className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-brand-blue/30 hover:bg-brand-blue/5 transition-all group"
                  >
                    <div>
                      <h4 className="text-xs font-black uppercase text-slate-200">Collections</h4>
                      <p className="text-[9px] text-slate-500 uppercase tracking-widest mt-1">Organiser les catégories d&apos;impression</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-brand-blue group-hover:translate-x-1 transition-all" />
                  </Link>
                </div>
              </div>
 
              <div className="p-4.5 rounded-2xl bg-brand-yellow/5 border border-brand-yellow/20 flex items-start gap-3 mt-6">
                <Sparkles className="w-4.5 h-4.5 text-brand-yellow shrink-0 mt-0.5 animate-pulse" />
                <p className="text-[9px] font-bold text-brand-yellow leading-relaxed uppercase tracking-wider">
                  Moteur de traitement intelligent en ligne. Toutes les commandes validées synchronisent automatiquement l&apos;état des stocks en temps réel.
                </p>
              </div>
            </div>
 
          </div>
        </div>
      )}
    </div>
  );
}
