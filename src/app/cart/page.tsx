'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Trash2, Plus, Minus, ShoppingCart, ArrowRight } from 'lucide-react';
import { useCartStore } from '@/lib/store/cartStore';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export default function CartPage() {
  const router = useRouter();
  const { items, updateQuantity, removeFromCart, clearCart } = useCartStore();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = 0;
  const total = subtotal + tax;

  const handleCheckout = () => {
    router.push('/checkout');
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col justify-center items-center gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Chargement de votre panier...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-500">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 pt-32 pb-20 max-w-5xl">
        <div className="flex items-center gap-3 mb-10">
          <ShoppingCart className="w-8 h-8 text-primary" />
          <h1 className="text-4xl font-black uppercase tracking-tighter text-white">Mon Panier / Your Cart</h1>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 glass rounded-[3rem] border border-white/5 text-center bg-[#111116] shadow-2xl">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
              <ShoppingCart className="w-8 h-8 text-white/20" />
            </div>
            <h2 className="text-2xl font-black uppercase tracking-widest text-white/50 mb-6">Votre panier est vide / Cart is empty</h2>
            <Link href="/categories" className="px-8 py-4 bg-primary text-white font-black uppercase text-xs tracking-widest rounded-2xl hover:scale-105 transition-transform shadow-xl shadow-primary/20">
              Retour au catalogue / Return to Catalog
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

            {/* Items List */}
            <div className="lg:col-span-2 space-y-4">
              {items.map(item => (
                <div key={item.cartItemId} className="glass p-6 rounded-[2rem] border border-white/5 flex gap-6 relative bg-[#111116] shadow-xl hover:border-white/10 transition-colors">
                  {/* Thumbnail — Clean product support image only */}
                  <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-xl overflow-hidden bg-white/5 border border-white/10 shrink-0">
                     <img src={item.image_url || item.mockupUrl || ''} alt={item.name} className="absolute inset-0 w-full h-full object-cover" />
                  </div>

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xl font-black uppercase tracking-tighter text-white mb-1">{item.name}</h3>
                      <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-foreground/50">
                        <span>Taille / Size: <span className="text-white">{item.size}</span></span>
                      </div>
                    </div>

                    <div className="flex items-end justify-between mt-4">
                      {/* Quantity Selector */}
                      <div className="flex items-center gap-1 bg-white/5 rounded-xl border border-white/10 p-1">
                        <button
                          onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                          className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center font-bold text-sm text-white">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                          className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="text-right flex flex-col items-end">
                        <span className="text-lg font-black italic text-primary">{item.price * item.quantity} MAD</span>
                        <button
                          onClick={() => removeFromCart(item.cartItemId)}
                          className="text-[10px] uppercase font-black tracking-widest text-rose-400 hover:text-rose-300 mt-2 flex items-center gap-1 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" /> Supprimer / Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary Panel */}
            <div className="lg:col-span-1">
              <div className="glass p-8 rounded-[2.5rem] border border-white/5 sticky top-32 bg-[#111116] shadow-2xl">
                <h2 className="text-xl font-black uppercase tracking-tighter mb-6 text-white">Récapitulatif / Summary</h2>

                <div className="space-y-4 text-sm font-medium text-slate-400 mb-8 border-b border-white/10 pb-6">
                  <div className="flex justify-between">
                    <span>Sous-total / Subtotal</span>
                    <span className="text-white font-bold">{subtotal} MAD</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Taxe / Tax</span>
                    <span className="text-white font-bold">{tax} MAD</span>
                  </div>
                </div>

                <div className="flex justify-between items-end mb-6">
                  <span className="text-sm font-black uppercase tracking-widest text-foreground/50">Total</span>
                  <span className="text-4xl font-black italic text-primary">{total} MAD</span>
                </div>

                <div className="mb-8 p-4 rounded-2xl bg-white/5 border border-white/5 text-center">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                    🚚 Livraison / Shipping
                  </p>
                  <p className="text-[11px] font-bold text-primary mt-1 uppercase tracking-wider">
                    Calculé à l'étape suivante / Calculated at checkout
                  </p>
                </div>

                <button
                  onClick={handleCheckout}
                  className="w-full py-5 rounded-2xl bg-white text-black font-black uppercase text-sm tracking-widest flex items-center justify-center gap-2 hover:bg-gray-200 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl"
                >
                  COMMANDER (CHECKOUT) <ArrowRight className="w-4 h-4" />
                </button>

                <p className="text-center text-[9px] text-foreground/40 mt-6 font-bold uppercase tracking-widest">
                  Paiement sécurisé / Secure Payment
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
