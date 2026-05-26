"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import * as fabric from "fabric";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useCartStore } from "@/lib/store/cartStore";
import { supabase } from "@/lib/supabase";
import WebFont from "webfontloader";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  Wand2,
  ShoppingCart,
  ArrowRight,
  Loader2,
  Terminal,
  Trash2,
} from "lucide-react";

interface StudioLog {
  id: string;
  time: string;
  message: string;
  type: 'system' | 'ai' | 'success' | 'error';
}

const GOOGLE_FONTS = ["Inter", "Oswald", "Pacifico", "Playfair Display", "Bangers", "Monoton"];

export default function TShirtEditor() {
  const fabricRef = useRef<fabric.Canvas | null>(null);   // Holds live Fabric instance
  const [fabricCanvas, setFabricCanvas] = useState<fabric.Canvas | null>(null); // For triggering UI re-renders
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [designId, setDesignId] = useState<string | null>(null);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [studioLogs, setStudioLogs] = useState<StudioLog[]>([]);

  // Transformation States
  const [opacity, setOpacity] = useState(1);
  const [objScale, setObjScale] = useState(1);
  const [rotation, setRotation] = useState(0);

  // Typography States
  const [fontFamily, setFontFamily] = useState("Inter");
  const [textColor, setTextColor] = useState("#ffffff");

  // History State
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Coordinate Placement State
  const [coordinates, setCoordinates] = useState({
    x: 150,
    y: 150,
    width: 200,
    height: 200,
    canvasWidth: 500,
    canvasHeight: 500
  });

  const router = useRouter();
  const searchParams = useSearchParams();
  const queryProductId = searchParams.get('productId') || "cmosndxll00000eps60qnuw76";
  const queryMockupUrl = searchParams.get('mockupUrl');
  const querySize = searchParams.get('size') || 'M';
  const mockupUrl = queryMockupUrl ? decodeURIComponent(queryMockupUrl) : "https://htnagmiuapyxaqoptzju.supabase.co/storage/v1/object/public/fashion/vecteezy_ai-generated-classic-crewneck-t-shirt-mockup-with-model-9_38095951.jpg";

  // DB States
  const [productData, setProductData] = useState<any>(null);
  const [dbLoading, setDbLoading] = useState(true);

  // Customization States
  const [quantity, setQuantity] = useState(1);
  const [lastGeneratedUrl, setLastGeneratedUrl] = useState<string | null>(null);

  // Cart Actions
  const addToCart = useCartStore((state) => state.addToCart);
  const [showToast, setShowToast] = useState(false);

  // Pending image URL — queued when AI finishes before canvas is ready
  const [pendingImageUrl, setPendingImageUrl] = useState<string | null>(null);

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
        console.error("Error fetching product from Supabase:", err);
      } finally {
        setProductData((prev: any) => prev || { name: 'Premium Custom Design (AI)', price: 249 });
        setDbLoading(false);
      }
    }
    fetchProduct();
  }, [queryProductId]);

  // Pricing calculations
  const now = new Date();
  const isSaleActive = productData &&
    productData.sale_price !== null &&
    productData.sale_ends_at !== null &&
    new Date(productData.sale_ends_at) > now;

  const currentPrice = isSaleActive ? productData.sale_price : (productData?.price || 249);

  const addLog = useCallback((message: string, type: StudioLog['type'] = 'system') => {
    const newLog: StudioLog = {
      id: Math.random().toString(36).substr(2, 9),
      time: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      message,
      type
    };
    setStudioLogs(prev => [newLog, ...prev].slice(0, 10));
  }, []);

  const saveHistory = useCallback(() => {
    if (!fabricCanvas) return;
    const json = JSON.stringify(fabricCanvas.toJSON());
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      return [...newHistory, json].slice(-50);
    });
    setHistoryIndex(prev => Math.min(prev + 1, 49));
  }, [fabricCanvas, historyIndex]);

  useEffect(() => {
    WebFont.load({
      google: { families: GOOGLE_FONTS }
    });
  }, []);

  const saveHistoryRef = useRef(saveHistory);
  useEffect(() => {
    saveHistoryRef.current = saveHistory;
  }, [saveHistory]);

  const addLogRef = useRef(addLog);
  useEffect(() => {
    addLogRef.current = addLog;
  }, [addLog]);

  // Load pending AI image once the canvas becomes available (queued path)
  useEffect(() => {
    if (!fabricCanvas || !pendingImageUrl) return;
    applyImageToCanvas(pendingImageUrl, fabricCanvas);
    setPendingImageUrl(null);
  // applyImageToCanvas is stable (useCallback with [] deps)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fabricCanvas, pendingImageUrl]);

  useEffect(() => {
    if (fabricRef.current) return; // Already initialized — survive Strict Mode double-mount

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
    console.log('[Fabric] Canvas initialized successfully. fabricRef.current =', fabricRef.current);

    // No canvas-level clipPath — it was clipping images to an invisible 200×200 box
    // and making dragged objects disappear. The dashed print-zone guide in the JSX
    // provides the visual boundary hint without enforcing it programmatically.
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

    setHistory([JSON.stringify(canvas.toJSON())]);
    setHistoryIndex(0);

    const updateCoords = () => {
      const activeObject = canvas.getActiveObject() || canvas.getObjects()[0];
      if (activeObject) {
        const rect = activeObject.getBoundingRect();
        setCoordinates({
          x: Math.round(rect.left),
          y: Math.round(rect.top),
          width: Math.round(rect.width),
          height: Math.round(rect.height),
          canvasWidth: canvas.getWidth(),
          canvasHeight: canvas.getHeight()
        });
      }
    };

    canvas.on('object:moving', (e) => {
      const obj = e.target!;
      const centerX = 250;
      const centerY = 250;
      if (Math.abs(obj.left! - centerX) < 5) obj.set({ left: centerX }).setCoords();
      if (Math.abs(obj.top! - centerY) < 5) obj.set({ top: centerY }).setCoords();
      updateCoords();
    });

    canvas.on('object:scaling', () => {
      updateCoords();
    });

    canvas.on('object:modified', () => {
      saveHistoryRef.current();
      addLogRef.current("Workspace updated", "system");
      updateCoords();
    });

    canvas.on('selection:created', updateCoords);
    canvas.on('selection:updated', updateCoords);
    canvas.on('selection:cleared', updateCoords);
    canvas.on('object:added', updateCoords);
    canvas.on('object:removed', updateCoords);

    // No cleanup — intentionally letting the Fabric instance survive
    // React 18 Strict Mode's unmount/remount cycle. Disposing here
    // would mangle the DOM (Fabric wraps <canvas> in a container div)
    // and leave fabricRef.current permanently null on the second mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Shared helper: paint an image URL onto the canvas ──────────────────────
  // • multiply blend makes white AI backgrounds transparent against fabric texture
  // • all lock flags are cleared so the user can freely move / scale / rotate
  const applyImageToCanvas = useCallback((imageUrl: string, canvas: fabric.Canvas) => {
    fabric.Image.fromURL(imageUrl, { crossOrigin: "anonymous" }).then((img) => {
      img.set({
        // Blend mode — white pixels become transparent against the shirt
        globalCompositeOperation: 'multiply',
        // Unlock every transform axis
        lockMovementX: false,
        lockMovementY: false,
        lockScalingX: false,
        lockScalingY: false,
        lockRotation: false,
        // Make sure all control handles are visible
        hasControls: true,
        hasBorders: true,
        selectable: true,
        evented: true,
      });
      // Scale to a comfortable starting size and center on canvas
      img.scaleToWidth(220);
      canvas.centerObject(img);
      canvas.add(img);
      canvas.bringObjectToFront(img);
      canvas.setActiveObject(img);
      canvas.renderAll();
      saveHistoryRef.current();
      addLogRef.current("AI design materialized ✓", "success");
    }).catch((err: any) => {
      console.error("Fabric Rendering Error:", err);
      addLogRef.current("Failed to paint AI image on canvas", "error");
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addText = () => {
    if (!fabricRef.current) { console.error('addText: fabricRef.current is null'); return; }
    const canvas = fabricRef.current;
    const itext = new fabric.IText("Type here...", {
      left: 250,
      top: 250,
      fontFamily: fontFamily,
      fill: textColor,
      fontSize: 30,
      originX: 'center',
      originY: 'center'
    });
    canvas.add(itext);
    canvas.setActiveObject(itext);
    saveHistory();
    addLog("Text element added", "system");
  };

  // ==========================================================
  // SECURE CLOUDFLARE AI GENERATION — Stable Diffusion XL
  // ==========================================================
  const generateWithCloudflareAI = async (): Promise<void> => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setGenerationProgress(0);
    addLog(`Vision Engine (Cloudflare AI): processing prompt...`, "ai");

    // Simulate progress while image generates
    const progressInterval = setInterval(() => {
      setGenerationProgress(prev => {
        if (prev >= 90) { clearInterval(progressInterval); return 90; }
        return prev + Math.random() * 8;
      });
    }, 300);

    try {
      // Append apparel-optimized keywords to user prompt
      const enhancedPrompt = `${prompt.trim()}, vector art, t-shirt design, isolated on pure white background, clean edges, no background noise, high contrast, print ready`;

      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: enhancedPrompt }),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || `Generation failed: ${response.statusText}`);
      }

      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);

      clearInterval(progressInterval);
      setGenerationProgress(100);
      addLog(`Image received — rendering on canvas...`, "ai");

      setLastGeneratedUrl(imageUrl);

      if (!fabricRef.current) {
        console.warn('generateWithCloudflareAI: fabricRef.current is null — queuing image for later render');
        addLog('Canvas initializing — design queued for rendering.', 'system');
        setPendingImageUrl(imageUrl);
        setIsGenerating(false);
        setTimeout(() => setGenerationProgress(0), 1500);
        return;
      }

      const canvas = fabricRef.current;
      applyImageToCanvas(imageUrl, canvas);

      setIsGenerating(false);
      // Reset progress after a brief moment
      setTimeout(() => setGenerationProgress(0), 1500);
    } catch (err: any) {
      clearInterval(progressInterval);
      console.error('Cloudflare Workers AI generation failed:', err);
      addLog(`Error: ${err.message}`, "error");
      setIsGenerating(false);
      setGenerationProgress(0);
    }
  };

  const [isFinalizing, setIsFinalizing] = useState(false);
  const handleAddToCart = () => {
    if (!fabricRef.current) {
      console.error('handleAddToCart: fabricRef.current is null');
      return;
    }

    setIsFinalizing(true);
    addLog("Capturing design layer & coordinates...", "system");
    try {
      const canvas = fabricRef.current;

      // Export the isolated transparent design (no background, just user artwork)
      const transparentDesign = canvas.toDataURL({ format: 'png', quality: 1, multiplier: 1 });
      const designUrl = transparentDesign || "";

      // Extract placement coordinates from active design element (or fallback to clip path printable zone)
      const activeObject = canvas.getActiveObject() || canvas.getObjects()[0];
      
      const clipPath = canvas.clipPath;
      const clipX = (clipPath as any)?.left ?? 150;
      const clipY = (clipPath as any)?.top ?? 150;
      const clipW = (clipPath as any)?.width ?? 200;
      const clipH = (clipPath as any)?.height ?? 200;
      const canvasW = canvas.getWidth();
      const canvasH = canvas.getHeight();

      let finalCoordinates = {
        x: clipX,
        y: clipY,
        width: clipW,
        height: clipH,
        canvasWidth: canvasW,
        canvasHeight: canvasH
      };

      if (activeObject) {
        const rect = activeObject.getBoundingRect();
        finalCoordinates = {
          x: Math.round(rect.left),
          y: Math.round(rect.top),
          width: Math.round(rect.width),
          height: Math.round(rect.height),
          canvasWidth: canvasW,
          canvasHeight: canvasH
        };
      }

      const now = new Date();
      const isSaleActive = productData &&
        productData.sale_price !== null &&
        productData.sale_ends_at !== null &&
        new Date(productData.sale_ends_at) > now;
      const currentPrice = isSaleActive ? productData.sale_price : (productData?.price || 249);

      addToCart({
        id: queryProductId || "unknown",
        name: productData?.name || "Premium Custom Design (AI)",
        price: currentPrice,
        size: querySize,
        quantity: quantity,
        image_url: productData?.image_url || mockupUrl,
        design_url: designUrl,
        coordinates: finalCoordinates,
        // Legacy fields for backward compatibility
        mockupUrl: mockupUrl,
        finalMockup: designUrl
      });

      addLog("Product added to cart!", "success");
      setShowToast(true);
    } catch (err: any) {
      console.error("Error securing cart snapshot:", err);
      addLog("Failed to snapshot canvas", "error");
    } finally {
      setIsFinalizing(false);
    }
  };

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // IMPORTANT: Do NOT return null before mounted — the <canvas> element must
  // always be in the DOM so the Fabric initialization useEffect can find it.
  // We use `opacity-0 pointer-events-none` to hide the UI visually instead.

  return (
    <div className={`flex flex-col lg:flex-row gap-6 lg:h-[calc(100vh-180px)] lg:min-h-[700px] animate-reveal transition-opacity duration-300 ${mounted ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      {/* ── Left: Canvas Area ───────────────────────────────── */}
      <div className="flex-grow relative flex flex-col min-w-0 min-h-[500px]">

        {/* Floating trash button — top-right of canvas */}
        <div className="absolute top-4 right-4 z-30">
          <motion.button
            whileHover={{ scale: 1.08, backgroundColor: 'rgba(239,68,68,0.18)' }}
            whileTap={{ scale: 0.92 }}
            onClick={() => {
              const active = fabricRef.current?.getActiveObject();
              if (active) { fabricRef.current?.remove(active); fabricRef.current?.discardActiveObject(); saveHistory(); }
            }}
            title="Supprimer l'élément sélectionné"
            className="w-10 h-10 rounded-xl bg-black/60 backdrop-blur-xl border border-white/10 flex items-center justify-center text-red-400/70 hover:text-red-400 shadow-xl transition-all"
          >
            <Trash2 className="w-4 h-4" />
          </motion.button>
        </div>

        <div className="flex-grow bg-[#0d0d0f] rounded-2xl border border-white/8 shadow-2xl overflow-hidden relative flex items-center justify-center">
          <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '36px 36px' }} />
          <motion.div
            id="product-preview-container"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative shadow-[0_40px_80px_rgba(0,0,0,0.6)] rounded-2xl overflow-hidden ring-1 ring-white/10 bg-black"
            style={{ width: 500, height: 500 }}
          >
            <img src={mockupUrl} alt="Backdrop" className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none" />
            {/* Dashed print-zone guide — visual hint only */}
            <div className="absolute border border-dashed border-brand-blue/35 pointer-events-none rounded-xl z-20" style={{ left: 125, top: 100, width: 250, height: 280 }}>
              <div className="absolute -top-1 -left-1 w-2 h-2 bg-brand-blue/50 rounded-full" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-brand-blue/50 rounded-full" />
              <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-brand-blue/50 rounded-full" />
              <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-brand-blue/50 rounded-full" />
              <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[8px] font-black uppercase tracking-widest text-brand-blue/40 whitespace-nowrap">Zone d&apos;impression</span>
            </div>
            <canvas id="main-fabric-canvas" width={500} height={500} className="absolute inset-0 z-10" />
          </motion.div>
        </div>
      </div>

      {/* ── Right: Control Panel ─────────────────────────────── */}
      <div className="w-full lg:w-[420px] flex flex-col gap-5 overflow-y-auto scrollbar-thin">

        {/* ── Vision Engine Card ─── */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="relative bg-[#121212] border border-white/10 rounded-xl shadow-lg p-5 overflow-hidden"
        >
          {/* Progress bar */}
          {generationProgress > 0 && (
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-white/5 overflow-hidden rounded-t-xl">
              <motion.div
                className="h-full bg-gradient-to-r from-brand-blue via-brand-yellow to-brand-blue"
                initial={{ width: '0%' }}
                animate={{ width: `${Math.min(generationProgress, 100)}%` }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              />
            </div>
          )}

          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-blue/10 border border-brand-blue/20 text-brand-blue text-[10px] font-black uppercase tracking-widest">
              <Sparkles className="w-3 h-3" /> Vision Engine
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[8px] font-black uppercase tracking-widest text-white/30">Cloudflare SDXL</span>
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
          </div>

          {/* Prompt textarea */}
          <textarea
            className="w-full h-28 px-4 py-3 text-sm text-white/90 bg-black/50 border border-white/20 rounded-lg outline-none resize-none transition-all placeholder:text-white/25 focus:border-brand-blue focus:ring-1 focus:ring-brand-blue"
            placeholder="Décrivez votre design… ex: 'Dragon japonais en style encre, minimaliste sur fond blanc'"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey && prompt.trim()) { e.preventDefault(); generateWithCloudflareAI(); } }}
          />
          <p className="text-[9px] text-white/25 mt-1.5 mb-4 leading-relaxed">
            Les mots-clés <span className="text-white/40">vector art · t-shirt design · isolated</span> sont ajoutés automatiquement.
          </p>

          {/* Generate button */}
          <motion.button
            whileHover={{ scale: 1.02, boxShadow: '0 8px 32px rgba(74,144,226,0.35)' }}
            whileTap={{ scale: 0.97 }}
            onClick={() => generateWithCloudflareAI()}
            disabled={isGenerating || !prompt.trim()}
            className={`w-full py-3 rounded-lg font-bold text-sm tracking-wide transition-all flex items-center justify-center gap-2 ${
              isGenerating
                ? 'bg-brand-blue/50 text-white/70 cursor-wait'
                : !prompt.trim()
                ? 'bg-white/5 text-white/20 cursor-not-allowed border border-white/10'
                : 'bg-brand-blue text-white hover:bg-brand-blue/90 shadow-lg shadow-brand-blue/20'
            }`}
          >
            {isGenerating ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Génération… {Math.round(generationProgress)}%</>
            ) : (
              <><Wand2 className="w-4 h-4" /> ✨ GÉNÉRER LE DESIGN</>
            )}
          </motion.button>
        </motion.div>

        {/* ── Studio Log Card ─── */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#121212] border border-white/10 rounded-xl shadow-lg p-5 h-36 flex flex-col overflow-hidden"
        >
          <div className="flex items-center gap-2 mb-3 border-b border-white/8 pb-2.5">
            <Terminal className="w-3.5 h-3.5 text-brand-blue" />
            <span className="text-[9px] font-black uppercase tracking-[0.35em] text-white/30">Studio Log</span>
          </div>
          <div className="flex-grow overflow-y-auto space-y-1.5">
            <AnimatePresence initial={false}>
              {studioLogs.length === 0 && (
                <p className="text-[9px] text-white/20 font-mono italic">En attente d&apos;activité…</p>
              )}
              {studioLogs.map(log => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex gap-3 text-[9px] font-mono"
                >
                  <span className="text-white/20 flex-shrink-0">[{log.time}]</span>
                  <span className={`truncate ${
                    log.type === 'success' ? 'text-emerald-400' :
                    log.type === 'error'   ? 'text-red-400' :
                    log.type === 'ai'      ? 'text-brand-blue' :
                                            'text-white/35'
                  }`}>{log.message}</span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* ── Order Summary Card ─── */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#121212] border border-white/10 rounded-xl shadow-lg p-5"
        >
          <p className="text-[9px] font-black uppercase tracking-[0.35em] text-white/30 mb-4">Résumé de commande</p>

          {/* Quantity */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-white/50 font-medium">Quantité</span>
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg p-1">
              <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="w-7 h-7 rounded-md hover:bg-white/10 flex items-center justify-center transition-colors font-bold text-sm text-white/80">−</button>
              <span className="w-8 text-center font-black text-sm text-white">{quantity}</span>
              <button onClick={() => setQuantity(q => q + 1)} className="w-7 h-7 rounded-md hover:bg-white/10 flex items-center justify-center transition-colors font-bold text-sm text-white/80">+</button>
            </div>
          </div>

          {/* Price */}
          <div className="flex items-baseline justify-between border-t border-white/8 pt-4">
            <span className="text-xs text-white/40 font-medium">Total</span>
            <span className="text-3xl font-black tracking-tight text-brand-yellow">{currentPrice * quantity} <span className="text-base font-bold text-brand-yellow/60">MAD</span></span>
          </div>
        </motion.div>

        {/* ── Add to Cart CTA ─── */}
        <motion.button
          whileHover={{ scale: 1.02, boxShadow: '0 16px 40px rgba(74,144,226,0.25)' }}
          whileTap={{ scale: 0.97 }}
          onClick={handleAddToCart}
          disabled={isFinalizing}
          className="w-full py-4 rounded-xl bg-brand-blue text-white font-bold text-sm tracking-wide transition-all shadow-xl shadow-brand-blue/20 flex items-center justify-center gap-3 hover:bg-brand-blue/90"
        >
          {isFinalizing ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShoppingCart className="w-4 h-4" />}
          {isFinalizing ? 'Traitement…' : 'Ajouter au panier'}
        </motion.button>

        {/* Choice Confirmation Modal */}
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
      </div>
    </div>
  );
}
