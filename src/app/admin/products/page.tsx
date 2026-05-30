'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useApp } from '@/lib/store';
import { 
  Package, 
  PlusCircle, 
  Trash2, 
  ImageIcon, 
  Loader2, 
  Edit, 
  X, 
  Upload, 
  Search, 
  AlertCircle, 
  Check, 
  TrendingDown, 
  AlertTriangle,
  FolderOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

/* ─────────── Types ─────────── */
interface Category {
  id: string;
  name: string;
}

interface Product {
  id: string;
  category_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  sale_price: number | null;
  sale_ends_at: string | null;
  stock: number;
  colors: string[];
  sizes: string[];
  image_url: string | null;
  images: string[];
  created_at: string;
  categories: { name: string } | null;
}

/* Helper to map color names to hex codes for premium UI color circles */
const getColorHex = (colorName: string): string | null => {
  const name = colorName.toLowerCase().trim();
  const colors: Record<string, string> = {
    noir: '#000000', black: '#000000',
    blanc: '#ffffff', white: '#ffffff',
    rouge: '#ef4444', red: '#ef4444',
    bleu: '#3b82f6', blue: '#3b82f6',
    vert: '#22c55e', green: '#22c55e',
    jaune: '#eab308', yellow: '#eab308',
    rose: '#ec4899', pink: '#ec4899',
    gris: '#6b7280', gray: '#6b7280', grey: '#6b7280',
    orange: '#f97316',
    violet: '#a855f7', purple: '#a855f7',
    marron: '#78350f', brown: '#78350f',
    gold: '#fbbf24', or: '#fbbf24',
    argent: '#cbd5e1', silver: '#cbd5e1',
    navy: '#1e3a8a', beige: '#f5f5dc'
  };
  return colors[name] || null;
};

/* ─────────── Component ─────────── */
export default function AdminProductsPage() {
  const { showToast } = useApp();
  /* Core state */
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  /* Modal state */
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  /* Form state */
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [saleEndsAt, setSaleEndsAt] = useState('');
  const [stock, setStock] = useState('');
  const [colorsInput, setColorsInput] = useState('');
  const [sizesInput, setSizesInput] = useState('');
  
  /* Image inputs: allows drag & drop file upload or direct URL fallback */
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [imagesInput, setImagesInput] = useState(''); // Extra gallery images (CSV URLs)
  const [uploadingImage, setUploadingImage] = useState(false);

  /* Search & Filter states */
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');
  const [filterPromoOnly, setFilterPromoOnly] = useState(false);
  const [filterStockStatus, setFilterStockStatus] = useState('all'); // all, in_stock, out_of_stock

  /* Local object URL preview generator */
  useEffect(() => {
    if (!imageFile) {
      setImagePreviewUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(imageFile);
    setImagePreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [imageFile]);

  /* Format datetime-local string to local timezone naive format */
  const formatDateForInput = (dateStr: string | null) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return '';
      // Correct local naive datetime input offset
      const tzOffset = d.getTimezoneOffset() * 60000;
      return new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
    } catch {
      return '';
    }
  };

  /* Active promo checker */
  const isPromoActive = (prod: Product) => {
    if (prod.sale_price === null || prod.sale_price === undefined || prod.sale_price <= 0) return false;
    if (!prod.sale_ends_at) return true;
    return new Date(prod.sale_ends_at) > new Date();
  };

  /* Expiration timer display helper */
  const getPromoTimeLeft = (prod: Product) => {
    if (!prod.sale_ends_at) return 'Illimitée';
    const now = new Date();
    const ends = new Date(prod.sale_ends_at);
    if (ends <= now) return 'Expirée';
    const diffTime = ends.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 1) return 'Fin demain';
    return `Fin dans ${diffDays} j`;
  };

  /* Data fetching methods */
  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*, categories(name)')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase fetch error:', error.message);
        setError(`Erreur lors du chargement des produits : ${error.message}`);
      } else {
        setProducts(data ?? []);
      }
    } catch (err: any) {
      console.error('Fetch products fail:', err);
      setError(err.message || 'Impossible de se connecter au serveur de base de données.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name')
        .order('name');
      if (error) {
        console.error('Supabase categories error:', error.message);
      } else {
        setCategories(data ?? []);
      }
    } catch (err) {
      console.error('Fetch categories fail:', err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  /* Pre-populate form on edit click */
  const handleEditInit = (prod: Product) => {
    setEditingId(prod.id);
    setName(prod.name);
    setSlug(prod.slug);
    setCategoryId(prod.category_id || '');
    setDescription(prod.description || '');
    setPrice(prod.price ? String(prod.price) : '');
    setSalePrice(prod.sale_price ? String(prod.sale_price) : '');
    setSaleEndsAt(prod.sale_ends_at ? formatDateForInput(prod.sale_ends_at) : '');
    setStock(prod.stock ? String(prod.stock) : '');
    
    // Primary image configurations
    setImageUrl(prod.image_url || '');
    setImageFile(null);

    // Parse secondary images out of images list
    const extraImages = prod.images && prod.images.length > 0
      ? prod.images.filter(img => img !== prod.image_url).join(', ')
      : '';
    setImagesInput(extraImages || '');
    
    setColorsInput(prod.colors && prod.colors.length > 0 ? prod.colors[0] : '');
    setSizesInput(prod.sizes ? prod.sizes.join(', ') : '');
    
    setError(null);
    setSuccess(null);
    setIsModalOpen(true);
  };

  /* Reset form states */
  const handleCancelEdit = () => {
    setEditingId(null);
    setName('');
    setSlug('');
    setCategoryId('');
    setDescription('');
    setPrice('');
    setSalePrice('');
    setSaleEndsAt('');
    setStock('');
    setImageUrl('');
    setImageFile(null);
    setImagesInput('');
    setColorsInput('');
    setSizesInput('');
    setError(null);
    setIsModalOpen(false);
  };

  const handleOpenAdd = () => {
    handleCancelEdit();
    setSuccess(null);
    setIsModalOpen(true);
  };

  /* Handle Add / Edit Submission */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    setSaving(true);
    setError(null);
    setSuccess(null);

    // Input Validations
    const productPrice = parseFloat(price);
    if (isNaN(productPrice) || productPrice < 0) {
      setError('Veuillez entrer un prix valide (supérieur ou égal à 0).');
      setSaving(false);
      return;
    }

    const productSalePrice = salePrice ? parseFloat(salePrice) : null;
    if (productSalePrice !== null && (isNaN(productSalePrice) || productSalePrice < 0)) {
      setError('Veuillez entrer un prix promotionnel valide.');
      setSaving(false);
      return;
    }

    if (productSalePrice !== null && productSalePrice >= productPrice) {
      setError('Le prix de promotion doit être inférieur au prix normal.');
      setSaving(false);
      return;
    }

    const productStock = parseInt(stock);
    if (isNaN(productStock) || productStock < 0) {
      setError('Le stock doit être un nombre entier positif.');
      setSaving(false);
      return;
    }

    // Auto-generate slug if empty
    const productSlug = slug.trim() || name.trim().toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Comma-separated array parser
    const colorsArray = colorsInput
      .split(',')
      .map(c => c.trim())
      .filter(c => c.length > 0);

    const sizesArray = sizesInput
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    let finalImageUrl = imageUrl;

    try {
      // 1. Upload main image to storage if selected
      if (imageFile) {
        setUploadingImage(true);
        const filePath = `${Date.now()}-${imageFile.name}`;
        
        // Storage upload
        const { error: uploadError } = await supabase.storage
          .from('assets')
          .upload(filePath, imageFile);

        if (uploadError) {
          console.error("Supabase Storage error details:", uploadError);
          showToast(`Échec de l'upload : ${uploadError.message}`, "error");
          throw new Error(`Échec de l'upload de l'image : ${uploadError.message}`);
        }

        // Retrieve public URL
        const { data } = supabase.storage
          .from('assets')
          .getPublicUrl(filePath);
        
        finalImageUrl = data.publicUrl;
        setUploadingImage(false);
      }

      // 2. Parse extra gallery images
      const extraImagesArray = imagesInput
        .split(',')
        .map(img => img.trim())
        .filter(img => img.length > 0);

      // Main image goes first inside the images array, then secondary images
      const imagesArray = finalImageUrl
        ? [finalImageUrl, ...extraImagesArray.filter(img => img !== finalImageUrl)]
        : extraImagesArray;

      // 3. Construct database payload
      const payload = {
        name: name.trim(),
        slug: productSlug,
        category_id: categoryId || null,
        description: description.trim() || null,
        price: productPrice,
        sale_price: productSalePrice,
        sale_ends_at: saleEndsAt ? new Date(saleEndsAt).toISOString() : null,
        stock: productStock,
        image_url: finalImageUrl || null,
        images: imagesArray,
        colors: colorsArray,
        sizes: sizesArray,
      };

      let responseError;
      if (editingId) {
        const { error: updateErr } = await supabase
          .from('products')
          .update(payload)
          .eq('id', editingId);
        responseError = updateErr;
      } else {
        const { error: insertErr } = await supabase
          .from('products')
          .insert([payload]);
        responseError = insertErr;
      }

      if (responseError) {
        throw new Error(responseError.message);
      }

      const successMsg = editingId 
        ? `Le produit "${name}" a été mis à jour avec succès.` 
        : `Le produit "${name}" a été créé avec succès.`;
      setSuccess(successMsg);
      showToast(successMsg, "success");
      handleCancelEdit();
      await fetchProducts();

    } catch (err: any) {
      console.error('Save query failed:', err);
      const errMsg = err.message || 'Une erreur inattendue est survenue lors de la sauvegarde.';
      setError(errMsg);
      showToast(errMsg, "error");
    } finally {
      setSaving(false);
      setUploadingImage(false);
    }
  };

  /* Delete handler */
  const handleDelete = async (id: string, productName: string) => {
    if (!confirm(`Voulez-vous vraiment supprimer le produit "${productName}" ? Cette action est irréversible.`)) {
      return;
    }
    setDeleting(id);
    setError(null);
    setSuccess(null);
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(error.message);
      }

      setSuccess(`Le produit "${productName}" a été définitivement retiré du catalogue.`);
      await fetchProducts();
    } catch (err: any) {
      console.error('Delete query failed:', err);
      setError(`Erreur lors de la suppression : ${err.message}`);
    } finally {
      setDeleting(null);
    }
  };

  /* Front-end Filtering logic */
  const filteredProducts = products.filter(prod => {
    // 1. Text Search matching name, slug, description, or sizes/colors
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      prod.name.toLowerCase().includes(searchLower) ||
      prod.slug.toLowerCase().includes(searchLower) ||
      (prod.description || '').toLowerCase().includes(searchLower);

    // 2. Category selection filtering
    const matchesCategory = 
      selectedCategoryFilter === 'all' || 
      prod.category_id === selectedCategoryFilter;

    // 3. Promo active status filtering
    const matchesPromo = !filterPromoOnly || isPromoActive(prod);

    // 4. Stock status filtering
    const matchesStock = 
      filterStockStatus === 'all' || 
      (filterStockStatus === 'in_stock' && prod.stock > 0) || 
      (filterStockStatus === 'out_of_stock' && prod.stock === 0);

    return matchesSearch && matchesCategory && matchesPromo && matchesStock;
  });

  /* Calculate dashboard metrics */
  const totalCount = products.length;
  const activePromosCount = products.filter(isPromoActive).length;
  const outOfStockCount = products.filter(p => p.stock <= 0).length;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto pb-20 selection:bg-emerald-500/30">
      
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/5">
            <Package className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white uppercase">Produits</h1>
            <p className="text-xs md:text-sm font-semibold text-slate-400 uppercase tracking-widest">Gérez vos stocks, promotions et images</p>
          </div>
        </div>
        
        <button 
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 px-6 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-emerald-500/20"
        >
          <PlusCircle className="w-4 h-4" /> Ajouter un produit
        </button>
      </div>

      {/* ── Stats widgets ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-zinc-900 border border-white/5 p-6 rounded-2xl flex items-center gap-4 shadow-xl">
          <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
            <Package className="w-6 h-6 text-slate-300" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Produits</p>
            <p className="text-2xl font-black text-white italic mt-1">{totalCount}</p>
          </div>
        </div>

        <div className="bg-zinc-900 border border-white/5 p-6 rounded-2xl flex items-center gap-4 shadow-xl">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0 border border-amber-500/20">
            <TrendingDown className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Promotions Actives</p>
            <p className="text-2xl font-black text-amber-400 italic mt-1">{activePromosCount}</p>
          </div>
        </div>

        <div className="bg-zinc-900 border border-white/5 p-6 rounded-2xl flex items-center gap-4 shadow-xl">
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center shrink-0 border border-rose-500/20">
            <AlertTriangle className="w-6 h-6 text-rose-400" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Ruptures de stock</p>
            <p className="text-2xl font-black text-rose-400 italic mt-1">{outOfStockCount}</p>
          </div>
        </div>
      </div>

      {/* ── Status Messages (Toasts) ── */}
      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-medium flex items-center justify-between shadow-lg"
          >
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
            <button onClick={() => setError(null)} className="p-1.5 hover:bg-white/5 rounded-lg text-rose-400 hover:text-rose-300 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {success && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium flex items-center justify-between shadow-lg"
          >
            <div className="flex items-center gap-3">
              <Check className="w-5 h-5 shrink-0" />
              <span>{success}</span>
            </div>
            <button onClick={() => setSuccess(null)} className="p-1.5 hover:bg-white/5 rounded-lg text-emerald-400 hover:text-emerald-300 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Search & Filter Panel ── */}
      <div className="bg-zinc-900 border border-white/5 rounded-2xl p-5 mb-8 shadow-xl flex flex-col lg:flex-row gap-5 items-stretch lg:items-center">
        
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Rechercher par nom, slug ou description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-black/40 border border-white/10 hover:border-white/20 rounded-xl py-3 pl-11 pr-4 text-white text-sm outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all font-medium"
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')} 
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 bg-white/5 hover:bg-white/10 rounded-md text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:w-[60%]">
          
          {/* Category Selector */}
          <select 
            value={selectedCategoryFilter} 
            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
            className="bg-black/40 border border-white/10 hover:border-white/20 rounded-xl px-4 py-3 text-slate-300 hover:text-white text-sm outline-none focus:border-emerald-500/50 transition-all cursor-pointer font-bold"
          >
            <option value="all" className="bg-zinc-900">Toutes catégories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id} className="bg-zinc-900">{cat.name}</option>
            ))}
          </select>

          {/* Stock Filter */}
          <select 
            value={filterStockStatus} 
            onChange={(e) => setFilterStockStatus(e.target.value)}
            className="bg-black/40 border border-white/10 hover:border-white/20 rounded-xl px-4 py-3 text-slate-300 hover:text-white text-sm outline-none focus:border-emerald-500/50 transition-all cursor-pointer font-bold"
          >
            <option value="all" className="bg-zinc-900">Tous les stocks</option>
            <option value="in_stock" className="bg-zinc-900">En stock uniquement</option>
            <option value="out_of_stock" className="bg-zinc-900">Ruptures de stock</option>
          </select>

          {/* Promotions Toggle */}
          <button
            onClick={() => setFilterPromoOnly(!filterPromoOnly)}
            className={`px-4 py-3 rounded-xl border text-sm font-bold transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-2 ${
              filterPromoOnly 
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 shadow-md shadow-amber-500/5' 
                : 'bg-black/40 border-white/10 hover:border-white/20 text-slate-400 hover:text-slate-200'
            }`}
          >
            <TrendingDown className="w-4 h-4 shrink-0" />
            Promo Uniquement
          </button>

        </div>
      </div>

      {/* ── Products List Table ── */}
      <div className="bg-zinc-900 border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
        <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between bg-black/20">
          <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tous les produits</h2>
          <span className="text-[10px] text-emerald-500 font-black uppercase tracking-widest bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
            {filteredProducts.length} filtrés / {products.length} total
          </span>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
            <p className="text-xs font-black uppercase tracking-widest text-slate-500 animate-pulse">Chargement du catalogue...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-24 text-center">
            <FolderOpen className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-sm font-black uppercase tracking-widest text-slate-500">Aucun produit ne correspond à vos filtres</p>
          </div>
        ) : (
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-sm min-w-[1050px]">
              <thead>
                <tr className="border-b border-white/5 bg-black/20 text-slate-400">
                  <th className="text-left px-6 py-4 text-[10px] font-black uppercase tracking-widest">Image</th>
                  <th className="text-left px-6 py-4 text-[10px] font-black uppercase tracking-widest">Nom / Slug</th>
                  <th className="text-left px-6 py-4 text-[10px] font-black uppercase tracking-widest">Catégorie</th>
                  <th className="text-right px-6 py-4 text-[10px] font-black uppercase tracking-widest">Prix</th>
                  <th className="text-center px-6 py-4 text-[10px] font-black uppercase tracking-widest">Stock</th>
                  <th className="text-left px-6 py-4 text-[10px] font-black uppercase tracking-widest">Tailles / Couleurs</th>
                  <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredProducts.map((prod) => {
                  const hasPromo = isPromoActive(prod);
                  return (
                    <tr key={prod.id} className="hover:bg-white/[0.015] transition-colors group">
                      
                      {/* Product Thumbnail */}
                      <td className="px-6 py-4">
                        {prod.image_url ? (
                          <div className="relative w-14 h-14 rounded-xl overflow-hidden border border-white/10 bg-black/40 shadow-inner group-hover:border-emerald-500/30 transition-all shrink-0">
                            <img src={prod.image_url} alt={prod.name} className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="w-14 h-14 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 shrink-0">
                            <ImageIcon className="w-5 h-5 text-slate-600" />
                          </div>
                        )}
                      </td>

                      {/* Name & Slug */}
                      <td className="px-6 py-4">
                        <div className="text-xs font-bold text-white mb-1 group-hover:text-emerald-400 transition-colors leading-relaxed">
                          {prod.name}
                        </div>
                        <div className="font-mono text-[9px] text-slate-500 select-all mb-1.5">{prod.slug}</div>
                        {hasPromo && (
                          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            <TrendingDown className="w-2.5 h-2.5" />
                            Promo ({getPromoTimeLeft(prod)})
                          </div>
                        )}
                      </td>

                      {/* Category */}
                      <td className="px-6 py-4">
                        <span className="inline-block px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest text-slate-300 bg-white/5 border border-white/5">
                          {prod.categories?.name ?? '— Non classé'}
                        </span>
                      </td>

                      {/* Price & Promo Price */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex flex-col items-end gap-0.5">
                          <span className={`text-xs font-black italic ${hasPromo ? 'line-through text-slate-500 text-[10px]' : 'text-emerald-400'}`}>
                            {Number(prod.price).toFixed(2)} MAD
                          </span>
                          {hasPromo && (
                            <span className="text-xs font-black italic text-amber-400 bg-amber-500/5 px-2 py-0.5 rounded border border-amber-500/10">
                              {Number(prod.sale_price).toFixed(2)} MAD
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Stock indicator badge */}
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-block text-[9px] font-black uppercase tracking-widest px-2.5 py-1.5 rounded-lg border ${
                          prod.stock > 10 
                            ? 'bg-emerald-500/5 text-emerald-400 border-emerald-500/10' 
                            : prod.stock > 0
                              ? 'bg-amber-500/5 text-amber-400 border-amber-500/10'
                              : 'bg-rose-500/5 text-rose-400 border-rose-500/10'
                        }`}>
                          {prod.stock > 0 ? `${prod.stock} unités` : 'Rupture'}
                        </span>
                      </td>

                      {/* Sizes & Colors tags */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-2 max-w-[200px]">
                          {/* Sizes */}
                          <div className="flex flex-wrap gap-1">
                            {prod.sizes && prod.sizes.length > 0 ? (
                              prod.sizes.map(sz => (
                                <span key={sz} className="px-1.5 py-0.5 rounded bg-white/5 border border-white/5 text-slate-400 text-[8px] font-black uppercase tracking-widest">{sz}</span>
                              ))
                            ) : (
                              <span className="text-[8px] text-slate-600 font-bold uppercase tracking-wider">— Sans tailles</span>
                            )}
                          </div>
                          {/* Colors */}
                          <div className="flex flex-wrap gap-1.5">
                            {prod.colors && prod.colors.length > 0 ? (
                              prod.colors.map(col => {
                                const hex = getColorHex(col);
                                return (
                                  <span key={col} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-black/35 border border-white/5 text-slate-300 text-[8px] font-bold uppercase tracking-widest">
                                    {hex && <span className="w-1.5 h-1.5 rounded-full border border-white/10" style={{ backgroundColor: hex }} />}
                                    {col}
                                  </span>
                                );
                              })
                            ) : (
                              <span className="text-[8px] text-slate-600 font-bold uppercase tracking-wider">— Sans couleurs</span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Action buttons */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEditInit(prod)}
                            className="p-2 rounded-xl text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all border border-transparent hover:border-emerald-500/20 active:scale-95"
                            title="Modifier ce produit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={() => handleDelete(prod.id, prod.name)}
                            disabled={deleting === prod.id}
                            className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all border border-transparent hover:border-rose-500/20 active:scale-95 disabled:opacity-50"
                            title="Supprimer ce produit"
                          >
                            {deleting === prod.id ? (
                              <Loader2 className="w-4 h-4 animate-spin text-rose-400" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Add / Edit Form Modal ── */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={handleCancelEdit}
              className="absolute inset-0 bg-black/75 backdrop-blur-md"
            />
            
            {/* Modal Box */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-4xl bg-zinc-950 border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              
              {/* Modal Header */}
              <div className="p-6 border-b border-white/5 flex items-center justify-between bg-zinc-900/50">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    {editingId ? <Edit className="w-4.5 h-4.5 text-emerald-400" /> : <PlusCircle className="w-4.5 h-4.5 text-emerald-400" />}
                  </div>
                  <h2 className="text-xs font-black uppercase tracking-widest text-emerald-400">
                    {editingId ? 'Modifier le produit' : 'Nouveau produit catalogue'}
                  </h2>
                </div>
                <button 
                  onClick={handleCancelEdit} 
                  className="p-2 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-xl transition-colors"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              {/* Scrollable Container */}
              <div className="p-6 overflow-y-auto scrollbar-thin space-y-6">
                
                {/* Local Modal Warnings */}
                {error && (
                  <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold flex items-center gap-2.5">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}
                
                <form id="admin-product-form" onSubmit={handleSubmit} className="space-y-6">
                  
                  {/* Image Pickers Section */}
                  <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-5 space-y-4">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-white/5 pb-2">Image Principale</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
                      
                      {/* Image Preview */}
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Aperçu du produit</label>
                        {imageUrl ? (
                          <div className="relative rounded-xl overflow-hidden border border-white/10 aspect-video max-h-[160px] bg-black/40 flex items-center justify-center">
                            <img
                              src={imageUrl}
                              alt="Aperçu du produit"
                              className="h-full w-full object-contain"
                            />
                          </div>
                        ) : (
                          <div className="border border-white/10 rounded-xl p-6 bg-white/[0.015] text-center flex flex-col items-center justify-center gap-2 min-h-[130px]">
                            <ImageIcon className="w-7 h-7 text-slate-600" />
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                              Aucune image chargée
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Manual Image URL Input */}
                      <div className="space-y-4">
                        <div>
                          <label htmlFor="prod-image-url" className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
                            Lien direct (URL)
                          </label>
                          <input
                            id="prod-image-url"
                            type="text"
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            placeholder="https://images.unsplash.com/photo-..."
                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:border-emerald-500/50 outline-none transition-all"
                          />
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Core Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Name */}
                    <div>
                      <label htmlFor="prod-name" className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Nom du produit *</label>
                      <input 
                        id="prod-name" 
                        type="text" 
                        required 
                        value={name} 
                        onChange={e => setName(e.target.value)} 
                        placeholder="Ex: T-shirt Oversize Premium" 
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:border-emerald-500/50 outline-none transition-all" 
                      />
                    </div>

                    {/* Slug */}
                    <div>
                      <label htmlFor="prod-slug" className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Slug <span className="text-slate-600">(auto-généré si vide)</span></label>
                      <input 
                        id="prod-slug" 
                        type="text" 
                        value={slug} 
                        onChange={e => setSlug(e.target.value)} 
                        placeholder="t-shirt-oversize-premium" 
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:border-emerald-500/50 outline-none transition-all font-mono" 
                      />
                    </div>

                    {/* Category Selection */}
                    <div>
                      <label htmlFor="prod-category" className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Catégorie</label>
                      <select 
                        id="prod-category" 
                        value={categoryId} 
                        onChange={e => setCategoryId(e.target.value)} 
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:border-emerald-500/50 outline-none transition-all cursor-pointer"
                      >
                        <option value="" className="bg-zinc-950">— Aucune —</option>
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.id} className="bg-zinc-950">{cat.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Stock */}
                    <div>
                      <label htmlFor="prod-stock" className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Stock disponible *</label>
                      <input 
                        id="prod-stock" 
                        type="number" 
                        required
                        min="0"
                        value={stock} 
                        onChange={e => setStock(e.target.value)} 
                        placeholder="150" 
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:border-emerald-500/50 outline-none transition-all" 
                      />
                    </div>

                    {/* Price */}
                    <div>
                      <label htmlFor="prod-price" className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Prix (Normal, MAD) *</label>
                      <input 
                        id="prod-price" 
                        type="number" 
                        step="0.01" 
                        required 
                        min="0"
                        value={price} 
                        onChange={e => setPrice(e.target.value)} 
                        placeholder="299.00" 
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:border-emerald-500/50 outline-none transition-all font-semibold text-emerald-400" 
                      />
                    </div>

                    {/* Sale Price */}
                    <div>
                      <label htmlFor="prod-sale-price" className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Prix promotionnel (MAD) <span className="text-slate-600">(optionnel)</span></label>
                      <input 
                        id="prod-sale-price" 
                        type="number" 
                        step="0.01" 
                        min="0"
                        value={salePrice} 
                        onChange={e => setSalePrice(e.target.value)} 
                        placeholder="199.00" 
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:border-emerald-500/50 outline-none transition-all font-semibold text-amber-400" 
                      />
                    </div>

                    {/* Sale Ends At */}
                    <div className="md:col-span-2">
                      <label htmlFor="prod-sale-ends-at" className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Date d'expiration de la promotion <span className="text-slate-600">(optionnel)</span></label>
                      <input 
                        id="prod-sale-ends-at" 
                        type="datetime-local" 
                        value={saleEndsAt} 
                        onChange={e => setSaleEndsAt(e.target.value)} 
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:border-emerald-500/50 outline-none transition-all cursor-pointer font-medium" 
                      />
                    </div>
                  </div>

                  {/* Secondary Image Gallery */}
                  <div>
                    <label htmlFor="prod-images-gallery" className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
                      Galerie additionnelle (URLs séparées par des virgules)
                    </label>
                    <input 
                      id="prod-images-gallery" 
                      type="text" 
                      value={imagesInput} 
                      onChange={e => setImagesInput(e.target.value)} 
                      placeholder="https://image1.jpg, https://image2.jpg..." 
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:border-emerald-500/50 outline-none transition-all" 
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label htmlFor="prod-description" className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Description complète</label>
                    <textarea 
                      id="prod-description" 
                      rows={3} 
                      value={description} 
                      onChange={e => setDescription(e.target.value)} 
                      placeholder="Description détaillée du produit, coupe, conseils d'entretien..."
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:border-emerald-500/50 outline-none transition-all resize-y" 
                    />
                  </div>

                  {/* Attributes (Colors & Sizes CSV) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-zinc-900/30 p-5 border border-white/5 rounded-2xl">
                    <div>
                      <label htmlFor="prod-colors" className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
                        Couleur principale
                      </label>
                      <input 
                        id="prod-colors" 
                        type="text" 
                        value={colorsInput} 
                        onChange={e => setColorsInput(e.target.value)} 
                        placeholder="Ex: Noir (ou Blanc, Rouge...)" 
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:border-emerald-500/50 outline-none transition-all" 
                      />
                      <span className="inline-block text-[8px] text-slate-500 mt-2 leading-relaxed">
                        Entrez une seule couleur principale pour ce produit.
                      </span>
                    </div>

                    <div>
                      <label htmlFor="prod-sizes" className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 flex items-center justify-between">
                        <span>Tailles</span>
                        <span className="text-slate-600 font-bold uppercase tracking-wider">(saisie CSV)</span>
                      </label>
                      <input 
                        id="prod-sizes" 
                        type="text" 
                        value={sizesInput} 
                        onChange={e => setSizesInput(e.target.value)} 
                        placeholder="S, M, L, XL, XXL" 
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:border-emerald-500/50 outline-none transition-all" 
                      />
                      <span className="inline-block text-[8px] text-slate-500 mt-2 leading-relaxed">
                        Entrez les tailles (ex: S, M, L, 42, 43) séparées par des virgules.
                      </span>
                    </div>
                  </div>

                </form>
              </div>
              
              {/* Modal Footer Controls */}
              <div className="p-6 border-t border-white/5 bg-zinc-900/50 flex justify-end gap-3 shrink-0">
                <button 
                  type="button" 
                  onClick={handleCancelEdit} 
                  disabled={saving || uploadingImage}
                  className="px-6 py-4 rounded-xl text-xs font-black uppercase tracking-widest text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors disabled:opacity-50"
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  form="admin-product-form" 
                  disabled={saving || uploadingImage} 
                  className="px-6 py-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-widest transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-emerald-600/20 active:scale-98"
                >
                  {saving || uploadingImage ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> 
                      <span>Enregistrement...</span>
                    </>
                  ) : (
                    <>
                      <Package className="w-4 h-4" /> 
                      <span>Enregistrer</span>
                    </>
                  )}
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
