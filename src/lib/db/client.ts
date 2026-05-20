// ─────────────────────────────────────────────────────────────
// src/lib/db/client.ts
// Typed Supabase clients:
//   - browserClient()  → for 'use client' components
//   - serverClient()   → for Server Components / Route Handlers
//   - adminClient()    → service-role client (bypasses RLS) — server only
// ─────────────────────────────────────────────────────────────
import { createClient }            from '@supabase/supabase-js';
import { createBrowserClient }     from '@supabase/ssr';
import { createServerClient }      from '@supabase/ssr';
import { cookies }                 from 'next/headers';
import type { Database }           from './types';

const SUPABASE_URL      = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    '[DB] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local'
  );
}

// ── 1. Browser client (singleton, for 'use client' components) ─
let _browserClient: ReturnType<typeof createBrowserClient<Database>> | null = null;

export function browserClient() {
  if (!_browserClient) {
    _browserClient = createBrowserClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return _browserClient;
}

// ── 2. Server client (per-request, reads cookies for auth) ────
// Use in Server Components, Route Handlers, and Server Actions.
export async function serverClient() {
  const cookieStore = await cookies();
  return createServerClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll()           { return cookieStore.getAll(); },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // setAll called from a Server Component — cookies are read-only.
          // Auth middleware will handle the refresh.
        }
      },
    },
  });
}

// ── 3. Admin / service-role client (bypasses RLS) ─────────────
// NEVER import this in client components — server/API routes only.
export function adminClient() {
  const serviceKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!; // already service_role
  return createClient<Database>(SUPABASE_URL, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

// ── Default export (browser-safe singleton) ───────────────────
// Keeps backwards compatibility with existing `import { supabase }` usage.
export const supabase = browserClient();
