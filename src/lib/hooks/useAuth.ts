'use client';
// src/lib/hooks/useAuth.ts
// Central auth hook. Wraps Supabase auth + syncs UserProfile.
// Usage: const { user, profile, signIn, signUp, signOut, loading } = useAuth();

import { useEffect, useState, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import type { UserProfile } from '@/lib/db/types';

export interface AuthUser {
  supabaseUser: User;
  profile: UserProfile | null;
}

interface UseAuthReturn {
  user:     AuthUser | null;
  loading:  boolean;
  signUp:   (email: string, password: string, fullName?: string) => Promise<{ error: string | null; requiresConfirmation?: boolean }>;
  signIn:   (email: string, password: string) => Promise<{ error: string | null }>;
  signOut:  () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [user,    setUser]    = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  // ── Fetch UserProfile and merge with Supabase user ───────
  const loadProfile = useCallback(async (supabaseUser: User) => {
    const { data: profile } = await supabase
      .from('UserProfile')
      .select('*')
      .eq('id', supabaseUser.id)
      .single();

    setUser({ supabaseUser, profile: profile ?? null });
  }, [supabase]);

  // ── Initial auth state + listener ────────────────────────
  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      if (session?.user) {
        loadProfile(session.user).finally(() => { if (mounted) setLoading(false); });
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!mounted) return;
        if (session?.user) {
          await loadProfile(session.user);
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [loadProfile, supabase.auth]);

  // ── Sign Up ───────────────────────────────────────────────
  const signUp = useCallback(async (
    email: string,
    password: string,
    fullName?: string
  ): Promise<{ error: string | null; requiresConfirmation?: boolean }> => {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, fullName }),
    });
    const json = await res.json();
    if (!res.ok) return { error: json.error };
    return { error: null, requiresConfirmation: json.requiresConfirmation };
  }, []);

  // ── Sign In ───────────────────────────────────────────────
  const signIn = useCallback(async (
    email: string,
    password: string
  ): Promise<{ error: string | null }> => {
    // Use Supabase client directly so the session is persisted in the browser.
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return { error: null };
  }, [supabase.auth]);

  // ── Sign Out ──────────────────────────────────────────────
  const signOut = useCallback(async () => {
    const session = (await supabase.auth.getSession()).data.session;
    if (session) {
      await fetch('/api/auth/signout', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${session.access_token}` },
      });
    }
    await supabase.auth.signOut();
    setUser(null);
  }, [supabase.auth]);

  // ── Refresh profile (call after updating UserProfile) ─────
  const refreshProfile = useCallback(async () => {
    const { data: { user: sbUser } } = await supabase.auth.getUser();
    if (sbUser) await loadProfile(sbUser);
  }, [supabase.auth, loadProfile]);

  return { user, loading, signUp, signIn, signOut, refreshProfile };
}
