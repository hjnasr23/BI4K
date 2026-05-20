// src/app/api/admin/categories/route.ts
// GET  /api/admin/categories        — list all
// POST /api/admin/categories        — create one

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const db = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  );

// ── GET ───────────────────────────────────────────────────────
export async function GET() {
  const { data, error } = await db()
    .from('Category')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

// ── POST ──────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, image_url } = body;

  if (!name?.trim()) {
    return NextResponse.json({ error: 'Category name is required.' }, { status: 400 });
  }

  const { data, error } = await db()
    .from('Category')
    .insert({ name: name.trim(), image_url: image_url?.trim() || null })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data }, { status: 201 });
}
