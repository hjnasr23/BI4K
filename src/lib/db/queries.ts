// ─────────────────────────────────────────────────────────────
// src/lib/db/queries.ts
// Typed query helpers for every table.
// All functions return { data, error } — never throw.
// ─────────────────────────────────────────────────────────────
import { createClient } from '@supabase/supabase-js';
import type {
  UUID,
  Category,
  Product,
  UserDesign,
  CartItem,
  Commande,
  LigneCommande,
  UserProfile,
  InsertCategory,
  InsertProduct,
  InsertDesign,
  InsertUserDesign,
  InsertCartItem,
  InsertCommande,
  InsertLigneCommande,
  OrderStatus,
} from './types';

// ── Plain untyped client — types are enforced by our own interfaces above ──
// We intentionally use an untyped client here because Supabase's generated
// Database type requires running `supabase gen types`. Our hand-written types
// in types.ts provide the same safety at a higher level (return type annotations).
const getClient = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );

// ══════════════════════════════════════════════════════════════
// CATEGORIES
// ══════════════════════════════════════════════════════════════

export async function getCategories(): Promise<{ data: Category[] | null; error: unknown }> {
  return getClient().from('Category').select('*').order('name');
}

export async function getCategoryById(id: UUID): Promise<{ data: Category | null; error: unknown }> {
  return getClient().from('Category').select('*').eq('id', id).single();
}

export async function insertCategory(payload: InsertCategory): Promise<{ data: Category | null; error: unknown }> {
  return getClient().from('Category').insert(payload).select().single();
}

export async function deleteCategory(id: UUID) {
  return getClient().from('Category').delete().eq('id', id);
}

// ══════════════════════════════════════════════════════════════
// PRODUCTS
// ══════════════════════════════════════════════════════════════

export async function getProducts(options?: {
  categoryId?: UUID;
  activeOnly?: boolean;
}): Promise<{ data: (Product & { Category: Pick<Category,'id'|'name'|'image_url'> | null })[] | null; error: unknown }> {
  let query = getClient()
    .from('Product')
    .select('*, Category(id, name, image_url)')
    .order('created_at', { ascending: false });

  if (options?.categoryId) query = query.eq('category_id', options.categoryId);
  if (options?.activeOnly !== false) query = query.eq('is_active', true);

  return query;
}

export async function getProductById(id: UUID): Promise<{ data: Product | null; error: unknown }> {
  return getClient()
    .from('Product')
    .select('*, Category(id, name, image_url)')
    .eq('id', id)
    .single();
}

export async function insertProduct(payload: InsertProduct): Promise<{ data: Product | null; error: unknown }> {
  return getClient().from('Product').insert(payload).select().single();
}

export async function updateProduct(id: UUID, payload: Partial<Product>): Promise<{ data: Product | null; error: unknown }> {
  return getClient().from('Product').update(payload).eq('id', id).select().single();
}

export async function deleteProduct(id: UUID) {
  return getClient().from('Product').delete().eq('id', id);
}

// ══════════════════════════════════════════════════════════════
// MOCKUPS
// ══════════════════════════════════════════════════════════════

export async function getMockups(options?: {
  clothType?: string;
  targetAudience?: string;
  view?: string;
}) {
  let query = getClient().from('Mockup').select('*').order('created_at', { ascending: false });
  if (options?.clothType)      query = query.eq('cloth_type', options.clothType);
  if (options?.targetAudience) query = query.eq('target_audience', options.targetAudience);
  if (options?.view)           query = query.eq('view', options.view);
  return query;
}

// ══════════════════════════════════════════════════════════════
// DESIGNS
// ══════════════════════════════════════════════════════════════

