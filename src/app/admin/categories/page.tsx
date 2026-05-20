'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Tag, PlusCircle, Trash2, ImageIcon, Loader2 } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  image_url: string | null;
  created_at: string;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [deleting, setDeleting]     = useState<string | null>(null);
  const [error, setError]           = useState<string | null>(null);
  const [success, setSuccess]       = useState<string | null>(null);

  const [name, setName]         = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const fetchCategories = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('Category')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error) setCategories(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    setError(null);
    setSuccess(null);

    const { error } = await supabase
      .from('Category')
      .insert({ name: name.trim(), image_url: imageUrl.trim() || null });

    if (error) {
      setError(error.message);
    } else {
      setSuccess(`Category "${name}" added successfully.`);
      setName('');
      setImageUrl('');
      await fetchCategories();
    }
    setSaving(false);
  };

  const handleDelete = async (id: string, catName: string) => {
    if (!confirm(`Delete category "${catName}"? This cannot be undone.`)) return;
    setDeleting(id);
    await supabase.from('Category').delete().eq('id', id);
    await fetchCategories();
    setDeleting(null);
  };

  return (
    <div className="p-8 max-w-5xl">
      {/* Page header */}
      <div className="flex items-center gap-3 mb-8">
        <Tag className="w-5 h-5 text-violet-400" />
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white">Categories</h1>
          <p className="text-xs text-slate-500 mt-0.5">Manage product categories displayed across the store.</p>
        </div>
      </div>

      {/* ── Add form ── */}
      <div className="bg-[#111116] border border-white/5 rounded-2xl p-6 mb-8">
        <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-5 flex items-center gap-2">
          <PlusCircle className="w-4 h-4 text-violet-400" /> Add New Category
        </h2>

        {error   && <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">{error}</div>}
        {success && <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">{success}</div>}

        <form id="admin-add-category-form" onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-4 items-end">
          {/* Name */}
          <div>
            <label htmlFor="cat-name" className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-1.5">
              Category Name *
            </label>
            <input
              id="cat-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. T-Shirts"
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-100 text-sm placeholder:text-slate-600 focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 outline-none transition-all"
            />
          </div>

          {/* Image URL */}
          <div>
            <label htmlFor="cat-image-url" className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-1.5">
              Image URL
            </label>
            <div className="relative">
              <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 pointer-events-none" />
              <input
                id="cat-image-url"
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-100 text-sm placeholder:text-slate-600 focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 outline-none transition-all"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            id="admin-add-category-btn"
            type="submit"
            disabled={saving}
            className="h-10 px-6 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-sm transition-all disabled:opacity-50 flex items-center gap-2 whitespace-nowrap"
          >
            {saving
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
              : <><PlusCircle className="w-4 h-4" /> Add Category</>
            }
          </button>
        </form>
      </div>

      {/* ── Table ── */}
      <div className="bg-[#111116] border border-white/5 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400">All Categories</h2>
          <span className="text-xs text-slate-600 font-medium">{categories.length} total</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 text-violet-400 animate-spin" />
          </div>
        ) : categories.length === 0 ? (
          <div className="py-16 text-center text-slate-600 text-sm">No categories yet. Add one above.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-600">Preview</th>
                <th className="text-left px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-600">Name</th>
                <th className="text-left px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-600">ID</th>
                <th className="text-left px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-600">Created</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody>
              {categories.map((cat, i) => (
                <tr key={cat.id} className={`border-b border-white/5 hover:bg-white/5 transition-colors ${i % 2 === 0 ? '' : 'bg-white/[0.01]'}`}>
                  <td className="px-6 py-3">
                    {cat.image_url
                      ? <img src={cat.image_url} alt={cat.name} className="w-10 h-10 rounded-lg object-cover bg-white/5" />
                      : <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center"><ImageIcon className="w-4 h-4 text-slate-600" /></div>
                    }
                  </td>
                  <td className="px-6 py-3 font-semibold text-slate-200">{cat.name}</td>
                  <td className="px-6 py-3 font-mono text-xs text-slate-600">{cat.id.substring(0, 8)}…</td>
                  <td className="px-6 py-3 text-slate-500">{new Date(cat.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-3 text-right">
                    <button
                      onClick={() => handleDelete(cat.id, cat.name)}
                      disabled={deleting === cat.id}
                      className="p-2 rounded-lg text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                    >
                      {deleting === cat.id
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : <Trash2 className="w-4 h-4" />
                      }
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
