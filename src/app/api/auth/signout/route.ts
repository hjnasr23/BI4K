// src/app/api/auth/signout/route.ts
// POST /api/auth/signout — Signs the user out globally.

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization') ?? '';
  const accessToken = authHeader.replace('Bearer ', '');

  if (accessToken) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { persistSession: false } }
    );
    // Set the user's session so we sign out the correct user
    await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: '',
    });
    await supabase.auth.signOut({ scope: 'global' });
  }

  return NextResponse.json({ ok: true });
}
