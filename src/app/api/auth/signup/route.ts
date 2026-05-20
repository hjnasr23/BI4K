// src/app/api/auth/signup/route.ts
// POST /api/auth/signup
// Creates a Supabase auth user + ensures UserProfile row exists.

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { auth: { persistSession: false } }
);

export async function POST(req: NextRequest) {
  const { email, password, fullName } = await req.json();

  // ── Validate input ────────────────────────────────────────
  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 });
  }

  // ── Create Supabase auth user ─────────────────────────────
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName ?? '' },
    },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const user = data.user;
  if (!user) {
    return NextResponse.json({ error: 'Signup failed — no user returned.' }, { status: 500 });
  }

  // ── Upsert UserProfile row ────────────────────────────────
  // The DB trigger handles this automatically, but we upsert here as a
  // safety net in case the trigger hasn't run yet.
  await supabase.from('UserProfile').upsert({
    id:        user.id,
    full_name: fullName ?? '',
    preferred_lang: 'fr',
  }, { onConflict: 'id' });

  return NextResponse.json({
    ok: true,
    userId: user.id,
    email:  user.email,
    // If email confirmation is enabled in Supabase, identities will be empty
    // and the user needs to confirm before they can log in.
    requiresConfirmation: data.session === null,
  });
}
