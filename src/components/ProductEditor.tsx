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
  MousePointer2,
  RotateCcw,
  Loader2,
  Maximize2,
  Terminal,
  Sliders,
  Eye,
  Undo2,
  Redo2,
  Trash2,
  Copy,
  Type,
  AlignCenter,
  AlignLeft,
  AlignRight,
  FlipHorizontal,
  ChevronDown
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

    const clipRect = new fabric.Rect({
      left: 150,
      top: 150,
      width: 200,
      height: 200,
      absolutePositioned: true
    });
    canvas.clipPath = clipRect;

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
  // FREE AI GENERATION — Pollinations.ai (No API key required)
  // ==========================================================
  const generateWithPollinations = async (): Promise<void> => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setGenerationProgress(0);
    addLog(`Vision Engine: processing prompt...`, "ai");

    // Simulate progress while image loads
    const progressInterval = setInterval(() => {
      setGenerationProgress(prev => {
        if (prev >= 90) { clearInterval(progressInterval); return 90; }
        return prev + Math.random() * 12;
      });
    }, 400);

    try {
      // Append apparel-optimized keywords to user prompt
      const enhancedPrompt = `${prompt.trim()}, vector art, t-shirt design, isolated on pure white background, clean edges, no background noise, high contrast, print ready`;
      const encodedPrompt = encodeURIComponent(enhancedPrompt);
      // Add a cache-busting seed to avoid stale CDN results
      const seed = Math.floor(Math.random() * 999999);
      const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=512&height=512&nologo=true&seed=${seed}`;

      addLog(`Requesting Pollinations AI (seed: ${seed})...`, "ai");

      // Pre-load the image using a JS Image() object
      await new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Failed to load image from Pollinations"));
        img.src = imageUrl;
      });

      clearInterval(progressInterval);
      setGenerationProgress(100);
      addLog(`Image received — rendering on canvas...`, "ai");

      setLastGeneratedUrl(imageUrl);

      if (!fabricRef.current) {
        console.error('generateWithPollinations: fabricRef.current is null');
        addLog('Canvas not ready — please wait and retry.', 'error');
        setIsGenerating(false);
        setGenerationProgress(0);
        return;
      }

      const canvas = fabricRef.current;
      fabric.Image.fromURL(imageUrl, { crossOrigin: "anonymous" }).then((img) => {
        img.scaleToWidth(200);
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

      setIsGenerating(false);
      // Reset progress after a brief moment
      setTimeout(() => setGenerationProgress(0), 1500);
    } catch (err: any) {
      clearInterval(progressInterval);
      console.error('Pollinations fetch failed:', err);
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

  if (!mounted) return null;

  return (
    <div className="flex flex-col lg:flex-row gap-6 lg:h-[calc(100vh-180px)] lg:min-h-[700px] animate-reveal">
      <div className="flex-grow relative group flex flex-col min-w-0 min-h-[500px]">
        <div className="absolute top-6 left-6 z-30 flex flex-col gap-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title="Select Tool"
            className="w-12 h-12 rounded-2xl bg-black/80 backdrop-blur-xl border border-white/10 flex items-center justify-center text-brand-blue shadow-2xl transition-all"
          >
            <MousePointer2 className="w-5 h-5" />
          </motion.button>
          <div className="w-12 h-px bg-white/10 my-1" />
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => { fabricRef.current?.discardActiveObject(); fabricRef.current?.renderAll(); }}
            title="Deselect"
            className="w-12 h-12 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/5 flex items-center justify-center text-foreground/40 hover:bg-black/60 transition-all"
          >
            <AlignLeft className="w-5 h-5 rotate-90" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              const active = fabricRef.current?.getActiveObject();
              if (active) { active.flipX = !active.flipX; fabricRef.current?.renderAll(); saveHistory(); }
            }}
            title="Flip Horizontal"
            className="w-12 h-12 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/5 flex items-center justify-center text-foreground/40 hover:bg-black/60 transition-all"
          >
            <FlipHorizontal className="w-5 h-5" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1, backgroundColor: "rgba(239, 68, 68, 0.2)" }}
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              const active = fabricRef.current?.getActiveObject();
              if (active) { fabricRef.current?.remove(active); fabricRef.current?.discardActiveObject(); saveHistory(); }
            }}
            title="Delete"
            className="w-12 h-12 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/5 flex items-center justify-center text-accent/60 transition-all"
          >
            <Trash2 className="w-5 h-5" />
          </motion.button>
        </div>

        <div className="flex-grow glass rounded-[3.5rem] p-1 border-white/5 shadow-2xl overflow-hidden relative flex items-center justify-center bg-background/40">
          <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
          <motion.div
            id="product-preview-container"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative shadow-[0_50px_100px_rgba(0,0,0,0.5)] rounded-2xl overflow-hidden ring-1 ring-white/10 bg-black"
            style={{ width: 500, height: 500 }}
          >
            <img src={mockupUrl} alt="Backdrop" className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none" />
            <div className="absolute border border-dashed border-brand-blue/40 pointer-events-none rounded-xl z-20" style={{ left: 150, top: 150, width: 200, height: 200 }}>
              <div className="absolute -top-1 -left-1 w-2 h-2 bg-brand-blue/60 rounded-full" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-brand-blue/60 rounded-full" />
              <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-brand-blue/60 rounded-full" />
              <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-brand-blue/60 rounded-full" />
            </div>
            {/* mix-blend-multiply makes white AI backgrounds disappear into the product */}
            <canvas id="main-fabric-canvas" width={500} height={500} className="absolute inset-0 z-10 mix-blend-multiply" />
          </motion.div>
        </div>
      </div>

      <div className="w-full lg:w-[450px] flex flex-col gap-4 overflow-y-auto pr-2 scrollbar-thin">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass rounded-[2.5rem] border-white/5 p-8 relative overflow-hidden group"
        >
          {/* Progress bar overlay */}
          {generationProgress > 0 && (
            <div className="absolute top-0 left-0 right-0 h-1 bg-black/20 z-10 overflow-hidden rounded-t-[2.5rem]">
              <motion.div
                className="h-full bg-gradient-to-r from-brand-blue via-brand-yellow to-brand-blue"
                initial={{ width: '0%' }}
                animate={{ width: `${Math.min(generationProgress, 100)}%` }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              />
            </div>
          )}

          <div className="flex items-center justify-between mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-blue/10 border border-brand-blue/20 text-brand-blue text-[10px] font-black uppercase tracking-widest"><Sparkles className="w-3 h-3" /> Vision Engine</div>
            <div className="flex items-center gap-2">
              <span className="text-[8px] font-black uppercase tracking-widest text-emerald-400/60">Free · No API Key</span>
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            </div>
          </div>
          <textarea
            className="w-full h-24 p-5 text-foreground bg-black/40 border border-white/5 rounded-2xl outline-none resize-none transition-all font-medium text-sm mb-3 focus:border-brand-blue/40 placeholder:text-foreground/20"
            placeholder="Décrivez votre design (ex: 'Un dragon japonais en style encre, minimaliste' / 'A retro sunset with palm trees and neon vibes')" 
            value={prompt} 
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey && prompt.trim()) { e.preventDefault(); generateWithPollinations(); } }}
          />
          <p className="text-[8px] font-bold text-foreground/20 uppercase tracking-wider mb-4">Les mots-clés "vector art, t-shirt design, isolated" sont ajoutés automatiquement</p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => generateWithPollinations()}
            disabled={isGenerating || !prompt.trim()}
            className={`w-full py-4 rounded-xl font-black text-xs uppercase shadow-2xl transition-all flex items-center justify-center gap-3 ${
              isGenerating 
                ? 'bg-brand-blue/60 text-white/80 cursor-wait' 
                : !prompt.trim() 
                  ? 'bg-white/5 text-foreground/20 cursor-not-allowed'
                  : 'bg-brand-blue text-white hover:shadow-brand-blue/30'
            }`}
          >
            {isGenerating ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Génération en cours ({Math.round(generationProgress)}%)...</>
            ) : (
              <><Wand2 className="w-4 h-4" /> Générer avec l&apos;IA</>
            )}
          </motion.button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-[2.5rem] border-white/5 p-8 relative overflow-hidden group"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-yellow/10 border border-brand-yellow/20 text-brand-yellow text-[10px] font-black uppercase tracking-widest"><Type className="w-3 h-3" /> Typography</div>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="relative group/font">
              <select value={fontFamily} onChange={(e) => setFontFamily(e.target.value)} className="w-full bg-black/40 border border-white/5 p-3 rounded-xl text-xs font-bold outline-none appearance-none cursor-pointer hover:bg-black/60 transition-colors">
                {GOOGLE_FONTS.map(f => <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 opacity-20" />
            </div>
            <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} className="w-full h-full bg-black/40 border border-white/5 rounded-xl cursor-pointer hover:bg-black/60 transition-colors" />
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={addText}
            className="w-full py-3 rounded-xl border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-all"
          >
            Add Text Layer
          </motion.button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-[2rem] border-white/5 p-6 bg-black/40 h-40 flex flex-col overflow-hidden"
        >
          <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-3"><Terminal className="w-3 h-3 text-brand-blue" /><span className="text-[8px] font-black uppercase tracking-[0.4em] text-foreground/40">Studio Log</span></div>
          <div className="flex-grow overflow-y-auto space-y-2 pr-2">
            <AnimatePresence initial={false}>
              {studioLogs.map(log => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex gap-3 text-[9px] font-mono"
                >
                  <span className="text-foreground/20">[{log.time}]</span>
                  <span className={log.type === 'success' ? 'text-green-500' : log.type === 'ai' ? 'text-brand-blue' : 'text-foreground/40'}>{log.message}</span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Quantity Controls */}
        <div className="space-y-3 mb-4 border-t border-white/5 pt-4">
          <label className="text-[9px] font-black uppercase tracking-[0.2em] text-foreground/40">Total Quantity</label>
          <div className="flex items-center gap-4 bg-white/5 border border-white/5 rounded-2xl p-1.5">
            <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="w-9 h-9 rounded-xl hover:bg-white/10 flex items-center justify-center transition-colors font-bold text-sm">-</button>
            <span className="flex-grow text-center font-black text-xs">{quantity}</span>
            <button onClick={() => setQuantity(q => q + 1)} className="w-9 h-9 rounded-xl hover:bg-white/10 flex items-center justify-center transition-colors font-bold text-sm">+</button>
          </div>
        </div>

        {/* Pricing Summary */}
        <div className="pt-4 border-t border-white/5 mb-6">
          <div className="flex justify-between items-end">
            <p className="text-[9px] font-black uppercase tracking-[0.4em] text-foreground/20">Final Amount</p>
            <p className="text-2xl font-black tracking-tighter text-brand-yellow">{currentPrice * quantity} MAD</p>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02, boxShadow: "0 20px 40px rgba(74, 144, 226, 0.2)" }}
          whileTap={{ scale: 0.98 }}
          onClick={handleAddToCart}
          disabled={isFinalizing}
          className="w-full py-5 rounded-2xl bg-brand-blue text-white font-black text-xs uppercase tracking-[0.3em] transition-all shadow-2xl flex items-center justify-center gap-3 shadow-brand-blue/20"
        >
          {isFinalizing ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShoppingCart className="w-4 h-4" />}
          {isFinalizing ? 'Traitement...' : 'Ajouter au panier'}
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
