'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CreditCard, MapPin, Truck, ShieldCheck, Loader2 } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { processCheckout } from '@/app/actions/checkout';
import type { ShippingAddress } from '@/lib/db/types';

export default function ClientCheckout({ items, savedAddress }: { items: any[], savedAddress?: any }) {
  const router = useRouter();
  const subtotal = items.reduce((sum, item) => sum + (item.price_unit * item.quantity), 0);

  const [address, setAddress] = useState<ShippingAddress>({
    fullName: savedAddress?.fullName || '',
    street: savedAddress?.street || '',
    city: savedAddress?.city || '',
    zip: savedAddress?.zip || '',
    country: savedAddress?.country || '',
    phone: savedAddress?.phone || '',
  });

  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setError(null);

    const result = await processCheckout(address);

    if (result.error) {
      setError(result.error);
      setProcessing(false);
    } else if (result.success) {
      router.push(`/checkout/success?order_id=${result.orderId}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-500">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 pt-32 pb-20 max-w-6xl">
        <div className="flex items-center gap-3 mb-10">
          <ShieldCheck className="w-8 h-8 text-emerald-400" />
          <h1 className="text-4xl font-black uppercase tracking-tighter">Secure Checkout</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Form Section */}
          <div className="lg:col-span-7 space-y-8">
            <form id="checkout-form" onSubmit={handleCheckout} className="space-y-8">
              
              {error && (
                 <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 font-bold text-sm">
                   {error}
                 </div>
              )}

              {/* Shipping Address */}
              <div className="glass p-8 rounded-[2rem] border border-white/5">
                <h2 className="text-xl font-black uppercase tracking-widest flex items-center gap-2 mb-6">
                  <MapPin className="w-5 h-5 text-primary" /> Shipping Address
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-widest text-foreground/50 mb-1.5">Full Name</label>
                    <input required value={address.fullName} onChange={(e) => setAddress({...address, fullName: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all text-sm" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-widest text-foreground/50 mb-1.5">Street Address</label>
                    <input required value={address.street} onChange={(e) => setAddress({...address, street: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-foreground/50 mb-1.5">City</label>
                    <input required value={address.city} onChange={(e) => setAddress({...address, city: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-foreground/50 mb-1.5">Postal / Zip Code</label>
                    <input required value={address.zip} onChange={(e) => setAddress({...address, zip: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-foreground/50 mb-1.5">Country</label>
                    <input required value={address.country} onChange={(e) => setAddress({...address, country: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-foreground/50 mb-1.5">Phone Number</label>
                    <input required value={address.phone} onChange={(e) => setAddress({...address, phone: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all text-sm" />
                  </div>
                </div>
              </div>

              {/* Payment Info */}
              <div className="glass p-8 rounded-[2rem] border border-white/5">
                <h2 className="text-xl font-black uppercase tracking-widest flex items-center gap-2 mb-6">
                  <CreditCard className="w-5 h-5 text-primary" /> Payment details
                </h2>
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl mb-4 text-emerald-400 text-sm font-bold flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" /> Payment is securely simulated for this demo. No real card required.
                </div>
                <div className="space-y-4 opacity-50 pointer-events-none">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-foreground/50 mb-1.5">Card Number</label>
                    <input value="•••• •••• •••• 4242" readOnly className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-foreground/50 mb-1.5">Expiry</label>
                      <input value="12/28" readOnly className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-foreground/50 mb-1.5">CVC</label>
                      <input value="•••" readOnly className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm" />
                    </div>
                  </div>
                </div>
              </div>
              
              <button 
                type="submit" 
                disabled={processing}
                className="w-full py-5 rounded-2xl bg-emerald-500 text-white font-black uppercase text-sm tracking-widest flex items-center justify-center gap-2 hover:bg-emerald-400 transition-colors shadow-xl shadow-emerald-500/20 disabled:opacity-50"
              >
                {processing ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
                {processing ? "Processing Order..." : `Pay $${subtotal.toFixed(2)}`}
              </button>

            </form>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-5">
             <div className="glass p-8 rounded-[2.5rem] border border-white/5 sticky top-32">
               <h2 className="text-xl font-black uppercase tracking-tighter mb-6">In Your Cart</h2>
               
               <div className="space-y-4 mb-8 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                 {items.map(item => (
                   <div key={item.id} className="flex gap-4 items-center bg-white/5 p-3 rounded-2xl">
                     <div className="w-16 h-16 rounded-xl bg-black/50 overflow-hidden shrink-0">
                       <img src={item.designs?.url || item.Product?.base_image_url} alt="Item" className="w-full h-full object-cover" />
                     </div>
                     <div className="flex-1">
                       <h4 className="font-bold text-sm leading-tight">{item.Product?.name}</h4>
                       <p className="text-[10px] uppercase font-bold text-foreground/50 tracking-widest mt-0.5">
                         Qty: {item.quantity} | {item.selected_size}
                       </p>
                     </div>
                     <div className="font-black italic text-primary">
                       ${(item.price_unit * item.quantity).toFixed(2)}
                     </div>
                   </div>
                 ))}
               </div>

               <div className="space-y-3 text-sm font-medium text-foreground/70 mb-6 border-t border-white/10 pt-6">
                 <div className="flex justify-between">
                   <span>Subtotal</span>
                   <span className="text-white">${subtotal.toFixed(2)}</span>
                 </div>
                 <div className="flex justify-between items-center text-emerald-400">
                   <span className="flex items-center gap-2"><Truck className="w-4 h-4" /> Shipping</span>
                   <span>Free</span>
                 </div>
               </div>
               
               <div className="flex justify-between items-end border-t border-white/10 pt-6">
                 <span className="text-sm font-black uppercase tracking-widest text-foreground/50">Total</span>
                 <span className="text-4xl font-black italic text-emerald-400">${subtotal.toFixed(2)}</span>
               </div>
             </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
