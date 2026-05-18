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

-- 2. Create 'LigneCommande' table (bridge between product and design)
CREATE TABLE IF NOT EXISTS public."LigneCommande" (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    commande_id uuid, -- Reference to a Commande table (assumed to exist or will be created)
    product_id uuid, -- Reference to the Product table
    design_id uuid REFERENCES public.designs(id) ON DELETE SET NULL,
    customization_coordinates jsonb, -- Stores {x, y, scale, rotation, etc.}
    created_at timestamptz DEFAULT now()
);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.designs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."LigneCommande" ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS Policies for 'designs'
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

-- 5. Create RLS Policies for 'LigneCommande'
-- Assuming LigneCommande can only be viewed/managed by the user who owns the associated Commande or by service role.
-- Note: A more complex policy might join with Commande to check auth.uid(), but for now we provide a base template.
DROP POLICY IF EXISTS "Service role has full access to LigneCommande" ON public."LigneCommande";
CREATE POLICY "Service role has full access to LigneCommande" ON public."LigneCommande"
    USING (true) -- Service roles bypass RLS anyway, but keeping a policy as template
    WITH CHECK (true);

-- Allow users to view their own LigneCommande (Simplified: assuming we add user_id or join with Commande later)
-- For demonstration of RLS template:
-- CREATE POLICY "Users can view their own LigneCommande" ON public."LigneCommande"
--     FOR SELECT USING (
--         commande_id IN (SELECT id FROM public."Commande" WHERE user_id = auth.uid())
--     );
