// src/app/api/auth/session/route.ts
// GET /api/auth/session
// Returns the current user's session + UserProfile. Used to hydrate
// the client on page load without an extra Supabase round trip.

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { auth: { persistSession: false } }
);

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization') ?? '';
  const accessToken = authHeader.replace('Bearer ', '');

  if (!accessToken) {
    return NextResponse.json({ user: null }, { status: 200 });
  }

  const { data: { user }, error } = await supabase.auth.getUser(accessToken);

  if (error || !user) {
    return NextResponse.json({ user: null }, { status: 200 });
  }

  // Fetch UserProfile for extra fields
  const { data: profile } = await supabase
    .from('UserProfile')
    .select('full_name, avatar_url, preferred_lang, shipping_address')
    .eq('id', user.id)
    .single();

  return NextResponse.json({
    user: {
      id:              user.id,
      email:           user.email,
      fullName:        profile?.full_name ?? user.user_metadata?.full_name ?? '',
      avatarUrl:       profile?.avatar_url ?? null,
      lang:            profile?.preferred_lang ?? 'fr',
      shippingAddress: profile?.shipping_address ?? {},
    },
  });
}
