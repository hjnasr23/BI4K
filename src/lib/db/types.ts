// ─────────────────────────────────────────────────────────────
// src/lib/db/types.ts
// TypeScript types that mirror the PostgreSQL schema exactly.
// Keep in sync with schema_complete.sql
// ─────────────────────────────────────────────────────────────

// ── Primitive helpers ────────────────────────────────────────
export type UUID = string;
export type ISODate = string; // timestamptz → ISO 8601 string in JS

// ── Order / Payment enums ────────────────────────────────────
export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export type PaymentMethod = 'card' | 'cash_on_delivery' | 'bank_transfer';
export type PaymentStatus = 'unpaid' | 'paid' | 'refunded';
export type PrintSupport  = 'front' | 'back' | 'sleeve' | 'left' | 'right';
export type Lang          = 'fr' | 'en';

// ── ShippingAddress (stored as JSONB) ────────────────────────
export interface ShippingAddress {
  fullName?  : string;
  street?    : string;
  city?      : string;
  zip?       : string;
  country?   : string;
  phone?     : string;
}

// ── CustomizationData (stored as JSONB) ──────────────────────
export interface CustomizationData {
  scale?    : number;
  offsetX?  : number;
  offsetY?  : number;
  color?    : string;
  size?     : string;
  support?  : PrintSupport;
  rotation? : number;
}

// ══════════════════════════════════════════════════════════════
// TABLE TYPES  (row shape returned from Supabase)
// ══════════════════════════════════════════════════════════════

export interface UserProfile {
  id               : UUID;
  full_name        : string | null;
  avatar_url       : string | null;
  phone            : string | null;
  shipping_address : ShippingAddress;
  preferred_lang   : Lang;
  created_at       : ISODate;
  updated_at       : ISODate;
}

export interface Category {
  id         : UUID;
  name       : string;
  image_url  : string | null;
  created_at : ISODate;
}

export interface Product {
  id               : UUID;
  category_id      : UUID | null;
  name             : string;
  available_colors : string[];
  sizes            : string[];
  base_image_url   : string | null;
  base_price       : number;
  is_active        : boolean;
  created_at       : ISODate;
}

export interface Mockup {
  id              : UUID;
  name            : string;
  url             : string;
  cloth_type      : string | null;
  target_audience : string | null;
  view            : string | null;
  created_at      : ISODate;
}

export interface Design {
  id         : UUID;
  user_id    : UUID | null;
  url        : string;
  prompt     : string | null;
  is_ai      : boolean;
  created_at : ISODate;
}

export interface UserDesign {
  id                     : UUID;
  user_id                : UUID;
  product_id             : UUID | null;
  design_id              : UUID | null;
  generated_ai_image_url : string | null;
  selected_support       : PrintSupport;
  customization_data     : CustomizationData;
  created_at             : ISODate;
}

export interface Cart {
  id         : UUID;
  user_id    : UUID;
  created_at : ISODate;
  updated_at : ISODate;
}

export interface CartItem {
  id             : UUID;
  cart_id        : UUID;
  product_id     : UUID | null;
  design_id      : UUID | null;
  selected_color : string | null;
  selected_size  : string | null;
  quantity       : number;
  price_unit     : number;
  added_at       : ISODate;
}

export interface Commande {
  id               : UUID;
  user_id          : UUID;
  status           : OrderStatus;
  total_price      : number;
  order_notes      : string | null;
  shipping_address : ShippingAddress;
  payment_method   : PaymentMethod;
  payment_status   : PaymentStatus;
  created_at       : ISODate;
  updated_at       : ISODate;
}

export interface LigneCommande {
  id                        : UUID;
  commande_id               : UUID;
  product_id                : UUID | null;
  design_id                 : UUID | null;
  customization_coordinates : CustomizationData;
  quantity                  : number;
  price_unit                : number;
  preview_url               : string | null;
  created_at                : ISODate;
}

// ══════════════════════════════════════════════════════════════
// INSERT PAYLOADS  (omit auto-generated fields)
// ══════════════════════════════════════════════════════════════

export type InsertCategory = Omit<Category, 'id' | 'created_at'>;
export type InsertProduct  = Omit<Product,  'id' | 'created_at'>;
export type InsertDesign   = Omit<Design,   'id' | 'created_at'>;

export type InsertUserDesign = Omit<UserDesign, 'id' | 'created_at'>;

export type InsertCartItem = Omit<CartItem, 'id' | 'added_at'>;

export type InsertCommande = Omit<Commande, 'id' | 'created_at' | 'updated_at'>;
export type InsertLigneCommande = Omit<LigneCommande, 'id' | 'created_at'>;

// ══════════════════════════════════════════════════════════════
// SUPABASE DATABASE TYPE MAP  (for createClient<Database>())
// ══════════════════════════════════════════════════════════════

export type Database = {
  public: {
    Tables: {
      UserProfile:    { Row: UserProfile;    Insert: Partial<UserProfile>;    Update: Partial<UserProfile> };
      Category:       { Row: Category;       Insert: InsertCategory;          Update: Partial<Category> };
      Product:        { Row: Product;        Insert: InsertProduct;           Update: Partial<Product> };
      Mockup:         { Row: Mockup;         Insert: Omit<Mockup,'id'|'created_at'>; Update: Partial<Mockup> };
      designs:        { Row: Design;         Insert: InsertDesign;            Update: Partial<Design> };
      UserDesign:     { Row: UserDesign;     Insert: InsertUserDesign;        Update: Partial<UserDesign> };
      Cart:           { Row: Cart;           Insert: Omit<Cart,'id'|'created_at'|'updated_at'>; Update: Partial<Cart> };
      CartItem:       { Row: CartItem;       Insert: InsertCartItem;          Update: Partial<CartItem> };
      Commande:       { Row: Commande;       Insert: InsertCommande;          Update: Partial<Commande> };
      LigneCommande:  { Row: LigneCommande;  Insert: InsertLigneCommande;     Update: Partial<LigneCommande> };
    };
  };
};
