import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// ── Routes that require a logged-in user ──────────────────────
const USER_PROTECTED = ['/dashboard', '/orders', '/profile', '/designs', '/account'];

// ── Admin routes ──────────────────────────────────────────────
async function handleAdmin(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  if (pathname === '/admin/login' || pathname.startsWith('/api/admin/auth')) {
    return NextResponse.next();
  }

  const adminSecret = process.env.ADMIN_SECRET ?? '';
  const token       = request.cookies.get('admin_token')?.value ?? '';

  if (!adminSecret || token !== adminSecret) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  return NextResponse.next();
}

// ── User-protected routes ─────────────────────────────────────
async function handleUserProtected(request: NextRequest): Promise<NextResponse> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  // Try to get the access token from the cookie Supabase sets automatically
  const projectRef  = supabaseUrl.split('//')[1].split('.')[0];
  const cookieKey   = `sb-${projectRef}-auth-token`;
  const rawCookie   = request.cookies.get(cookieKey)?.value ?? '';

  let accessToken = '';
  try {
    const parsed = JSON.parse(decodeURIComponent(rawCookie));
    accessToken  = parsed.access_token ?? '';
  } catch {
    // Cookie not present or malformed — treat as unauthenticated
  }

  if (!accessToken) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Verify the token with Supabase
  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false },
  });
  const { data: { user } } = await supabase.auth.getUser(accessToken);

  if (!user) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// ── Main middleware ───────────────────────────────────────────
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    return handleAdmin(request);
  }

  if (USER_PROTECTED.some(route => pathname.startsWith(route))) {
    return handleUserProtected(request);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
    //'/dashboard/:path*',
    //'/dashboard',
    '/orders/:path*',
    '/profile/:path*',
    '/designs/:path*',
    '/account/:path*',
  ],
};
