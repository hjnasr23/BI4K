'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useApp } from '@/lib/store';
import { 
  Tag, 
  PlusCircle, 
  Trash2, 
  Edit, 
  X, 
  ImageIcon, 
  Loader2, 
  Upload, 
  Search, 
  Calendar, 
  FolderOpen, 
  AlertCircle, 
  Check 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

/* ─────────── Types ─────────── */
interface Category {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
  created_at: string;
}

/* ─────────── Component ─────────── */
export default function AdminCategoriesPage() {
  const { showToast } = useApp();
  /* Core state */
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
  
  /* Image upload states */
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  /* Filter/Search state */
  const [searchTerm, setSearchTerm] = useState('');

  /* Generate image object url preview when file changes */
  useEffect(() => {
    if (!imageFile) {
      setImagePreviewUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(imageFile);
    setImagePreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [imageFile]);

  /* Format timestamp to French readable date format */
  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  /* Fetch categories */
  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) {
        throw new Error(error.message);
      }
      setCategories(data ?? []);
    } catch (err: any) {
      console.error('Fetch categories fail:', err);
      setError(err.message || 'Erreur lors du chargement des catégories.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  /* Prepopulate for edit */
  const handleEditInit = (cat: Category) => {
    setEditingId(cat.id);
    setName(cat.name);
    setSlug(cat.slug);
    setImageUrl(cat.image_url || '');
    setImageFile(null);
    setError(null);
    setSuccess(null);
    setIsModalOpen(true);
  };

  /* Reset form fields */
  const handleCancelEdit = () => {
    setEditingId(null);
    setName('');
    setSlug('');
    setImageUrl('');
    setImageFile(null);
    setError(null);
    setIsModalOpen(false);
  };

  const handleOpenAdd = () => {
    handleCancelEdit();
    setSuccess(null);
    setIsModalOpen(true);
  };

  /* Submit handler */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    setError(null);
    setSuccess(null);

    // Auto-generate slug if left blank
    const categorySlug = slug.trim() || name.trim().toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    let finalImageUrl = imageUrl;

    try {
      // 1. Upload category icon/image if selected
      if (imageFile) {
        setUploadingImage(true);
        const filePath = `${Date.now()}-${imageFile.name}`;

        const { error: uploadError } = await supabase.storage
          .from('assets')
          .upload(filePath, imageFile);

        if (uploadError) {
          console.error("Storage upload details:", uploadError);
          showToast(`Échec de l'upload : ${uploadError.message}`, "error");
          throw new Error(`Échec de l'upload de l'image : ${uploadError.message}`);
        }

        const { data } = supabase.storage
          .from('assets')
          .getPublicUrl(filePath);

        finalImageUrl = data.publicUrl;
        setUploadingImage(false);
      }

      // 2. Database payload construct
      const payload = {
        name: name.trim(),
        slug: categorySlug,
        image_url: finalImageUrl || null
      };

      let responseError;
      if (editingId) {
        const { error: updateErr } = await supabase
          .from('categories')
          .update(payload)
          .eq('id', editingId);
        responseError = updateErr;
      } else {
        const { error: insertErr } = await supabase
          .from('categories')
          .insert([payload]);
        responseError = insertErr;
      }

      if (responseError) {
        throw new Error(responseError.message);
      }

      const successMsg = editingId 
        ? `La catégorie "${name}" a été modifiée avec succès.` 
        : `La catégorie "${name}" a été ajoutée avec succès.`;
      setSuccess(successMsg);
      showToast(successMsg, "success");
      handleCancelEdit();
      await fetchCategories();

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

  /* Delete query execution */
  const handleDelete = async (id: string, catName: string) => {
    if (!confirm(`Voulez-vous vraiment supprimer la catégorie "${catName}" ? Tout produit lié n'aura plus de catégorie.`)) {
      return;
    }
    setDeleting(id);
    setError(null);
    setSuccess(null);
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(error.message);
      }

      setSuccess(`La catégorie "${catName}" a été définitivement supprimée.`);
      await fetchCategories();
    } catch (err: any) {
      console.error('Delete category failed:', err);
      setError(`Erreur lors de la suppression : ${err.message}`);
    } finally {
      setDeleting(null);
    }
  };

  /* Filter categories list */
  const filteredCategories = categories.filter(cat => 
    cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto pb-20 selection:bg-emerald-500/30">
      
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/5">
            <Tag className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white uppercase">Catégories</h1>
            <p className="text-xs md:text-sm font-semibold text-slate-400 uppercase tracking-widest">Gérez la taxonomie et classification de vos produits</p>
          </div>
        </div>
        
        <button 
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 px-6 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-emerald-500/20"
        >
          <PlusCircle className="w-4 h-4" /> Ajouter une catégorie
        </button>
      </div>

      {/* ── Alerts ── */}
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

      {/* ── Search Bar ── */}
      <div className="bg-zinc-900 border border-white/5 rounded-2xl p-5 mb-8 shadow-xl">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Rechercher une catégorie par nom ou slug..."
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
      </div>

      {/* ── Table Grid ── */}
      <div className="bg-zinc-900 border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
        <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between bg-black/20">
          <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Toutes les catégories</h2>
          <span className="text-[10px] text-emerald-500 font-black uppercase tracking-widest bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
            {filteredCategories.length} total
          </span>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
            <p className="text-xs font-black uppercase tracking-widest text-slate-500 animate-pulse">Chargement...</p>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="py-20 text-center">
            <FolderOpen className="w-10 h-10 text-slate-600 mx-auto mb-4" />
            <p className="text-sm font-black uppercase tracking-widest text-slate-500">Aucune catégorie trouvée</p>
          </div>
        ) : (
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-sm min-w-[700px]">
              <thead>
                <tr className="border-b border-white/5 bg-black/20 text-slate-400">
                  <th className="text-left px-6 py-4 text-[10px] font-black uppercase tracking-widest w-[100px]">Image</th>
                  <th className="text-left px-6 py-4 text-[10px] font-black uppercase tracking-widest">Nom de la catégorie</th>
                  <th className="text-left px-6 py-4 text-[10px] font-black uppercase tracking-widest">Slug (ID Unique)</th>
                  <th className="text-left px-6 py-4 text-[10px] font-black uppercase tracking-widest">Date de création</th>
                  <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-widest w-[120px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredCategories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-white/[0.015] transition-colors group">
                    
                    {/* Category Image */}
                    <td className="px-6 py-4">
                      {cat.image_url ? (
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-white/10 bg-black/40 shadow-inner group-hover:border-emerald-500/30 transition-all shrink-0">
                          <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 shrink-0">
                          <ImageIcon className="w-4 h-4 text-slate-600" />
                        </div>
                      )}
                    </td>

                    {/* Name */}
                    <td className="px-6 py-4 font-bold text-white group-hover:text-emerald-400 transition-colors">
                      {cat.name}
                    </td>

                    {/* Slug */}
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs text-slate-400 select-all">{cat.slug}</span>
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4 text-slate-400 flex items-center gap-1.5 py-7">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span className="text-xs font-medium">{formatDate(cat.created_at)}</span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEditInit(cat)}
                          className="p-2 rounded-xl text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all border border-transparent hover:border-emerald-500/20 active:scale-95"
                          title="Modifier"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => handleDelete(cat.id, cat.name)}
                          disabled={deleting === cat.id}
                          className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all border border-transparent hover:border-rose-500/20 active:scale-95 disabled:opacity-50"
                          title="Supprimer"
                        >
                          {deleting === cat.id ? (
                            <Loader2 className="w-4 h-4 animate-spin text-rose-400" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Modal Add / Edit ── */}
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
            
            {/* Modal Body */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-2xl bg-zinc-950 border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              
              {/* Header */}
              <div className="p-6 border-b border-white/5 flex items-center justify-between bg-zinc-900/50">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <Tag className="w-4.5 h-4.5 text-emerald-400" />
                  </div>
                  <h2 className="text-xs font-black uppercase tracking-widest text-emerald-400">
                    {editingId ? 'Modifier la catégorie' : 'Nouvelle catégorie de produit'}
                  </h2>
                </div>
                <button 
                  onClick={handleCancelEdit} 
                  className="p-2 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-xl transition-colors"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              {/* Form Scroll Container */}
              <div className="p-6 overflow-y-auto scrollbar-thin space-y-6">
                
                {error && (
                  <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold flex items-center gap-2.5">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}
                
                <form id="admin-category-form" onSubmit={handleSubmit} className="space-y-6">
                  
                  {/* Category Image Picker */}
                  <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-5 space-y-4">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-white/5 pb-2">Vignette Catégorie</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
                      
                      {/* Drag & Drop zone */}
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Image de la catégorie</label>
                        {imagePreviewUrl || imageUrl ? (
                          <div className="relative group rounded-xl overflow-hidden border border-white/10 aspect-video max-h-[140px] bg-black/40 flex items-center justify-center">
                            <img
                              src={imagePreviewUrl || imageUrl || ''}
                              alt="Aperçu catégorie"
                              className="h-full w-full object-contain"
                            />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              {imageFile ? (
                                <button
                                  type="button"
                                  onClick={() => setImageFile(null)}
                                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-[9px] font-black uppercase tracking-widest rounded-xl transition-all"
                                >
                                  Retirer le fichier
                                </button>
                              ) : (
                                <span className="text-[8px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                                  Image sauvegardée
                                </span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="border-2 border-dashed border-white/10 hover:border-emerald-500/50 rounded-xl p-5 transition-all bg-white/[0.015] hover:bg-white/[0.035] text-center relative cursor-pointer group flex flex-col items-center justify-center gap-2 min-h-[110px]">
                            <input
                              id="cat-image-file"
                              type="file"
                              accept="image/*"
                              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                            />
                            <Upload className="w-6 h-6 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                            <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">
                              Glisser-déposer ou cliquer
                            </span>
                            <span className="text-[7px] text-slate-500 uppercase tracking-wider">
                              JPG, PNG, WEBP uniquement
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Manual Image URL fallback */}
                      <div className="space-y-4">
                        <div>
                          <label htmlFor="cat-image-url" className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
                            Lien direct (URL)
                          </label>
                          <input
                            id="cat-image-url"
                            type="text"
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            placeholder="https://images.unsplash.com/photo-..."
                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:border-emerald-500/50 outline-none transition-all"
                          />
                          <p className="text-[9px] text-slate-500 leading-normal mt-2 select-none">
                            L'upload d'un fichier écrasera automatiquement ce lien avec l'URL finale du bucket Supabase.
                          </p>
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Category Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Nom de la catégorie */}
                    <div>
                      <label htmlFor="cat-name" className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
                        Nom de la catégorie *
                      </label>
                      <input 
                        id="cat-name" 
                        type="text" 
                        required 
                        value={name} 
                        onChange={e => setName(e.target.value)} 
                        placeholder="Ex: Sneakers, Vestes, Accessoires" 
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:border-emerald-500/50 outline-none transition-all" 
                      />
                    </div>

                    {/* Slug */}
                    <div>
                      <label htmlFor="cat-slug" className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
                        Slug de la catégorie <span className="text-slate-600">(auto-généré si vide)</span>
                      </label>
                      <input 
                        id="cat-slug" 
                        type="text" 
                        value={slug} 
                        onChange={e => setSlug(e.target.value)} 
                        placeholder="sneakers-premium" 
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:border-emerald-500/50 outline-none transition-all font-mono" 
                      />
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
                  form="admin-category-form" 
                  disabled={saving || uploadingImage} 
                  className="px-6 py-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-widest transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-emerald-600/20 active:scale-98"
                >
                  {saving || uploadingImage ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> 
                      <span>{uploadingImage ? 'Uploading...' : 'Enregistrement...'}</span>
                    </>
                  ) : (
                    <>
                      <Tag className="w-4 h-4" /> 
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
