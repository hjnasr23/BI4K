'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { createClient } from '@/lib/supabase/client';
import { useApp } from '@/lib/store';
import { 
  Clipboard, 
  Calendar, 
  CreditCard, 
  Tag, 
  PackageOpen, 
  ChevronRight, 
  Loader2, 
  ArrowLeft,
  X
} from 'lucide-react';

interface OrderItem {
  name: string;
  price: number;
  size: string;
  quantity: number;
  mockupUrl?: string;
  finalMockup?: string;
  mockup_url?: string;
  design_url?: string;
  image_url?: string;
}

interface Order {
  id: string;
  created_at: string;
  total_amount: number;
  status: string;
  payment_method: string;
  shipping_address: string;
  order_items: OrderItem[];
}

export default function OrderHistoryPage() {
  const router = useRouter();
  const { lang, showToast } = useApp();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const supabase = createClient();

  useEffect(() => {
    let mounted = true;

    const fetchOrders = async () => {
      try {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
          router.push('/login');
          return;
        }

        const { data, error: fetchErr } = await supabase
          .from('orders')
          .select('*')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false });

        if (fetchErr) throw fetchErr;

        if (mounted) {
          // Parse order_items if they are stored as stringified JSON
          const formattedOrders = (data || []).map((order: any) => {
            let parsedItems: OrderItem[] = [];
            try {
              parsedItems = typeof order.order_items === 'string' 
                ? JSON.parse(order.order_items) 
                : (order.order_items || []);
            } catch (e) {
              console.error("Error parsing order_items:", e);
            }
            return {
              ...order,
              order_items: parsedItems
            };
          });
          setOrders(formattedOrders);
        }
      } catch (err: any) {
        console.error('Error loading orders:', err);
        if (mounted) {
          setError(err.message || 'An error occurred while loading orders.');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchOrders();

    return () => {
      mounted = false;
    };
  }, [router, supabase]);

  const getStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    let label = status;
    let style = 'bg-slate-500/10 border-slate-500/20 text-slate-400';

    if (lang === 'fr') {
      if (s === 'pending') { label = 'En attente'; style = 'bg-amber-500/10 border-amber-500/20 text-amber-400'; }
      else if (s === 'confirmed') { label = 'Confirmé'; style = 'bg-brand-blue/10 border-brand-blue/20 text-brand-blue'; }
      else if (s === 'processing') { label = 'En cours'; style = 'bg-brand-blue/10 border-brand-blue/20 text-brand-blue'; }
      else if (s === 'shipped') { label = 'Expédié'; style = 'bg-brand-yellow/10 border-brand-yellow/20 text-brand-yellow'; }
      else if (s === 'delivered') { label = 'Livré'; style = 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'; }
      else if (s === 'cancelled') { label = 'Annulé'; style = 'bg-rose-500/10 border-rose-500/20 text-rose-400'; }
    } else {
      if (s === 'pending') { label = 'Pending'; style = 'bg-amber-500/10 border-amber-500/20 text-amber-400'; }
      else if (s === 'confirmed') { label = 'Confirmed'; style = 'bg-brand-blue/10 border-brand-blue/20 text-brand-blue'; }
      else if (s === 'processing') { label = 'Processing'; style = 'bg-brand-blue/10 border-brand-blue/20 text-brand-blue'; }
      else if (s === 'shipped') { label = 'Shipped'; style = 'bg-brand-yellow/10 border-brand-yellow/20 text-brand-yellow'; }
      else if (s === 'delivered') { label = 'Delivered'; style = 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'; }
      else if (s === 'cancelled') { label = 'Cancelled'; style = 'bg-rose-500/10 border-rose-500/20 text-rose-400'; }
    }

    return (
      <span className={`px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest ${style}`}>
        {label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#08080a] text-foreground">
      <Navbar />

      <main className="flex-grow container mx-auto px-4 pt-32 pb-20 max-w-5xl relative z-10">
        {/* Decorative Background Blob */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-brand-blue/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-4xl mx-auto relative z-10">
          <div className="mb-10 flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-black uppercase tracking-tighter text-white">
                {lang === 'fr' ? 'Mes Commandes' : 'Order History'}
              </h1>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-2">
                {lang === 'fr' ? 'Historique complet de vos achats personnalisés' : 'Full history of your custom creations'}
              </p>
            </div>
            <button 
              onClick={() => router.push('/')} 
              className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> {lang === 'fr' ? 'Accueil' : 'Home'}
            </button>
          </div>

          {loading ? (
            <div className="glass p-20 rounded-[3rem] border border-white/5 bg-[#111116]/80 flex flex-col items-center justify-center shadow-2xl">
              <Loader2 className="w-8 h-8 text-brand-blue animate-spin mb-4" />
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                {lang === 'fr' ? 'Récupération de vos commandes...' : 'Fetching your order history...'}
              </p>
            </div>
          ) : error ? (
            <div className="glass p-10 rounded-[3.5rem] border border-rose-500/10 bg-rose-500/5 text-center shadow-2xl">
              <p className="text-rose-400 font-bold text-sm mb-4">{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="py-3 px-6 bg-brand-blue text-white hover:bg-brand-blue/90 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-brand-blue/10"
              >
                {lang === 'fr' ? 'Réessayer' : 'Retry'}
              </button>
            </div>
          ) : orders.length === 0 ? (
            <div className="glass p-16 rounded-[3rem] border border-white/5 bg-[#111116]/80 text-center shadow-2xl flex flex-col items-center">
              <PackageOpen className="w-16 h-16 text-slate-600 mb-6" />
              <h3 className="text-lg font-black uppercase tracking-widest text-white mb-2">
                {lang === 'fr' ? 'Aucune commande' : 'No orders found'}
              </h3>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-8 max-w-sm">
                {lang === 'fr' 
                  ? 'Vous n\'avez pas encore effectué d\'achat avec ce compte.' 
                  : 'You have not placed any orders yet on this account.'}
              </p>
              <button 
                onClick={() => router.push('/categories')} 
                className="py-4.5 px-8 bg-brand-blue text-white hover:bg-brand-blue/80 rounded-2xl text-xs font-black uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-brand-blue/20"
              >
                {lang === 'fr' ? 'Lancer la personnalisation' : 'Start Customizing'}
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {orders.map((order) => {
                const totalItems = order.order_items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
                const firstItem = order.order_items?.[0];
                const thumbnail = firstItem?.mockup_url || firstItem?.image_url || firstItem?.mockupUrl || '';

                return (
                  <div 
                    key={order.id} 
                    onClick={() => setSelectedOrder(order)}
                    className="glass p-6 rounded-[2rem] border border-white/5 hover:border-brand-blue/20 bg-[#111116]/60 hover:bg-[#111116]/80 transition-all shadow-xl cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-6 group"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-brand-blue/10 to-brand-yellow/10 border border-brand-blue/20 overflow-hidden flex items-center justify-center text-brand-blue group-hover:scale-105 transition-transform relative shrink-0">
                        {thumbnail ? (
                          <img src={thumbnail} alt="" className="absolute inset-0 w-full h-full object-cover" />
                        ) : (
                          <Clipboard className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-black uppercase tracking-tighter text-white">
                          Order #{order.id.slice(0, 8).toUpperCase()}
                        </h3>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                          <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-brand-blue" /> {formatDate(order.created_at)}</span>
                          <span className="flex items-center gap-1.5"><CreditCard className="w-3.5 h-3.5 text-brand-yellow" /> {order.payment_method}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 border-white/5 pt-4 md:pt-0">
                      <div className="text-left md:text-right">
                        <span className="block text-[8px] font-black uppercase tracking-widest text-slate-500">
                          {lang === 'fr' ? 'Montant Total' : 'Total Amount'}
                        </span>
                        <span className="text-xl font-black italic text-brand-yellow mt-0.5 block">
                          {order.total_amount} MAD
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        {getStatusBadge(order.status)}
                        <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-white group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Selected Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-background/50 backdrop-blur-xl animate-fadeIn">
          <div className="relative w-full max-w-2xl overflow-hidden glass border-white/10 shadow-[0_50px_100px_rgba(0,0,0,0.5)] rounded-[2.5rem] bg-[#111116] animate-reveal">
            
            <button 
              onClick={() => setSelectedOrder(null)}
              className="absolute top-6 right-6 text-foreground/20 hover:text-brand-yellow transition-colors bg-white/5 hover:bg-white/10 rounded-xl p-2 z-20"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="p-8">
              <div className="mb-6 pb-4 border-b border-white/10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-blue/10 border border-brand-blue/20 text-brand-blue text-[9px] font-black uppercase tracking-widest mb-3">
                  Order Details
                </div>
                <h2 className="text-2xl font-black text-white tracking-tighter">
                  Order #{selectedOrder.id.substring(0, 8).toUpperCase()}
                </h2>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                  Placed on {formatDate(selectedOrder.created_at)}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 text-left">
                <div>
                  <span className="block text-[8px] font-black uppercase tracking-widest text-slate-500 mb-1">Status</span>
                  {getStatusBadge(selectedOrder.status)}
                </div>
                <div>
                  <span className="block text-[8px] font-black uppercase tracking-widest text-slate-500 mb-1">Payment Method</span>
                  <span className="text-xs font-bold text-white uppercase tracking-wider">{selectedOrder.payment_method}</span>
                </div>
                <div className="md:col-span-2">
                  <span className="block text-[8px] font-black uppercase tracking-widest text-slate-500 mb-1">Shipping Address</span>
                  <p className="text-xs font-bold text-slate-300 bg-white/5 border border-white/5 rounded-2xl p-4 leading-relaxed">
                    {selectedOrder.shipping_address}
                  </p>
                </div>
              </div>

              <div>
                <span className="block text-[8px] font-black uppercase tracking-widest text-slate-500 mb-3 text-left">Items Purchased</span>
                <div className="space-y-3 max-h-56 overflow-y-auto pr-2 custom-scrollbar">
                  {selectedOrder.order_items?.map((item, idx) => (
                    <div key={idx} className="flex gap-4 items-center bg-white/5 border border-white/5 p-3 rounded-2xl">
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-black/50 relative border border-white/5 shrink-0">
                        {item.mockup_url ? (
                          <img src={item.mockup_url} alt="" className="absolute inset-0 w-full h-full object-cover z-0" />
                        ) : (
                          <>
                            {(item.mockupUrl || item.image_url) && (
                              <img src={item.mockupUrl || item.image_url} alt="" className="absolute inset-0 w-full h-full object-cover z-0 opacity-40" />
                            )}
                            {(item.finalMockup || item.design_url) && (
                              <img src={item.finalMockup || item.design_url} alt="" className="absolute inset-0 w-full h-full object-contain z-10" />
                            )}
                          </>
                        )}
                      </div>
                      <div className="flex-1 text-left">
                        <h4 className="font-black text-xs uppercase tracking-tight text-white leading-tight">{item.name}</h4>
                        <p className="text-[9px] uppercase font-bold text-slate-500 tracking-widest mt-0.5">
                          Size: {item.size} | Qty: {item.quantity}
                        </p>
                      </div>
                      <div className="font-black italic text-brand-yellow text-sm">
                        {item.price * item.quantity} MAD
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/10 flex justify-between items-end">
                <span className="text-xs font-black uppercase tracking-widest text-slate-500">Total Price</span>
                <span className="text-3xl font-black italic text-brand-yellow">{selectedOrder.total_amount} MAD</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
