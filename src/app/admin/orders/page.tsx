"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useApp } from "@/lib/store";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  ChevronUp,
  Loader2,
  FileText,
  ShoppingCart,
  Printer,
  Crosshair,
  Image as ImageIcon,
  Layers,
  DownloadCloud
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface DesignCoordinates {
  x: number;
  y: number;
  width: number;
  height: number;
  canvasWidth: number;
  canvasHeight: number;
}

interface OrderItem {
  cartItemId: string;
  name: string;
  price: number;
  quantity: number;
  size: string;
  image_url?: string;
  design_url?: string | null;
  coordinates?: DesignCoordinates | null;
  // Legacy fields
  mockupUrl?: string;
  finalMockup?: string;
  mockup_url?: string;
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

export default function AdminOrdersPage() {
  const { showToast } = useApp();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const downloadImage = async (imageUrl: string, fileName: string) => {
    try {
      const response = await fetch(imageUrl, { mode: 'cors' });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.warn("Forced download failed, falling back to open in new tab:", err);
      window.open(imageUrl, '_blank');
    }
  };

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error);
    } else {
      setOrders(data || []);
    }
    setLoading(false);
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    // 1. Fetch current order to check the old status and order items
    const { data: order, error: fetchErr } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .maybeSingle();

    if (fetchErr || !order) {
      console.error('Error fetching order for stock update:', fetchErr);
      showToast("Impossible de récupérer la commande pour la mise à jour des stocks.", "error");
      return;
    }

    const oldStatus = (order.status || '').toUpperCase().trim();
    const targetStatus = newStatus.toUpperCase().trim();

    // 2. Perform the status update
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);

    if (error) {
      console.error('Supabase Update Error:', error);
      showToast(`Erreur Supabase: ${error.message}`, "error");
      return;
    }

    // 3. Stock management rules
    const isActive = (s: string) => s === 'PENDING' || s === 'LIVRÉE' || s === 'LIVREE' || s === 'EN ATTENTE' || s === 'DELIVERED';
    const isCanceled = (s: string) => s === 'ANNULÉE' || s === 'ANNULEE' || s === 'ANNULÉ' || s === 'ANNULE' || s === 'CANCELED' || s === 'CANCELLED';

    // Transition A: Active -> Canceled (RESTORE STOCK)
    if (isActive(oldStatus) && isCanceled(targetStatus)) {
      const items = typeof order.order_items === 'string' ? JSON.parse(order.order_items) : order.order_items;
      if (Array.isArray(items)) {
        for (const item of items) {
          const productId = item.id;
          const qty = item.quantity || 1;
          if (productId) {
            // Fetch current stock
            const { data: prod } = await supabase
              .from('products')
              .select('stock')
              .eq('id', productId)
              .maybeSingle();
            
            if (prod) {
              const newStock = (prod.stock || 0) + qty;
              await supabase
                .from('products')
                .update({ stock: newStock })
                .eq('id', productId);
            }
          }
        }
        showToast("Statut mis à jour. Stock restitué avec succès !", "success");
      }
    } 
    // Transition B: Canceled -> Active (DEDUCT STOCK)
    else if (isCanceled(oldStatus) && isActive(targetStatus)) {
      const items = typeof order.order_items === 'string' ? JSON.parse(order.order_items) : order.order_items;
      if (Array.isArray(items)) {
        for (const item of items) {
          const productId = item.id;
          const qty = item.quantity || 1;
          if (productId) {
            // Fetch current stock
            const { data: prod } = await supabase
              .from('products')
              .select('stock')
              .eq('id', productId)
              .maybeSingle();
            
            if (prod) {
              const newStock = Math.max(0, (prod.stock || 0) - qty);
              await supabase
                .from('products')
                .update({ stock: newStock })
                .eq('id', productId);
            }
          }
        }
        showToast("Statut mis à jour. Stock déduit avec succès !", "success");
      }
    } else {
      showToast("Statut de la commande mis à jour avec succès !", "success");
    }

    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    router.refresh();
  };

  const getStatusColor = (status: string) => {
    switch ((status || '').toUpperCase().trim()) {
      case 'PENDING':
      case 'EN ATTENTE':
        return 'text-amber-500 border-amber-500/30 bg-[#1A1A1A]';
      case 'LIVRÉE':
      case 'LIVREE':
      case 'DELIVERED':
        return 'text-emerald-500 border-emerald-500/30 bg-[#1A1A1A]';
      case 'ANNULÉE':
      case 'ANNULEE':
        return 'text-rose-500 border-rose-500/30 bg-[#1A1A1A]';
      default:
        return 'text-zinc-400 border-zinc-700 bg-[#1A1A1A]';
    }
  };

  const toggleExpand = (orderId: string) => {
    setExpandedOrderId(prev => prev === orderId ? null : orderId);
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 pb-20">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <ShoppingCart className="w-6 h-6 text-emerald-400" />
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white uppercase">Commandes</h1>
        </div>
        <p className="text-xs md:text-sm font-medium text-slate-400 uppercase tracking-widest">Gérez les commandes et fiches techniques d&apos;impression</p>
      </div>

      <div className="bg-zinc-900 border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="border-b border-white/5 bg-black/20">
                <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-slate-400 w-8"></th>
                <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Date</th>
                <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Client</th>
                <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Aperçu Articles</th>
                <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Montant</th>
                <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Preuve Paiement</th>
                <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {orders.map((order) => {
                const isExpanded = expandedOrderId === order.id;

                return (
                  <React.Fragment key={order.id}>
                    {/* Main Row */}
                    <tr 
                      className={`hover:bg-white/[0.02] transition-colors cursor-pointer ${isExpanded ? 'bg-white/[0.015]' : ''}`}
                      onClick={() => toggleExpand(order.id)}
                    >
                      {/* Expand Toggle */}
                      <td className="py-5 px-4 align-top text-center">
                        <button className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                          {isExpanded 
                            ? <ChevronUp className="w-3.5 h-3.5" /> 
                            : <ChevronDown className="w-3.5 h-3.5" />
                          }
                        </button>
                      </td>

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

                      {/* Items Preview — clean support image only */}
                      <td className="py-5 px-6 align-top" onClick={(e) => e.stopPropagation()}>
                        <div className="flex flex-col gap-3">
                          {order.order_items.map((item, idx) => (
                            <div key={idx} className="flex gap-3 items-center">
                              <div className="relative w-12 h-12 rounded-lg bg-black/50 overflow-hidden shrink-0 border border-white/10 flex items-center justify-center">
                                <img src={item.mockup_url || item.image_url || item.mockupUrl || ''} alt="" className="absolute inset-0 w-full h-full object-contain" />
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
                        <span className="text-sm font-black italic text-emerald-400">{Number(order.total_amount).toFixed(2)} MAD</span>
                        <span className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mt-1">{order.payment_method}</span>
                      </td>

                      {/* Payment Proof */}
                      <td className="py-5 px-6 text-center align-top" onClick={(e) => e.stopPropagation()}>
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

                      {/* Status Dropdown */}
                      <td className="py-5 px-6 text-right align-top" onClick={(e) => e.stopPropagation()}>
                        <div className="relative inline-block text-left" onClick={(e) => e.stopPropagation()}>
                          <select
                            value={order.status ? order.status.toUpperCase().trim() : 'PENDING'}
                            onChange={async (e) => {
                              const newValue = e.target.value;
                              await updateOrderStatus(order.id, newValue);
                            }}
                            className={`bg-[#1A1A1A] border rounded-md px-3 py-1 outline-none focus:ring-2 focus:ring-brand-blue appearance-none text-[10px] font-black uppercase tracking-widest cursor-pointer transition-all pr-8 ${getStatusColor(order.status)}`}
                          >
                            <option value="PENDING" className="bg-[#1A1A1A] text-amber-500 font-black">PENDING</option>
                            <option value="LIVRÉE" className="bg-[#1A1A1A] text-emerald-500 font-black">LIVRÉE</option>
                            <option value="ANNULÉE" className="bg-[#1A1A1A] text-rose-500 font-black">ANNULÉE</option>
                          </select>
                          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                            <ChevronDown className="w-3.5 h-3.5" />
                          </div>
                        </div>
                      </td>
                    </tr>

                    {/* Expandable Printing Specs Row */}
                    {isExpanded && (
                      <tr>
                        <td colSpan={7} className="p-0">
                          <AnimatePresence>
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="px-8 py-6 bg-zinc-950/60 border-t border-white/5">
                                
                                {/* Section Title */}
                                <div className="flex items-center gap-2.5 mb-6">
                                  <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center border border-violet-500/20">
                                    <Printer className="w-4 h-4 text-violet-400" />
                                  </div>
                                  <div>
                                    <h3 className="text-xs font-black uppercase tracking-widest text-violet-400">Fiche Technique d&apos;Impression</h3>
                                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Spécifications de placement pour la production industrielle</p>
                                  </div>
                                </div>

                                {/* Each Item Printing Spec */}
                                <div className="space-y-6">
                                  {order.order_items.map((item, idx) => {
                                    const hasDesign = !!item.design_url || !!item.finalMockup;
                                    const hasCoords = !!item.coordinates;
                                    const designSrc = item.design_url || item.finalMockup || null;
                                    const supportSrc = item.mockupUrl || item.image_url || '';

                                    return (
                                      <div key={idx} className="bg-zinc-900/50 border border-white/5 rounded-2xl p-5">
                                        
                                        {/* Item Header */}
                                        <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
                                          <div className="flex items-center gap-2">
                                            <span className="w-5 h-5 rounded bg-violet-500/10 text-violet-400 flex items-center justify-center text-[9px] font-black border border-violet-500/20">
                                              {idx + 1}
                                            </span>
                                            <span className="text-xs font-bold text-white">{item.name}</span>
                                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 bg-white/5 px-2 py-0.5 rounded">
                                              Taille: {item.size} · Qté: {item.quantity}
                                            </span>
                                          </div>
                                          <span className="text-xs font-black italic text-emerald-400">{Number(item.price * item.quantity).toFixed(2)} MAD</span>
                                        </div>

                                        {/* Split Preview: Support + Design */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                          
                                          {/* Mockup de Production */}
                                          <div className="space-y-2">
                                            <div className="flex items-center gap-1.5">
                                              <ImageIcon className="w-3 h-3 text-blue-400" />
                                              <span className="text-[9px] font-black uppercase tracking-widest text-blue-400">Mockup de Production</span>
                                            </div>
                                            <div className="relative aspect-square max-h-[200px] rounded-xl overflow-hidden bg-black/50 border border-white/10 flex items-center justify-center">
                                              {item.mockup_url ? (
                                                <img src={item.mockup_url} alt="Mockup de Production" className="w-full h-full object-contain z-0" />
                                              ) : supportSrc ? (
                                                <>
                                                  <img src={supportSrc} alt="Support produit" className="w-full h-full object-contain z-0" />
                                                  {hasCoords && item.coordinates && designSrc && (
                                                    <div style={{
                                                      position: 'absolute',
                                                      left: `${(item.coordinates.x / (item.coordinates.canvasWidth || 550)) * 100}%`,
                                                      top: `${(item.coordinates.y / (item.coordinates.canvasHeight || 688)) * 100}%`,
                                                      width: `${(item.coordinates.width / (item.coordinates.canvasWidth || 550)) * 100}%`,
                                                      height: `${(item.coordinates.height / (item.coordinates.canvasHeight || 688)) * 100}%`
                                                    }} className="pointer-events-none z-10">
                                                      <img src={designSrc} alt="Design Overlay" className="w-full h-full object-contain" />
                                                    </div>
                                                  )}
                                                </>
                                              ) : (
                                                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Aucune image</span>
                                              )}
                                            </div>
                                            {supportSrc && (
                                              <button
                                                type="button"
                                                onClick={() => downloadImage(supportSrc, `support-${order.id}-${idx + 1}.png`)}
                                                className="w-full mt-2 py-2 px-3 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-400 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-1.5"
                                              >
                                                <DownloadCloud className="w-3.5 h-3.5" /> Télécharger Support
                                              </button>
                                            )}
                                          </div>

                                          {/* Design Image */}
                                          <div className="space-y-2">
                                            <div className="flex items-center gap-1.5">
                                              <Layers className="w-3 h-3 text-violet-400" />
                                              <span className="text-[9px] font-black uppercase tracking-widest text-violet-400">Design Isolé (Transparent)</span>
                                            </div>
                                            <div className="relative aspect-square max-h-[200px] rounded-xl overflow-hidden border border-white/10 flex items-center justify-center" style={{ background: 'repeating-conic-gradient(#1a1a2e 0% 25%, #16162a 0% 50%) 50% / 16px 16px' }}>
                                              {hasDesign && designSrc ? (
                                                <img src={designSrc} alt="Design isolé" className="w-full h-full object-contain" />
                                              ) : (
                                                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Aucun design personnalisé</span>
                                              )}
                                            </div>
                                            {hasDesign && designSrc && (
                                              <button
                                                type="button"
                                                onClick={() => downloadImage(designSrc, `design-${order.id}-${idx + 1}.png`)}
                                                className="w-full mt-2 py-2 px-3 bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/20 text-violet-400 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-1.5"
                                              >
                                                <DownloadCloud className="w-3.5 h-3.5" /> Télécharger Design
                                              </button>
                                            )}
                                          </div>
                                        </div>

                                        {/* Coordinates Technical Block */}
                                        {hasCoords && item.coordinates ? (
                                          <div className="bg-black/30 border border-white/5 rounded-xl p-4">
                                            <div className="flex items-center gap-1.5 mb-3">
                                              <Crosshair className="w-3 h-3 text-cyan-400" />
                                              <span className="text-[9px] font-black uppercase tracking-widest text-cyan-400">Coordonnées de Placement</span>
                                            </div>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                              <div className="bg-white/[0.02] rounded-lg p-3 border border-white/5">
                                                <p className="text-[8px] font-black uppercase tracking-widest text-slate-500 mb-1">Position X</p>
                                                <p className="text-sm font-black text-cyan-400 font-mono">{item.coordinates.x}px</p>
                                              </div>
                                              <div className="bg-white/[0.02] rounded-lg p-3 border border-white/5">
                                                <p className="text-[8px] font-black uppercase tracking-widest text-slate-500 mb-1">Position Y</p>
                                                <p className="text-sm font-black text-cyan-400 font-mono">{item.coordinates.y}px</p>
                                              </div>
                                              <div className="bg-white/[0.02] rounded-lg p-3 border border-white/5">
                                                <p className="text-[8px] font-black uppercase tracking-widest text-slate-500 mb-1">Largeur</p>
                                                <p className="text-sm font-black text-violet-400 font-mono">{item.coordinates.width}px</p>
                                              </div>
                                              <div className="bg-white/[0.02] rounded-lg p-3 border border-white/5">
                                                <p className="text-[8px] font-black uppercase tracking-widest text-slate-500 mb-1">Hauteur</p>
                                                <p className="text-sm font-black text-violet-400 font-mono">{item.coordinates.height}px</p>
                                              </div>
                                            </div>
                                            <div className="mt-3 px-3 py-2 bg-white/[0.01] rounded-lg border border-white/5">
                                              <p className="text-[8px] font-mono text-slate-400 leading-relaxed">
                                                <span className="text-cyan-400/80">Position:</span> X: {item.coordinates.x}px, Y: {item.coordinates.y}px
                                                <span className="mx-2 text-slate-600">|</span>
                                                <span className="text-violet-400/80">Dimensions:</span> W: {item.coordinates.width}px, H: {item.coordinates.height}px
                                                <span className="mx-2 text-slate-600">|</span>
                                                <span className="text-slate-500">Canvas Ref: {item.coordinates.canvasWidth}×{item.coordinates.canvasHeight}px</span>
                                              </p>
                                            </div>
                                          </div>
                                        ) : (
                                          <div className="bg-black/20 border border-white/5 rounded-xl p-4 text-center">
                                            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500">
                                              Aucune donnée de coordonnées — commande antérieure au système de placement
                                            </p>
                                          </div>
                                        )}

                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </motion.div>
                          </AnimatePresence>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 text-xs font-bold uppercase tracking-widest">
                    Aucune commande trouvée
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
