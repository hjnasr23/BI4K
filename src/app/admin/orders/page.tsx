"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  ChevronDown,
  ChevronUp,
  Loader2,
  FileText,
  ShoppingCart,
  Printer,
  Crosshair,
  Image as ImageIcon,
  Layers
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
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

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
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);

    if (error) {
      console.error('Error updating order status:', error);
      fetchOrders();
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
                              <div className="relative w-12 h-12 rounded-lg bg-black/50 overflow-hidden shrink-0 border border-white/10">
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
                        <div className="relative inline-block text-left group/dropdown">
                          <button className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[10px] font-black uppercase tracking-widest cursor-pointer hover:opacity-80 transition-opacity ${getStatusColor(order.status)}`}>
                            {order.status} <ChevronDown className="w-3 h-3" />
                          </button>
                          <div className="absolute right-0 mt-2 w-32 origin-top-right rounded-xl bg-zinc-900 border border-white/10 shadow-2xl opacity-0 invisible group-hover/dropdown:opacity-100 group-hover/dropdown:visible transition-all z-50 overflow-hidden">
                            <button onClick={() => updateOrderStatus(order.id, 'en attente')} className="w-full text-left px-4 py-3 text-[10px] uppercase tracking-widest font-black text-amber-500 hover:bg-white/5 transition-colors">En attente</button>
                            <button onClick={() => updateOrderStatus(order.id, 'livrée')} className="w-full text-left px-4 py-3 text-[10px] uppercase tracking-widest font-black text-emerald-500 hover:bg-white/5 transition-colors">Livrée</button>
                            <button onClick={() => updateOrderStatus(order.id, 'annulée')} className="w-full text-left px-4 py-3 text-[10px] uppercase tracking-widest font-black text-rose-500 hover:bg-white/5 transition-colors">Annulée</button>
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
                                    const supportSrc = item.image_url || item.mockupUrl || '';

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
                                          <span className="text-xs font-black italic text-emerald-400">{item.price * item.quantity} MAD</span>
                                        </div>

                                        {/* Split Preview: Support + Design */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                          
                                          {/* Support Image */}
                                          <div className="space-y-2">
                                            <div className="flex items-center gap-1.5">
                                              <ImageIcon className="w-3 h-3 text-blue-400" />
                                              <span className="text-[9px] font-black uppercase tracking-widest text-blue-400">Support (Produit Vierge)</span>
                                            </div>
                                            <div className="relative aspect-square max-h-[200px] rounded-xl overflow-hidden bg-black/50 border border-white/10 flex items-center justify-center">
                                              {supportSrc ? (
                                                <img src={supportSrc} alt="Support produit" className="w-full h-full object-contain" />
                                              ) : (
                                                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Aucune image</span>
                                              )}
                                            </div>
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
