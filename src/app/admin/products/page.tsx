'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Package, PlusCircle, Trash2, ImageIcon, Loader2, X } from 'lucide-react';

/* ─────────── Types ─────────── */
interface Category { id: string; name: string; }
interface Product {
  id: string;
  name: string;
  category_id: string | null;
  available_colors: string[];
  sizes: string[];
  base_image_url: string | null;
  created_at: string;
}

const SIZE_OPTIONS   = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '11oz', '15oz', 'One Size'];
const COLOR_PRESETS  = ['Black', 'White', 'Red', 'Navy', 'Gray', 'Olive', 'Blue', 'Green', 'Yellow', 'Pink'];

/* ─────────── Component ─────────── */
export default function AdminProductsPage() {
  const [products,   setProducts]   = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [saving,     setSaving]     = useState(false);
  const [deleting,   setDeleting]   = useState<string | null>(null);
  const [error,      setError]      = useState<string | null>(null);
  const [success,    setSuccess]    = useState<string | null>(null);

  /* Form state */
  const [name,         setName]         = useState('');
  const [categoryId,   setCategoryId]   = useState('');
  const [colors,       setColors]       = useState<string[]>([]);
  const [colorInput,   setColorInput]   = useState('');
  const [sizes,        setSizes]        = useState<string[]>([]);
  const [baseImageUrl, setBaseImageUrl] = useState('');

  /* Fetch helpers */
  const fetchProducts = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('Product')
      .select('*')
      .order('created_at', { ascending: false });
    setProducts(data ?? []);
    setLoading(false);
  };

  const fetchCategories = async () => {
    const { data } = await supabase.from('Category').select('id, name').order('name');
    setCategories(data ?? []);
  };

  useEffect(() => {
    Promise.all([fetchProducts(), fetchCategories()]);
  }, []);

  /* Toggle helpers */
  const toggleSize = (size: string) =>
    setSizes(prev => prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]);

  const toggleColor = (color: string) =>
    setColors(prev => prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]);

  const addCustomColor = () => {
    const trimmed = colorInput.trim();
    if (trimmed && !colors.includes(trimmed)) {
      setColors(prev => [...prev, trimmed]);
    }
    setColorInput('');
  };

  /* Submit */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    setError(null);
    setSuccess(null);

    const { error } = await supabase.from('Product').insert({
      name:             name.trim(),
      category_id:      categoryId || null,
      available_colors: colors,
      sizes,
      base_image_url:   baseImageUrl.trim() || null,
    });

    if (error) {
      setError(error.message);
    } else {
      setSuccess(`Product "${name}" added successfully.`);
      setName('');
      setCategoryId('');
      setColors([]);
      setSizes([]);
      setBaseImageUrl('');
      await fetchProducts();
    }
    setSaving(false);
  };

  /* Delete */
  const handleDelete = async (id: string, productName: string) => {
    if (!confirm(`Delete product "${productName}"? This cannot be undone.`)) return;
    setDeleting(id);
    await supabase.from('Product').delete().eq('id', id);
    await fetchProducts();
    setDeleting(null);
  };

  const getCategoryName = (id: string | null) =>
    categories.find(c => c.id === id)?.name ?? '—';

  /* ─── Render ─── */
  return (
    <div className="p-8 max-w-5xl">
      {/* Page header */}
      <div className="flex items-center gap-3 mb-8">
        <Package className="w-5 h-5 text-cyan-400" />
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white">Products</h1>
          <p className="text-xs text-slate-500 mt-0.5">Add and manage printable products in your catalog.</p>
        </div>
      </div>

      {/* ── Add form ── */}
      <div className="bg-[#111116] border border-white/5 rounded-2xl p-6 mb-8">
        <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
          <PlusCircle className="w-4 h-4 text-cyan-400" /> Add New Product
        </h2>

        {error   && <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">{error}</div>}
        {success && <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">{success}</div>}

        <form id="admin-add-product-form" onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Product name */}
            <div>
              <label htmlFor="prod-name" className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-1.5">
                Product Name *
              </label>
              <input
                id="prod-name"
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Premium T-Shirt"
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-100 text-sm placeholder:text-slate-600 focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all"
              />
            </div>

            {/* Category dropdown */}
            <div>
              <label htmlFor="prod-category" className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-1.5">
                Category
              </label>
              <select
                id="prod-category"
                value={categoryId}
                onChange={e => setCategoryId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-100 text-sm focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all appearance-none"
              >
                <option value="" className="bg-[#111116]">— No category —</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id} className="bg-[#111116]">{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Base image URL */}
          <div>
            <label htmlFor="prod-image-url" className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-1.5">
              Base Image URL
            </label>
            <div className="relative">
              <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 pointer-events-none" />
              <input
                id="prod-image-url"
                type="url"
                value={baseImageUrl}
                onChange={e => setBaseImageUrl(e.target.value)}
                placeholder="https://..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-100 text-sm placeholder:text-slate-600 focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all"
              />
            </div>
          </div>

          {/* Sizes checkboxes */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">Available Sizes</p>
            <div className="flex flex-wrap gap-2">
              {SIZE_OPTIONS.map(size => (
                <button
                  key={size}
                  type="button"
                  onClick={() => toggleSize(size)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                    sizes.includes(size)
                      ? 'bg-cyan-600/20 border-cyan-500/40 text-cyan-300'
                      : 'bg-white/5 border-white/10 text-slate-500 hover:border-white/20 hover:text-slate-300'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
            {sizes.length > 0 && (
              <p className="mt-2 text-xs text-slate-600">Selected: {sizes.join(', ')}</p>
            )}
          </div>

          {/* Colors */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">Available Colors</p>
            {/* Preset swatches */}
            <div className="flex flex-wrap gap-2 mb-3">
              {COLOR_PRESETS.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => toggleColor(color)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                    colors.includes(color)
                      ? 'bg-cyan-600/20 border-cyan-500/40 text-cyan-300'
                      : 'bg-white/5 border-white/10 text-slate-500 hover:border-white/20 hover:text-slate-300'
                  }`}
                >
                  {color}
                </button>
              ))}
            </div>
            {/* Custom color input */}
            <div className="flex gap-2">
              <input
                id="prod-custom-color"
                type="text"
                value={colorInput}
                onChange={e => setColorInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCustomColor(); } }}
                placeholder="Add custom color…"
                className="flex-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-100 text-sm placeholder:text-slate-600 focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all"
              />
              <button
                type="button"
                id="prod-add-color-btn"
                onClick={addCustomColor}
                className="px-4 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-slate-200 text-sm font-medium transition-all"
              >
                Add
              </button>
            </div>
            {/* Color tags */}
            {colors.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {colors.map(c => (
                  <span key={c} className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-cyan-600/10 border border-cyan-500/20 text-cyan-300 text-xs font-semibold">
                    {c}
                    <button type="button" onClick={() => setColors(prev => prev.filter(x => x !== c))} className="hover:text-rose-400 transition-colors">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="pt-2 border-t border-white/5">
            <button
              id="admin-add-product-btn"
              type="submit"
              disabled={saving}
              className="px-8 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-sm transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {saving
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
                : <><PlusCircle className="w-4 h-4" /> Add Product</>
              }
            </button>
          </div>
        </form>
      </div>

      {/* ── Table ── */}
      <div className="bg-[#111116] border border-white/5 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400">All Products</h2>
          <span className="text-xs text-slate-600 font-medium">{products.length} total</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
          </div>
        ) : products.length === 0 ? (
          <div className="py-16 text-center text-slate-600 text-sm">No products yet. Add one above.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-600">Image</th>
                  <th className="text-left px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-600">Name</th>
                  <th className="text-left px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-600">Category</th>
                  <th className="text-left px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-600">Colors</th>
                  <th className="text-left px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-600">Sizes</th>
                  <th className="px-6 py-3" />
                </tr>
              </thead>
              <tbody>
                {products.map((prod, i) => (
                  <tr key={prod.id} className={`border-b border-white/5 hover:bg-white/5 transition-colors ${i % 2 === 0 ? '' : 'bg-white/[0.01]'}`}>
                    <td className="px-6 py-3">
                      {prod.base_image_url
                        ? <img src={prod.base_image_url} alt={prod.name} className="w-10 h-10 rounded-lg object-cover bg-white/5" />
                        : <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center"><ImageIcon className="w-4 h-4 text-slate-600" /></div>
                      }
                    </td>
                    <td className="px-6 py-3 font-semibold text-slate-200">{prod.name}</td>
                    <td className="px-6 py-3 text-slate-400">{getCategoryName(prod.category_id)}</td>
                    <td className="px-6 py-3">
                      <div className="flex flex-wrap gap-1">
                        {(prod.available_colors ?? []).slice(0, 3).map(c => (
                          <span key={c} className="px-2 py-0.5 rounded-md bg-white/5 text-slate-500 text-[10px] font-medium">{c}</span>
                        ))}
                        {(prod.available_colors ?? []).length > 3 && (
                          <span className="px-2 py-0.5 rounded-md bg-white/5 text-slate-600 text-[10px]">+{prod.available_colors.length - 3}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-3 text-slate-400 text-xs">{(prod.sizes ?? []).join(', ') || '—'}</td>
                    <td className="px-6 py-3 text-right">
                      <button
                        onClick={() => handleDelete(prod.id, prod.name)}
                        disabled={deleting === prod.id}
                        className="p-2 rounded-lg text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                      >
                        {deleting === prod.id
                          ? <Loader2 className="w-4 h-4 animate-spin" />
                          : <Trash2 className="w-4 h-4" />
                        }
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
