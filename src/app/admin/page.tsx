"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  TrendingUp, 
  ShoppingCart, 
  Clock, 
  Users, 
  CheckCircle,
  XCircle,
  ArrowUpRight, 
  ArrowDownRight,
  Loader2, 
  Calendar,
  Layers,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { motion } from 'motion/react';
import Link from 'next/link';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

interface Stats {
  totalRevenue: number;
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  canceledOrders: number;
}

interface ChartData {
  month: string;
  revenue: number;
}

const MONTH_NAMES = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats>({ 
    totalRevenue: 0, 
    totalOrders: 0, 
    pendingOrders: 0, 
    completedOrders: 0,
    canceledOrders: 0 
  });
  const [userCount, setUserCount] = useState(0);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);

      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('total_amount, status, created_at');

      if (!ordersError && ordersData) {
        let revenue = 0;
        let total = ordersData.length;
        let pending = 0;
        let completed = 0;
        let canceled = 0;
        
        // Setup monthly revenue aggregation
        const monthlyRevenue: Record<string, number> = {};

        ordersData.forEach(order => {
          const status = (order.status || '').toUpperCase().trim();
          const amount = Number(order.total_amount) || 0;
          
          if (status === 'LIVRÉE' || status === 'LIVREE' || status === 'DELIVERED') {
            completed++;
            revenue += amount;
          } else if (status === 'PENDING' || status === 'EN ATTENTE') {
            pending++;
          } else if (status === 'ANNULÉ' || status === 'ANNULE' || status === 'ANNULÉE' || status === 'ANNULEE' || status === 'CANCELED' || status === 'CANCELLED') {
            canceled++;
          }
          
          // Aggregate for charts
          if (status === 'LIVRÉE' || status === 'LIVREE' || status === 'DELIVERED') {
             if (order.created_at) {
               const date = new Date(order.created_at);
               const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
               monthlyRevenue[monthKey] = (monthlyRevenue[monthKey] || 0) + amount;
             }
          }
        });
        
        // Format chart data
        const sortedMonths = Object.keys(monthlyRevenue).sort();
        const formattedChartData = sortedMonths.map(key => {
          const [year, monthStr] = key.split('-');
          const monthIndex = parseInt(monthStr, 10) - 1;
          return {
            month: `${MONTH_NAMES[monthIndex]} ${year.substring(2)}`,
            revenue: monthlyRevenue[key]
          };
        });
        
        setChartData(formattedChartData.length > 0 ? formattedChartData : [{ month: 'Actuel', revenue: revenue }]);

        setStats({
          totalRevenue: revenue,
          totalOrders: total,
          pendingOrders: pending,
          completedOrders: completed,
          canceledOrders: canceled
        });
      }

      // Fetch active users count from public.profiles
      const { count, error: usersError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

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

  const cards = [
    { 
      label: 'TOTAL REVENU', 
      value: `${stats.totalRevenue.toLocaleString()} MAD`, 
      subtext: 'Revenus totaux générés',
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
      label: 'NOMBRE D\'UTILISATEURS', 
      value: userCount, 
      subtext: 'Comptes actifs',
      trend: 'up',
      icon: Users, 
      color: 'text-brand-blue', 
      bg: 'from-brand-blue/10 to-brand-blue/5', 
      border: 'border-brand-blue/20' 
    },
    { 
      label: 'COMMANDES LIVRÉES', 
      value: stats.completedOrders, 
      subtext: 'Terminées avec succès',
      trend: 'up',
      icon: CheckCircle, 
      color: 'text-emerald-400', 
      bg: 'from-emerald-500/10 to-emerald-500/5', 
      border: 'border-emerald-500/20' 
    },
    { 
      label: 'COMMANDES ANNULÉES', 
      value: stats.canceledOrders, 
      subtext: 'Annulées ou refusées',
      trend: 'down',
      icon: XCircle, 
      color: 'text-rose-400', 
      bg: 'from-rose-500/10 to-rose-500/5', 
      border: 'border-rose-500/20' 
    },
  ];

  return (
    <div className="p-6 md:p-10 pb-24">
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
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-brand-blue" />
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest animate-pulse">Calcul des métriques en cours...</p>
        </div>
      ) : (
        <div className="space-y-10">
          
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

                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2/3 h-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 md:gap-8">
            
            <div className="xl:col-span-2 rounded-[2.5rem] bg-[#111116] border border-white/5 p-8 shadow-2xl relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white flex items-center gap-2 mb-1">
                    <Calendar className="w-4 h-4 text-brand-blue" />
                    Flux de Revenus
                  </h3>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Variation mensuelle du chiffre d&apos;affaires généré</p>
                </div>
              </div>

              <div className="h-80 w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4A90E2" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#4A90E2" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                    <XAxis 
                      dataKey="month" 
                      stroke="#64748b" 
                      fontSize={10} 
                      tickLine={false}
                      axisLine={false}
                      dy={10}
                    />
                    <YAxis 
                      stroke="#64748b" 
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `${value} MAD`}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#111116', borderColor: '#ffffff20', borderRadius: '12px' }}
                      itemStyle={{ color: '#4A90E2', fontWeight: 'bold' }}
                      labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#4A90E2" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorRevenue)" 
                      activeDot={{ r: 6, fill: '#F39C12', stroke: '#fff', strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="rounded-[2.5rem] bg-[#111116] border border-white/5 p-8 shadow-2xl flex flex-col">
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white flex items-center gap-2 mb-6">
                <Layers className="w-4 h-4 text-brand-yellow" />
                Raccourcis & Actions
              </h3>
              
              <div className="grid grid-cols-1 gap-4 flex-1">
                <Link 
                  href="/admin/users"
                  className="flex items-center justify-between p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-brand-yellow/30 hover:bg-brand-yellow/5 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-brand-yellow/10 rounded-xl text-brand-yellow">
                      <ShieldAlert className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black uppercase text-slate-200 group-hover:text-brand-yellow transition-colors">Gestion des Utilisateurs</h4>
                      <p className="text-[9px] text-slate-500 uppercase tracking-widest mt-1">Gérer les comptes et bannissements</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-brand-yellow group-hover:translate-x-1 transition-all" />
                </Link>

                <Link 
                  href="/admin/orders"
                  className="flex items-center justify-between p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-brand-blue/30 hover:bg-brand-blue/5 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-brand-blue/10 rounded-xl text-brand-blue">
                      <ShoppingCart className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black uppercase text-slate-200 group-hover:text-brand-blue transition-colors">Terminal Commandes</h4>
                      <p className="text-[9px] text-slate-500 uppercase tracking-widest mt-1">Gérer les reçus RIB et livraisons</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-brand-blue group-hover:translate-x-1 transition-all" />
                </Link>

                <Link 
                  href="/admin/products"
                  className="flex items-center justify-between p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-brand-blue/30 hover:bg-brand-blue/5 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/5 rounded-xl text-slate-300">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black uppercase text-slate-200 group-hover:text-brand-blue transition-colors">Créer Produits</h4>
                      <p className="text-[9px] text-slate-500 uppercase tracking-widest mt-1">Gérer les collections de designs</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-brand-blue group-hover:translate-x-1 transition-all" />
                </Link>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
