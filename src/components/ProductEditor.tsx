"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import * as fabric from "fabric";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useCartStore } from "@/lib/store/cartStore";
import { createClient } from "@/lib/supabase/client";
import { useApp } from "@/lib/store";
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
const STYLE_PRESETS = ['Anime', 'Cyberpunk', 'Minimalist', 'Vintage', 'Neon', 'Watercolor'];

export default function TShirtEditor() {
  const supabase = createClient();
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
  const { showToast: triggerGlobalToast, user, profile } = useApp();

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

  const hasValidDiscount = profile?.discount_rate > 0 && profile?.discount_expires_at && new Date(profile.discount_expires_at) > now;
  const originalPrice = isSaleActive ? productData.sale_price : (productData?.price || 249);
  const currentPrice = hasValidDiscount ? originalPrice * (1 - profile.discount_rate / 100) : originalPrice;

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
      const enhancedPrompt = `${prompt.trim()}, vector art, t-shirt design, isolated on pure white background, clean edges, no background noise, high contrast, print ready`;

      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
        console.warn('generateWithCloudflareAI: fabricRef.current is null');
        addLog('Canvas initializing — design queued for rendering.', 'system');
        setPendingImageUrl(imageUrl);
        setIsGenerating(false);
        setTimeout(() => setGenerationProgress(0), 1500);
        return;
      }

      // Render the AI design on canvas — user can now reposition/scale it freely
      applyImageToCanvas(imageUrl, fabricRef.current);

      setIsGenerating(false);
      addLog("Design ready — position & scale it, then click 'Ajouter au panier' to save.", "success");
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
  const handleAddToCart = async () => {
    if (!fabricRef.current) {
      console.error('handleAddToCart: fabricRef.current is null');
      return;
    }

    setIsFinalizing(true);
    addLog("Capturing final design placement & compositing mockup...", "system");
    try {
      const canvas = fabricRef.current;

      // ── Step 1: Extract placement coordinates BEFORE deselecting ──
      const allObjects = canvas.getObjects();
      if (allObjects.length === 0) {
        addLog("No design to add.", "error");
        setIsFinalizing(false);
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

      // ── Step 2: Deselect to remove selection handles, then capture ──
      canvas.discardActiveObject();
      
      // Temporarily remove multiply blend mode to prevent fading in the export
      const originalBlendModes = allObjects.map(obj => obj.globalCompositeOperation);
      allObjects.forEach(obj => obj.set('globalCompositeOperation', 'source-over'));
      
      canvas.renderAll();

      // Export the isolated transparent design EXACTLY cropped to the bounding box
      const transparentDesign = canvas.toDataURL({
        format: 'png',
        quality: 1,
        multiplier: 1,
        left: finalCoordinates.x,
        top: finalCoordinates.y,
        width: finalCoordinates.width,
        height: finalCoordinates.height
      });
      const designUrl = transparentDesign || "";

      // Restore blend modes
      allObjects.forEach((obj, i) => obj.set('globalCompositeOperation', originalBlendModes[i]));
      canvas.renderAll();

      // ── Step 3: Generate the merged product mockup via Backend Engine ──
      addLog("Compositing full product mockup...", "system");
      
      const compositeResponse = await fetch('/api/design/composite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          baseImageUrl: mockupUrl,
          designUrl: designUrl,
          placement: finalCoordinates
        })
      });

      if (!compositeResponse.ok) {
        throw new Error('Failed to composite mockup via backend');
      }

      const mockupBlob = await compositeResponse.blob();

      // ── Step 4: Upload mockup & save creation to database ──
      let savedMockupUrl: string | null = null;
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user && mockupBlob) {
        const activeUserId = session.user.id;
        const filename = `mockup_${activeUserId}_${Date.now()}.png`;

        addLog("Uploading merged mockup to cloud storage...", "system");
        const { error: uploadError } = await supabase.storage
          .from('user_designs')
          .upload(filename, mockupBlob, { contentType: 'image/png', upsert: true });

        if (!uploadError) {
          const { data } = supabase.storage
            .from('user_designs')
            .getPublicUrl(filename);
          if (data?.publicUrl) {
            savedMockupUrl = data.publicUrl;
            addLog("Full product mockup uploaded ✓", "system");
          }
        } else {
          console.error("Storage upload error:", uploadError);
          addLog("Failed to upload mockup to cloud storage.", "error");
        }

        // Insert creation record into the creations table
        const selectedProductId = queryProductId || productData?.id || "cmosndxll00000eps60qnuw76";
        const { error: insertErr } = await supabase.from('creations').insert([{
          user_id: activeUserId,
          product_id: selectedProductId,
          prompt: prompt.trim(),
          image_url: savedMockupUrl || designUrl
        }]);

        if (!insertErr) {
          addLog("Design saved to your creations!", "success");
          triggerGlobalToast("Design sauvegardé dans vos créations !", "success");
        } else {
          console.error("Database insert error:", insertErr);
          addLog("Failed to save design to your creations database.", "error");
        }
      } else if (!session?.user) {
        addLog("Not logged in — design will not be saved permanently.", "system");
      }

      // ── Step 5: Add to cart ──

      addToCart({
        id: queryProductId || "unknown",
        name: productData?.name || "Premium Custom Design (AI)",
        price: currentPrice,
        size: querySize,
        quantity: quantity,
        image_url: productData?.image_url || mockupUrl,
        design_url: designUrl,
        coordinates: finalCoordinates,
        mockupUrl: productData?.image_url || mockupUrl,
        finalMockup: designUrl,
        mockup_url: savedMockupUrl || mockupUrl
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

        <div className="flex-grow bg-white border border-neutral-200 shadow-sm dark:bg-neutral-950 dark:border-neutral-800 dark:shadow-none rounded-2xl overflow-hidden relative flex items-center justify-center">
          <div className="absolute inset-0 opacity-[0.04] dark:opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '36px 36px' }} />
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
          className="relative bg-white border border-neutral-200 shadow-sm dark:bg-neutral-950 dark:border-neutral-800 dark:shadow-none rounded-xl p-5 overflow-hidden"
        >
          {/* Progress bar */}
          {generationProgress > 0 && (
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-neutral-100 dark:bg-white/5 overflow-hidden rounded-t-xl">
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
              <span className="text-[8px] font-black uppercase tracking-widest text-neutral-500 dark:text-neutral-400">Cloudflare SDXL</span>
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
          </div>

          {/* Prompt textarea */}
          <textarea
            className="w-full h-28 px-4 py-3 text-sm text-neutral-900 bg-neutral-50 border border-neutral-300 rounded-lg outline-none resize-none transition-all placeholder:text-neutral-400 focus:border-brand-blue focus:ring-1 focus:ring-brand-blue dark:text-white/90 dark:bg-black/50 dark:border-white/20 dark:placeholder:text-white/25"
            placeholder="Décrivez votre design... ex: 'Dragon japonais, style encre, minimaliste'"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey && prompt.trim()) { e.preventDefault(); generateWithCloudflareAI(); } }}
          />

          {/* Style Presets */}
          <div className="flex flex-wrap gap-2 mt-3 mb-2">
            {STYLE_PRESETS.map((style) => (
              <button
                key={style}
                type="button"
                onClick={() => setPrompt((prev) => (prev ? `${prev}, ${style}` : style))}
                className="text-[10px] px-3 py-1 rounded-full cursor-pointer transition-colors border bg-neutral-100 border-neutral-200 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800/50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-700 font-black uppercase tracking-tight"
              >
                {style}
              </button>
            ))}
          </div>

          <p className="text-[9px] text-neutral-500 dark:text-neutral-400 mt-1.5 mb-4 leading-relaxed">
            Les mots-clés <span className="text-neutral-700 dark:text-white/40 font-bold">vector art · t-shirt design · isolated</span> sont ajoutés automatiquement.
          </p>

          {/* Generate button */}
          <motion.button
            whileHover={{ scale: 1.02, boxShadow: '0 8px 32px rgba(74,144,226,0.35)' }}
            whileTap={{ scale: 0.97 }}
            onClick={() => generateWithCloudflareAI()}
            disabled={isGenerating || !prompt.trim()}
            className={`w-full py-3 rounded-lg font-bold text-sm tracking-wide transition-all flex items-center justify-center gap-2 ${isGenerating
                ? 'bg-brand-blue/50 text-white/70 cursor-wait'
                : !prompt.trim()
                  ? 'bg-neutral-100 text-neutral-400 dark:bg-white/5 dark:text-white/20 cursor-not-allowed border border-neutral-200 dark:border-white/10'
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

        {/* ── Order Summary Card ─── */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white border border-neutral-200 shadow-sm dark:bg-neutral-950 dark:border-neutral-800 dark:shadow-none rounded-xl p-5"
        >
          <p className="text-[9px] font-black uppercase tracking-[0.35em] text-neutral-500 dark:text-neutral-400 mb-4">Résumé de commande</p>

          {/* Quantity */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-neutral-600 dark:text-neutral-300 font-medium">Quantité</span>
            <div className="flex items-center gap-2 bg-neutral-100 border border-neutral-200 dark:bg-white/5 dark:border-white/10 rounded-lg p-1">
              <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="w-7 h-7 rounded-md hover:bg-neutral-200 dark:hover:bg-white/10 flex items-center justify-center transition-colors font-bold text-sm text-neutral-700 dark:text-white/80">−</button>
              <span className="w-8 text-center font-black text-sm text-neutral-900 dark:text-white">{quantity}</span>
              <button onClick={() => setQuantity(q => q + 1)} className="w-7 h-7 rounded-md hover:bg-neutral-200 dark:hover:bg-white/10 flex items-center justify-center transition-colors font-bold text-sm text-neutral-700 dark:text-white/80">+</button>
            </div>
          </div>

          {/* Price */}
          <div className="flex items-baseline justify-between border-t border-neutral-200 dark:border-white/8 pt-4">
            <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">Total</span>
            <div className="text-right">
              {hasValidDiscount ? (
                <>
                  <span className="block text-xs font-bold text-neutral-500 line-through mb-1">{(originalPrice * quantity) % 1 === 0 ? (originalPrice * quantity) : (originalPrice * quantity).toFixed(2)} MAD</span>
                  <span className="text-3xl font-black tracking-tight text-red-600 dark:text-red-500">{(currentPrice * quantity) % 1 === 0 ? (currentPrice * quantity) : (currentPrice * quantity).toFixed(2)} <span className="text-base font-bold text-red-600/60 dark:text-red-500/60">MAD</span></span>
                </>
              ) : (
                <span className="text-3xl font-black tracking-tight text-neutral-900 dark:text-brand-yellow">{(currentPrice * quantity) % 1 === 0 ? (currentPrice * quantity) : (currentPrice * quantity).toFixed(2)} <span className="text-base font-bold text-neutral-500 dark:text-brand-yellow/60">MAD</span></span>
              )}
            </div>
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
            <div className="bg-white border border-neutral-200 dark:bg-[#111116] dark:border-white/10 rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl text-center animate-reveal">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-6 animate-pulse">
                <Sparkles className="w-8 h-8 text-emerald-500 dark:text-emerald-400" />
              </div>
              <h3 className="text-2xl font-black uppercase tracking-tighter text-neutral-900 dark:text-white mb-2">Produit ajouté au panier !</h3>
              <p className="text-neutral-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-8">Votre création a été enregistrée avec succès.</p>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => { setShowToast(false); router.push('/categories'); }}
                  className="flex-grow py-4 bg-neutral-100 border border-neutral-200 hover:bg-neutral-200 dark:bg-white/5 dark:border-white/10 dark:hover:bg-white/10 rounded-2xl font-black text-[10px] uppercase tracking-widest text-neutral-700 dark:text-slate-300 transition-all hover:scale-[1.02] active:scale-[0.98]"
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
