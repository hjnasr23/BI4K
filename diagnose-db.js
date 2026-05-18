 
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://htnagmiuapyxaqoptzju.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0bmFnbWl1YXB5eGFxb3B0emp1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjQ2NjMzOSwiZXhwIjoyMDkyMDQyMzM5fQ.E1sTNj7_arjPhhx5j-Dlq7-85JPK1tF6o8yxGD_ssdQ';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function diagnose() {
  console.log('--- Checking Mockup Table ---');
  const { data: mockups, error: mockupError } = await supabase.from('Mockup').select('*').limit(5);
  if (mockupError) console.error('Mockup Error:', mockupError.message);
  else console.log('Mockups found:', mockups.length, mockups);

  console.log('\n--- Checking Category Table ---');
  const { data: categories, error: catError } = await supabase.from('Category').select('*');
  if (catError) console.error('Category Error:', catError.message);
  else console.log('Categories found:', categories.length, categories);

  console.log('\n--- Checking Product Table ---');
  const { data: products, error: prodError } = await supabase.from('Product').select('*').limit(5);
  if (prodError) console.error('Product Error:', prodError.message);
  else console.log('Products found:', products.length, products);
}

diagnose();

