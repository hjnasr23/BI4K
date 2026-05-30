import { createClient } from '@supabase/supabase-js';
import UsersTableClient from './UsersTableClient';

export const dynamic = 'force-dynamic';

export default async function UsersPage() {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: users, error } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .order('updated_at', { ascending: false });

  if (error) {
    console.error("Supabase Admin Fetch Error:", error);
  }

  // Pass the fetched users to the Client Component that handles the UI and Actions
  return <UsersTableClient users={users || []} />;
}
