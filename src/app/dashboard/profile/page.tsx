'use client';

import { useState, useEffect } from 'react';
import { useApp } from '@/lib/store';
import { createClient } from '@/lib/supabase/client';
import { User, Mail, Phone, MapPin, Pencil, Check, Loader2 } from 'lucide-react';

interface UserData {
  fullName: string;
  email: string;
  phone: string;
  address: string;
}

export default function ProfilePage() {
  const { showToast, setProfile } = useApp();

  const [userData, setUserData] = useState<UserData>({
    fullName: '',
    email: '',
    phone: '',
    address: ''
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<UserData>(userData);

  useEffect(() => {
    async function fetchProfileData() {
      try {
        const supabase = createClient();
        const { data: { user }, error: userErr } = await supabase.auth.getUser();
        
        if (userErr || !user) {
          throw new Error('Authentication required');
        }

        // Direct SELECT query on profiles table matching the user's ID
        const { data, error } = await supabase
          .from('profiles')
          .select('full_name, phone, address')
          .eq('id', user.id)
          .maybeSingle();

        if (error) {
          console.warn('Error fetching profiles table directly, falling back to API:', error);
          
          // API Fallback as a robust safety net
          const res = await fetch('/api/profile');
          if (!res.ok) throw new Error('Failed to load profile');
          const apiData = await res.json();
          
          const loadedData = {
            fullName: apiData.fullName || '',
            email: apiData.email || user.email || '',
            phone: apiData.phone || '',
            address: apiData.address || ''
          };
          setUserData(loadedData);
          setEditForm(loadedData);
        } else {
          const loadedData = {
            fullName: data?.full_name || '',
            email: user.email || '',
            phone: data?.phone || '',
            address: data?.address || ''
          };
          setUserData(loadedData);
          setEditForm(loadedData);
        }
      } catch (err) {
        console.error(err);
        showToast('Erreur lors du chargement du profil.', 'error');
      } finally {
        setLoading(false);
      }
    }
    fetchProfileData();
  }, [showToast]);

  const fields = [
    { key: 'fullName', label: 'Nom complet', value: userData.fullName, icon: User, editable: true },
    { key: 'email', label: 'Adresse email', value: userData.email, icon: Mail, editable: false },
    { key: 'phone', label: 'Téléphone', value: userData.phone, icon: Phone, editable: true },
    { key: 'address', label: 'Adresse de livraison', value: userData.address, icon: MapPin, editable: true },
  ];

  const handleEdit = () => {
    setEditForm(userData);
    setIsEditing(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const supabase = createClient();
      const { data: { user }, error: userErr } = await supabase.auth.getUser();
      if (userErr || !user) throw new Error('Authentication required');

      // Update directly via Supabase browser client on profiles table
      const { error: dbErr } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: editForm.fullName,
          phone: editForm.phone,
          address: editForm.address,
          updated_at: new Date().toISOString()
        });

      if (dbErr) throw dbErr;

      // Sync backend / backups
      await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: editForm.fullName,
          phone: editForm.phone,
          address: editForm.address
        })
      });
      
      const updatedData = {
        fullName: editForm.fullName,
        email: userData.email,
        phone: editForm.phone,
        address: editForm.address
      };

      setUserData(updatedData);
      setEditForm(updatedData);
      setIsEditing(false);
      
      // Sync global state context so avatar and other layouts update
      setProfile({
        full_name: updatedData.fullName,
        phone: updatedData.phone,
        address: updatedData.address
      });

      showToast('Profil mis à jour avec succès !', 'success');
    } catch (err) {
      console.error(err);
      showToast('Erreur lors de la mise à jour du profil.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="mb-6 animate-pulse">
          <div className="h-3 w-16 bg-neutral-200 dark:bg-neutral-800 rounded mb-2"></div>
          <div className="h-8 w-40 bg-neutral-200 dark:bg-neutral-800 rounded mb-1"></div>
          <div className="h-4 w-64 bg-neutral-200 dark:bg-neutral-800 rounded mt-2"></div>
        </div>

        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-white/5 rounded-2xl overflow-hidden animate-pulse">
          {/* Avatar Header Skeleton */}
          <div className="border-b border-neutral-100 dark:border-white/5 p-6 flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-neutral-200 dark:bg-neutral-800"></div>
            <div className="space-y-2 flex-1">
              <div className="h-5 w-32 bg-neutral-200 dark:bg-neutral-800 rounded"></div>
              <div className="h-4 w-48 bg-neutral-200 dark:bg-neutral-800 rounded"></div>
            </div>
          </div>

          {/* Fields Skeleton */}
          <div className="divide-y divide-neutral-100 dark:divide-white/5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-4">
                <div className="w-8 h-8 rounded-xl bg-neutral-200 dark:bg-neutral-800 shrink-0"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-20 bg-neutral-200 dark:bg-neutral-800 rounded"></div>
                  <div className="h-4 w-full bg-neutral-200 dark:bg-neutral-800 rounded"></div>
                </div>
              </div>
            ))}
          </div>

          {/* Button Skeleton */}
          <div className="px-6 py-4 border-t border-neutral-100 dark:border-white/5">
            <div className="w-36 h-10 bg-neutral-200 dark:bg-neutral-800 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">Dashboard</p>
        <h1 className="text-2xl font-extrabold text-neutral-900 dark:text-white tracking-tight">Mon Profil</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">Vos informations personnelles et de livraison.</p>
      </div>

      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-white/5 rounded-2xl overflow-hidden">
        {/* Avatar Header */}
        <div className="bg-gradient-to-r from-blue-500/10 to-amber-500/10 dark:from-blue-500/5 dark:to-amber-500/5 border-b border-neutral-100 dark:border-white/5 p-6 flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-amber-500 flex items-center justify-center text-white font-black text-2xl shadow-lg">
            {(userData.fullName || userData.email || '?').charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-bold text-neutral-900 dark:text-white text-lg">{userData.fullName}</p>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">{userData.email}</p>
          </div>
        </div>

        {/* Fields */}
        <div className="divide-y divide-neutral-100 dark:divide-white/5">
          {fields.map(({ key, label, value, icon: Icon, editable }) => (
            <div key={label} className="flex items-center gap-4 px-6 py-4">
              <div className="w-8 h-8 rounded-xl bg-neutral-100 dark:bg-white/5 flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-1">{label}</p>
                {isEditing ? (
                  <input
                    type="text"
                    disabled={!editable || saving}
                    value={editForm[key as keyof UserData]}
                    onChange={(e) => setEditForm(prev => ({ ...prev, [key]: e.target.value }))}
                    className={`w-full bg-white/5 border border-neutral-600 rounded-md px-3 py-1.5 text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm font-semibold ${
                      !editable ? 'opacity-50 cursor-not-allowed text-white/50' : ''
                    } ${saving ? 'opacity-70' : ''}`}
                  />
                ) : (
                  <p className="text-sm font-semibold text-neutral-900 dark:text-white truncate">{value || '—'}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="px-6 py-4 border-t border-neutral-100 dark:border-white/5 flex items-center gap-3">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-700/50 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/20"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Enregistrer
                  </>
                )}
              </button>
              <button
                onClick={handleCancel}
                disabled={saving}
                className="bg-transparent border border-neutral-600 text-neutral-400 hover:text-white px-4 py-2 rounded-xl text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Annuler
              </button>
            </>
          ) : (
            <button
              onClick={handleEdit}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-blue-500/20"
            >
              <Pencil className="w-4 h-4" />
              Modifier mon profil
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

