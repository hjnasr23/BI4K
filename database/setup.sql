-- 1. Permissions and Schema Access
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

-- 2. Enable RLS on tables
ALTER TABLE "Category" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Product" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Mockup" ENABLE ROW LEVEL SECURITY;

-- 3. Create Policies (Drop first to avoid "already exists" errors)
DROP POLICY IF EXISTS "Allow public read for Category" ON "Category";
CREATE POLICY "Allow public read for Category" ON "Category" FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read for Product" ON "Product";
CREATE POLICY "Allow public read for Product" ON "Product" FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read for Mockup" ON "Mockup";
CREATE POLICY "Allow public read for Mockup" ON "Mockup" FOR SELECT USING (true);

-- 4. Ensure Mockup table exists with correct structure
CREATE TABLE IF NOT EXISTS "Mockup" (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  url text NOT NULL,
  cloth_type text,
  target_audience text,
  view text,
  created_at timestamptz DEFAULT now()
);

-- 5. Insert Mockup Data (Ignores duplicates if they already exist)
INSERT INTO "Mockup" (name, url, cloth_type, target_audience, view)
VALUES 
('vecteezy_ai-generated-classic-crewneck-t-shirt-mockup-with-model-9_38095951.jpg', 'https://htnagmiuapyxaqoptzju.supabase.co/storage/v1/object/public/fashion/vecteezy_ai-generated-classic-crewneck-t-shirt-mockup-with-model-9_38095951.jpg', 't-shirt', 'men', 'front'),
('vecteezy_closeup-t-shirt-on-men-illustration_23692581.jpg', 'https://htnagmiuapyxaqoptzju.supabase.co/storage/v1/object/public/fashion/vecteezy_closeup-t-shirt-on-men-illustration_23692581.jpg', 't-shirt', 'men', 'front'),
('vecteezy_closeup-t-shirt-on-men-illustration_23692721.jpg', 'https://htnagmiuapyxaqoptzju.supabase.co/storage/v1/object/public/fashion/vecteezy_closeup-t-shirt-on-men-illustration_23692721.jpg', 't-shirt', 'men', 'front'),
('vecteezy_cropped-image-of-man-in-white-blank-t-shirt-on-black-background_26415904.jpg', 'https://htnagmiuapyxaqoptzju.supabase.co/storage/v1/object/public/fashion/vecteezy_cropped-image-of-man-in-white-blank-t-shirt-on-black-background_26415904.jpg', 't-shirt', 'men', 'back'),
('vecteezy_cute-boy-wearing-blank-empty-purple-t-shirt-mockup-for_33334442.jpg', 'https://htnagmiuapyxaqoptzju.supabase.co/storage/v1/object/public/fashion/vecteezy_cute-boy-wearing-blank-empty-purple-t-shirt-mockup-for_33334442.jpg', 't-shirt', 'kids', 'front'),
('vecteezy_cute-boy-wearing-blank-empty-white-t-shirt-mockup-for-design_33333288.jpg', 'https://htnagmiuapyxaqoptzju.supabase.co/storage/v1/object/public/fashion/vecteezy_cute-boy-wearing-blank-empty-white-t-shirt-mockup-for-design_33333288.jpg', 't-shirt', 'kids', 'front')
ON CONFLICT (name) DO NOTHING;
