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
        <div className="w-12 h-12 rounded-full border-4 border-brand-blue/20 border-t-brand-blue animate-spin"></div>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-blue">Chargement de votre panier...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-background text-neutral-900 dark:text-foreground transition-colors duration-500">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 pt-32 pb-20 max-w-5xl">
        <div className="flex items-center gap-3 mb-10">
          <ShoppingCart className="w-8 h-8 text-brand-blue" />
          <h1 className="text-4xl font-black uppercase tracking-tighter text-neutral-900 dark:text-white">Mon Panier / Your Cart</h1>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 bg-white dark:bg-[#111116] border border-neutral-200 dark:border-white/5 rounded-[3rem] text-center shadow-sm dark:shadow-2xl">
            <div className="w-20 h-20 bg-neutral-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-6">
              <ShoppingCart className="w-8 h-8 text-neutral-300 dark:text-white/20" />
            </div>
            <h2 className="text-2xl font-black uppercase tracking-widest text-neutral-400 dark:text-white/50 mb-6">Votre panier est vide / Cart is empty</h2>
            <Link href="/categories" className="px-8 py-4 bg-brand-blue text-white font-black uppercase text-xs tracking-widest rounded-2xl hover:bg-brand-blue/80 hover:scale-105 transition-transform shadow-xl shadow-brand-blue/20">
              Retour au catalogue / Return to Catalog
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

            {/* Items List */}
            <div className="lg:col-span-2 space-y-4">
              {items.map(item => (
                <div key={item.cartItemId} className="bg-white border border-neutral-200 dark:bg-[#111116] dark:border-white/5 p-6 rounded-[2rem] flex gap-6 relative shadow-sm dark:shadow-xl hover:border-neutral-300 dark:hover:border-white/10 transition-colors">
                  {/* Thumbnail — Clean product support image with design overlay or composite mockup */}
                  <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-xl overflow-hidden bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10 shrink-0 flex items-center justify-center">
                    {item.mockup_url && !item.mockup_url.includes('images.24hourwristbands.com') && !item.mockup_url.includes('vecteezy') ? (
                      <img src={item.mockup_url} alt={item.name} className="absolute inset-0 w-full h-full object-contain" />
                    ) : (
                      <>
                        <img src={item.image_url || item.mockupUrl || item.mockup_url || ''} alt={item.name} className="absolute inset-0 w-full h-full object-cover z-0 opacity-60" />
                        {item.design_url && (
                          <div
                            style={{
                              position: 'absolute',
                              left: item.coordinates ? `${(item.coordinates.x / (item.coordinates.canvasWidth || 500)) * 100}%` : '25%',
                              top: item.coordinates ? `${(item.coordinates.y / (item.coordinates.canvasHeight || 500)) * 100}%` : '20%',
                              width: item.coordinates ? `${(item.coordinates.width / (item.coordinates.canvasWidth || 500)) * 100}%` : '50%',
                              height: item.coordinates ? `${(item.coordinates.height / (item.coordinates.canvasHeight || 500)) * 100}%` : '56%',
                            }}
                            className="pointer-events-none z-10 flex items-center justify-center"
                          >
                            <img src={item.design_url} alt="" className="w-full h-full object-contain" />
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xl font-black uppercase tracking-tighter text-neutral-900 dark:text-white mb-1">{item.name}</h3>
                      <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-neutral-500 dark:text-foreground/50">
                        <span>Taille / Size: <span className="text-neutral-900 dark:text-white">{item.size}</span></span>
                      </div>
                    </div>

                    <div className="flex items-end justify-between mt-4">
                      {/* Quantity Selector */}
                      <div className="flex items-center gap-1 bg-neutral-100 dark:bg-white/5 rounded-xl border border-neutral-200 dark:border-white/10 p-1">
                        <button
                          onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                          className="p-2 hover:bg-neutral-200 dark:hover:bg-white/10 rounded-lg transition-colors text-neutral-500 dark:text-slate-400 hover:text-neutral-900 dark:hover:text-white"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center font-bold text-sm text-neutral-900 dark:text-white">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                          className="p-2 hover:bg-neutral-200 dark:hover:bg-white/10 rounded-lg transition-colors text-neutral-500 dark:text-slate-400 hover:text-neutral-900 dark:hover:text-white"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="text-right flex flex-col items-end">
                        <span className="text-lg font-black italic text-neutral-900 dark:text-brand-yellow">{Number(item.price * item.quantity).toFixed(2)} MAD</span>
                        <button
                          onClick={() => removeFromCart(item.cartItemId)}
                          className="text-[10px] uppercase font-black tracking-widest text-rose-500 dark:text-rose-400 hover:text-rose-600 dark:hover:text-rose-300 mt-2 flex items-center gap-1 transition-colors"
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
              <div className="bg-white dark:bg-[#111116] border border-neutral-200 dark:border-white/5 p-8 rounded-[2.5rem] sticky top-32 shadow-sm dark:shadow-2xl">
                <h2 className="text-xl font-black uppercase tracking-tighter mb-6 text-neutral-900 dark:text-white">Récapitulatif / Summary</h2>

                <div className="space-y-4 text-sm font-medium text-neutral-500 dark:text-slate-400 mb-8 border-b border-neutral-200 dark:border-white/10 pb-6">
                  <div className="flex justify-between">
                    <span>Sous-total / Subtotal</span>
                    <span className="text-neutral-900 dark:text-white font-bold">{Number(subtotal).toFixed(2)} MAD</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Taxe / Tax</span>
                    <span className="text-neutral-900 dark:text-white font-bold">{Number(tax).toFixed(2)} MAD</span>
                  </div>
                </div>

                <div className="flex justify-between items-end mb-6">
                  <span className="text-sm font-black uppercase tracking-widest text-neutral-400 dark:text-foreground/50">Total</span>
                  <span className="text-4xl font-black italic text-neutral-900 dark:text-brand-yellow">{Number(total).toFixed(2)} MAD</span>
                </div>

                <div className="mb-8 p-4 rounded-2xl bg-neutral-50 dark:bg-white/5 border border-neutral-200 dark:border-white/5 text-center">
                  <p className="text-[9px] font-black uppercase tracking-widest text-neutral-500 dark:text-slate-400">
                    🚚 Livraison / Shipping
                  </p>
                  <p className="text-[11px] font-bold text-brand-blue mt-1 uppercase tracking-wider">
                    Calculé à l'étape suivante / Calculated at checkout
                  </p>
                </div>

                <button
                  onClick={handleCheckout}
                  className="w-full py-5 rounded-2xl bg-brand-blue text-white font-black uppercase text-sm tracking-widest flex items-center justify-center gap-2 hover:bg-brand-blue/80 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-brand-blue/20"
                >
                  COMMANDER (CHECKOUT) <ArrowRight className="w-4 h-4" />
                </button>

                <p className="text-center text-[9px] text-neutral-400 dark:text-foreground/40 mt-6 font-bold uppercase tracking-widest">
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
