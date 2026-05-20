// src/app/api/auth/signin/route.ts
// POST /api/auth/signin
// Signs the user in and returns their session + profile data.

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { auth: { persistSession: false } }
);

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
  }

  // ── Authenticate ─────────────────────────────────────────
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.session) {
    return NextResponse.json(
      { error: error?.message ?? 'Invalid credentials.' },
      { status: 401 }
    );
  }

  const { session, user } = data;

  // ── Fetch UserProfile ─────────────────────────────────────
  const { data: profile } = await supabase
    .from('UserProfile')
    .select('*')
    .eq('id', user.id)
    .single();

  // ── Ensure profile exists (edge case) ────────────────────
  if (!profile) {
    await supabase.from('UserProfile').upsert({
      id:             user.id,
      full_name:      user.user_metadata?.full_name ?? '',
      preferred_lang: 'fr',
    }, { onConflict: 'id' });
  }

  return NextResponse.json({
    ok: true,
    user: {
      id:        user.id,
      email:     user.email,
      fullName:  profile?.full_name ?? user.user_metadata?.full_name ?? '',
      avatarUrl: profile?.avatar_url ?? null,
      lang:      profile?.preferred_lang ?? 'fr',
    },
    accessToken:  session.access_token,
    refreshToken: session.refresh_token,
    expiresAt:    session.expires_at,
  });
}
