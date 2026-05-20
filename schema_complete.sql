-- ============================================================
-- BI4K — Complete Schema  (Run in Supabase SQL Editor)
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── 1. UserProfile ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public."UserProfile" (
    id               uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name        text,
    avatar_url       text,
    phone            text,
    shipping_address jsonb DEFAULT '{}'::jsonb,
    preferred_lang   text DEFAULT 'fr',
    created_at       timestamptz DEFAULT now(),
    updated_at       timestamptz DEFAULT now()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
    INSERT INTO public."UserProfile" (id, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Shared updated_at trigger function
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER trg_userprofile_updated_at
    BEFORE UPDATE ON public."UserProfile"
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── 2. Category ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public."Category" (
    id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name       text NOT NULL,
    image_url  text,
    created_at timestamptz DEFAULT now()
);

-- ── 3. Product ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public."Product" (
    id               uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    category_id      uuid REFERENCES public."Category"(id) ON DELETE SET NULL,
    name             text NOT NULL,
    available_colors text[]  DEFAULT '{}',
    sizes            text[]  DEFAULT '{}',
    base_image_url   text,
    base_price       numeric(10, 2) DEFAULT 0,
    is_active        boolean DEFAULT true,
    created_at       timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_product_category ON public."Product"(category_id);
CREATE INDEX IF NOT EXISTS idx_product_active    ON public."Product"(is_active);

-- ── 4. Mockup (already exists — safe to re-run) ───────────
CREATE TABLE IF NOT EXISTS public."Mockup" (
    id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name            text NOT NULL UNIQUE,
    url             text NOT NULL,
    cloth_type      text,
    target_audience text,
    view            text,
    created_at      timestamptz DEFAULT now()
);

-- ── 5. designs (already exists — enhanced) ────────────────
CREATE TABLE IF NOT EXISTS public.designs (
    id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id    uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    url        text NOT NULL,
    prompt     text,
    is_ai      boolean DEFAULT false,
    created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_designs_user ON public.designs(user_id);

-- ── 6. UserDesign ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public."UserDesign" (
    id                     uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id                uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id             uuid REFERENCES public."Product"(id) ON DELETE SET NULL,
    design_id              uuid REFERENCES public.designs(id) ON DELETE SET NULL,
    generated_ai_image_url text,
    selected_support       text DEFAULT 'front',
    customization_data     jsonb DEFAULT '{}'::jsonb,
    created_at             timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_userdesign_user    ON public."UserDesign"(user_id);
CREATE INDEX IF NOT EXISTS idx_userdesign_product ON public."UserDesign"(product_id);

-- ── 7. Cart ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public."Cart" (
    id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id    uuid UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TRIGGER trg_cart_updated_at
    BEFORE UPDATE ON public."Cart"
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE IF NOT EXISTS public."CartItem" (
    id             uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    cart_id        uuid NOT NULL REFERENCES public."Cart"(id) ON DELETE CASCADE,
    product_id     uuid REFERENCES public."Product"(id) ON DELETE CASCADE,
    design_id      uuid REFERENCES public.designs(id) ON DELETE SET NULL,
    selected_color text,
    selected_size  text,
    quantity       integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
    price_unit     numeric(10, 2) NOT NULL DEFAULT 0,
    added_at       timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cartitem_cart    ON public."CartItem"(cart_id);
CREATE INDEX IF NOT EXISTS idx_cartitem_product ON public."CartItem"(product_id);

-- ── 8. Commande (already exists — enhanced) ───────────────
CREATE TABLE IF NOT EXISTS public."Commande" (
    id               uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id          uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    status           text DEFAULT 'pending',
    total_price      numeric(10, 2) NOT NULL DEFAULT 0,
    order_notes      text,
    shipping_address jsonb DEFAULT '{}'::jsonb,
    payment_method   text DEFAULT 'cash_on_delivery',
    payment_status   text DEFAULT 'unpaid',
    created_at       timestamptz DEFAULT now(),
    updated_at       timestamptz DEFAULT now()
);

CREATE TRIGGER trg_commande_updated_at
    BEFORE UPDATE ON public."Commande"
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX IF NOT EXISTS idx_commande_user   ON public."Commande"(user_id);
CREATE INDEX IF NOT EXISTS idx_commande_status ON public."Commande"(status);

-- ── 9. LigneCommande (already exists — enhanced) ──────────
CREATE TABLE IF NOT EXISTS public."LigneCommande" (
    id                        uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    commande_id               uuid NOT NULL REFERENCES public."Commande"(id) ON DELETE CASCADE,
    product_id                uuid REFERENCES public."Product"(id) ON DELETE SET NULL,
    design_id                 uuid REFERENCES public.designs(id) ON DELETE SET NULL,
    customization_coordinates jsonb DEFAULT '{}'::jsonb,
    quantity                  integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
    price_unit                numeric(10, 2) NOT NULL DEFAULT 0,
    preview_url               text,
    created_at                timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lignecommande_commande ON public."LigneCommande"(commande_id);
