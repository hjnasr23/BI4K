"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/lib/store/cartStore";
import { createClient } from "@/lib/supabase/client";
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
  Truck,
  X,
  Lock,
  Wifi
} from "lucide-react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useApp } from "@/lib/store";

// ─── Credit Card Modal Component ─────────────────────────────────────────────
function CreditCardModal({
  isOpen,
  onClose,
  onSuccess,
  totalAmount,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  totalAmount: number;
}) {
  const [cardData, setCardData] = useState({
    holder: "",
    number: "",
    expiry: "",
    cvv: "",
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Format card number with spaces every 4 digits
  const formatCardNumber = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(.{4})/g, "$1 ").trim();
  };

  // Format expiry as MM/YY
  const formatExpiry = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 4);
    if (digits.length >= 3) {
      return digits.slice(0, 2) + "/" + digits.slice(2);
    }
    return digits;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCardData({ ...cardData, number: formatCardNumber(e.target.value) });
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCardData({ ...cardData, expiry: formatExpiry(e.target.value) });
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 3);
    setCardData({ ...cardData, cvv: digits });
  };

  const displayNumber = cardData.number || "•••• •••• •••• ••••";
  const displayHolder = cardData.holder || "NOM DU TITULAIRE";
  const displayExpiry = cardData.expiry || "MM/YY";

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setProcessingStage(1);

    // Phase 1: Verifying card (1.2s)
    await new Promise((r) => setTimeout(r, 1200));
    setProcessingStage(2);

    // Phase 2: Processing transaction (1.3s)
    await new Promise((r) => setTimeout(r, 1300));
    setProcessingStage(3);

    // Phase 3: Brief success flash (0.5s)
    await new Promise((r) => setTimeout(r, 500));

    setIsProcessing(false);
    setProcessingStage(0);
    onSuccess();
  };

  const isFormValid =
    cardData.holder.length >= 2 &&
    cardData.number.replace(/\s/g, "").length === 16 &&
    cardData.expiry.length === 5 &&
    cardData.cvv.length === 3;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          onClick={!isProcessing ? onClose : undefined}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg bg-white dark:bg-[#0c0c12] border border-neutral-200 dark:border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden"
          >
            {/* Processing Overlay */}
            <AnimatePresence>
              {isProcessing && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-50 bg-white/90 dark:bg-[#0c0c12]/95 backdrop-blur-sm flex flex-col items-center justify-center gap-6"
                >
                  {processingStage < 3 ? (
                    <>
                      <div className="relative">
                        <div className="w-16 h-16 rounded-full border-4 border-brand-blue/20 border-t-brand-blue animate-spin" />
                        <Lock className="w-6 h-6 text-brand-blue absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                      </div>
                      <div className="text-center">
                        <motion.p
                          key={processingStage}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-sm font-black uppercase tracking-widest text-zinc-900 dark:text-zinc-100"
                        >
                          {processingStage === 1
                            ? "Vérification de la carte..."
                            : "Traitement de la transaction..."}
                        </motion.p>
                        <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mt-2">
                          Connexion sécurisée SSL
                        </p>
                      </div>
                      {/* Animated progress bar */}
                      <div className="w-48 h-1 bg-neutral-200 dark:bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: "0%" }}
                          animate={{
                            width: processingStage === 1 ? "45%" : "90%",
                          }}
                          transition={{ duration: 1.2, ease: "easeInOut" }}
                          className="h-full bg-gradient-to-r from-brand-blue to-blue-400 rounded-full"
                        />
                      </div>
                    </>
                  ) : (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", damping: 15 }}
                      className="flex flex-col items-center gap-4"
                    >
                      <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="w-8 h-8 text-green-500" />
                      </div>
                      <p className="text-sm font-black uppercase tracking-widest text-green-500">
                        Paiement accepté !
                      </p>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Header */}
            <div className="flex items-center justify-between px-8 pt-8 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-blue/10 rounded-xl flex items-center justify-center">
                  <Lock className="w-5 h-5 text-brand-blue" />
                </div>
                <div>
                  <h2 className="text-lg font-black uppercase tracking-tight text-zinc-900 dark:text-zinc-100">
                    Paiement sécurisé
                  </h2>
                  <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                    Simulation • Démonstration
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                disabled={isProcessing}
                className="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-white/5 flex items-center justify-center text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors disabled:opacity-30"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Live Card Preview */}
            <div className="px-8 pb-4">
              <div
                className="relative w-full aspect-[1.6/1] rounded-2xl overflow-hidden cursor-pointer select-none"
                style={{ perspective: "1000px" }}
                onClick={() => setIsFlipped(!isFlipped)}
              >
                <motion.div
                  animate={{ rotateY: isFlipped ? 180 : 0 }}
                  transition={{ duration: 0.6, type: "spring", damping: 20 }}
                  style={{ transformStyle: "preserve-3d" }}
                  className="relative w-full h-full"
                >
                  {/* Front of Card */}
                  <div
                    className="absolute inset-0 rounded-2xl p-6 flex flex-col justify-between"
                    style={{
                      backfaceVisibility: "hidden",
                      background:
                        "linear-gradient(135deg, #1a1a2e 0%, #16213e 40%, #0f3460 100%)",
                    }}
                  >
                    {/* Card top row */}
                    <div className="flex items-center justify-between">
                      <Wifi className="w-8 h-8 text-white/40 rotate-90" />
                      <div className="flex items-center gap-1.5">
                        <div className="w-6 h-6 bg-yellow-400/90 rounded-full" />
                        <div className="w-6 h-6 bg-red-400/70 rounded-full -ml-3" />
                      </div>
                    </div>
                    {/* Card number */}
                    <div>
                      <p className="text-white/90 font-mono text-xl md:text-2xl tracking-[0.2em] mb-1">
                        {displayNumber}
                      </p>
                    </div>
                    {/* Card bottom row */}
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-[9px] text-white/40 font-bold uppercase tracking-widest mb-0.5">
                          Titulaire
                        </p>
                        <p className="text-white/80 text-xs font-bold uppercase tracking-wider truncate max-w-[200px]">
                          {displayHolder}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] text-white/40 font-bold uppercase tracking-widest mb-0.5">
                          Expire
                        </p>
                        <p className="text-white/80 text-xs font-mono font-bold">
                          {displayExpiry}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Back of Card */}
                  <div
                    className="absolute inset-0 rounded-2xl flex flex-col justify-center"
                    style={{
                      backfaceVisibility: "hidden",
                      transform: "rotateY(180deg)",
                      background:
                        "linear-gradient(135deg, #0f3460 0%, #16213e 50%, #1a1a2e 100%)",
                    }}
                  >
                    <div className="w-full h-10 bg-black/60 mt-6" />
                    <div className="px-6 mt-4 flex items-center justify-end gap-3">
                      <div className="flex-1 h-8 bg-white/10 rounded" />
                      <div className="bg-white/20 rounded px-3 py-1.5">
                        <p className="text-white font-mono text-sm font-bold tracking-wider">
                          {cardData.cvv || "•••"}
                        </p>
                      </div>
                    </div>
                    <p className="text-center text-[9px] text-white/30 font-bold uppercase tracking-widest mt-4">
                      Cliquez pour retourner la carte
                    </p>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handlePayment} className="px-8 pb-8 space-y-4">
              {/* Cardholder Name */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400 ml-1">
                  Nom du titulaire
                </label>
                <input
                  type="text"
                  required
                  value={cardData.holder}
                  onChange={(e) =>
                    setCardData({
                      ...cardData,
                      holder: e.target.value.toUpperCase(),
                    })
                  }
                  onFocus={() => setIsFlipped(false)}
                  className="w-full bg-neutral-50 dark:bg-white/5 border border-neutral-200 dark:border-white/10 rounded-xl py-3.5 px-4 text-zinc-900 dark:text-zinc-100 font-medium text-sm outline-none focus:border-brand-blue/50 transition-colors uppercase tracking-wider"
                  placeholder="JEAN DUPONT"
                  disabled={isProcessing}
                />
              </div>

              {/* Card Number */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400 ml-1">
                  Numéro de carte
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={cardData.number}
                    onChange={handleCardNumberChange}
                    onFocus={() => setIsFlipped(false)}
                    className="w-full bg-neutral-50 dark:bg-white/5 border border-neutral-200 dark:border-white/10 rounded-xl py-3.5 pl-4 pr-12 text-zinc-900 dark:text-zinc-100 font-mono font-medium text-sm outline-none focus:border-brand-blue/50 transition-colors tracking-widest"
                    placeholder="0000 0000 0000 0000"
                    maxLength={19}
                    disabled={isProcessing}
                  />
                  <CardIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-300 dark:text-zinc-600" />
                </div>
              </div>

              {/* Expiry + CVV Row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400 ml-1">
                    Date d'expiration
                  </label>
                  <input
                    type="text"
                    required
                    value={cardData.expiry}
                    onChange={handleExpiryChange}
                    onFocus={() => setIsFlipped(false)}
                    className="w-full bg-neutral-50 dark:bg-white/5 border border-neutral-200 dark:border-white/10 rounded-xl py-3.5 px-4 text-zinc-900 dark:text-zinc-100 font-mono font-medium text-sm outline-none focus:border-brand-blue/50 transition-colors tracking-wider"
                    placeholder="MM/YY"
                    maxLength={5}
                    disabled={isProcessing}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400 ml-1">
                    CVV
                  </label>
                  <input
                    type="password"
                    required
                    value={cardData.cvv}
                    onChange={handleCvvChange}
                    onFocus={() => setIsFlipped(true)}
                    onBlur={() => setIsFlipped(false)}
                    className="w-full bg-neutral-50 dark:bg-white/5 border border-neutral-200 dark:border-white/10 rounded-xl py-3.5 px-4 text-zinc-900 dark:text-zinc-100 font-mono font-medium text-sm outline-none focus:border-brand-blue/50 transition-colors tracking-widest"
                    placeholder="•••"
                    maxLength={3}
                    disabled={isProcessing}
                  />
                </div>
              </div>

              {/* Amount Display */}
              <div className="flex items-center justify-between py-3 px-4 bg-neutral-100 dark:bg-white/5 rounded-xl border border-neutral-200 dark:border-white/10">
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                  Montant à débiter
                </span>
                <span className="text-lg font-black italic text-zinc-900 dark:text-brand-yellow">
                  {Number(totalAmount).toFixed(2)} MAD
                </span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!isFormValid || isProcessing}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-brand-blue to-blue-500 text-white font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2 hover:opacity-90 transition-all hover:scale-[1.01] active:scale-[0.99] shadow-xl shadow-brand-blue/20 disabled:opacity-40 disabled:pointer-events-none"
              >
                <Lock className="w-4 h-4" /> Valider le paiement
              </button>

              <p className="text-center text-[9px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-widest flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" /> Environnement de
                simulation sécurisé
              </p>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Main Checkout Page ──────────────────────────────────────────────────────
export default function CheckoutPage() {
  const router = useRouter();
  const { items, clearCart } = useCartStore();
  const { user, profile } = useApp();
  const [mounted, setMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showCardModal, setShowCardModal] = useState(false);

  const supabase = createClient();

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

  // Fetch user data on mount
  useEffect(() => {
    async function fetchUserData() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
         
      if (error) console.error("Profile fetch error in checkout:", error);

      setFormData(prev => ({
        ...prev,
        fullName: profile?.full_name || '',
        email: session.user.email || '',
        phone: profile?.phone || '',
        address: profile?.address || ''
      }));
    }
    fetchUserData();
  }, []);

  // Handle Input Changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Calculate totals
  const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const totalAmount = subtotal; // Assuming no tax/shipping added for now

  // Redirect if cart is empty (only after mount to avoid hydration errors)
  useEffect(() => {
    if (mounted && items.length === 0 && !isSuccess) {
      router.push("/cart");
    }
  }, [mounted, items, isSuccess, router]);

  // Core order creation logic (shared by all payment methods)
  const createOrder = useCallback(async (paymentMethodOverride?: string) => {
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

      // Check user session
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id || null;

      const orderPayload: any = {
        full_name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        shipping_address: formData.address,
        total_amount: totalAmount,
        order_items: items,
        status: paymentMethodOverride === 'carte' ? 'Payé par Carte' : 'pending',
        payment_method: paymentMethodOverride || paymentMethod,
        payment_proof_url: payment_proof_url
      };

      if (userId) {
        orderPayload.user_id = userId;
      }

      // Insert Order
      const { error } = await supabase
        .from('orders')
        .insert([orderPayload]);

      if (error) {
        console.error("Supabase insert error:", error);
        throw error;
      }

      // Decrement product inventory stocks
      if (Array.isArray(items)) {
        for (const item of items) {
          const productId = item.product_id || item.id;
          if (productId) {
            const { data: product } = await supabase
              .from('products')
              .select('stock')
              .eq('id', productId)
              .maybeSingle();
              
            if (product && product.stock > 0) {
              const qty = item.quantity || 1;
              const newStock = Math.max(0, product.stock - qty); 
              
              await supabase
                .from('products')
                .update({ stock: newStock })
                .eq('id', productId);
            }
          }
        }
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
  }, [formData, paymentMethod, paymentProof, totalAmount, items, supabase, clearCart]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // If carte is selected, open the card modal instead of submitting directly
    if (paymentMethod === 'carte') {
      setShowCardModal(true);
      return;
    }

    await createOrder();
  };

  // Called when the card modal simulation completes successfully
  const handleCardPaymentSuccess = async () => {
    setShowCardModal(false);
    await createOrder('carte');
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-background text-neutral-900 dark:text-foreground transition-colors duration-500">
      <Navbar />

      {/* Credit Card Payment Modal */}
      <CreditCardModal
        isOpen={showCardModal}
        onClose={() => setShowCardModal(false)}
        onSuccess={handleCardPaymentSuccess}
        totalAmount={totalAmount}
      />

      <main className="flex-1 container mx-auto px-4 pt-32 pb-20 max-w-5xl relative">
        <AnimatePresence mode="wait">
          {isSuccess ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-[#111116] border border-neutral-200 dark:border-white/5 p-12 rounded-[3rem] flex flex-col items-center text-center shadow-sm dark:shadow-2xl relative overflow-hidden max-w-2xl mx-auto mt-10"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-brand-blue/10 to-transparent pointer-events-none" />
              <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mb-8 relative">
                <div className="absolute inset-0 rounded-full bg-green-500/20 animate-ping" />
                <CheckCircle2 className="w-12 h-12 text-green-400" />
              </div>
              <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-zinc-900 dark:text-zinc-100 mb-4">
                🎉 Commande<br />Confirmée !
              </h1>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm font-bold uppercase tracking-widest mb-10 max-w-md leading-relaxed">
                Merci pour votre achat. Vous recevrez bientôt un e-mail de confirmation avec les détails de votre commande.
              </p>
              <Link
                href="/categories"
                className="py-5 px-10 bg-brand-blue text-white hover:bg-brand-blue/80 rounded-2xl font-black text-xs uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-brand-blue/20"
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
                <button onClick={() => router.back()} className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 mb-8 transition-colors">
                  <ArrowLeft className="w-4 h-4" /> Retour au panier
                </button>

                <div className="mb-10">
                  <h1 className="text-3xl font-black uppercase tracking-tighter text-zinc-900 dark:text-zinc-100 mb-2">Finaliser la commande</h1>
                  <p className="text-sm font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">Informations de livraison et paiement</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Informations de livraison */}
                  <div className="bg-white dark:bg-[#111116] border border-neutral-200 dark:border-white/5 p-8 rounded-[2.5rem] shadow-sm dark:shadow-xl space-y-6">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500 border-b border-neutral-200 dark:border-white/10 pb-4">Adresse de livraison</h3>
                    
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400 ml-2">Nom Complet / Full Name</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 dark:text-zinc-500" />
                        <input
                          type="text"
                          name="fullName"
                          required
                          value={formData.fullName}
                          onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                          className="w-full bg-neutral-50 dark:bg-black/50 border border-neutral-200 dark:border-white/10 rounded-2xl py-4 pl-12 pr-4 text-zinc-900 dark:text-zinc-100 font-medium outline-none focus:border-brand-blue/50 transition-colors"
                          placeholder="Jean Dupont"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400 ml-2">Email</label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 dark:text-zinc-500" />
                          <input
                            type="email"
                            name="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            className="w-full bg-neutral-50 dark:bg-black/50 border border-neutral-200 dark:border-white/10 rounded-2xl py-4 pl-12 pr-4 text-zinc-900 dark:text-zinc-100 font-medium outline-none focus:border-brand-blue/50 transition-colors"
                            placeholder="jean@example.com"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400 ml-2">Téléphone / Phone</label>
                        <div className="relative">
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 dark:text-zinc-500" />
                          <input
                            type="tel"
                            name="phone"
                            required
                            value={formData.phone}
                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                            className="w-full bg-neutral-50 dark:bg-black/50 border border-neutral-200 dark:border-white/10 rounded-2xl py-4 pl-12 pr-4 text-zinc-900 dark:text-zinc-100 font-medium outline-none focus:border-brand-blue/50 transition-colors"
                            placeholder="+212 6 00 00 00 00"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400 ml-2">Adresse de livraison / Shipping Address</label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-6 w-5 h-5 text-zinc-400 dark:text-zinc-500" />
                        <textarea
                          name="address"
                          required
                          rows={3}
                          value={formData.address}
                          onChange={(e) => setFormData({...formData, address: e.target.value})}
                          className="w-full bg-neutral-50 dark:bg-black/50 border border-neutral-200 dark:border-white/10 rounded-2xl py-4 pl-12 pr-4 text-zinc-900 dark:text-zinc-100 font-medium outline-none resize-none focus:border-brand-blue/50 transition-colors"
                          placeholder="123 Rue de la Liberté, Casablanca"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Méthode de paiement */}
                  <div className="bg-white dark:bg-[#111116] border border-neutral-200 dark:border-white/5 p-8 rounded-[2.5rem] shadow-sm dark:shadow-xl space-y-6">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500 border-b border-neutral-200 dark:border-white/10 pb-4">Méthode de paiement</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Livraison */}
                      <label className={`cursor-pointer border rounded-2xl p-4 transition-all relative overflow-hidden group ${paymentMethod === 'livraison' ? 'bg-brand-blue/10 border-brand-blue' : 'bg-neutral-50 border-neutral-200 dark:bg-black/40 dark:border-white/10 hover:border-neutral-300 dark:hover:border-white/20'}`}>
                        <input type="radio" name="paymentMethod" value="livraison" checked={paymentMethod === 'livraison'} onChange={() => setPaymentMethod('livraison')} className="hidden" />
                        <Truck className={`w-5 h-5 mb-3 transition-colors ${paymentMethod === 'livraison' ? 'text-brand-blue' : 'text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-100'}`} />
                        <span className="block text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-1">Livraison</span>
                        <span className="block text-[10px] text-zinc-500 dark:text-zinc-400">Paiement à la livraison</span>
                      </label>

                      {/* Carte */}
                      <label className={`cursor-pointer border rounded-2xl p-4 transition-all relative overflow-hidden group ${paymentMethod === 'carte' ? 'bg-brand-blue/10 border-brand-blue' : 'bg-neutral-50 border-neutral-200 dark:bg-black/40 dark:border-white/10 hover:border-neutral-300 dark:hover:border-white/20'}`}>
                        <input type="radio" name="paymentMethod" value="carte" checked={paymentMethod === 'carte'} onChange={() => setPaymentMethod('carte')} className="hidden" />
                        <CardIcon className={`w-5 h-5 mb-3 transition-colors ${paymentMethod === 'carte' ? 'text-brand-blue' : 'text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-100'}`} />
                        <span className="block text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-1">Carte Bancaire</span>
                        <span className="block text-[10px] text-zinc-500 dark:text-zinc-400">Paiement sécurisé</span>
                      </label>

                      {/* RIB */}
                      <label className={`cursor-pointer border rounded-2xl p-4 transition-all relative overflow-hidden group ${paymentMethod === 'rib' ? 'bg-brand-blue/10 border-brand-blue' : 'bg-neutral-50 border-neutral-200 dark:bg-black/40 dark:border-white/10 hover:border-neutral-300 dark:hover:border-white/20'}`}>
                        <input type="radio" name="paymentMethod" value="rib" checked={paymentMethod === 'rib'} onChange={() => setPaymentMethod('rib')} className="hidden" />
                        <Building className={`w-5 h-5 mb-3 transition-colors ${paymentMethod === 'rib' ? 'text-brand-blue' : 'text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-100'}`} />
                        <span className="block text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-1">Virement (RIB)</span>
                        <span className="block text-[10px] text-zinc-500 dark:text-zinc-400">Télécharger le reçu</span>
                      </label>
                    </div>

                    <AnimatePresence>
                      {paymentMethod === 'carte' && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="text-center p-4 bg-brand-blue/5 dark:bg-brand-blue/10 rounded-xl border border-brand-blue/20 text-xs font-bold text-brand-blue overflow-hidden flex items-center justify-center gap-2">
                          <Lock className="w-3.5 h-3.5" /> Un formulaire de paiement sécurisé s'ouvrira à la confirmation
                        </motion.div>
                      )}
                      
                      {paymentMethod === 'rib' && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-4 overflow-hidden">
                          <div className="p-4 bg-neutral-100 dark:bg-white/5 rounded-xl border border-neutral-200 dark:border-white/10 text-xs text-zinc-700 dark:text-zinc-300 font-medium">
                            <p className="mb-3">Veuillez effectuer le virement sur le compte suivant :</p>
                            <div className="font-mono text-zinc-950 dark:text-zinc-100 bg-neutral-50 dark:bg-black/80 p-4 rounded-xl border border-neutral-200 dark:border-white/5 text-center shadow-inner">
                              <span className="block text-[10px] text-brand-yellow font-black uppercase tracking-widest mb-1">Banque CIH</span>
                              <span className="text-lg tracking-wider">D123456</span>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400 ml-2">Reçu de virement (Format Image ou PDF)</label>
                            <input 
                              type="file" 
                              accept="image/*,.pdf" 
                              required={paymentMethod === 'rib'}
                              onChange={(e) => setPaymentProof(e.target.files?.[0] || null)}
                              className="w-full bg-neutral-50 dark:bg-black/50 border border-neutral-200 dark:border-white/10 rounded-2xl py-3 px-4 text-zinc-900 dark:text-zinc-100 font-medium outline-none text-sm file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-brand-blue file:text-white hover:file:bg-brand-blue/80 transition-all cursor-pointer"
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || items.length === 0}
                    className="w-full py-5 rounded-2xl bg-brand-blue text-white font-black uppercase text-sm tracking-widest flex items-center justify-center gap-3 hover:bg-brand-blue/90 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-brand-blue/20 disabled:opacity-50 disabled:pointer-events-none"
                  >
                    {isSubmitting ? (
                      <><Loader2 className="w-5 h-5 animate-spin" /> Traitement en cours...</>
                    ) : (
                      <><CheckCircle2 className="w-5 h-5" /> {paymentMethod === 'carte' ? 'Procéder au paiement' : 'Confirmer la commande'}</>
                    )}
                  </button>
                  <p className="text-center text-[10px] text-zinc-500 dark:text-zinc-500 font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                    <ShieldCheck className="w-4 h-4" /> Transactions sécurisées
                  </p>
                </form>
              </div>

              {/* Order Summary Sidebar */}
              <div className="lg:col-span-2">
                <div className="bg-white dark:bg-[#111116] border border-neutral-200 dark:border-white/5 p-8 rounded-[2.5rem] sticky top-32 shadow-sm dark:shadow-2xl">
                  <div className="flex items-center gap-3 mb-8 pb-6 border-b border-neutral-200 dark:border-white/10">
                    <CreditCard className="w-6 h-6 text-brand-blue" />
                    <h2 className="text-xl font-black uppercase tracking-tighter text-zinc-900 dark:text-zinc-100">Résumé</h2>
                  </div>

                  <div className="space-y-6 mb-8 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin">
                    {items.map(item => (
                      <div key={item.cartItemId} className="flex gap-4 items-center">
                        <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10 shrink-0 flex items-center justify-center">
                          {item.mockup_url && !item.mockup_url.includes('images.24hourwristbands.com') && !item.mockup_url.includes('vecteezy') ? (
                            <img src={item.mockup_url} alt="" className="absolute inset-0 w-full h-full object-contain z-10" />
                          ) : (
                            <>
                              <img src={item.image_url || item.mockupUrl || item.mockup_url || ''} alt="" className="absolute inset-0 w-full h-full object-cover z-0 opacity-50" />
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
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-brand-blue text-white rounded-full flex items-center justify-center text-[10px] font-black z-20">
                            {item.quantity}
                          </div>
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-black uppercase tracking-tight text-zinc-900 dark:text-zinc-100 line-clamp-1">{item.name}</h4>
                          <p className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">Taille: {item.size}</p>
                        </div>
                        <div className="text-sm font-black italic text-zinc-900 dark:text-brand-yellow">
                          {Number(item.price * item.quantity).toFixed(2)} MAD
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-4 text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-6 border-t border-neutral-200 dark:border-white/10 pt-6">
                    <div className="flex justify-between">
                      <span>Sous-total</span>
                      <span className="text-zinc-900 dark:text-zinc-100 font-bold">{Number(subtotal).toFixed(2)} MAD</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Livraison</span>
                      <span className="text-green-400 font-bold">Gratuite</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-end border-t border-neutral-200 dark:border-white/10 pt-6 mt-6">
                    <span className="text-sm font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500">Total à payer</span>
                    <span className="text-4xl font-black italic text-zinc-900 dark:text-brand-yellow">{Number(totalAmount).toFixed(2)} MAD</span>
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
