// src/app/api/admin/products/route.ts
// GET  /api/admin/products   — list all with category join
// POST /api/admin/products   — create one

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const db = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  );

// ── GET ───────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const categoryId = searchParams.get('category_id');
  const search     = searchParams.get('q');

  let query = db()
    .from('Product')
    .select('*, Category(id, name)')
    .order('created_at', { ascending: false });

  if (categoryId) query = query.eq('category_id', categoryId);
  if (search)     query = query.ilike('name', `%${search}%`);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

// ── POST ──────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, category_id, available_colors, sizes, base_image_url, base_price } = body;

  if (!name?.trim()) {
    return NextResponse.json({ error: 'Product name is required.' }, { status: 400 });
  }

  const payload = {
    name:             name.trim(),
    category_id:      category_id || null,
    available_colors: Array.isArray(available_colors) ? available_colors : [],
    sizes:            Array.isArray(sizes) ? sizes : [],
    base_image_url:   base_image_url?.trim() || null,
    base_price:       Number(base_price) || 0,
    is_active:        true,
  };

  const { data, error } = await db()
    .from('Product')
    .insert(payload)
    .select('*, Category(id, name)')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data }, { status: 201 });
}
