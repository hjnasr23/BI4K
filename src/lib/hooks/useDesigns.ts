'use client';
// src/lib/hooks/useDesigns.ts
// Hook to save, load and delete a user's AI-generated designs.
// Requires the user to be signed in.

import { useCallback, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Design, InsertDesign } from '@/lib/db/types';

interface UseDesignsReturn {
  designs:      Design[];
  loading:      boolean;
  saveDesign:   (payload: Omit<InsertDesign, 'user_id'>) => Promise<{ data: Design | null; error: string | null }>;
  deleteDesign: (id: string) => Promise<void>;
  refresh:      () => Promise<void>;
}

export function useDesigns(userId: string | undefined): UseDesignsReturn {
  const [designs, setDesigns] = useState<Design[]>([]);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const refresh = useCallback(async () => {
    if (!userId) { setDesigns([]); return; }
    setLoading(true);
    const { data } = await supabase
      .from('designs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    setDesigns((data as Design[]) ?? []);
    setLoading(false);
  }, [userId, supabase]);

  useEffect(() => { refresh(); }, [refresh]);

  const saveDesign = useCallback(async (
    payload: Omit<InsertDesign, 'user_id'>
  ): Promise<{ data: Design | null; error: string | null }> => {
    if (!userId) return { data: null, error: 'You must be signed in to save designs.' };

    const { data, error } = await supabase
      .from('designs')
      .insert({ ...payload, user_id: userId })
      .select()
      .single();

    if (error) return { data: null, error: error.message };

    setDesigns(prev => [data as Design, ...prev]);
    return { data: data as Design, error: null };
  }, [userId, supabase]);

  const deleteDesign = useCallback(async (id: string) => {
    await supabase.from('designs').delete().eq('id', id);
    setDesigns(prev => prev.filter(d => d.id !== id));
  }, [supabase]);

  return { designs, loading, saveDesign, deleteDesign, refresh };
}
