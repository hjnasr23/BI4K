'use client';

import { useEffect, useMemo, useState, Suspense, useRef, useCallback } from "react";
import * as fabric from "fabric";
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
  const [isStandardizing, setIsStandardizing] = useState(false);

  // Synchronized canvas states for backwards compatibility and UI
  const [scale, setScale] = useState(1);
  const [offsetX, setOffsetX] = useState(250);
  const [offsetY, setOffsetY] = useState(250);

  // Fabric.js Canvas References
  const fabricRef = useRef<fabric.Canvas | null>(null);
  const [fabricCanvas, setFabricCanvas] = useState<fabric.Canvas | null>(null);
  const [mounted, setMounted] = useState(false);

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
    setMounted(true);
  }, []);

  // Load custom image onto Fabric canvas
  const applyImageToCanvas = useCallback((imageUrl: string, canvas: fabric.Canvas) => {
    canvas.clear();
    fabric.Image.fromURL(imageUrl, { crossOrigin: "anonymous" }).then((img) => {
      img.set({
        lockMovementX: false,
        lockMovementY: false,
        lockScalingX: false,
        lockScalingY: false,
        lockRotation: false,
        hasControls: true,
        hasBorders: true,
        selectable: true,
        evented: true,
        originX: 'center',
        originY: 'center',
      });
      img.scaleToWidth(220);
      canvas.centerObject(img);
      canvas.add(img);
      canvas.bringObjectToFront(img);
      canvas.setActiveObject(img);
      canvas.renderAll();

      const baseWidth = 220;
      const originalWidth = img.width || 220;
      const baseScale = baseWidth / originalWidth;

      setScale((img.scaleX || baseScale) / baseScale);
      setOffsetX(img.left || 250);
      setOffsetY(img.top || 250);
    }).catch((err: any) => {
      console.error("Fabric image loading error:", err);
    });
  }, []);

  // Initialize Fabric canvas
  useEffect(() => {
    if (!mounted) return;
    if (fabricRef.current) return;

    const canvasElement = document.getElementById('main-fabric-canvas') as HTMLCanvasElement;
    if (!canvasElement) {
      console.error('Canvas element #main-fabric-canvas not found in DOM');
      return;
    }

    const canvas = new fabric.Canvas(canvasElement, {
      width: 500,
      height: 500,
      backgroundColor: "transparent",
      preserveObjectStacking: true,
    });

    fabricRef.current = canvas;
    setFabricCanvas(canvas);

    canvas.clipPath = undefined;

    fabric.Object.prototype.set({
      transparentCorners: false,
      cornerColor: '#4A90E2',
      cornerStrokeColor: '#ffffff',
      cornerStyle: 'circle',
      cornerSize: 10,
      padding: 10,
      borderColor: '#4A90E2',
      borderDashArray: [4, 4]
    });

    canvas.on('object:moving', (e) => {
      const activeObject = e.target;
      if (activeObject) {
        setOffsetX(Math.round(activeObject.left || 250));
        setOffsetY(Math.round(activeObject.top || 250));
      }
    });

    canvas.on('object:scaling', (e) => {
      const activeObject = e.target;
      if (activeObject) {
        const baseWidth = 220;
        const originalWidth = activeObject.width || 220;
        const baseScale = baseWidth / originalWidth;
        setScale((activeObject.scaleX || baseScale) / baseScale);
      }
    });

  }, [mounted]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setDesignFile(file);
    setIsStandardizing(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/design/standardize', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to standardize design file on the server');
      }

      const data = await response.json();
      const publicSupabaseUrl = data.url;

      setDesignUrl(publicSupabaseUrl);

      if (fabricRef.current) {
        applyImageToCanvas(publicSupabaseUrl, fabricRef.current);
      }
    } catch (err: any) {
      console.error('Error during design standardization upload:', err);
      alert("Erreur lors de l'envoi du design. Veuillez réessayer.");
      setDesignFile(null);
      setDesignUrl(null);
    } finally {
      setIsStandardizing(false);
    }
  };

  const handleScaleSliderChange = (newScale: number) => {
    setScale(newScale);
    if (fabricRef.current) {
      const activeObject = fabricRef.current.getActiveObject();
      if (activeObject) {
        const baseWidth = 220;
        const originalWidth = activeObject.width || 220;
        const baseScale = baseWidth / originalWidth;
        
        activeObject.set({
          scaleX: baseScale * newScale,
          scaleY: baseScale * newScale
        }).setCoords();
        fabricRef.current.renderAll();
      }
    }
  };

  const handleResetAlignment = () => {
    setOffsetX(250);
    setOffsetY(250);
    setScale(1);
    if (fabricRef.current) {
      const activeObject = fabricRef.current.getActiveObject();
      if (activeObject) {
        const baseWidth = 220;
        const originalWidth = activeObject.width || 220;
        const baseScale = baseWidth / originalWidth;

        activeObject.set({
          left: 250,
          top: 250,
          scaleX: baseScale,
          scaleY: baseScale,
          angle: 0
        }).setCoords();
        fabricRef.current.centerObject(activeObject);
        fabricRef.current.renderAll();
      }
    }
  };

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

  const handleAddToCart = async () => {
    if (!fabricRef.current) {
      console.error('handleAddToCart: fabricRef.current is null');
      return;
    }
    if (!designFile) {
      alert("Veuillez d'abord importer un design / Please upload a design first.");
      return;
    }

    setIsFinishing(true);
    try {
      const canvas = fabricRef.current;
      const allObjects = canvas.getObjects();
      if (allObjects.length === 0) {
        alert("No design to add.");
        setIsFinishing(false);
        return;
      }

      // Calculate the bounding box of ALL objects
      let minX = canvas.getWidth(), minY = canvas.getHeight(), maxX = 0, maxY = 0;
      allObjects.forEach(obj => {
        const rect = obj.getBoundingRect();
        if (rect.left < minX) minX = rect.left;
        if (rect.top < minY) minY = rect.top;
        if (rect.left + rect.width > maxX) maxX = rect.left + rect.width;
        if (rect.top + rect.height > maxY) maxY = rect.top + rect.height;
      });

      // Clamp to canvas boundaries so we don't send negative coordinates to Sharp
      minX = Math.max(0, minX);
      minY = Math.max(0, minY);
      maxX = Math.min(canvas.getWidth(), maxX);
      maxY = Math.min(canvas.getHeight(), maxY);

      let finalCoordinates = {
        x: Math.round(minX),
        y: Math.round(minY),
        width: Math.round(maxX - minX),
        height: Math.round(maxY - minY),
        canvasWidth: canvas.getWidth(),
        canvasHeight: canvas.getHeight()
      };

      // Deselect to remove selection handles, then capture
      canvas.discardActiveObject();
      canvas.renderAll();

      // Export the isolated transparent design cropped to bounding box
      const transparentDesign = canvas.toDataURL({
        format: 'png',
        quality: 1,
        multiplier: 1,
        left: finalCoordinates.x,
        top: finalCoordinates.y,
        width: finalCoordinates.width,
        height: finalCoordinates.height
      });
      const isolatedDesignUrl = transparentDesign || "";

      // Call Backend Compositing API
      const mockupSrc = queryMockupUrl ? decodeURIComponent(queryMockupUrl) : (productData?.image_url || "");
      
      const compositeResponse = await fetch('/api/design/composite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          baseImageUrl: mockupSrc,
          designUrl: designUrl || isolatedDesignUrl,
          placement: finalCoordinates
        })
      });

      if (!compositeResponse.ok) {
        throw new Error('Failed to composite mockup via backend');
      }

      const compositeData = await compositeResponse.json();
      const savedMockupUrl = compositeData.url;

      // Add to cart
      addToCart({
        id: queryProductId || "unknown",
        name: productData?.name || "Premium Custom Design",
        price: currentPrice,
        size: querySize,
        quantity: quantity,
        image_url: productData?.image_url || mockupSrc,
        design_url: isolatedDesignUrl,
        coordinates: finalCoordinates,
        mockupUrl: productData?.image_url || mockupSrc,
        finalMockup: isolatedDesignUrl,
        mockup_url: savedMockupUrl || mockupSrc
      });

      setShowToast(true);
    } catch (err: any) {
      console.error("Error securing custom cart snapshot:", err);
      alert("Failed to create mockup. Please try again.");
    } finally {
      setIsFinishing(false);
    }
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

              {/* Product Mockup Container (Fixed 500x500 reference scale) */}
              <div className="relative w-[500px] h-[500px] flex items-center justify-center rounded-2xl overflow-hidden bg-black shadow-[0_40px_80px_rgba(0,0,0,0.6)]">
                
                {/* Main Texture/Mockup Image */}
                {queryMockupUrl ? (
                  <img
                    src={decodeURIComponent(queryMockupUrl)}
                    className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none"
                    alt=""
                  />
                ) : (
                  <div className="absolute inset-0 bg-[#111116] flex items-center justify-center">
                    <span className="text-foreground/20 font-black tracking-widest text-xs uppercase">No Mockup loaded</span>
                  </div>
                )}

                {/* Print Zone Guide Overlay */}
                <div className="absolute border border-dashed border-white/20 pointer-events-none rounded-xl z-20" style={{ left: 125, top: 100, width: 250, height: 280 }}>
                  <div className="absolute -top-1 -left-1 w-2 h-2 bg-white/50 rounded-full" />
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-white/50 rounded-full" />
                  <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-white/50 rounded-full" />
                  <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-white/50 rounded-full" />
                  <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[8px] font-black uppercase tracking-widest text-white/40 whitespace-nowrap">Zone d'impression</span>
                </div>

                {/* Fabric.js Canvas */}
                <canvas id="main-fabric-canvas" width={500} height={500} className="absolute inset-0 z-10" />

                {/* Standardizing Loader */}
                {isStandardizing && (
                  <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/75 backdrop-blur-sm pointer-events-auto rounded-2xl">
                    <Loader2 className="w-10 h-10 animate-spin text-brand-blue mb-4" />
                    <p className="font-black uppercase text-[10px] tracking-[0.25em] text-white">Optimisation du design...</p>
                    <p className="text-[8px] text-foreground/40 font-bold uppercase tracking-[0.2em] mt-1.5">Standardisation en 1024x1024 PNG</p>
                  </div>
                )}

                {/* Fallback Upload Button when no design is uploaded yet */}
                {!designUrl && !isStandardizing && (
                  <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-auto">
                    <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-white/10 rounded-[2.5rem] bg-black/60 hover:bg-black/80 hover:border-brand-blue/50 transition-all cursor-pointer group text-center max-w-[280px]">
                      <input type="file" accept=".png, image/png, image/jpeg, image/jpg" className="hidden" onChange={handleFileChange} />
                      <div className="w-12 h-12 rounded-2xl bg-brand-blue/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <UploadCloud className="w-6 h-6 text-brand-blue" />
                      </div>
                      <p className="font-black uppercase text-[10px] tracking-widest mb-1 text-white">Importer le design</p>
                      <p className="text-[8px] text-foreground/40 font-bold uppercase tracking-[0.2em] mb-3">Format PNG/JPG</p>
                      <p className="text-[9px] font-bold text-amber-400/90 leading-relaxed uppercase tracking-wider max-w-[240px]">
                        Astuce : Pour un meilleur rendu, téléchargez une image avec un fond transparent.
                      </p>
                    </label>
                  </div>
                )}
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
            {designFile && !isStandardizing && (
              <div className="border-t border-white/5 pt-6 mb-8 space-y-5">
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/5 border border-white/5">
                  <span className="text-[9px] font-bold text-slate-300 truncate max-w-[160px] uppercase tracking-wider">{designFile.name}</span>
                  <button onClick={() => { setDesignFile(null); setDesignUrl(null); if (fabricRef.current) fabricRef.current.clear(); }} className="text-rose-400 hover:text-rose-300 transition-colors text-[9px] font-black uppercase tracking-widest">
                    Remove
                  </button>
                </div>

                <div className="space-y-3">
                  <button onClick={handleResetAlignment} className="w-full py-2 rounded-xl bg-white/5 hover:bg-white/10 text-[8px] font-black uppercase tracking-widest border border-white/5 text-slate-400 transition-colors">
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
              onClick={handleAddToCart}
              disabled={!designFile || isFinishing || isStandardizing}
              className={`w-full py-5 rounded-2xl flex items-center justify-center gap-3 font-black text-xs uppercase tracking-[0.3em] transition-all relative overflow-hidden group/order ${!designFile || isFinishing || isStandardizing ? 'bg-white/5 text-foreground/20 cursor-not-allowed' : 'bg-brand-blue text-white hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-brand-blue/20'}`}
            >
              {isFinishing ? <Loader2 className="w-5 h-5 animate-spin" /> : <PackageCheck className="w-5 h-5" />}
              {isFinishing ? 'Traitement…' : 'Ajouter au panier'}
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
