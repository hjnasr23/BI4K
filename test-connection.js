 
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://htnagmiuapyxaqoptzju.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0bmFnbWl1YXB5eGFxb3B0emp1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjQ2NjMzOSwiZXhwIjoyMDkyMDQyMzM5fQ.E1sTNj7_arjPhhx5j-Dlq7-85JPK1tF6o8yxGD_ssdQ';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function listTables() {
  const { data, error } = await supabase
    .from('Mockup')
    .select('*')
    .limit(1);

  if (error) {
    console.error('Error fetching Mockup:', error.message);
  } else {
    console.log('Successfully connected to Mockup table.');
  }

  // To list tables, we usually need to query information_schema, but that's restricted via API.
  // We can try a simple query to see if it works.
  console.log('Known tables from documentation: Mockup');
}

listTables();

