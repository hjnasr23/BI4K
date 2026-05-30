"use client";

import React, { useState } from 'react';
import { 
  Users as UsersIcon, 
  Search, 
  Ban, 
  Unlock,
  Trash2, 
  Gift, 
  Loader2,
  CheckCircle2,
  ShieldAlert,
  ArrowLeft,
  RefreshCw,
  Percent
} from 'lucide-react';
import Link from 'next/link';
import { toggleBanUserAction, deleteUserAction, fetchUsersAction, applyDiscountAction } from './actions';

interface Profile {
  id: string;
  full_name?: string;
  email?: string;
  phone?: string;
  is_banned?: boolean;
  updated_at?: string;
  discount_rate?: number | null;
  discount_expires_at?: string | null;
}

interface UsersTableClientProps {
  users: Profile[];
}

export default function UsersTableClient({ users: initialUsers }: UsersTableClientProps) {
  const [usersList, setUsersList] = useState<Profile[]>(initialUsers);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal states
  const [bonusModalOpen, setBonusModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  
  // Bonus form states
  const [discountPercentage, setDiscountPercentage] = useState<number | ''>('');
  const [discountDays, setDiscountDays] = useState<number | ''>('');
  const [bonusSubmitting, setBonusSubmitting] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await fetchUsersAction();
      if (error) {
        console.error('Error fetching users:', error);
        alert(`Erreur: ${error}`);
      } else if (data) {
        setUsersList(data);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBan = async (user: Profile) => {
    const actionLabel = user.is_banned ? 'débannir' : 'bannir';
    if (!window.confirm(`Êtes-vous sûr de vouloir ${actionLabel} ${user.full_name || 'cet utilisateur'} ?`)) return;
    
    const newStatus = !user.is_banned;
    
    try {
      setLoading(true);
      const { success, error } = await toggleBanUserAction(user.id, newStatus);
      if (success) {
        setUsersList(usersList.map(u => u.id === user.id ? { ...u, is_banned: newStatus } : u));
      } else {
        alert(`Erreur: ${error}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.')) return;
    
    try {
      setLoading(true);
      const { success, error } = await deleteUserAction(userId);
      if (success) {
        setUsersList(usersList.filter(u => u.id !== userId));
      } else {
        alert(`Erreur: ${error}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openBonusModal = (user: Profile) => {
    setSelectedUser(user);
    setDiscountPercentage(user.discount_rate || '');
    setDiscountDays('');
    setBonusModalOpen(true);
  };

  const handleApplyDiscount = async () => {
    if (!selectedUser || typeof discountPercentage !== 'number' || typeof discountDays !== 'number') {
      alert("Veuillez remplir tous les champs correctement.");
      return;
    }
    
    if (discountPercentage <= 0 || discountPercentage > 100) {
      alert("Le pourcentage doit être compris entre 1 et 100.");
      return;
    }
    
    if (discountDays <= 0) {
      alert("La durée doit être supérieure à 0 jour.");
      return;
    }

    try {
      setBonusSubmitting(true);
      const { success, expiresAt, error } = await applyDiscountAction(selectedUser.id, discountPercentage, discountDays);
      
      if (success) {
        setUsersList(usersList.map(u => u.id === selectedUser.id ? { 
          ...u, 
          discount_rate: discountPercentage,
          discount_expires_at: expiresAt
        } : u));
        setBonusModalOpen(false);
      } else {
        alert(`Erreur: ${error}`);
      }
    } catch (err) {
      console.error(err);
      alert("Une erreur est survenue.");
    } finally {
      setBonusSubmitting(false);
    }
  };

  const filteredUsers = usersList.filter(user => 
    (user.full_name?.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (user.email?.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (user.phone?.includes(searchQuery))
  );

  return (
    <div className="p-6 md:p-10 pb-24 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-10">
        <Link 
          href="/admin" 
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white uppercase tracking-widest transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Retour au Dashboard
        </Link>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white uppercase italic flex items-center gap-3">
              <div className="w-1.5 h-10 bg-brand-yellow rounded-full shadow-[0_0_20px_rgba(243,156,18,0.6)]" />
              Utilisateurs
            </h1>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-2">
              Gestion des comptes, accès et récompenses
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={fetchUsers}
              disabled={loading}
              className="p-3 rounded-xl bg-[#111116] border border-white/10 text-slate-400 hover:text-white transition-all disabled:opacity-50"
              title="Recharger la liste"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-brand-yellow' : ''}`} />
            </button>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Rechercher un utilisateur..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full md:w-64 pl-11 pr-4 py-3 rounded-xl bg-[#111116] border border-white/10 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-brand-yellow/50 transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      {loading && usersList.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-brand-yellow" />
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest animate-pulse">Chargement des utilisateurs...</p>
        </div>
      ) : (
        <div className="bg-[#111116] border border-white/5 rounded-[2rem] overflow-hidden shadow-2xl relative">
          {loading && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center z-10">
              <Loader2 className="w-8 h-8 animate-spin text-brand-yellow" />
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 border-b border-white/5">
                  <th className="p-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Utilisateur</th>
                  <th className="p-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Contact</th>
                  <th className="p-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Statut</th>
                  <th className="p-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Avantages</th>
                  <th className="p-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-10 text-center text-slate-500 text-sm">
                      Aucun utilisateur trouvé.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => {
                    const hasActiveDiscount = user.discount_rate && user.discount_expires_at && new Date(user.discount_expires_at) > new Date();

                    return (
                      <tr key={user.id} className="hover:bg-white/5 transition-colors group">
                        <td className="p-5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-yellow/20 to-brand-blue/20 flex items-center justify-center border border-white/10 shrink-0">
                              <UsersIcon className="w-5 h-5 text-slate-300" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-white">{user.full_name || 'Utilisateur Anonyme'}</p>
                              <p className="text-[10px] font-mono text-slate-500">{user.id.substring(0, 8)}...</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-5">
                          <p className="text-sm text-slate-300">{user.email || 'Email non fourni'}</p>
                          <p className="text-xs text-slate-500">{user.phone || 'Téléphone non fourni'}</p>
                        </td>
                        <td className="p-5">
                          {user.is_banned ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-500/10 border border-rose-500/20 text-[10px] font-black uppercase tracking-widest text-rose-400">
                              <ShieldAlert className="w-3 h-3" /> Banni
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black uppercase tracking-widest text-emerald-400">
                              <CheckCircle2 className="w-3 h-3" /> Actif
                            </span>
                          )}
                        </td>
                        <td className="p-5">
                          {hasActiveDiscount ? (
                            <div className="flex flex-col gap-1">
                              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-brand-yellow/10 border border-brand-yellow/20 text-[10px] font-black uppercase tracking-widest text-brand-yellow w-fit">
                                <Percent className="w-3 h-3" /> -{user.discount_rate}%
                              </span>
                              <span className="text-[9px] font-medium text-slate-500 uppercase tracking-widest">
                                Exp: {new Date(user.discount_expires_at!).toLocaleDateString('fr-FR')}
                              </span>
                            </div>
                          ) : (
                            <span className="text-[10px] font-medium text-slate-600 uppercase tracking-widest">-</span>
                          )}
                        </td>
                        <td className="p-5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => openBonusModal(user)}
                              title="Ajouter une Réduction"
                              className="p-2 rounded-lg bg-white/5 hover:bg-brand-yellow/20 hover:text-brand-yellow text-slate-400 transition-colors border border-transparent hover:border-brand-yellow/30"
                            >
                              <Gift className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleToggleBan(user)}
                              title={user.is_banned ? "Débannir" : "Bannir"}
                              className="p-2 rounded-lg bg-white/5 hover:bg-rose-500/20 hover:text-rose-400 text-slate-400 transition-colors border border-transparent hover:border-rose-500/30"
                            >
                              {user.is_banned ? <Unlock className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                            </button>
                            <button 
                              onClick={() => handleDeleteUser(user.id)}
                              title="Supprimer"
                              className="p-2 rounded-lg bg-white/5 hover:bg-red-500/20 hover:text-red-400 text-slate-400 transition-colors border border-transparent hover:border-red-500/30"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Bonus Modal */}
      {bonusModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#111116] border border-white/10 rounded-[2rem] p-8 w-full max-w-md shadow-2xl relative animate-reveal">
            <h3 className="text-xl font-black text-white uppercase italic flex items-center gap-3 mb-6">
              <Gift className="w-6 h-6 text-brand-yellow" />
              Réduction VIP
            </h3>
            
            <p className="text-sm text-slate-300 mb-6">
              Offrir une réduction temporaire à <strong className="text-white">{selectedUser.full_name || 'cet utilisateur'}</strong>.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Pourcentage de réduction (%)</label>
                <input 
                  type="number" 
                  value={discountPercentage}
                  onChange={(e) => setDiscountPercentage(e.target.value === '' ? '' : Number(e.target.value))}
                  min="1"
                  max="100"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-brand-yellow/50" 
                  placeholder="Ex: 20" 
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Durée de validité (en jours)</label>
                <input 
                  type="number" 
                  value={discountDays}
                  onChange={(e) => setDiscountDays(e.target.value === '' ? '' : Number(e.target.value))}
                  min="1"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-brand-yellow/50" 
                  placeholder="Ex: 30" 
                />
              </div>
            </div>

            <div className="flex items-center gap-3 mt-8">
              <button 
                onClick={() => setBonusModalOpen(false)}
                disabled={bonusSubmitting}
                className="flex-1 py-3 rounded-xl bg-white/5 text-xs font-black uppercase tracking-widest text-slate-400 hover:bg-white/10 hover:text-white transition-all disabled:opacity-50"
              >
                Annuler
              </button>
              <button 
                onClick={handleApplyDiscount}
                disabled={bonusSubmitting}
                className="flex-1 py-3 rounded-xl bg-brand-yellow text-xs font-black uppercase tracking-widest text-black hover:bg-yellow-400 transition-all shadow-[0_0_20px_rgba(243,156,18,0.3)] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {bonusSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirmer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
