"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import * as fabric from "fabric";
import { useSearchParams } from "next/navigation";
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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<fabric.Canvas | null>(null);
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [designId, setDesignId] = useState<string | null>(null);
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

  const searchParams = useSearchParams();
  const queryProductId = searchParams.get('productId') || "cmosndxll00000eps60qnuw76";
  const queryMockupUrl = searchParams.get('mockupUrl');

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

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new fabric.Canvas(canvasRef.current, {
      width: 500,
      height: 500,
      backgroundColor: "transparent",
      preserveObjectStacking: true,
    });

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
        cornerColor: '#6366f1',
        cornerStrokeColor: '#ffffff',
        cornerStyle: 'circle',
        cornerSize: 10,
        padding: 10,
        borderColor: '#6366f1',
        borderDashArray: [4, 4]
    });

    setFabricCanvas(canvas);

    const mockupUrl = queryMockupUrl ? decodeURIComponent(queryMockupUrl) : "https://htnagmiuapyxaqoptzju.supabase.co/storage/v1/object/public/fashion/vecteezy_ai-generated-classic-crewneck-t-shirt-mockup-with-model-9_38095951.jpg";
    
    fabric.Image.fromURL(mockupUrl, { crossOrigin: "anonymous" }).then((img) => {
      const scale = Math.min(500 / img.width!, 500 / img.height!);
      img.set({ originX: 'center', originY: 'center', left: 250, top: 250, scaleX: scale, scaleY: scale, selectable: false, evented: false });
      canvas.backgroundImage = img;
      canvas.renderAll();
      setHistory([JSON.stringify(canvas.toJSON())]);
      setHistoryIndex(0);
    });

    canvas.on('object:moving', (e) => {
        const obj = e.target!;
        const centerX = 250;
        const centerY = 250;
        if (Math.abs(obj.left! - centerX) < 5) obj.set({ left: centerX }).setCoords();
        if (Math.abs(obj.top! - centerY) < 5) obj.set({ top: centerY }).setCoords();
    });

    canvas.on('object:modified', () => {
        saveHistory();
        addLog("Workspace updated", "system");
    });

    return () => { canvas.dispose(); };
  }, [queryMockupUrl, addLog, saveHistory]);

  const addText = () => {
    if (!fabricCanvas) return;
    const itext = new fabric.IText("Type here...", {
        left: 250,
        top: 250,
        fontFamily: fontFamily,
        fill: textColor,
        fontSize: 30,
        originX: 'center',
        originY: 'center'
    });
    fabricCanvas.add(itext);
    fabricCanvas.setActiveObject(itext);
    saveHistory();
    addLog("Text element added", "system");
  };

  const handleGenerate = async () => {
    if (!prompt) return;
    setIsGenerating(true);
    addLog(`Initiating AI engine...`, "ai");
    try {
      const response = await fetch("http://127.0.0.1:8000/designs/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, user_id: "00000000-0000-0000-0000-000000000000" }), 
      });
      const initialData = await response.json();
      const poll = async () => {
        const statusRes = await fetch(`http://127.0.0.1:8000/designs/status/${initialData.id}`);
        const data = await statusRes.json();
        if (data.status === 'completed') {
            fabric.Image.fromURL(data.url, { crossOrigin: "anonymous" }).then(img => {
                img.scaleToWidth(150);
                img.set({ left: 250, top: 250, originX: 'center', originY: 'center' });
                fabricCanvas?.add(img);
                fabricCanvas?.setActiveObject(img);
                saveHistory();
                addLog("AI design materialized", "success");
            });
            setIsGenerating(false);
        } else {
            addLog("Synthesizing textures...", "ai");
            setTimeout(poll, 2000);
        }
      };
      poll();
    } catch {
      addLog("Engine offline", "error");
      setIsGenerating(false);
    }
  };

  const [isFinalizing, setIsFinalizing] = useState(false);
  const handleFinalize = async () => {
    if (!fabricCanvas) return;
    setIsFinalizing(true);
    addLog("Securing collection entry...", "system");
    try {
      const previewDataUrl = fabricCanvas.toDataURL({ format: "png", multiplier: 1 });
      const activeObj = fabricCanvas.getActiveObject() || fabricCanvas.getObjects()[0];
      const payload = {
        product_id: queryProductId,
        design_id: designId || "uploaded",
        coordinates: activeObj ? { 
            left: activeObj.left, 
            top: activeObj.top, 
            scaleX: activeObj.scaleX, 
            angle: activeObj.angle,
            opacity: activeObj.opacity
        } : {},
        preview_data_url: previewDataUrl
      };
      await fetch("http://127.0.0.1:8000/orders/ligne-commande", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      addLog("Design secured", "success");
      alert("Success!");
    } catch {
      addLog("Finalization failed", "error");
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
              className="w-12 h-12 rounded-2xl bg-black/80 backdrop-blur-xl border border-white/10 flex items-center justify-center text-primary shadow-2xl transition-all"
            >
              <MousePointer2 className="w-5 h-5" />
            </motion.button>
            <div className="w-12 h-px bg-white/10 my-1" />
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => { fabricCanvas?.discardActiveObject(); fabricCanvas?.renderAll(); }} 
              title="Deselect" 
              className="w-12 h-12 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/5 flex items-center justify-center text-foreground/40 hover:bg-black/60 transition-all"
            >
              <AlignLeft className="w-5 h-5 rotate-90" />
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                const active = fabricCanvas?.getActiveObject();
                if(active) { active.flipX = !active.flipX; fabricCanvas?.renderAll(); saveHistory(); }
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
                const active = fabricCanvas?.getActiveObject();
                if(active) { fabricCanvas?.remove(active); fabricCanvas?.discardActiveObject(); saveHistory(); }
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
             initial={{ scale: 0.9, opacity: 0 }}
             animate={{ scale: 1, opacity: 1 }}
             className="relative shadow-[0_50px_100px_rgba(0,0,0,0.5)] rounded-2xl overflow-hidden ring-1 ring-white/10 bg-black" 
             style={{ width: 500, height: 500 }}
           >
                <div className="absolute border border-dashed border-primary/40 pointer-events-none rounded-xl z-20" style={{ left: 150, top: 150, width: 200, height: 200 }}>
                   <div className="absolute -top-1 -left-1 w-2 h-2 bg-primary/60 rounded-full" />
                   <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary/60 rounded-full" />
                   <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-primary/60 rounded-full" />
                   <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-primary/60 rounded-full" />
                </div>
                <canvas ref={canvasRef} />
           </motion.div>
        </div>
      </div>

      <div className="w-full lg:w-[450px] flex flex-col gap-4 overflow-y-auto pr-2 scrollbar-thin">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass rounded-[2.5rem] border-white/5 p-8 relative overflow-hidden group"
        >
           <div className="flex items-center justify-between mb-6">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest"><Sparkles className="w-3 h-3" /> Vision Engine</div>
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
           </div>
           <textarea className="w-full h-24 p-5 text-foreground bg-black/40 border border-white/5 rounded-2xl outline-none resize-none transition-all font-medium text-sm mb-4 focus:border-primary/40" placeholder="Describe your design..." value={prompt} onChange={(e) => setPrompt(e.target.value)} />
           <motion.button 
             whileHover={{ scale: 1.02 }}
             whileTap={{ scale: 0.98 }}
             onClick={handleGenerate} 
             disabled={isGenerating || !prompt} 
             className="w-full py-4 rounded-xl font-black text-[10px] uppercase bg-primary text-white shadow-2xl transition-all flex items-center justify-center gap-3"
           >
                {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />} Synthesize Asset
           </motion.button>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-[2.5rem] border-white/5 p-8 relative overflow-hidden group"
        >
           <div className="flex items-center justify-between mb-6">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-[10px] font-black uppercase tracking-widest"><Type className="w-3 h-3" /> Typography</div>
           </div>
           <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="relative group/font">
                 <select value={fontFamily} onChange={(e) => setFontFamily(e.target.value)} className="w-full bg-black/40 border border-white/5 p-3 rounded-xl text-xs font-bold outline-none appearance-none cursor-pointer hover:bg-black/60 transition-colors">
                    {GOOGLE_FONTS.map(f => <option key={f} value={f} style={{fontFamily: f}}>{f}</option>)}
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
            <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-3"><Terminal className="w-3 h-3 text-primary" /><span className="text-[8px] font-black uppercase tracking-[0.4em] text-foreground/40">Studio Log</span></div>
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
                      <span className={log.type === 'success' ? 'text-green-500' : log.type === 'ai' ? 'text-primary' : 'text-foreground/40'}>{log.message}</span>
                    </motion.div>
                  ))}
                </AnimatePresence>
            </div>
        </motion.div>

        <motion.button 
          whileHover={{ scale: 1.02, boxShadow: "0 20px 40px rgba(255,255,255,0.1)" }}
          whileTap={{ scale: 0.98 }}
          onClick={handleFinalize}
          disabled={isFinalizing}
          className="w-full py-6 rounded-[2rem] bg-white text-black font-black text-xs uppercase tracking-[0.3em] transition-all shadow-2xl flex items-center justify-center gap-3"
        >
          {isFinalizing ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShoppingCart className="w-4 h-4" />}
          {isFinalizing ? 'Securing...' : 'Secure to Vault'}
        </motion.button>
      </div>
    </div>
  );
}
