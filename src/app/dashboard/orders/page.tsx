'use client';

import { useState, useEffect } from 'react';
import { useApp } from '@/lib/store';
import { createClient } from '@/lib/supabase/client';
import { 
  Package, 
  Clock, 
  CheckCircle2, 
  Truck, 
  XCircle, 
  ChevronRight, 
  X, 
  Calendar, 
  CreditCard, 
  ShoppingBag,
  ArrowRight,
  ClipboardList
} from 'lucide-react';
import Link from 'next/link';

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
  order_items: OrderItem[];
  user_id: string;
}

export default function OrdersPage() {
  const { showToast } = useApp();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  
  const supabase = createClient();

  useEffect(() => {
    let active = true;

    async function fetchOrders() {
      try {
        setLoading(true);
        setError(null);
        
        // 1. Authentication Check & Session retrieval
        const { data: { session }, error: sessionErr } = await supabase.auth.getSession();
        
        if (sessionErr) throw sessionErr;
        
        if (!session?.user) {
          if (active) {
            setError("Session expirée. Veuillez vous reconnecter.");
            showToast("Veuillez vous connecter pour voir vos commandes.", "error");
          }
          return;
        }

        // 2. Fetching user-specific active orders
        const { data, error: dbErr } = await supabase
          .from('orders')
          .select('*')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false });

        if (dbErr) throw dbErr;

        if (active) {
          setOrders(data || []);
        }
      } catch (err: any) {
        console.error("Error fetching orders:", err);
        if (active) {
          setError("Impossible de charger vos commandes.");
          showToast("Erreur lors de la récupération des commandes.", "error");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    fetchOrders();

    return () => {
      active = false;
    };
  }, [showToast]);

  // Status mapping
  const getStatusInfo = (status: string) => {
    const s = status ? status.toLowerCase() : '';
    
    if (s === 'pending' || s === 'en attente') {
      return {
        label: 'En attente',
        icon: Clock,
        color: 'text-amber-500 bg-amber-500/5 border-amber-500/20 dark:bg-amber-500/10'
      };
    }
    if (s === 'confirmed' || s === 'processing' || s === 'en cours' || s === 'confirme' || s === 'confirmé') {
      return {
        label: 'En cours',
        icon: Clock,
        color: 'text-blue-500 bg-blue-500/5 border-blue-500/20 dark:bg-blue-500/10'
      };
    }
    if (s === 'shipped' || s === 'en livraison' || s === 'expedié' || s === 'expédié') {
      return {
        label: 'En livraison',
        icon: Truck,
        color: 'text-purple-500 bg-purple-500/5 border-purple-500/20 dark:bg-purple-500/10'
      };
    }
    if (s === 'delivered' || s === 'livré' || s === 'livre') {
      return {
        label: 'Livré',
        icon: CheckCircle2,
        color: 'text-emerald-500 bg-emerald-500/5 border-emerald-500/20 dark:bg-emerald-500/10'
      };
    }
    if (s === 'cancelled' || s === 'annulé' || s === 'annule') {
      return {
        label: 'Annulé',
        icon: XCircle,
        color: 'text-rose-500 bg-rose-500/5 border-rose-500/20 dark:bg-rose-500/10'
      };
    }
    
    return {
      label: status || 'Inconnu',
      icon: Package,
      color: 'text-neutral-500 bg-neutral-500/5 border-neutral-500/20 dark:bg-neutral-500/10'
    };
  };

  // Safe parsing helper for items lists
  const parseOrderItems = (orderItems: any): OrderItem[] => {
    if (!orderItems) return [];
    if (typeof orderItems === 'string') {
      try {
        return JSON.parse(orderItems);
      } catch (e) {
        console.error('Failed to parse order items json:', e);
        return [];
      }
    }
    if (Array.isArray(orderItems)) {
      return orderItems;
    }
    return [];
  };

  // Summarize items for the card subtitle
  const getItemsSummaryText = (items: OrderItem[]) => {
    if (items.length === 0) return 'Aucun article';
    
    const totalQty = items.reduce((acc, item) => acc + (item.quantity || 1), 0);
    const firstItemName = items[0]?.name || 'Article personnalisé';

    if (items.length === 1) {
      return `${totalQty}x ${firstItemName}`;
    }
    return `${firstItemName} + ${items.length - 1} autre(s) (${totalQty} articles)`;
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (e) {
      return dateString;
    }
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 animate-pulse">
          <div className="h-3 w-16 bg-neutral-200 dark:bg-neutral-800 rounded mb-2"></div>
          <div className="h-8 w-48 bg-neutral-200 dark:bg-neutral-800 rounded mb-1"></div>
          <div className="h-4 w-64 bg-neutral-200 dark:bg-neutral-800 rounded mt-2"></div>
        </div>

        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-white/5 rounded-2xl p-5 animate-pulse flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-neutral-200 dark:bg-neutral-800"></div>
                  <div className="space-y-2">
                    <div className="h-4 w-32 bg-neutral-200 dark:bg-neutral-800 rounded"></div>
                    <div className="h-3 w-48 bg-neutral-200 dark:bg-neutral-800 rounded"></div>
                    <div className="h-2.5 w-20 bg-neutral-200 dark:bg-neutral-800 rounded"></div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="h-5 w-16 bg-neutral-200 dark:bg-neutral-800 rounded"></div>
                  <div className="h-5 w-24 bg-neutral-200 dark:bg-neutral-800 rounded-full"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-3xl mx-auto text-center py-12">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto mb-4">
          <XCircle className="w-7 h-7 text-rose-500" />
        </div>
        <h3 className="font-extrabold text-neutral-900 dark:text-white text-lg">Erreur de chargement</h3>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1 mb-6">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-5 py-2.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold rounded-xl text-xs transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">Dashboard</p>
        <h1 className="text-2xl font-extrabold text-neutral-900 dark:text-white tracking-tight">Mes Commandes</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">Historique et suivi en temps réel de vos commandes.</p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-white/5 rounded-2xl p-12 text-center shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-neutral-100 dark:bg-white/5 flex items-center justify-center mx-auto mb-4 border border-neutral-200/50 dark:border-white/5">
            <ClipboardList className="w-7 h-7 text-neutral-400 dark:text-neutral-500" />
          </div>
          <p className="font-bold text-neutral-900 dark:text-white">Aucune commande</p>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1 mb-6">
            Vous n'avez pas encore passé de commande. Explorez notre catalogue pour concevoir vos premiers produits.
          </p>
          <Link
            href="/categories"
            className="inline-flex items-center gap-2 px-5 py-3 bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98]"
          >
            Découvrir le catalogue
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const items = parseOrderItems(order.order_items);
            const summary = getItemsSummaryText(items);
            const orderId = order.id.split('-')[0]?.toUpperCase() || order.id.substring(0, 8).toUpperCase();
            const ref = `#BI4K-${orderId}`;
            const statusInfo = getStatusInfo(order.status);
            const StatusIcon = statusInfo.icon;

            // Extract dynamic thumbnail image from order_items safely
            const firstItem = Array.isArray(items) && items.length > 0 ? items[0] : null;
            const thumbnailImage = firstItem?.mockup_url || firstItem?.image_url || firstItem?.mockupUrl || firstItem?.mockup || firstItem?.image || null;

            return (
              <div 
                key={order.id} 
                onClick={() => setSelectedOrder(order)}
                className="group bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-white/5 rounded-2xl p-5 hover:border-blue-500/30 dark:hover:border-white/10 hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    {thumbnailImage ? (
                      <div className="w-16 h-16 rounded-md bg-neutral-800 border border-neutral-700 overflow-hidden shrink-0 flex items-center justify-center relative group-hover:scale-105 transition-transform duration-300">
                        <img 
                          src={thumbnailImage} 
                          alt={firstItem?.name || "Aperçu du produit"} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-md bg-neutral-100 dark:bg-white/5 flex items-center justify-center shrink-0 border border-neutral-200/50 dark:border-white/5 group-hover:scale-105 transition-transform duration-300">
                        <Package className="w-6 h-6 text-neutral-500 dark:text-neutral-400" />
                      </div>
                    )}
                    
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-extrabold text-neutral-900 dark:text-white text-sm">{ref}</p>
                        <span className="inline-block md:hidden">
                          <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
                        </span>
                      </div>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate mt-0.5">{summary}</p>
                      <p className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-1">{formatDate(order.created_at)}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className="font-black text-sm text-neutral-900 dark:text-white">
                      {order.total_amount} MAD
                    </span>
                    <span className={`flex items-center gap-1.5 text-[9px] font-extrabold uppercase tracking-widest px-2.5 py-1.5 rounded-full border ${statusInfo.color}`}>
                      <StatusIcon className="w-3 h-3" />
                      {statusInfo.label}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Premium Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-lg overflow-hidden bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-white/10 shadow-2xl rounded-3xl p-6 md:p-8 animate-scaleIn">
            
            {/* Close Button */}
            <button 
              onClick={() => setSelectedOrder(null)}
              className="absolute top-5 right-5 text-neutral-400 hover:text-neutral-600 dark:hover:text-white bg-neutral-100 dark:bg-white/5 hover:bg-neutral-200 dark:hover:bg-white/10 rounded-xl p-2 transition-colors z-20"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header info */}
            <div className="mb-6 pb-4 border-b border-neutral-100 dark:border-white/5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 text-[9px] font-extrabold uppercase tracking-widest mb-3">
                Détails de la Commande
              </span>
              <h2 className="text-xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
                Commande #BI4K-{(selectedOrder.id.split('-')[0] || selectedOrder.id.substring(0, 8)).toUpperCase()}
              </h2>
              <div className="flex items-center gap-1 text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest mt-1">
                <Calendar className="w-3.5 h-3.5 text-blue-500 mr-1" />
                Le {formatDate(selectedOrder.created_at)}
              </div>
            </div>

            {/* Items details list */}
            <div className="mb-6">
              <span className="block text-[9px] font-extrabold uppercase tracking-widest text-neutral-400 dark:text-neutral-500 mb-3">
                Articles commandés
              </span>
              <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                {parseOrderItems(selectedOrder.order_items).map((item, idx) => (
                  <div key={idx} className="flex gap-4 items-center bg-neutral-50 dark:bg-white/5 border border-neutral-200/50 dark:border-white/5 p-3 rounded-2xl">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-neutral-100 dark:bg-black/50 relative border border-neutral-200/50 dark:border-white/5 shrink-0 flex items-center justify-center text-neutral-400">
                      {item.mockup_url ? (
                        <img 
                          src={item.mockup_url} 
                          alt={item.name} 
                          className="absolute inset-0 w-full h-full object-contain z-10" 
                        />
                      ) : (item.mockupUrl || item.image_url || item.finalMockup || item.design_url) ? (
                        <>
                          {(item.mockupUrl || item.image_url) && (
                            <img src={item.mockupUrl || item.image_url} alt="" className="absolute inset-0 w-full h-full object-cover z-0 opacity-40" />
                          )}
                          {(item.finalMockup || item.design_url) && (
                            <img src={item.finalMockup || item.design_url} alt="" className="absolute inset-0 w-full h-full object-contain z-10" />
                          )}
                        </>
                      ) : (
                        <ShoppingBag className="w-5 h-5 text-neutral-400" />
                      )}
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <h4 className="font-bold text-xs text-neutral-900 dark:text-white truncate leading-tight">{item.name}</h4>
                      <p className="text-[9px] uppercase font-extrabold text-neutral-500 dark:text-neutral-400 tracking-widest mt-1">
                        Taille: {item.size || 'Unique'} | Qté: {item.quantity || 1}
                      </p>
                    </div>
                    <div className="font-extrabold text-neutral-900 dark:text-white text-xs whitespace-nowrap">
                      {item.price * (item.quantity || 1)} MAD
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom summary and total */}
            <div className="pt-5 border-t border-neutral-100 dark:border-white/5 flex justify-between items-end">
              <div className="text-left">
                <span className="text-[9px] font-extrabold uppercase tracking-widest text-neutral-400 dark:text-neutral-500">Statut actuel</span>
                <div className="mt-1.5">
                  <span className={`inline-flex items-center gap-1.5 text-[9px] font-extrabold uppercase tracking-widest px-2.5 py-1.5 rounded-full border ${getStatusInfo(selectedOrder.status).color}`}>
                    {getStatusInfo(selectedOrder.status).label}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[9px] font-extrabold uppercase tracking-widest text-neutral-400 dark:text-neutral-500">Montant Total</span>
                <span className="text-2xl font-black text-blue-500 dark:text-white block tracking-tight mt-0.5">
                  {selectedOrder.total_amount} MAD
                </span>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
