'use client';
import { useCartStore } from '@/hooks/useCartStore';
import Link from 'next/link';
import { Trash2 } from 'lucide-react';
import { FREE_SHIPPING_THRESHOLD, SHIPPING_COST } from '@/utils/constants';

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalPrice } = useCartStore();
  const subtotal = totalPrice();
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : SHIPPING_COST;
  const total = subtotal + shipping;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-8">Mon Panier</h1>
      
      {items.length === 0 ? (
        <div className="text-center py-16 bg-card-bg rounded-2xl">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-2xl font-bold mb-4">Votre panier est vide</h2>
          <Link href="/products" className="inline-block px-6 py-3 bg-primary text-white font-medium rounded-full hover:bg-primary/90 transition-colors">
            Découvrir nos produits
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-4 p-4 bg-card-bg border border-card-border rounded-xl">
                <img src={item.mockupUrl} alt={item.productName} className="w-20 h-20 object-cover rounded-md bg-white" />
                <div className="flex-1">
                  <h3 className="font-bold">{item.productName}</h3>
                  <p className="text-sm text-foreground/70">Taille: {item.size} • Matière: {item.material}</p>
                  <div className="flex items-center gap-2 mt-1 text-sm">
                    Couleur: <span className="w-4 h-4 rounded-full border border-gray-300" style={{ backgroundColor: item.color }} />
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center rounded bg-background border border-card-border hover:bg-primary/10 hover:text-primary transition-colors">-</button>
                  <span className="w-8 text-center">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center rounded bg-background border border-card-border hover:bg-primary/10 hover:text-primary transition-colors">+</button>
                </div>
                
                <div className="w-24 text-right font-bold">
                  {(item.price * item.quantity).toFixed(2)} €
                </div>
                
                <button onClick={() => removeItem(item.id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
          
          <div className="lg:col-span-1">
            <div className="bg-card-bg border border-card-border p-6 rounded-2xl sticky top-24">
              <h2 className="text-xl font-bold mb-6">Récapitulatif</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-foreground/70">Sous-total</span>
                  <span className="font-medium">{subtotal.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground/70">Livraison</span>
                  <span className="font-medium">{shipping === 0 ? 'Gratuite' : `${shipping.toFixed(2)} €`}</span>
                </div>
              </div>
              
              <div className="border-t border-card-border pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-lg">Total</span>
                  <span className="font-bold text-2xl text-primary">{total.toFixed(2)} €</span>
                </div>
              </div>
              
              <Link href="/checkout" className="block w-full py-3 bg-primary text-white text-center font-bold rounded-full hover:bg-primary/90 transition-colors">
                Passer commande
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
