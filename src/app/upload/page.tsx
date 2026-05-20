'use client';

import { useEffect, useMemo, useState, Suspense } from "react";
import { UploadCloud, ImagePlus, MoveHorizontal, ArrowUpDown, PackageCheck, Trash2, ArrowRight, Sparkles, Settings2, Palette, Ruler, Boxes } from "lucide-react";
import { useApp } from "@/lib/store";
import { translations } from "@/lib/translations";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const products = [
  {
    id: "tshirt",
    name: "Premium T-Shirt",
    description: "Soft cotton tee built for bold prints.",
    baseColor: "#111827",
    colors: [
      { label: "Black", value: "#111827", stock: 24 },
      { label: "White", value: "#f9fafb", stock: 18 },
      { label: "Red", value: "#dc2626", stock: 12 },
      { label: "Navy", value: "#1e40af", stock: 10 },
    ],
    sizes: ["S", "M", "L", "XL"],
    price: 24,
  },
  {
    id: "mug",
    name: "Signature Mug",
    description: "Ceramic mug with a crisp, centered print area.",
    baseColor: "#f8fafc",
    colors: [
      { label: "White", value: "#f8fafc", stock: 32 },
      { label: "Black", value: "#0f172a", stock: 8 },
      { label: "Blue", value: "#2563eb", stock: 14 },
    ],
    sizes: ["11oz", "15oz"],
    price: 18,
  },
  {
    id: "cap",
    name: "Custom Cap",
    description: "Structured cap that keeps your design visible and sharp.",
    baseColor: "#1f2937",
    colors: [
      { label: "Black", value: "#1f2937", stock: 16 },
      { label: "Olive", value: "#3f6212", stock: 9 },
      { label: "Gray", value: "#6b7280", stock: 6 },
    ],
    sizes: ["One size"],
    price: 22,
  },
];

