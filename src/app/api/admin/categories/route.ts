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
    .from('categories')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

// ── POST ──────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, slug, image_url } = body;

  if (!name?.trim()) {
    return NextResponse.json({ error: 'Category name is required.' }, { status: 400 });
  }

  const categorySlug = slug?.trim() || name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const { data, error } = await db()
    .from('categories')
    .insert({ name: name.trim(), slug: categorySlug, image_url: image_url?.trim() || null })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data }, { status: 201 });
}
