'use client';
import { use, useState, useEffect } from 'react';
import { getProduct } from '@/services/productService';
import { useCartStore } from '@/hooks/useCartStore';
import { useDesignStore } from '@/hooks/useDesignStore';
import { notFound } from 'next/navigation';

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const product = getProduct(unwrappedParams.id);
  
  if (!product) {
    notFound();
  }

  const { addItem } = useCartStore();
  const { color, size, material, setColor, setSize, setMaterial } = useDesignStore();
  const [showToast, setShowToast] = useState(false);

  // Default values for dropdowns
  const sizes = ['S', 'M', 'L', 'XL', 'XXL'];
  const materials = ['Coton', 'Polyester', 'Mélange', 'Bio'];
  const colors = ['#ffffff', '#000000', '#facc15', '#3b82f6', '#ef4444'];

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      productName: product.name,
      price: product.basePrice,
      quantity: 1,
      size,
      material,
      color,
      designImageUrl: null,
      mockupUrl: product.mockupUrl
    });
    
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-green-500 text-white px-6 py-3 rounded-full shadow-lg font-bold flex items-center gap-2 animate-[slideUp_0.3s_ease-out]">
          <span>✅ Produit ajouté au panier !</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
        {/* Left: Product preview (Mockup for now, originally Fabric.js) */}
        <div className="bg-white border border-card-border rounded-3xl overflow-hidden shadow-sm relative flex items-center justify-center min-h-[500px]">
           {/* Color overlay to simulate product color */}
           <div className="absolute inset-0 mix-blend-multiply opacity-50 pointer-events-none" style={{ backgroundColor: color }} />
           <img src={product.mockupUrl} alt={product.name} className="w-full h-full object-contain" />
        </div>

        {/* Right: Personalization & Add to Cart */}
        <div>
          <span className="text-sm font-semibold text-primary/80 uppercase tracking-wider">{product.category}</span>
          <h1 className="text-4xl font-bold mt-2 mb-4">{product.name}</h1>
          <p className="text-foreground/70 mb-6">{product.description}</p>
          <div className="text-3xl font-bold mb-8">{product.basePrice.toFixed(2)} €</div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold mb-2">Couleur ({color})</label>
              <div className="flex gap-2">
                {colors.map(c => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={`w-10 h-10 rounded-full border-2 transition-transform ${color === c ? 'border-primary scale-110' : 'border-card-border hover:scale-105'}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold mb-2">Taille</label>
                <select 
                  className="w-full p-3 bg-background border border-card-border rounded-lg"
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                >
                  {sizes.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">Matière</label>
                <select 
                  className="w-full p-3 bg-background border border-card-border rounded-lg"
                  value={material}
                  onChange={(e) => setMaterial(e.target.value)}
                >
                  {materials.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </div>
            
            {/* Note: AI Generator and Upload Image components would go here in the full print-on-demand platform */}

            <div className="pt-6 border-t border-card-border mt-8">
              <button 
                onClick={handleAddToCart}
                className="w-full py-4 bg-primary text-white text-lg font-bold rounded-full hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 hover:shadow-primary/40"
              >
                Ajouter au panier
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
