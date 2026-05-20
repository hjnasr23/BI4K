import { redirect } from 'next/navigation';
import { serverClient } from '@/lib/db/client';
import { getProfile, getOrdersByUser } from '@/lib/db';
import ClientProfile from './ClientProfile';

export default async function ProfilePage() {
  const supabase = await serverClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?next=/profile');
  }

  const { data: profile } = await getProfile(user.id);
  const { data: orders } = await getOrdersByUser(user.id);

  return <ClientProfile userEmail={user.email || ''} profile={profile!} orders={orders || []} />;
}
