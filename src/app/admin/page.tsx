"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { LayoutDashboard, ShoppingCart, Clock, CheckCircle, TrendingUp, Loader2, FileText } from 'lucide-react';
import { motion } from 'motion/react';

interface OrderItem {
  cartItemId: string;
  name: string;
  price: number;
  quantity: number;
  size: string;
  image_url?: string;
  design_url?: string | null;
  coordinates?: { x: number; y: number; width: number; height: number; canvasWidth: number; canvasHeight: number } | null;
  // Legacy
  mockupUrl?: string;
  finalMockup?: string;
}

interface Order {
  id: string;
  created_at: string;
  full_name: string;
  email: string;
  phone: string;
  shipping_address: string;
  total_amount: number;
  status: string;
  payment_method: string;
  payment_proof_url: string | null;
  order_items: OrderItem[];
}

interface Stats {
  totalRevenue: number;
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats>({ totalRevenue: 0, totalOrders: 0, pendingOrders: 0, completedOrders: 0 });
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    const { data: ordersData, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && ordersData) {
      let revenue = 0;
      let total = ordersData.length;
      let pending = 0;
      let completed = 0;

      ordersData.forEach(order => {
        const status = order.status.toLowerCase();
        
        // Revenue is ONLY calculated from completed orders
        if (status === 'livrée' || status === 'livree') {
          completed++;
          revenue += Number(order.total_amount) || 0;
        } else if (status === 'pending' || status === 'en attente') {
          pending++;
        }
      });

      setStats({
        totalRevenue: revenue,
        totalOrders: total,
        pendingOrders: pending,
        completedOrders: completed
      });
      setOrders(ordersData);
    } else if (error) {
      console.error('Error fetching dashboard data:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleUpdateStatus = async (orderId: string, newStatus: string = 'livrée') => {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);

    if (!error) {
      // Automatically refresh the entire dashboard state (Stats + Table)
      fetchDashboardData();
    } else {
      console.error('Error updating status:', error);
      alert('Erreur lors de la mise à jour du statut.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
      case 'en attente':
        return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'livrée':
      case 'livree':
        return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'annulée':
      case 'annulee':
        return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
      default:
        return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
    }
  };

  const cards = [
    { label: 'Total Revenu', value: `${stats.totalRevenue.toLocaleString()} MAD`, icon: TrendingUp, color: 'text-emerald-400', bg: 'from-emerald-500/20 to-emerald-500/5', border: 'border-emerald-500/20' },
    { label: 'Commandes Totales', value: stats.totalOrders, icon: ShoppingCart, color: 'text-blue-400', bg: 'from-blue-500/20 to-blue-500/5', border: 'border-blue-500/20' },
    { label: 'En Attente', value: stats.pendingOrders, icon: Clock, color: 'text-amber-400', bg: 'from-amber-500/20 to-amber-500/5', border: 'border-amber-500/20' },
    { label: 'Livrées', value: stats.completedOrders, icon: CheckCircle, color: 'text-zinc-400', bg: 'from-zinc-500/20 to-zinc-500/5', border: 'border-zinc-500/20' },
  ];

  return (
    <div className="p-4 md:p-8 pb-20">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <LayoutDashboard className="w-6 h-6 text-emerald-400" />
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white uppercase">Dashboard</h1>
        </div>
        <p className="text-xs md:text-sm font-medium text-slate-400 uppercase tracking-widest">Aperçu des performances et gestion des commandes</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[30vh]">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6 mb-12">
            {cards.map((card, i) => (
              <motion.div 
                key={card.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`rounded-2xl bg-gradient-to-br ${card.bg} border ${card.border} p-6 shadow-xl relative overflow-hidden`}
              >
                <div className="flex items-center justify-between mb-4 relative z-10">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400">{card.label}</p>
                  <card.icon className={`w-5 h-5 ${card.color}`} />
                </div>
                <p className={`text-3xl md:text-4xl font-black tracking-tight ${card.color} relative z-10 truncate`}>{card.value}</p>
              </motion.div>
            ))}
          </div>

          {/* Orders Table */}
          <div className="bg-zinc-900 border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead>
                  <tr className="border-b border-white/5 bg-black/20">
                    <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Date</th>
                    <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Customer</th>
                    <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Items (Preview)</th>
                    <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Amount</th>
                    <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Payment Proof</th>
                    <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {orders.map((order) => {
                    const isPending = order.status.toLowerCase() === 'pending' || order.status.toLowerCase() === 'en attente';
                    
                    return (
                      <tr key={order.id} className="hover:bg-white/[0.02] transition-colors">
                        {/* Date */}
                        <td className="py-5 px-6 align-top">
                          <span className="text-xs font-bold text-white block">
                            {new Date(order.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono mt-1 block">
                            {new Date(order.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </td>

                        {/* Customer */}
                        <td className="py-5 px-6 align-top">
                          <span className="text-xs font-bold text-white block mb-1">{order.full_name}</span>
                          <span className="text-[10px] text-slate-400 block">{order.phone}</span>
                          <span className="text-[10px] text-slate-500 block truncate max-w-[150px] mt-1" title={order.shipping_address}>
                            {order.shipping_address}
                          </span>
                        </td>

                        {/* Items (Preview inline) */}
                        <td className="py-5 px-6 align-top">
                          <div className="flex flex-col gap-3">
                            {order.order_items?.map((item, idx) => (
                              <div key={idx} className="flex gap-3 items-center">
                                {/* Clean support image only */}
                                <div className="relative w-12 h-12 rounded bg-black/50 overflow-hidden shrink-0 border border-white/10">
                                  <img src={item.image_url || item.mockupUrl || ''} alt="" className="absolute inset-0 w-full h-full object-cover" />
                                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 text-white rounded-tl-lg flex items-center justify-center text-[8px] font-black z-20">
                                    x{item.quantity}
                                  </div>
                                </div>
                                <div>
                                  <p className="text-[10px] font-bold text-slate-200 line-clamp-1 max-w-[120px]" title={item.name}>{item.name}</p>
                                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Taille: {item.size}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </td>

                        {/* Amount */}
                        <td className="py-5 px-6 text-right align-top">
                          <span className="text-sm font-black italic text-emerald-400">{order.total_amount} MAD</span>
                          <span className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mt-1">{order.payment_method}</span>
                        </td>

                        {/* Payment Proof */}
                        <td className="py-5 px-6 text-center align-top">
                          {order.payment_method === 'rib' ? (
                            order.payment_proof_url ? (
                              <a 
                                href={order.payment_proof_url} 
                                target="_blank" 
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-cyan-400 hover:text-cyan-300 bg-cyan-400/10 px-3 py-2 rounded-lg transition-colors border border-cyan-400/20"
                              >
                                <FileText className="w-3 h-3" /> Voir Reçu
                              </a>
                            ) : (
                              <span className="text-[10px] font-black uppercase tracking-widest text-amber-500">En attente</span>
                            )
                          ) : (
                            <span className="text-[10px] text-slate-600">-</span>
                          )}
                        </td>

                        {/* Actions (Status & Quick Update) */}
                        <td className="py-5 px-6 align-top">
                          <div className="flex flex-col items-end gap-2">
                            <span className={`inline-flex items-center px-3 py-1.5 rounded-lg border text-[10px] font-black uppercase tracking-widest ${getStatusColor(order.status)}`}>
                              {order.status}
                            </span>
                            
                            {isPending && (
                              <button 
                                onClick={() => handleUpdateStatus(order.id, 'livrée')}
                                className="px-3 py-2 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-300 border border-emerald-500/20 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all shadow-lg text-right"
                              >
                                Marquer comme Livrée
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {orders.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-500 text-xs font-bold uppercase tracking-widest">
                        Aucune commande trouvée
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
