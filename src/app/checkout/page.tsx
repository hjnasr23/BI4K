"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/lib/store/cartStore";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "motion/react";
import {
  CheckCircle2,
  Loader2,
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  ShieldCheck,
  Building,
  CreditCard as CardIcon,
  Truck
} from "lucide-react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clearCart } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: ""
  });

  // Payment Method State
  const [paymentMethod, setPaymentMethod] = useState<'livraison' | 'carte' | 'rib'>('livraison');
  const [paymentProof, setPaymentProof] = useState<File | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Calculate totals
  const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const totalAmount = subtotal; // Assuming no tax/shipping added for now

  // Redirect if cart is empty (only after mount to avoid hydration errors)
  useEffect(() => {
    if (mounted && items.length === 0 && !isSuccess) {
      router.push("/cart");
    }
  }, [mounted, items, isSuccess, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let payment_proof_url = null;

      // Handle Storage Upload for RIB
      if (paymentMethod === 'rib') {
        if (!paymentProof) {
          alert("Veuillez télécharger votre reçu de virement bancaire.");
          setIsSubmitting(false);
          return;
        }

        const fileExt = paymentProof.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('receipts')
          .upload(fileName, paymentProof);

        if (uploadError) {
          console.error("Storage upload error:", uploadError);
          alert("Erreur lors du téléchargement du reçu.");
          setIsSubmitting(false);
          return;
        }

        const { data: { publicUrl } } = supabase.storage.from('receipts').getPublicUrl(fileName);
        payment_proof_url = publicUrl;
      }

      // Insert Order
      const { error } = await supabase
        .from('orders')
        .insert([
          {
            full_name: formData.fullName,
            email: formData.email,
            phone: formData.phone,
            shipping_address: formData.address,
            total_amount: totalAmount,
            order_items: items, // JSONB column
            status: 'pending',
            payment_method: paymentMethod,
            payment_proof_url: payment_proof_url
          }
        ]);

      if (error) {
        console.error("Supabase insert error:", error);
        throw error;
      }

      // Success
      clearCart();
      setIsSuccess(true);
    } catch (err: any) {
      console.error("Failed to submit order:", err);
      alert("Une erreur est survenue lors de la commande. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-500">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 pt-32 pb-20 max-w-5xl relative">
        <AnimatePresence mode="wait">
          {isSuccess ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass p-12 rounded-[3rem] border border-white/5 flex flex-col items-center text-center shadow-2xl relative overflow-hidden bg-[#111116] max-w-2xl mx-auto mt-10"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent pointer-events-none" />
              <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mb-8 relative">
                <div className="absolute inset-0 rounded-full bg-green-500/20 animate-ping" />
                <CheckCircle2 className="w-12 h-12 text-green-400" />
              </div>
              <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-white mb-4">
                🎉 Commande<br />Confirmée !
              </h1>
              <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-10 max-w-md leading-relaxed">
                Merci pour votre achat. Vous recevrez bientôt un e-mail de confirmation avec les détails de votre commande.
              </p>
              <Link
                href="/categories"
                className="py-5 px-10 bg-white text-black hover:bg-gray-200 rounded-2xl font-black text-xs uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl"
              >
                Retour au catalogue
              </Link>
            </motion.div>
          ) : (
            <motion.div
              key="checkout-form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="grid grid-cols-1 lg:grid-cols-5 gap-10"
            >
              <div className="lg:col-span-3">
                <button onClick={() => router.back()} className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-white mb-8 transition-colors">
                  <ArrowLeft className="w-4 h-4" /> Retour au panier
                </button>

                <div className="mb-10">
                  <h1 className="text-3xl font-black uppercase tracking-tighter text-white mb-2">Finaliser la commande</h1>
                  <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Informations de livraison et paiement</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Informations de livraison */}
                  <div className="glass p-8 rounded-[2.5rem] border border-white/5 bg-[#111116] shadow-xl space-y-6">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-white/10 pb-4">Adresse de livraison</h3>
                    
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Nom Complet / Full Name</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                        <input
                          type="text"
                          name="fullName"
                          required
                          value={formData.fullName}
                          onChange={handleInputChange}
                          className="w-full bg-black/50 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white font-medium outline-none focus:border-primary/50 transition-colors"
                          placeholder="Jean Dupont"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Email</label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                          <input
                            type="email"
                            name="email"
                            required
                            value={formData.email}
                            onChange={handleInputChange}
                            className="w-full bg-black/50 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white font-medium outline-none focus:border-primary/50 transition-colors"
                            placeholder="jean@example.com"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Téléphone / Phone</label>
                        <div className="relative">
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                          <input
                            type="tel"
                            name="phone"
                            required
                            value={formData.phone}
                            onChange={handleInputChange}
                            className="w-full bg-black/50 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white font-medium outline-none focus:border-primary/50 transition-colors"
                            placeholder="+212 6 00 00 00 00"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Adresse de livraison / Shipping Address</label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-6 w-5 h-5 text-slate-500" />
                        <textarea
                          name="address"
                          required
                          rows={3}
                          value={formData.address}
                          onChange={handleInputChange}
                          className="w-full bg-black/50 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white font-medium outline-none resize-none focus:border-primary/50 transition-colors"
                          placeholder="123 Rue de la Liberté, Casablanca"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Méthode de paiement */}
                  <div className="glass p-8 rounded-[2.5rem] border border-white/5 bg-[#111116] shadow-xl space-y-6">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-white/10 pb-4">Méthode de paiement</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Livraison */}
                      <label className={`cursor-pointer border rounded-2xl p-4 transition-all relative overflow-hidden group ${paymentMethod === 'livraison' ? 'bg-primary/10 border-primary' : 'bg-black/40 border-white/10 hover:border-white/20'}`}>
                        <input type="radio" name="paymentMethod" value="livraison" checked={paymentMethod === 'livraison'} onChange={() => setPaymentMethod('livraison')} className="hidden" />
                        <Truck className={`w-5 h-5 mb-3 transition-colors ${paymentMethod === 'livraison' ? 'text-primary' : 'text-slate-500 group-hover:text-white'}`} />
                        <span className="block text-sm font-bold text-white mb-1">Livraison</span>
                        <span className="block text-[10px] text-slate-400">Paiement à la livraison</span>
                      </label>

                      {/* Carte */}
                      <label className={`cursor-pointer border rounded-2xl p-4 transition-all relative overflow-hidden group ${paymentMethod === 'carte' ? 'bg-primary/10 border-primary' : 'bg-black/40 border-white/10 hover:border-white/20'}`}>
                        <input type="radio" name="paymentMethod" value="carte" checked={paymentMethod === 'carte'} onChange={() => setPaymentMethod('carte')} className="hidden" />
                        <CardIcon className={`w-5 h-5 mb-3 transition-colors ${paymentMethod === 'carte' ? 'text-primary' : 'text-slate-500 group-hover:text-white'}`} />
                        <span className="block text-sm font-bold text-white mb-1">Carte Bancaire</span>
                        <span className="block text-[10px] text-slate-400">Paiement sécurisé</span>
                      </label>

                      {/* RIB */}
                      <label className={`cursor-pointer border rounded-2xl p-4 transition-all relative overflow-hidden group ${paymentMethod === 'rib' ? 'bg-primary/10 border-primary' : 'bg-black/40 border-white/10 hover:border-white/20'}`}>
                        <input type="radio" name="paymentMethod" value="rib" checked={paymentMethod === 'rib'} onChange={() => setPaymentMethod('rib')} className="hidden" />
                        <Building className={`w-5 h-5 mb-3 transition-colors ${paymentMethod === 'rib' ? 'text-primary' : 'text-slate-500 group-hover:text-white'}`} />
                        <span className="block text-sm font-bold text-white mb-1">Virement (RIB)</span>
                        <span className="block text-[10px] text-slate-400">Télécharger le reçu</span>
                      </label>
                    </div>

                    <AnimatePresence>
                      {paymentMethod === 'carte' && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="text-center p-4 bg-white/5 rounded-xl border border-white/10 text-xs font-bold text-slate-400 overflow-hidden">
                          Redirection vers la passerelle de paiement après confirmation...
                        </motion.div>
                      )}
                      
                      {paymentMethod === 'rib' && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-4 overflow-hidden">
                          <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-xs text-slate-300 font-medium">
                            <p className="mb-3">Veuillez effectuer le virement sur le compte suivant :</p>
                            <div className="font-mono text-white bg-black/80 p-4 rounded-xl border border-white/5 text-center shadow-inner">
                              <span className="block text-[10px] text-primary font-black uppercase tracking-widest mb-1">Banque CIH</span>
                              <span className="text-lg tracking-wider">0000 1111 2222 3333</span>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Reçu de virement (Format Image ou PDF)</label>
                            <input 
                              type="file" 
                              accept="image/*,.pdf" 
                              required={paymentMethod === 'rib'}
                              onChange={(e) => setPaymentProof(e.target.files?.[0] || null)}
                              className="w-full bg-black/50 border border-white/10 rounded-2xl py-3 px-4 text-white font-medium outline-none text-sm file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-primary file:text-white hover:file:bg-primary/80 transition-all cursor-pointer"
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || items.length === 0}
                    className="w-full py-5 rounded-2xl bg-white text-black font-black uppercase text-sm tracking-widest flex items-center justify-center gap-3 hover:bg-gray-200 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl disabled:opacity-50 disabled:pointer-events-none"
                  >
                    {isSubmitting ? (
                      <><Loader2 className="w-5 h-5 animate-spin" /> Traitement en cours...</>
                    ) : (
                      <><CheckCircle2 className="w-5 h-5" /> {paymentMethod === 'carte' ? 'Procéder au paiement' : 'Confirmer la commande'}</>
                    )}
                  </button>
                  <p className="text-center text-[10px] text-slate-500 font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                    <ShieldCheck className="w-4 h-4" /> Transactions sécurisées
                  </p>
                </form>
              </div>

              {/* Order Summary Sidebar */}
              <div className="lg:col-span-2">
                <div className="glass p-8 rounded-[2.5rem] border border-white/5 sticky top-32 bg-[#111116] shadow-2xl">
                  <div className="flex items-center gap-3 mb-8 pb-6 border-b border-white/10">
                    <CreditCard className="w-6 h-6 text-primary" />
                    <h2 className="text-xl font-black uppercase tracking-tighter text-white">Résumé</h2>
                  </div>

                  <div className="space-y-6 mb-8 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin">
                    {items.map(item => (
                      <div key={item.cartItemId} className="flex gap-4 items-center">
                        <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-white/5 border border-white/10 shrink-0">
                          <img src={item.mockupUrl} alt="" className="absolute inset-0 w-full h-full object-cover z-0 opacity-50" />
                          {item.finalMockup && (
                            <img src={item.finalMockup} alt="" className="absolute inset-0 w-full h-full object-contain z-10" />
                          )}
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white rounded-full flex items-center justify-center text-[10px] font-black z-20">
                            {item.quantity}
                          </div>
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-black uppercase tracking-tight text-white line-clamp-1">{item.name}</h4>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Taille: {item.size}</p>
                        </div>
                        <div className="text-sm font-black italic text-primary">
                          {item.price * item.quantity} MAD
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-4 text-sm font-medium text-slate-400 mb-6 border-t border-white/10 pt-6">
                    <div className="flex justify-between">
                      <span>Sous-total</span>
                      <span className="text-white">{subtotal} MAD</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Livraison</span>
                      <span className="text-green-400 font-bold">Gratuite</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-end border-t border-white/10 pt-6 mt-6">
                    <span className="text-sm font-black uppercase tracking-widest text-slate-500">Total à payer</span>
                    <span className="text-4xl font-black italic text-primary">{totalAmount} MAD</span>
                  </div>
                </div>
              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
}