function UploadContent() {
  const { lang } = useApp();
  const t = translations[lang];
  const router = useRouter();
  const searchParams = useSearchParams();

  const queryProductId = searchParams.get('productId');
  const queryMockupUrl = searchParams.get('mockupUrl');

  const [activeTab, setActiveTab] = useState<'product' | 'design' | 'layers'>('product');
  const [selectedProductId, setSelectedProductId] = useState(queryProductId || "tshirt");
  const [selectedColor, setSelectedColor] = useState(products[0].colors[0].value);
  const [selectedSize, setSelectedSize] = useState(products[0].sizes[0]);
  const [quantity, setQuantity] = useState(1);
  const [designFile, setDesignFile] = useState<File | null>(null);
  const [designUrl, setDesignUrl] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);

  const product = useMemo(
    () => products.find((item) => item.id === selectedProductId) ?? products[0],
    [selectedProductId],
  );

  useEffect(() => {
    if (queryProductId) {
      setSelectedProductId(queryProductId);
    }
  }, [queryProductId]);

  useEffect(() => {
    setSelectedColor(product.colors[0].value);
    setSelectedSize(product.sizes[0]);
  }, [product]);

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
    setActiveTab('design');
  };

  const [isFinishing, setIsFinishing] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const { setIsAuthModalOpen } = useApp();

  const handleCheckout = async (skipAuth: boolean = false) => {
    if (!designFile) {
      alert("Please upload a design first.");
      return;
    }

    setIsFinishing(true);
    try {
      // Get user session
      const { data: { session } } = await supabase.auth.getSession();

      // If no session and skipAuth is false, show modal to ask user
      if (!session && !skipAuth) {
        setIsFinishing(false);
        setShowSaveModal(true);
        return;
      }

      // If skipAuth is true, save locally without account
      if (!session && skipAuth) {
        // Save order info to localStorage for later
        const orderData = {
          product: {
            id: selectedProductId,
            name: product.name,
            price: product.price,
          },
          design: {
            name: designFile.name,
            dataUrl: designUrl,
          },
          customization: {
            color: selectedColor,
            size: selectedSize,
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

      // User is authenticated, proceed with saving to database
      const token = session!.access_token;
      const userId = session!.user.id;

      // 1. Upload the design file to the backend
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

      // 2. Create the order (Commande)
      const commandePayload = {
        total_price: product.price * quantity,
        order_notes: `${product.name} - ${selectedSize} - ${selectedColor}`,
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

      // 3. Create the order line (LigneCommande)
      const lignePayload = {
        commande_id: commandeId,
        product_id: selectedProductId === "tshirt" ? null : selectedProductId,
        design_id: designId,
        coordinates: { scale, offsetX, offsetY, color: selectedColor, size: selectedSize },
        preview_data_url: uploadData.data.url,
        quantity: quantity,
        price_unit: product.price,
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

  const centerHorizontal = () => setOffsetX(0);
  const centerVertical = () => setOffsetY(0);

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-foreground transition-colors duration-500 flex flex-col">
      <Navbar />

      <main className="flex-grow pt-24 pb-12 flex flex-col lg:flex-row bg-[#0a0a0c] container mx-auto px-4 lg:px-8 gap-8">
        {/* Main Dashboard Container */}
        <div className="flex-grow flex flex-col lg:flex-row bg-[#111116] border border-white/5 rounded-[2.5rem] lg:overflow-hidden shadow-2xl relative">

          {/* Vertical Tab Navigation (Sidebar) */}
          <nav className="w-full lg:w-24 bg-[#0d0d12] border-r border-white/5 flex lg:flex-col items-center py-6 lg:py-16 gap-8 px-4 lg:px-0 z-20">
            <button
              onClick={() => setActiveTab('product')}
              className={`group flex flex-col items-center gap-2 p-3 rounded-2xl transition-all duration-300 ${activeTab === 'product' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-foreground/30 hover:bg-white/5 hover:text-foreground'}`}
            >
              <PackageCheck className="w-6 h-6" />
              <span className="text-[9px] font-black uppercase tracking-tighter">Product</span>
            </button>
            <button
              onClick={() => setActiveTab('design')}
              className={`group flex flex-col items-center gap-2 p-3 rounded-2xl transition-all duration-300 ${activeTab === 'design' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-foreground/30 hover:bg-white/5 hover:text-foreground'}`}
            >
              <Palette className="w-6 h-6" />
              <span className="text-[9px] font-black uppercase tracking-tighter">Design</span>
            </button>
            <button
              onClick={() => setActiveTab('layers')}
              className={`group flex flex-col items-center gap-2 p-3 rounded-2xl transition-all duration-300 ${activeTab === 'layers' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-foreground/30 hover:bg-white/5 hover:text-foreground'}`}
            >
              <Boxes className="w-6 h-6" />
              <span className="text-[9px] font-black uppercase tracking-tighter">Layers</span>
            </button>
          </nav>

          {/* Controls Panel */}
          <div className="w-full lg:w-[420px] border-r border-white/5 bg-[#0d0d12]/50 flex flex-col z-10">
            <div className="p-8 border-b border-white/5">
              <h2 className="text-2xl font-black tracking-tighter uppercase italic">
                {activeTab === 'product' && 'Select Product'}
                {activeTab === 'design' && 'Design Assets'}
                {activeTab === 'layers' && 'Layer Manager'}
              </h2>
            </div>

            <div className="flex-grow overflow-y-auto p-8 custom-scrollbar">
              {activeTab === 'product' && (
                <div className="space-y-10 animate-reveal">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40">{t.uploadProductLabel}</label>
                    <div className="grid grid-cols-1 gap-3">
                      {products.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setSelectedProductId(item.id)}
                          className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${selectedProductId === item.id ? 'border-primary bg-primary/5 text-primary' : 'border-white/5 bg-white/5 text-foreground/40 hover:border-white/20'}`}
                        >
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${selectedProductId === item.id ? 'bg-primary/20' : 'bg-white/5'}`}>
                            {item.id === 'tshirt' && <MoveHorizontal className="w-6 h-6" />}
                            {item.id === 'mug' && <Palette className="w-6 h-6" />}
                            {item.id === 'cap' && <Boxes className="w-6 h-6" />}
                          </div>
                          <div className="text-left">
                            <p className="font-black uppercase text-xs tracking-tight">{item.name}</p>
                            <p className="text-[9px] font-bold opacity-50 uppercase tracking-widest">{item.price}$ Base Price</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40">{t.uploadColorLabel}</label>
                    <div className="flex flex-wrap gap-3">
                      {product.colors.map((color) => (
                        <button
                          key={color.value}
                          onClick={() => setSelectedColor(color.value)}
                          title={color.label}
                          className={`h-10 w-10 rounded-xl border-2 transition-all ${selectedColor === color.value ? 'border-primary scale-110 shadow-lg shadow-primary/20' : 'border-white/10 hover:scale-105'}`}
                          style={{ backgroundColor: color.value }}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40">{t.uploadSizeLabel}</label>
                    <div className="flex flex-wrap gap-2">
                      {product.sizes.map((size) => (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedSize === size ? 'bg-primary text-white' : 'bg-white/5 text-foreground/40 hover:text-foreground'}`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'design' && (
                <div className="space-y-8 animate-reveal">
                  {!designFile ? (
                    <label className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-white/10 rounded-[2rem] bg-white/5 hover:bg-white/10 hover:border-primary/50 transition-all cursor-pointer group text-center">
                      <input type="file" className="hidden" onChange={handleFileChange} />
                      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-transform">
                        <UploadCloud className="w-8 h-8 text-primary" />
                      </div>
                      <p className="font-black uppercase text-xs tracking-widest mb-2">{t.uploadButton}</p>
                      <p className="text-[9px] text-foreground/40 font-bold uppercase tracking-[0.2em]">High Res PNG/SVG Preferred</p>
                    </label>
                  ) : (
                    <div className="space-y-8">
                      <div className="p-6 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <img src={designUrl!} className="w-12 h-12 object-contain rounded-lg bg-black/20" alt="" />
                          <div>
                            <p className="font-black text-[10px] uppercase tracking-tight truncate max-w-[150px]">{designFile.name}</p>
                            <p className="text-[8px] font-bold text-primary uppercase">Active Layer</p>
                          </div>
                        </div>
                        <button onClick={() => setDesignFile(null)} className="p-2 hover:bg-white/10 rounded-xl text-foreground/30 hover:text-accent transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="space-y-6">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40">Scale Design</label>
                            <span className="text-[10px] font-black text-primary italic">{Math.round(scale * 100)}%</span>
                          </div>
                          <input
                            type="range" min={0.5} max={1.5} step={0.01} value={scale}
                            onChange={(e) => setScale(parseFloat(e.target.value))}
                            className="w-full accent-primary"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <button onClick={centerHorizontal} className="py-3 rounded-xl bg-white/5 border border-white/5 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-colors">Center H</button>
                          <button onClick={centerVertical} className="py-3 rounded-xl bg-white/5 border border-white/5 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-colors">Center V</button>
                        </div>

                        <div className="space-y-4">
                          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40">Manual Placement</label>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <p className="text-[8px] font-black text-foreground/20 uppercase">X-Axis</p>
                              <input type="number" value={offsetX} onChange={(e) => setOffsetX(parseInt(e.target.value))} className="w-full bg-white/5 border border-white/5 rounded-xl p-3 text-xs font-black outline-none focus:border-primary/50" />
                            </div>
                            <div className="space-y-2">
                              <p className="text-[8px] font-black text-foreground/20 uppercase">Y-Axis</p>
                              <input type="number" value={offsetY} onChange={(e) => setOffsetY(parseInt(e.target.value))} className="w-full bg-white/5 border border-white/5 rounded-xl p-3 text-xs font-black outline-none focus:border-primary/50" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'layers' && (
                <div className="space-y-4 animate-reveal">
                  {designFile ? (
                    <div className="p-4 rounded-2xl bg-white/5 border border-primary/20 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-black/40 flex items-center justify-center">
                        <img src={designUrl!} className="w-full h-full object-contain" alt="" />
                      </div>
                      <div className="flex-grow">
                        <p className="text-[10px] font-black uppercase tracking-tight">{designFile.name}</p>
                        <p className="text-[8px] font-bold text-foreground/20 uppercase">Main Front Print</p>
                      </div>
                      <div className="flex gap-2">
                        <button className="p-2 hover:bg-white/10 rounded-lg transition-colors"><Settings2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                  ) : (
                    <div className="py-20 text-center opacity-20">
                      <p className="text-[10px] font-black uppercase tracking-widest leading-loose">No layers active <br /> Upload an asset to begin</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Large Preview Stage */}
          <div className="flex-grow relative bg-[#0a0a0c] flex items-center justify-center p-8 overflow-hidden">
            {/* Dynamic Background */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #333 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

            <div className="relative w-full max-w-[600px] aspect-[4/5] flex items-center justify-center animate-reveal">
              {/* Safe Print Area Box */}
              <div className="absolute inset-0 border border-white/5 rounded-[3rem] pointer-events-none" />

              {/* Product Mockup Container */}
              <div className="relative w-full h-full flex items-center justify-center">
                {/* Base Color Fill */}
                <div className="absolute inset-0 rounded-[3rem] transition-colors duration-1000" style={{ backgroundColor: selectedColor }} />

                {/* Main Texture/Mockup Image */}
                {queryMockupUrl && (
                  <img
                    src={decodeURIComponent(queryMockupUrl)}
                    className="absolute inset-0 w-full h-full object-contain mix-blend-multiply opacity-80 z-10 pointer-events-none"
                    alt=""
                  />
                )}

                {/* Shadow/Lighting Overlay */}
                <div className="absolute inset-0 rounded-[3rem] bg-gradient-to-tr from-black/40 via-transparent to-white/10 mix-blend-overlay z-20 pointer-events-none" />

                {/* Print Zone Guide */}
                <div className="absolute inset-[15%] border-2 border-dashed border-white/10 rounded-2xl z-30 pointer-events-none">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1 bg-[#111] border border-white/10 rounded-full text-[7px] font-black text-white uppercase tracking-[0.4em]">
                    Print Safe Zone
                  </div>
                </div>

                {/* The Design Layer */}
                <div className="relative z-40 w-full h-full flex items-center justify-center pointer-events-none">
                  {designUrl ? (
                    <div
                      className="transition-transform duration-200 ease-out"
                      style={{ transform: `translate(${offsetX}px, ${offsetY}px) scale(${scale})` }}
                    >
                      <img src={designUrl} className="max-w-[250px] max-h-[350px] object-contain drop-shadow-2xl" alt="Custom Design" />
                    </div>
                  ) : (
                    <div className="text-center animate-pulse opacity-20">
                      <Sparkles className="w-12 h-12 mx-auto mb-4" />
                      <p className="text-[10px] font-black uppercase tracking-[0.3em]">Awaiting Creation</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Perspective Controls (Printful style) */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-50">
                {['Front', 'Back', 'Left', 'Right'].map(view => (
                  <button key={view} className="px-4 py-2 rounded-xl bg-[#111]/80 backdrop-blur-md border border-white/10 text-[8px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all">
                    {view}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Summary & Checkout */}
        <aside className="w-full lg:w-[350px] space-y-6">
          <div className="bg-[#111116] border border-white/5 rounded-[2.5rem] p-8 shadow-2xl animate-reveal">
            <h3 className="text-xs font-black uppercase tracking-[0.4em] text-primary mb-8 flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Order Summary
            </h3>

            <div className="space-y-6 mb-10">
              <div className="flex justify-between items-center">
                <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">Base Product</p>
                <p className="text-[10px] font-black uppercase tracking-tighter">{product.name}</p>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">Selected Size</p>
                <p className="text-[10px] font-black uppercase tracking-tighter">{selectedSize}</p>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">Unit Price</p>
                <p className="text-xl font-black text-primary italic">${product.price}.00</p>
              </div>
            </div>

            <div className="space-y-3 mb-10">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40">Total Quantity</label>
              <div className="flex items-center gap-4 bg-white/5 border border-white/5 rounded-2xl p-2">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="w-10 h-10 rounded-xl hover:bg-white/10 flex items-center justify-center transition-colors">-</button>
                <span className="flex-grow text-center font-black text-sm">{quantity}</span>
                <button onClick={() => setQuantity(q => q + 1)} className="w-10 h-10 rounded-xl hover:bg-white/10 flex items-center justify-center transition-colors">+</button>
              </div>
            </div>

            <div className="pt-6 border-t border-white/5 mb-8">
              <div className="flex justify-between items-end">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-foreground/20">Final Amount</p>
                <p className="text-4xl font-black tracking-tighter text-white">${product.price * quantity}.00</p>
              </div>
            </div>

            <button
              onClick={() => handleCheckout()}
              disabled={isFinishing || !designFile}
              className={`w-full py-5 rounded-2xl flex items-center justify-center gap-4 font-black text-xs uppercase tracking-[0.3em] transition-all relative overflow-hidden group/order ${isFinishing || !designFile ? 'bg-white/5 text-foreground/20 cursor-not-allowed' : 'bg-primary text-white hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-primary/20'}`}
            >
              {isFinishing ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <PackageCheck className="w-5 h-5 group-hover/order:rotate-12 transition-transform" />
                  {t.uploadCheckout}
                </>
              )}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover/order:translate-x-[100%] transition-transform duration-1000" />
            </button>
          </div>

          <div className="bg-primary/5 border border-primary/20 rounded-3xl p-6 flex items-start gap-4">
            <Sparkles className="w-5 h-5 text-primary shrink-0 mt-1" />
            <p className="text-[9px] font-bold text-primary/80 leading-relaxed uppercase tracking-wider">
              Our high-fidelity print engines ensure 99.9% color accuracy on all textile surfaces.
            </p>
          </div>
        </aside>
      </main>

      <Footer />
    </div>
  );
}

export default function UploadPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <UploadContent />
    </Suspense>
  );
}
