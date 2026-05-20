import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  const adminEmail    = process.env.ADMIN_EMAIL    ?? '';
  const adminPassword = process.env.ADMIN_PASSWORD ?? '';
  const adminSecret   = process.env.ADMIN_SECRET   ?? 'fallback-secret';

  if (!adminEmail || !adminPassword) {
    return NextResponse.json(
      { error: 'Admin credentials not configured on the server.' },
      { status: 500 }
    );
  }

  if (email !== adminEmail || password !== adminPassword) {
    // Deliberate delay to slow down brute-force attempts
    await new Promise(r => setTimeout(r, 500));
    return NextResponse.json(
      { error: 'Invalid email or password.' },
      { status: 401 }
    );
  }

  // Credentials match — set a secure HTTP-only cookie
  const res = NextResponse.json({ ok: true });
  res.cookies.set('admin_token', adminSecret, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/admin',
    // In production set secure: true (requires HTTPS)
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 8, // 8 hours
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set('admin_token', '', {
    httpOnly: true,
    sameSite: 'lax',
    path: '/admin',
    maxAge: 0,
  });
  return res;
}
