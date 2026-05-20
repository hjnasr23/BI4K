-- schema_phase1.sql
-- Task 1: Supabase Schema Initialization for Phase 1

-- 1. Create 'designs' table
CREATE TABLE IF NOT EXISTS public.designs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    url text NOT NULL, -- Storage URL
    user_id uuid, -- Link to auth.users if needed
    prompt text,
    is_ai boolean DEFAULT false,
    created_at timestamptz DEFAULT now()
);

-- 2. Create 'Commande' table (main order table)
CREATE TABLE IF NOT EXISTS public."Commande" (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    status text DEFAULT 'pending', -- pending, confirmed, shipped, delivered, cancelled
    total_price numeric(10, 2),
    order_notes text,
    shipping_address jsonb, -- {street, city, zip, country, etc.}
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 3. Create 'LigneCommande' table (bridge between product and design)
CREATE TABLE IF NOT EXISTS public."LigneCommande" (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    commande_id uuid REFERENCES public."Commande"(id) ON DELETE CASCADE,
    product_id uuid, -- Reference to the Product table
    design_id uuid REFERENCES public.designs(id) ON DELETE SET NULL,
    customization_coordinates jsonb, -- Stores {x, y, scale, rotation, etc.}
    quantity integer DEFAULT 1,
    price_unit numeric(10, 2),
    preview_url text, -- URL of the preview image
    created_at timestamptz DEFAULT now()
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.designs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Commande" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."LigneCommande" ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS Policies for 'designs'
-- Allow users to see their own designs
DROP POLICY IF EXISTS "Users can view their own designs" ON public.designs;
CREATE POLICY "Users can view their own designs" ON public.designs
    FOR SELECT USING (auth.uid() = user_id);

-- Allow users to insert their own designs
DROP POLICY IF EXISTS "Users can insert their own designs" ON public.designs;
CREATE POLICY "Users can insert their own designs" ON public.designs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own designs
DROP POLICY IF EXISTS "Users can update their own designs" ON public.designs;
CREATE POLICY "Users can update their own designs" ON public.designs
    FOR UPDATE USING (auth.uid() = user_id);

-- Allow users to delete their own designs
DROP POLICY IF EXISTS "Users can delete their own designs" ON public.designs;
CREATE POLICY "Users can delete their own designs" ON public.designs
    FOR DELETE USING (auth.uid() = user_id);

-- 6. Create RLS Policies for 'Commande'
-- Allow users to view their own orders
DROP POLICY IF EXISTS "Users can view their own orders" ON public."Commande";
CREATE POLICY "Users can view their own orders" ON public."Commande"
    FOR SELECT USING (auth.uid() = user_id);

-- Allow users to insert their own orders
DROP POLICY IF EXISTS "Users can insert their own orders" ON public."Commande";
CREATE POLICY "Users can insert their own orders" ON public."Commande"
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own orders
DROP POLICY IF EXISTS "Users can update their own orders" ON public."Commande";
CREATE POLICY "Users can update their own orders" ON public."Commande"
    FOR UPDATE USING (auth.uid() = user_id);

-- Allow users to delete their own orders
DROP POLICY IF EXISTS "Users can delete their own orders" ON public."Commande";
CREATE POLICY "Users can delete their own orders" ON public."Commande"
    FOR DELETE USING (auth.uid() = user_id);

-- 7. Create RLS Policies for 'LigneCommande'
-- Allow users to view lines from their own orders
DROP POLICY IF EXISTS "Users can view their own order lines" ON public."LigneCommande";
CREATE POLICY "Users can view their own order lines" ON public."LigneCommande"
    FOR SELECT USING (
        commande_id IN (SELECT id FROM public."Commande" WHERE user_id = auth.uid())
    );

-- Allow users to insert lines in their own orders
DROP POLICY IF EXISTS "Users can insert order lines in their orders" ON public."LigneCommande";
CREATE POLICY "Users can insert order lines in their orders" ON public."LigneCommande"
    FOR INSERT WITH CHECK (
        commande_id IN (SELECT id FROM public."Commande" WHERE user_id = auth.uid())
    );

-- Allow users to update lines in their own orders
DROP POLICY IF EXISTS "Users can update order lines in their orders" ON public."LigneCommande";
CREATE POLICY "Users can update order lines in their orders" ON public."LigneCommande"
    FOR UPDATE USING (
        commande_id IN (SELECT id FROM public."Commande" WHERE user_id = auth.uid())
    );

-- Allow users to delete lines from their own orders
DROP POLICY IF EXISTS "Users can delete order lines from their orders" ON public."LigneCommande";
CREATE POLICY "Users can delete order lines from their orders" ON public."LigneCommande"
    FOR DELETE USING (
        commande_id IN (SELECT id FROM public."Commande" WHERE user_id = auth.uid())
    );
