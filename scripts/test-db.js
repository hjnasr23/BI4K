// scripts/test-db.js
// ─────────────────────────────────────────────────────────────
// Standalone connection test — runs directly with Node.js.
// Usage: node scripts/test-db.js
//
// Reads .env.local automatically (no dotenv install needed).
// ─────────────────────────────────────────────────────────────

const fs   = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// ── Load .env.local manually ─────────────────────────────────
const envPath = path.resolve(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const [key, ...rest] = trimmed.split('=');
    if (key) process.env[key.trim()] = rest.join('=').trim();
  }
  console.log('✅  Loaded .env.local');
} else {
  console.error('❌  .env.local not found at', envPath);
  process.exit(1);
}

// ── Build Supabase client ────────────────────────────────────
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌  Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false },
});

// ── Tables to test ───────────────────────────────────────────
const TABLES = [
  { name: 'Category',       emoji: '🏷️ ' },
  { name: 'Product',        emoji: '👕' },
  { name: 'Mockup',         emoji: '🖼️ ' },
  { name: 'designs',        emoji: '🎨' },
  { name: 'UserDesign',     emoji: '✏️ ' },
  { name: 'UserProfile',    emoji: '👤' },
  { name: 'Cart',           emoji: '🛒' },
  { name: 'CartItem',       emoji: '📦' },
  { name: 'Commande',       emoji: '🧾' },
  { name: 'LigneCommande',  emoji: '📋' },
];

// ── Test runner ──────────────────────────────────────────────
async function runTests() {
  console.log('\n══════════════════════════════════════════');
  console.log('   BI4K — Database Connection Test');
  console.log('══════════════════════════════════════════');
  console.log(`   URL: ${SUPABASE_URL}`);
  console.log('──────────────────────────────────────────\n');

  // 1. Auth check
  console.log('🔌  Testing connection...');
  const { error: authError } = await supabase.auth.getSession();
  if (authError) {
    console.error('❌  Auth check failed:', authError.message);
    process.exit(1);
  }
  console.log('✅  Connection established\n');

  // 2. Table existence + row counts
  console.log('📊  Checking tables:\n');
  const results = [];
  let allOk = true;

  for (const { name, emoji } of TABLES) {
    const start = Date.now();
    const { count, error } = await supabase
      .from(name)
      .select('*', { count: 'exact', head: true });
    const ms = Date.now() - start;

    if (error) {
      console.log(`  ${emoji}  ${name.padEnd(16)} ❌  ${error.message}`);
      allOk = false;
      results.push({ name, ok: false, count: 0, ms, error: error.message });
    } else {
      console.log(`  ${emoji}  ${name.padEnd(16)} ✅  ${String(count ?? 0).padStart(4)} rows  (${ms}ms)`);
      results.push({ name, ok: true, count: count ?? 0, ms, error: null });
    }
  }

  // 3. Sample data test — read first category
  console.log('\n──────────────────────────────────────────');
  console.log('🔍  Sample query: first 3 Categories\n');
  const { data: cats, error: catsErr } = await supabase
    .from('Category')
    .select('id, name')
    .order('name')
    .limit(3);

  if (catsErr) {
    console.log('  ❌  Query failed:', catsErr.message);
  } else if (!cats || cats.length === 0) {
    console.log('  ⚠️   No categories found — add some via the Admin panel at /admin/categories');
  } else {
    cats.forEach((c, i) =>
      console.log(`  ${i + 1}. ${c.name}  (id: ${c.id.substring(0, 8)}…)`)
    );
  }

  // 4. Sample data test — read first product with join
  console.log('\n🔍  Sample query: first 3 Products with Category join\n');
  const { data: prods, error: prodsErr } = await supabase
    .from('Product')
    .select('id, name')
    .limit(3);

  if (prodsErr) {
    console.log('  ❌  Query failed:', prodsErr.message);
  } else if (!prods || prods.length === 0) {
    console.log('  ⚠️   No products found — add some via the Admin panel at /admin/products');
  } else {
    prods.forEach((p, i) => {
      console.log(`  ${i + 1}. ${p.name}`);
    });
  }

  // 5. Summary
  const failed = results.filter(r => !r.ok);
  console.log('\n══════════════════════════════════════════');
  if (allOk) {
    console.log('🎉  All tables reachable — database is ready!');
  } else {
    console.log(`⚠️   ${failed.length} table(s) failed:`);
    failed.forEach(r => console.log(`     • ${r.name}: ${r.error}`));
    console.log('\n   → Run schema_complete.sql + rls_policies.sql in Supabase SQL Editor');
  }
  console.log('══════════════════════════════════════════\n');

  process.exit(allOk ? 0 : 1);
}

runTests().catch(err => {
  console.error('\n❌  Unexpected error:', err.message);
  process.exit(1);
});
