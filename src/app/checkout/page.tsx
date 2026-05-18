'use client';
import { useState, useEffect } from 'react';
import { useCartStore } from '@/hooks/useCartStore';
import { Stepper } from '@/components/checkout/Stepper';
import Link from 'next/link';
import { Lock } from 'lucide-react';
import { ShippingAddress } from '@/types/product';
import { FREE_SHIPPING_THRESHOLD, SHIPPING_COST } from '@/utils/constants';

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCartStore();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [orderNumber, setOrderNumber] = useState('');
  
  const [shipping, setShipping] = useState<ShippingAddress>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    postalCode: '',
    city: '',
    country: 'France',
  });

  const subtotal = totalPrice();
  const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : SHIPPING_COST;
  const total = subtotal + shippingCost;

  useEffect(() => {
    if (step === 3) {
      setOrderNumber(`CMD-${Date.now()}`);
      clearCart();
    }
  }, [step, clearCart]);

  if (items.length === 0 && step !== 3) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Votre panier est vide</h1>
        <Link href="/products" className="text-primary hover:underline">
          Retour à la boutique
        </Link>
      </div>
    );
  }

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(3);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Stepper currentStep={step} />

      {step === 1 && (
        <form onSubmit={handleShippingSubmit} className="bg-card-bg border border-card-border p-6 md:p-8 rounded-2xl">
          <h2 className="text-2xl font-bold mb-6">Adresse de livraison</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-1">Prénom</label>
              <input required type="text" className="w-full p-3 bg-background border border-card-border rounded-lg" value={shipping.firstName} onChange={e => setShipping({...shipping, firstName: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Nom</label>
              <input required type="text" className="w-full p-3 bg-background border border-card-border rounded-lg" value={shipping.lastName} onChange={e => setShipping({...shipping, lastName: e.target.value})} />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input required type="email" className="w-full p-3 bg-background border border-card-border rounded-lg" value={shipping.email} onChange={e => setShipping({...shipping, email: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Téléphone</label>
              <input required type="tel" className="w-full p-3 bg-background border border-card-border rounded-lg" value={shipping.phone} onChange={e => setShipping({...shipping, phone: e.target.value})} />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-1">Adresse</label>
            <input required type="text" className="w-full p-3 bg-background border border-card-border rounded-lg" value={shipping.address} onChange={e => setShipping({...shipping, address: e.target.value})} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div>
              <label className="block text-sm font-medium mb-1">Code postal</label>
              <input required type="text" className="w-full p-3 bg-background border border-card-border rounded-lg" value={shipping.postalCode} onChange={e => setShipping({...shipping, postalCode: e.target.value})} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Ville</label>
              <input required type="text" className="w-full p-3 bg-background border border-card-border rounded-lg" value={shipping.city} onChange={e => setShipping({...shipping, city: e.target.value})} />
            </div>
          </div>

          <button type="submit" className="w-full py-3 bg-primary text-white font-bold rounded-full hover:bg-primary/90 transition-colors">
            Continuer vers le paiement
          </button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handlePaymentSubmit} className="bg-card-bg border border-card-border p-6 md:p-8 rounded-2xl max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Paiement</h2>
            <div className="flex items-center text-green-600 text-sm font-medium bg-green-50 px-3 py-1 rounded-full">
              <Lock className="w-4 h-4 mr-1" /> Sécurisé SSL
            </div>
          </div>

          <div className="space-y-4 mb-8">
            <div>
              <label className="block text-sm font-medium mb-1">Numéro de carte</label>
              <input required type="text" placeholder="0000 0000 0000 0000" maxLength={19} className="w-full p-3 bg-background border border-card-border rounded-lg font-mono" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Date d'expiration</label>
                <input required type="text" placeholder="MM/YY" maxLength={5} className="w-full p-3 bg-background border border-card-border rounded-lg font-mono" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">CVC</label>
                <input required type="text" placeholder="123" maxLength={3} className="w-full p-3 bg-background border border-card-border rounded-lg font-mono" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Nom du titulaire</label>
              <input required type="text" placeholder="Alex Dupont" className="w-full p-3 bg-background border border-card-border rounded-lg" />
            </div>
          </div>

          <div className="flex flex-col-reverse md:flex-row items-center gap-4">
            <button type="button" onClick={() => setStep(1)} className="w-full md:w-auto px-6 py-3 font-medium hover:text-primary transition-colors">
              ← Retour
            </button>
            <button type="submit" className="w-full py-3 bg-primary text-white font-bold rounded-full hover:bg-primary/90 transition-colors">
              Payer {total.toFixed(2)} €
            </button>
          </div>
        </form>
      )}

      {step === 3 && (
        <div className="text-center py-12 bg-card-bg border border-card-border rounded-2xl">
          <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-bold mb-4">Commande confirmée ! 🎉</h2>
          <p className="text-foreground/70 mb-2">Merci pour votre achat, {shipping.firstName}.</p>
          <p className="text-foreground/70 mb-8">Votre numéro de commande est le <span className="font-bold text-foreground">{orderNumber}</span></p>
          
          <Link href="/account/orders" className="inline-block px-8 py-3 bg-primary text-white font-bold rounded-full hover:bg-primary/90 transition-colors">
            Voir mes commandes
          </Link>
        </div>
      )}
    </div>
  );
}

// Need to import Check since it's used in step 3
import { Check } from 'lucide-react';