export async function getDesignsByUser(userId: UUID) {
  return getClient()
    .from('designs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
}

export async function insertDesign(payload: InsertDesign) {
  return getClient().from('designs').insert(payload).select().single();
}

export async function deleteDesign(id: UUID) {
  return getClient().from('designs').delete().eq('id', id);
}

// ══════════════════════════════════════════════════════════════
// USER DESIGNS
// ══════════════════════════════════════════════════════════════

export async function getUserDesigns(userId: UUID) {
  return getClient()
    .from('UserDesign')
    .select('*, Product(id, name, base_image_url), designs(id, url, is_ai)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
}

export async function insertUserDesign(payload: InsertUserDesign): Promise<{ data: UserDesign | null; error: unknown }> {
  return getClient().from('UserDesign').insert(payload).select().single();
}

export async function deleteUserDesign(id: UUID) {
  return getClient().from('UserDesign').delete().eq('id', id);
}

// ══════════════════════════════════════════════════════════════
// CART
// ══════════════════════════════════════════════════════════════

export async function getOrCreateCart(userId: UUID) {
  const { data: existing } = await getClient()
    .from('Cart')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (existing) return { data: existing, error: null };

  return getClient().from('Cart').insert({ user_id: userId }).select().single();
}

export async function getCartWithItems(userId: UUID) {
  return getClient()
    .from('Cart')
    .select(`*, CartItem(*, Product(id, name, base_image_url, base_price), designs(id, url))`)
    .eq('user_id', userId)
    .maybeSingle();
}

export async function addCartItem(payload: InsertCartItem): Promise<{ data: CartItem | null; error: unknown }> {
  return getClient().from('CartItem').insert(payload).select().single();
}

export async function updateCartItemQty(id: UUID, quantity: number) {
  if (quantity <= 0) return getClient().from('CartItem').delete().eq('id', id);
  return getClient().from('CartItem').update({ quantity }).eq('id', id).select().single();
}

export async function removeCartItem(id: UUID) {
  return getClient().from('CartItem').delete().eq('id', id);
}

export async function clearCart(cartId: UUID) {
  return getClient().from('CartItem').delete().eq('cart_id', cartId);
}

// ══════════════════════════════════════════════════════════════
// ORDERS
// ══════════════════════════════════════════════════════════════

export async function getOrdersByUser(userId: UUID) {
  return getClient()
    .from('Commande')
    .select(`*, LigneCommande(*, Product(id, name, base_image_url), designs(id, url))`)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
}

export async function getOrderById(id: UUID) {
  return getClient()
    .from('Commande')
    .select(`*, LigneCommande(*, Product(id, name, base_image_url), designs(id, url))`)
    .eq('id', id)
    .single();
}

export async function insertOrder(
  order: InsertCommande,
  lines: InsertLigneCommande[]
): Promise<{ data: Commande | null; error: unknown }> {
  const { data: commande, error: orderErr } = await getClient()
    .from('Commande')
    .insert(order)
    .select()
    .single();

  if (orderErr || !commande) return { data: null, error: orderErr };

  const linesWithId = lines.map(l => ({ ...l, commande_id: commande.id }));
  const { error: linesErr } = await getClient().from('LigneCommande').insert(linesWithId);

  if (linesErr) return { data: null, error: linesErr };
  return { data: commande as unknown as Commande, error: null };
}

export async function updateOrderStatus(id: UUID, status: OrderStatus) {
  return getClient().from('Commande').update({ status }).eq('id', id).select().single();
}

// ══════════════════════════════════════════════════════════════
// USER PROFILE
// ══════════════════════════════════════════════════════════════

export async function getProfile(userId: UUID): Promise<{ data: UserProfile | null; error: unknown }> {
  return getClient().from('UserProfile').select('*').eq('id', userId).single();
}

export async function updateProfile(userId: UUID, payload: Partial<UserProfile>) {
  return getClient().from('UserProfile').update(payload).eq('id', userId).select().single();
}

// ══════════════════════════════════════════════════════════════
// ADMIN
// ══════════════════════════════════════════════════════════════

export async function adminGetAllOrders() {
  return getClient()
    .from('Commande')
    .select('*, LigneCommande(*)')
    .order('created_at', { ascending: false });
}

export async function adminGetStats() {
  const [cats, prods, orders, designs] = await Promise.all([
    getClient().from('Category').select('*', { count: 'exact', head: true }),
    getClient().from('Product').select('*', { count: 'exact', head: true }),
    getClient().from('Commande').select('*', { count: 'exact', head: true }),
    getClient().from('designs').select('*', { count: 'exact', head: true }),
  ]);
  return {
    categories : cats.count   ?? 0,
    products   : prods.count  ?? 0,
    orders     : orders.count ?? 0,
    designs    : designs.count ?? 0,
  };
}
