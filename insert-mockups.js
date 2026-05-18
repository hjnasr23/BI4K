 
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://htnagmiuapyxaqoptzju.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0bmFnbWl1YXB5eGFxb3B0emp1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjQ2NjMzOSwiZXhwIjoyMDkyMDQyMzM5fQ.E1sTNj7_arjPhhx5j-Dlq7-85JPK1tF6o8yxGD_ssdQ';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const mockups = [
  {
    "name": "vecteezy_ai-generated-classic-crewneck-t-shirt-mockup-with-model-9_38095951.jpg",
    "url": "https://htnagmiuapyxaqoptzju.supabase.co/storage/v1/object/public/fashion/vecteezy_ai-generated-classic-crewneck-t-shirt-mockup-with-model-9_38095951.jpg",
    "cloth_type": "t-shirt",
    "target_audience": "men",
    "view": "front"
  },
  {
    "name": "vecteezy_closeup-t-shirt-on-men-illustration_23692581.jpg",
    "url": "https://htnagmiuapyxaqoptzju.supabase.co/storage/v1/object/public/fashion/vecteezy_closeup-t-shirt-on-men-illustration_23692581.jpg",
    "cloth_type": "t-shirt",
    "target_audience": "men",
    "view": "front"
  },
  {
    "name": "vecteezy_closeup-t-shirt-on-men-illustration_23692721.jpg",
    "url": "https://htnagmiuapyxaqoptzju.supabase.co/storage/v1/object/public/fashion/vecteezy_closeup-t-shirt-on-men-illustration_23692721.jpg",
    "cloth_type": "t-shirt",
    "target_audience": "men",
    "view": "front"
  },
  {
    "name": "vecteezy_cropped-image-of-man-in-white-blank-t-shirt-on-black-background_26415904.jpg",
    "url": "https://htnagmiuapyxaqoptzju.supabase.co/storage/v1/object/public/fashion/vecteezy_cropped-image-of-man-in-white-blank-t-shirt-on-black-background_26415904.jpg",
    "cloth_type": "t-shirt",
    "target_audience": "men",
    "view": "back"
  },
  {
    "name": "vecteezy_cute-boy-wearing-blank-empty-purple-t-shirt-mockup-for_33334442.jpg",
    "url": "https://htnagmiuapyxaqoptzju.supabase.co/storage/v1/object/public/fashion/vecteezy_cute-boy-wearing-blank-empty-purple-t-shirt-mockup-for_33334442.jpg",
    "cloth_type": "t-shirt",
    "target_audience": "kids",
    "view": "front"
  },
  {
    "name": "vecteezy_cute-boy-wearing-blank-empty-white-t-shirt-mockup-for-design_33333288.jpg",
    "url": "https://htnagmiuapyxaqoptzju.supabase.co/storage/v1/object/public/fashion/vecteezy_cute-boy-wearing-blank-empty-white-t-shirt-mockup-for-design_33333288.jpg",
    "cloth_type": "t-shirt",
    "target_audience": "kids",
    "view": "front"
  }
];

async function insertMockups() {
  console.log('Inserting mockups one by one to avoid constraint errors...');
  
  for (const mockup of mockups) {
    const { error } = await supabase
      .from('Mockup')
      .insert([mockup]);
    
    if (error) {
      if (error.code === '23505') {
        console.log(`Skipping duplicate: ${mockup.name}`);
      } else {
        console.error(`Error inserting ${mockup.name}:`, error.message);
      }
    } else {
      console.log(`Inserted: ${mockup.name}`);
    }
  }
  console.log('Finished processing mockups.');
}

insertMockups();

