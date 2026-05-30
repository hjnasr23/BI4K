'use client';

import { useEffect, useMemo, useState, Suspense, useRef } from "react";
import { UploadCloud, PackageCheck, Trash2, Sparkles, AlertCircle, ArrowRight } from "lucide-react";
import { useApp } from "@/lib/store";
import { translations } from "@/lib/translations";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useCartStore } from "@/lib/store/cartStore";
import Link from "next/link";

function UploadContent() {
  const { lang, profile } = useApp();
  const t = translations[lang];
  const router = useRouter();
  const searchParams = useSearchParams();

  // Search parameters
  const queryProductId = searchParams.get('productId');
  const queryMockupUrl = searchParams.get('mockupUrl');
  const querySize = searchParams.get('size') || 'M';

  // DB States
  const [productData, setProductData] = useState<any>(null);
  const [dbLoading, setDbLoading] = useState(true);

  // Customization States
  const [quantity, setQuantity] = useState(1);
  const [designFile, setDesignFile] = useState<File | null>(null);
  const [designUrl, setDesignUrl] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);

  // Dragging States for Canvas Image
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const dragOffsetStart = useRef({ x: 0, y: 0 });

  // Cart Actions
  const addToCart = useCartStore((state) => state.addToCart);
  const [showToast, setShowToast] = useState(false);

  // Fetch product from Supabase using productId
  useEffect(() => {
    async function fetchProduct() {
      if (!queryProductId) return;
      setDbLoading(true);
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', queryProductId)
          .maybeSingle();
        
        if (data) {
          setProductData(data);
        }
      } catch (err) {
        console.error("Error fetching product:", err);
      } finally {
        setProductData((prev: any) => prev || { name: 'Premium Tee', price: 25 });
        setDbLoading(false);
      }
    }
    fetchProduct();
  }, [queryProductId]);

  useEffect(() => {
    if (!designFile) {
      setDesignUrl(null);
      return;
    }

    const url = URL.createObjectURL(designFile);
    setDesignUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [designFile]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setDesignFile(file);
    setScale(1);
    setOffsetX(0);
    setOffsetY(0);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!designUrl) return;
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
    dragOffsetStart.current = { x: offsetX, y: offsetY };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      setOffsetX(dragOffsetStart.current.x + dx);
      setOffsetY(dragOffsetStart.current.y + dy);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const [isFinishing, setIsFinishing] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);

  // Pricing calculations
  const now = new Date();
  const isSaleActive = productData &&
    productData.sale_price !== null &&
    productData.sale_ends_at !== null &&
    new Date(productData.sale_ends_at) > now;

  const hasValidDiscount = profile?.discount_rate > 0 && profile?.discount_expires_at && new Date(profile.discount_expires_at) > now;
  const originalPrice = isSaleActive ? productData.sale_price : (productData?.price || 0);
  const currentPrice = hasValidDiscount ? originalPrice * (1 - profile.discount_rate / 100) : originalPrice;

  const handleAddToCart = () => {
    if (!designFile) {
      alert("Veuillez d'abord importer un design / Please upload a design first.");
      return;
    }
    
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const mockupSrc = queryMockupUrl ? decodeURIComponent(queryMockupUrl) : '';
      
      addToCart({
        id: queryProductId || "unknown",
        name: productData?.name || "Premium Custom Design",
        price: currentPrice,
        size: querySize,
        quantity: quantity,
        image_url: productData?.image_url || mockupSrc,
        design_url: base64String,
        coordinates: {
          x: Math.round(offsetX),
          y: Math.round(offsetY),
          width: Math.round(220 * scale),
          height: Math.round(300 * scale),
          canvasWidth: 550,
          canvasHeight: 688
        },
        // Legacy fields
        mockupUrl: mockupSrc,
        finalMockup: base64String
      });

      setShowToast(true);
    };
    reader.readAsDataURL(designFile);
  };

  const handleCheckout = async (skipAuth: boolean = false) => {
    if (!designFile) {
      alert("Please upload a design first.");
      return;
    }

    setIsFinishing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session && !skipAuth) {
        setIsFinishing(false);
        setShowSaveModal(true);
        return;
      }

      if (!session && skipAuth) {
        const orderData = {
          product: {
            id: queryProductId,
            name: productData?.name || "Premium Product",
            price: currentPrice,
          },
          design: {
            name: designFile.name,
            dataUrl: designUrl,
          },
          customization: {
            size: querySize,
            quantity: quantity,
            scale: scale,
            offsetX: offsetX,
            offsetY: offsetY,
          },
          timestamp: new Date().toISOString(),
        };

        const savedOrders = JSON.parse(localStorage.getItem("localOrders") || "[]");
        savedOrders.push(orderData);
        localStorage.setItem("localOrders", JSON.stringify(savedOrders));

        alert("Your order has been saved locally. Log in to save it permanently!");
        setDesignFile(null);
        setIsFinishing(false);
        return;
      }

      const token = session!.access_token;
      const userId = session!.user.id;

      const formData = new FormData();
      formData.append("file", designFile);
      formData.append("user_id", userId);

      const uploadResponse = await fetch("http://127.0.0.1:8000/designs/upload", {
        method: "POST",
        body: formData,
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!uploadResponse.ok) throw new Error("Upload failed");
      const uploadData = await uploadResponse.json();
      const designId = uploadData.data.id;

      const commandePayload = {
        total_price: currentPrice * quantity,
        order_notes: `${productData?.name} - Size ${querySize}`,
        shipping_address: null,
      };

      const commandeResponse = await fetch("http://127.0.0.1:8000/orders/commande", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(commandePayload),
      });

      if (!commandeResponse.ok) throw new Error("Order creation failed");
      const commandeData = await commandeResponse.json();
      const commandeId = commandeData.data.id;

      const lignePayload = {
        commande_id: commandeId,
        product_id: queryProductId,
        design_id: designId,
        coordinates: { scale, offsetX, offsetY, size: querySize },
        preview_data_url: uploadData.data.url,
        quantity: quantity,
        price_unit: currentPrice,
      };

      const ligneResponse = await fetch("http://127.0.0.1:8000/orders/ligne-commande/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(lignePayload),
      });

      if (!ligneResponse.ok) throw new Error("Order line creation failed");

      alert("Success! Your custom order has been saved.");
      setShowSaveModal(false);
      router.push("/orders");
    } catch (error) {
      console.error(error);
      alert("An error occurred during checkout. Please try again.");
    } finally {
      setIsFinishing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-foreground transition-colors duration-500 flex flex-col">
      <Navbar />

      <main className="flex-grow pt-24 pb-12 flex flex-col lg:flex-row bg-[#0a0a0c] container mx-auto px-4 lg:px-8 gap-8">
        
        {/* Expanded Canvas Stage (Front and Center) */}
        <div className="flex-grow flex bg-[#111116] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl relative">
          <div className="flex-grow relative bg-[#0a0a0c] flex items-center justify-center p-8 overflow-hidden">
            
            {/* Dynamic Grid Background */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

            <div className="relative w-full max-w-[550px] aspect-[4/5] flex items-center justify-center animate-reveal">
              {/* Workspace Border Overlay */}
              <div className="absolute inset-0 border border-white/5 rounded-[3rem] pointer-events-none" />

              {/* Product Mockup Container */}
              <div className="relative w-full h-full flex items-center justify-center">
                
                {/* Main Texture/Mockup Image */}
                {queryMockupUrl ? (
                  <img
                    src={decodeURIComponent(queryMockupUrl)}
                    className="absolute inset-0 w-full h-full object-contain rounded-[3rem] z-10 pointer-events-none"
                    alt=""
                  />
                ) : (
                  <div className="absolute inset-0 rounded-[3rem] bg-[#111116] flex items-center justify-center">
                    <span className="text-foreground/20 font-black tracking-widest text-xs uppercase">No Mockup loaded</span>
                  </div>
                )}

                {/* Print Zone Guide Overlay */}
                <div className="absolute inset-[18%] border-2 border-dashed border-white/10 rounded-2xl z-30 pointer-events-none">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1 bg-[#111] border border-white/10 rounded-full text-[7px] font-black text-white uppercase tracking-[0.4em]">
                    Zone d'impression
                  </div>
                </div>

                {/* Interactive Dragging/Uploading Layer */}
                <div className="absolute inset-0 z-40 flex items-center justify-center">
                  {designUrl ? (
                    <div
                      onMouseDown={handleMouseDown}
                      className="cursor-move select-none active:scale-[1.01] transition-transform duration-100"
                      style={{ 
                        transform: `translate(${offsetX}px, ${offsetY}px) scale(${scale})`,
                        touchAction: 'none'
                      }}
                    >
                      <img src={designUrl} className="max-w-[220px] max-h-[300px] object-contain drop-shadow-2xl pointer-events-none" alt="Custom Design" />
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-white/10 rounded-[2.5rem] bg-black/60 hover:bg-black/80 hover:border-brand-blue/50 transition-all cursor-pointer group text-center pointer-events-auto max-w-[280px]">
                      <input type="file" accept=".png, image/png" className="hidden" onChange={handleFileChange} />
                      <div className="w-12 h-12 rounded-2xl bg-brand-blue/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <UploadCloud className="w-6 h-6 text-brand-blue" />
                      </div>
                      <p className="font-black uppercase text-[10px] tracking-widest mb-1 text-white">Importer le design</p>
                      <p className="text-[8px] text-foreground/40 font-bold uppercase tracking-[0.2em] mb-3">Format PNG uniquement</p>
                      <p className="text-[9px] font-bold text-amber-400/90 leading-relaxed uppercase tracking-wider max-w-[240px]">
                        Astuce : Pour un meilleur rendu, téléchargez une image avec un fond transparent (format PNG).
                      </p>
                    </label>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Simplified Right Sidebar - Summary & Checkout */}
        <aside className="w-full lg:w-[350px] space-y-6 shrink-0">
          <div className="bg-[#111116] border border-white/5 rounded-[2.5rem] p-8 shadow-2xl animate-reveal">
            <h3 className="text-xs font-black uppercase tracking-[0.4em] text-brand-yellow mb-8 flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-brand-yellow animate-pulse" />
              Order Summary
            </h3>

            {dbLoading ? (
              <div className="py-8 flex justify-center">
                <Loader2 className="w-5 h-5 animate-spin text-brand-blue" />
              </div>
            ) : (
              <div className="space-y-6 mb-8">
                <div className="flex justify-between items-center">
                  <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">Base Product</p>
                  <p className="text-[10px] font-black uppercase tracking-tighter text-white">{productData?.name}</p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">Selected Size</p>
                  <p className="text-[10px] font-black uppercase tracking-tighter text-white">{querySize}</p>
                </div>
                 <div className="flex justify-between items-center">
                  <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">Unit Price</p>
                  {hasValidDiscount ? (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-neutral-500 line-through">{(originalPrice % 1 === 0 ? originalPrice : originalPrice.toFixed(2))} MAD</span>
                      <span className="text-lg font-black text-red-500 italic">{(currentPrice % 1 === 0 ? currentPrice : currentPrice.toFixed(2))} MAD</span>
                    </div>
                  ) : (
                    <p className="text-lg font-black text-brand-yellow italic">{currentPrice} MAD</p>
                  )}
                </div>
              </div>
            )}

            {/* Design Actions & Scaling */}
            {designFile && (
              <div className="border-t border-white/5 pt-6 mb-8 space-y-5">
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/5 border border-white/5">
                  <span className="text-[9px] font-bold text-slate-300 truncate max-w-[160px] uppercase tracking-wider">{designFile.name}</span>
                  <button onClick={() => setDesignFile(null)} className="text-rose-400 hover:text-rose-300 transition-colors text-[9px] font-black uppercase tracking-widest">
                    Remove
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-foreground/40">Scale: {Math.round(scale * 100)}%</label>
                  </div>
                  <input
                    type="range"
                    min="0.10"
                    max="2.00"
                    step="0.01"
                    value={scale}
                    onChange={(e) => setScale(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-brand-blue focus:outline-none"
                  />
                  <button onClick={() => { setOffsetX(0); setOffsetY(0); setScale(1); }} className="w-full py-2 rounded-xl bg-white/5 hover:bg-white/10 text-[8px] font-black uppercase tracking-widest border border-white/5 text-slate-400 transition-colors">
                    Reset Alignment
                  </button>
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="space-y-3 mb-8 border-t border-white/5 pt-6">
              <label className="text-[9px] font-black uppercase tracking-[0.2em] text-foreground/40">Total Quantity</label>
              <div className="flex items-center gap-4 bg-white/5 border border-white/5 rounded-2xl p-1.5">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="w-9 h-9 rounded-xl hover:bg-white/10 flex items-center justify-center transition-colors font-bold text-sm">-</button>
                <span className="flex-grow text-center font-black text-xs">{quantity}</span>
                <button onClick={() => setQuantity(q => q + 1)} className="w-9 h-9 rounded-xl hover:bg-white/10 flex items-center justify-center transition-colors font-bold text-sm">+</button>
              </div>
            </div>

             {/* Total */}
            <div className="pt-6 border-t border-white/5 mb-8">
              <div className="flex justify-between items-end">
                <p className="text-[9px] font-black uppercase tracking-[0.4em] text-foreground/20">Final Amount</p>
                <div className="text-right">
                  {hasValidDiscount && (
                    <span className="block text-xs font-bold text-neutral-500 line-through mb-1">{(originalPrice * quantity) % 1 === 0 ? (originalPrice * quantity) : (originalPrice * quantity).toFixed(2)} MAD</span>
                  )}
                  <p className="text-3xl font-black tracking-tighter text-white">{((currentPrice * quantity) % 1 === 0 ? (currentPrice * quantity) : (currentPrice * quantity).toFixed(2))} MAD</p>
                </div>
              </div>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={() => handleAddToCart()}
              disabled={!designFile}
              className={`w-full py-5 rounded-2xl flex items-center justify-center gap-3 font-black text-xs uppercase tracking-[0.3em] transition-all relative overflow-hidden group/order ${!designFile ? 'bg-white/5 text-foreground/20 cursor-not-allowed' : 'bg-brand-blue text-white hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-brand-blue/20'}`}
            >
              <PackageCheck className="w-5 h-5" />
              Ajouter au panier
            </button>
          </div>

          <div className="bg-brand-blue/5 border border-brand-blue/20 rounded-3xl p-5 flex items-start gap-3">
            <Sparkles className="w-4 h-4 text-brand-yellow shrink-0 mt-0.5 animate-pulse" />
            <p className="text-[9px] font-bold text-brand-yellow leading-relaxed uppercase tracking-wider">
              Nos moteurs d'impression haute fidélité garantissent une précision des couleurs à 99,9%.
            </p>
          </div>
        </aside>
      </main>

      {/* Confirmation Modal / Toast */}
      {showToast && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#111116] border border-white/10 rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl text-center animate-reveal">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-6 animate-pulse">
              <Sparkles className="w-8 h-8 text-emerald-400" />
            </div>
            <h3 className="text-2xl font-black uppercase tracking-tighter text-white mb-2">Produit ajouté au panier !</h3>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-8">Votre création a été enregistrée avec succès.</p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => { setShowToast(false); router.push('/categories'); }}
                className="flex-grow py-4 bg-white/5 border border-white/10 hover:bg-white/10 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-300 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Continuer les achats
              </button>
              <Link 
                href="/cart"
                className="flex-grow py-4 bg-brand-blue hover:bg-brand-blue/90 rounded-2xl font-black text-[10px] uppercase tracking-widest text-white transition-all shadow-lg shadow-brand-blue/20 flex items-center justify-center gap-1.5 hover:scale-[1.02] active:scale-[0.98]"
              >
                Voir le panier <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

// Small helper for loading spinner inside main content
const Loader2 = ({ className }: { className?: string }) => (
  <svg className={`animate-spin ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

export default function UploadPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0a0a0c] flex flex-col justify-center items-center gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-brand-blue/20 border-t-brand-blue animate-spin"></div>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-blue">Chargement de l'atelier...</p>
      </div>
    }>
      <UploadContent />
    </Suspense>
  );
}
