// src/app/api/admin/products/[id]/route.ts
// GET    /api/admin/products/:id  — fetch one with category
// PUT    /api/admin/products/:id  — update any field
// DELETE /api/admin/products/:id  — delete

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const db = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  );

type Ctx = { params: Promise<{ id: string }> };

// ── GET ───────────────────────────────────────────────────────
export async function GET(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const { data, error } = await db()
    .from('Product')
    .select('*, Category(id, name)')
    .eq('id', id)
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json({ data });
}

// ── PUT ───────────────────────────────────────────────────────
export async function PUT(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const body = await req.json();

  const updates: Record<string, unknown> = {};
  if (body.name             !== undefined) updates.name             = body.name.trim();
  if (body.category_id      !== undefined) updates.category_id      = body.category_id || null;
  if (body.available_colors !== undefined) updates.available_colors = Array.isArray(body.available_colors) ? body.available_colors : [];
  if (body.sizes            !== undefined) updates.sizes            = Array.isArray(body.sizes) ? body.sizes : [];
  if (body.base_image_url   !== undefined) updates.base_image_url   = body.base_image_url?.trim() || null;
  if (body.base_price       !== undefined) updates.base_price       = Number(body.base_price) || 0;
  if (body.is_active        !== undefined) updates.is_active        = Boolean(body.is_active);

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No fields to update.' }, { status: 400 });
  }

  const { data, error } = await db()
    .from('Product')
    .update(updates)
    .eq('id', id)
    .select('*, Category(id, name)')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

// ── DELETE ────────────────────────────────────────────────────
export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const { error } = await db().from('Product').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
