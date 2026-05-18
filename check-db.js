 
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://htnagmiuapyxaqoptzju.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0bmFnbWl1YXB5eGFxb3B0emp1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjQ2NjMzOSwiZXhwIjoyMDkyMDQyMzM5fQ.E1sTNj7_arjPhhx5j-Dlq7-85JPK1tF6o8yxGD_ssdQ';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkTables() {
  // Try querying a table that we know SHOULD exist based on definitions
  const { data, error } = await supabase.rpc('get_tables'); // This might not exist, but let's try a direct query if possible
  
  if (error) {
    console.log("RPC failed, trying direct select on Mockup");
    const { data: mockupData, error: mockupError } = await supabase.from('Mockup').select('*').limit(5);
    if (mockupError) {
      console.error('Error fetching Mockup:', mockupError.message);
    } else {
      console.log('Mockup data:', mockupData);
    }
  } else {
    console.log('Tables:', data);
  }
}

checkTables();

