-- ============================================================
-- BI4K — Row Level Security Policies
-- Run AFTER schema_complete.sql
-- ============================================================

-- ── UserProfile ───────────────────────────────────────────
ALTER TABLE public."UserProfile" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own profile"   ON public."UserProfile";
DROP POLICY IF EXISTS "Users update own profile" ON public."UserProfile";
DROP POLICY IF EXISTS "Users insert own profile" ON public."UserProfile";

CREATE POLICY "Users view own profile"   ON public."UserProfile" FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public."UserProfile" FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON public."UserProfile" FOR INSERT WITH CHECK (auth.uid() = id);

-- ── Category (public read) ────────────────────────────────
ALTER TABLE public."Category" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read categories" ON public."Category";
CREATE POLICY "Public can read categories" ON public."Category" FOR SELECT USING (true);

-- ── Product (public read active only) ────────────────────
ALTER TABLE public."Product" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read active products" ON public."Product";
CREATE POLICY "Public can read active products" ON public."Product"
    FOR SELECT USING (is_active = true);

-- ── Mockup (public read) ──────────────────────────────────
ALTER TABLE public."Mockup" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read mockups" ON public."Mockup";
CREATE POLICY "Public can read mockups" ON public."Mockup" FOR SELECT USING (true);

-- ── designs ───────────────────────────────────────────────
ALTER TABLE public.designs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own designs" ON public.designs;
CREATE POLICY "Users manage own designs" ON public.designs
    USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ── UserDesign ────────────────────────────────────────────
ALTER TABLE public."UserDesign" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own user designs" ON public."UserDesign";
CREATE POLICY "Users manage own user designs" ON public."UserDesign"
    USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ── Cart ──────────────────────────────────────────────────
ALTER TABLE public."Cart" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own cart" ON public."Cart";
CREATE POLICY "Users manage own cart" ON public."Cart"
    USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ── CartItem ──────────────────────────────────────────────
ALTER TABLE public."CartItem" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own cart items" ON public."CartItem";
CREATE POLICY "Users manage own cart items" ON public."CartItem"
    USING (cart_id IN (SELECT id FROM public."Cart" WHERE user_id = auth.uid()))
    WITH CHECK (cart_id IN (SELECT id FROM public."Cart" WHERE user_id = auth.uid()));

-- ── Commande ──────────────────────────────────────────────
ALTER TABLE public."Commande" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own orders" ON public."Commande";
CREATE POLICY "Users manage own orders" ON public."Commande"
    USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ── LigneCommande ─────────────────────────────────────────
ALTER TABLE public."LigneCommande" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own order lines" ON public."LigneCommande";
CREATE POLICY "Users manage own order lines" ON public."LigneCommande"
    USING (commande_id IN (SELECT id FROM public."Commande" WHERE user_id = auth.uid()))
    WITH CHECK (commande_id IN (SELECT id FROM public."Commande" WHERE user_id = auth.uid()));

-- ── Grant service_role full access (bypasses RLS) ─────────
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
