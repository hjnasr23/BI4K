 
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://htnagmiuapyxaqoptzju.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0bmFnbWl1YXB5eGFxb3B0emp1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjQ2NjMzOSwiZXhwIjoyMDkyMDQyMzM5fQ.E1sTNj7_arjPhhx5j-Dlq7-85JPK1tF6o8yxGD_ssdQ';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  db: { schema: 'public' }
});

async function testSchema() {
  console.log('Testing access with explicit public schema...');
  const { data, error } = await supabase.from('Mockup').select('*').limit(1);
  if (error) console.log('Error:', error.message);
  else console.log('Success:', data);
}

testSchema();

