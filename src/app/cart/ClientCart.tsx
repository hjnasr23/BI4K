'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Trash2, Plus, Minus, ShoppingCart, ArrowRight } from 'lucide-react';
import { updateCartItemQty, removeCartItem } from '@/lib/db';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

// Use any to quickly type the joined properties returned from getCartWithItems
type CartItemJoined = any; 

export default function ClientCart({ initialItems, cartId }: { initialItems: CartItemJoined[], cartId?: string }) {
  const [items, setItems] = useState<CartItemJoined[]>(initialItems);
  const [updating, setUpdating] = useState<string | null>(null);

  const subtotal = items.reduce((sum, item) => sum + (item.price_unit * item.quantity), 0);

  const handleUpdateQty = async (id: string, newQty: number) => {
    if (newQty < 1) return handleRemove(id);
    
    setUpdating(id);
    const { error } = await updateCartItemQty(id, newQty);
    if (!error) {
      setItems(items.map(item => item.id === id ? { ...item, quantity: newQty } : item));
    }
    setUpdating(null);
  };

  const handleRemove = async (id: string) => {
    setUpdating(id);
    const { error } = await removeCartItem(id);
    if (!error) {
      setItems(items.filter(item => item.id !== id));
    }
    setUpdating(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-500">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 pt-32 pb-20 max-w-5xl">
        <div className="flex items-center gap-3 mb-10">
          <ShoppingCart className="w-8 h-8 text-brand-blue" />
          <h1 className="text-4xl font-black uppercase tracking-tighter">Your Studio Cart</h1>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 glass rounded-[3rem] border border-white/5 text-center">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
              <ShoppingCart className="w-8 h-8 text-white/20" />
            </div>
            <h2 className="text-2xl font-black uppercase tracking-widest text-white/50 mb-4">Cart is empty</h2>
            <Link href="/categories" className="px-8 py-4 bg-brand-blue text-white font-black uppercase text-xs tracking-widest rounded-2xl hover:bg-brand-blue/80 shadow-lg shadow-brand-blue/20 transition-transform">
              Return to Studio
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            
            {/* Items List */}
            <div className="lg:col-span-2 space-y-4">
              {items.map(item => (
                <div key={item.id} className="glass p-6 rounded-[2rem] border border-white/5 flex gap-6 relative">
                  {updating === item.id && (
                    <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-[2rem]">
                      <div className="w-6 h-6 border-2 border-brand-blue border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                  
                  {/* Image */}
                  <div className="w-32 h-32 rounded-2xl bg-black/50 border border-white/10 overflow-hidden shrink-0 relative">
                     {item.designs?.url ? (
                        <img src={item.designs.url} alt="Custom AI Design" className="w-full h-full object-cover" />
                     ) : item.Product?.base_image_url ? (
                        <img src={item.Product.base_image_url} alt={item.Product.name} className="w-full h-full object-cover opacity-80" />
                     ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/20 font-bold text-xs uppercase tracking-widest">Preview</div>
                     )}
                  </div>
                  
                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xl font-black uppercase tracking-tighter mb-1">{item.Product?.name || 'Unknown Product'}</h3>
                      <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-foreground/50">
                         {item.selected_color && (
                            <span className="flex items-center gap-1">
                              <span className="w-3 h-3 rounded-full inline-block border border-white/20" style={{ backgroundColor: item.selected_color }} />
                              {item.selected_color}
                            </span>
                         )}
                         {item.selected_size && <span>Size: <span className="text-white">{item.selected_size}</span></span>}
                      </div>
                    </div>
                    
                    <div className="flex items-end justify-between mt-4">
                       <div className="flex items-center gap-1 bg-white/5 rounded-xl border border-white/10 p-1">
                          <button onClick={() => handleUpdateQty(item.id, item.quantity - 1)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center font-bold text-sm">{item.quantity}</span>
                          <button onClick={() => handleUpdateQty(item.id, item.quantity + 1)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                            <Plus className="w-3 h-3" />
                          </button>
                       </div>
                       
                       <div className="text-right flex flex-col items-end">
                          <span className="text-lg font-black italic text-brand-yellow">${(item.price_unit * item.quantity).toFixed(2)}</span>
                          <button onClick={() => handleRemove(item.id)} className="text-[10px] uppercase font-black tracking-widest text-rose-400 hover:text-rose-300 mt-2 flex items-center gap-1 transition-colors">
                            <Trash2 className="w-3 h-3" /> Remove
                          </button>
                       </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary Panel */}
            <div className="lg:col-span-1">
               <div className="glass p-8 rounded-[2.5rem] border border-white/5 sticky top-32">
                 <h2 className="text-xl font-black uppercase tracking-tighter mb-6">Order Summary</h2>
                 
                 <div className="space-y-4 text-sm font-medium text-foreground/70 mb-8 border-b border-white/10 pb-6">
                   <div className="flex justify-between">
                     <span>Subtotal ({items.length} items)</span>
                     <span className="text-white">${subtotal.toFixed(2)}</span>
                   </div>
                   <div className="flex justify-between text-emerald-400">
                     <span>Standard Shipping</span>
                     <span>Free</span>
                   </div>
                   <div className="flex justify-between">
                     <span>Estimated Tax</span>
                     <span className="text-white">$0.00</span>
                   </div>
                 </div>
                 
                 <div className="flex justify-between items-end mb-8">
                   <span className="text-sm font-black uppercase tracking-widest text-foreground/50">Total</span>
                   <span className="text-4xl font-black italic text-brand-yellow">${subtotal.toFixed(2)}</span>
                 </div>
                 
                 <Link href="/checkout" className="w-full py-5 rounded-2xl bg-brand-blue text-white font-black uppercase text-sm tracking-widest flex items-center justify-center gap-2 hover:bg-brand-blue/80 transition-colors shadow-xl shadow-brand-blue/20">
                   Secure Checkout <ArrowRight className="w-4 h-4" />
                 </Link>
                 
                 <p className="text-center text-[10px] text-foreground/40 mt-6 font-bold uppercase tracking-widest">
                   Encrypted & Secure Payment
                 </p>
               </div>
            </div>

          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
