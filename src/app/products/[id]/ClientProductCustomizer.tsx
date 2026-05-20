'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Product } from '@/lib/db/types';
import { useAuth } from '@/lib/hooks/useAuth';
import { useDesigns } from '@/lib/hooks/useDesigns';
import { insertUserDesign, getOrCreateCart, addCartItem } from '@/lib/db';
import { Loader2, Palette, Ruler, Wand2, ShoppingCart, CheckCircle2 } from 'lucide-react';

export default function ClientProductCustomizer({ product }: { product: Product }) {
  const { user } = useAuth();
  const router = useRouter();
  const { saveDesign } = useDesigns(user?.supabaseUser.id);
  
  const [selectedColor, setSelectedColor] = useState<string>(product.available_colors?.[0] || '');
  const [selectedSize, setSelectedSize]   = useState<string>(product.sizes?.[0] || '');
  const [prompt, setPrompt]               = useState('');
  
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [addingToCart, setAddingToCart] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setGenerating(true);
    setGenerateError(null);
    setGeneratedUrl(null); // Clear previous image
    
    try {
      const res = await fetch('/api/generate-design', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate image');
      }
      
      setGeneratedUrl(data.imageUrl);
    } catch (err: any) {
      setGenerateError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      alert("Please sign in to save your design and add it to your cart.");
      router.push(`/login?next=/products/${product.id}`);
      return;
    }
    if (!generatedUrl) return;

    setAddingToCart(true);

    try {
      // 1. Save the generated image as a Design in the DB
      const { data: designData, error: designErr } = await saveDesign({
        url: generatedUrl,
        prompt: prompt,
        is_ai: true,
      });

      if (designErr) throw new Error(designErr);

      // 2. Save the customization context into User_Designs table
      const { data: userDesignData, error: udError } = await insertUserDesign({
        user_id: user.supabaseUser.id,
        product_id: product.id,
        design_id: designData?.id || null,
        generated_ai_image_url: generatedUrl,
        selected_support: 'front', // default support
        customization_data: {
          color: selectedColor,
          size: selectedSize,
        }
      });

      if (udError) throw new Error(udError.message);

      // 3. Add to Cart
      // a) Get or Create Cart
      const { data: cart, error: cartErr } = await getOrCreateCart(user.supabaseUser.id);
      if (cartErr || !cart) throw new Error(cartErr?.message || "Could not access cart");

      // b) Insert CartItem
      const { error: itemErr } = await addCartItem({
        cart_id: cart.id,
        product_id: product.id,
        design_id: designData?.id || null,
        selected_color: selectedColor,
        selected_size: selectedSize,
        quantity: 1,
        price_unit: product.base_price,
      });

      if (itemErr) throw new Error(itemErr.message);

      setSuccessMsg("Design saved & added to cart!");
      setTimeout(() => {
        // Option to redirect to cart
        // router.push('/cart');
        setSuccessMsg(null);
      }, 3000);

    } catch (err: any) {
      console.error(err);
      alert("Failed to add to cart: " + err.message);
    } finally {
      setAddingToCart(false);
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-20 bg-background px-4">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* Left: Product Preview / AI Result */}
        <div className="relative aspect-square w-full rounded-[3rem] bg-[#111116] border border-white/5 shadow-2xl overflow-hidden flex items-center justify-center p-8 group">
          {generatedUrl ? (
            <img src={generatedUrl} alt="AI Generated Design" className="absolute inset-0 w-full h-full object-cover" />
          ) : product.base_image_url ? (
            <img src={product.base_image_url} alt={product.name} className="absolute inset-0 w-full h-full object-cover opacity-80" />
          ) : (
             <div className="text-white/20 uppercase font-black tracking-[0.5em] text-xl">Preview</div>
          )}

          {/* Color Overlay (Blend mode trick for previewing color if desired) */}
          {selectedColor && product.base_image_url && !generatedUrl && (
             <div 
               className="absolute inset-0 mix-blend-multiply opacity-50"
               style={{ backgroundColor: selectedColor }}
             />
          )}
        </div>

        {/* Right: Customization Controls */}
        <div className="flex flex-col space-y-10">
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tighter mb-2">{product.name}</h1>
            <p className="text-2xl font-black italic text-primary">${product.base_price}</p>
          </div>

          <div className="space-y-6">
            {/* Color Selection */}
            {product.available_colors && product.available_colors.length > 0 && (
              <div>
                <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-foreground/50 mb-3">
                  <Palette className="w-4 h-4" /> Color
                </label>
                <div className="flex flex-wrap gap-3">
                  {product.available_colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`w-12 h-12 rounded-2xl border-2 transition-all ${selectedColor === color ? 'border-primary scale-110 shadow-lg shadow-primary/20' : 'border-transparent hover:scale-105'}`}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Size Selection */}
            {product.sizes && product.sizes.length > 0 && (
              <div>
                <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-foreground/50 mb-3">
                  <Ruler className="w-4 h-4" /> Size
                </label>
                <div className="flex flex-wrap gap-3">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-5 py-3 rounded-2xl font-black uppercase text-sm border-2 transition-all ${selectedSize === size ? 'border-primary bg-primary/10 text-primary' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* AI Generator Box */}
            <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
               <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary mb-4">
                  <Wand2 className="w-4 h-4" /> AI Design Generator
               </label>
               <textarea
                 value={prompt}
                 onChange={(e) => setPrompt(e.target.value)}
                 placeholder="Describe your design (e.g. 'A futuristic cyberpunk cat wearing neon sunglasses')"
                 className="w-full bg-black/20 border border-white/10 rounded-2xl p-4 text-sm font-medium outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all min-h-[100px] resize-none mb-4"
               />
               {generateError && (
                 <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold">
                   {generateError}
                 </div>
               )}
               <button
                 onClick={handleGenerate}
                 disabled={generating || !prompt.trim()}
                 className="w-full py-4 rounded-xl bg-white text-black font-black uppercase text-xs tracking-widest hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
               >
                 {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                 {generating ? "Synthesizing..." : "Generate AI Design"}
               </button>
            </div>

            {/* Add to Cart Actions */}
            {generatedUrl && (
               <button
                 onClick={handleAddToCart}
                 disabled={addingToCart || !!successMsg}
                 className={`w-full py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-sm flex items-center justify-center gap-3 transition-all ${successMsg ? 'bg-emerald-500 text-white' : 'bg-primary hover:bg-primary-hover text-white shadow-xl shadow-primary/20'}`}
               >
                 {addingToCart ? (
                   <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>
                 ) : successMsg ? (
                   <><CheckCircle2 className="w-5 h-5" /> {successMsg}</>
                 ) : (
                   <><ShoppingCart className="w-5 h-5" /> Add to Cart — ${product.base_price}</>
                 )}
               </button>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}
