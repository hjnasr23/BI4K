import { redirect } from 'next/navigation';
import { serverClient } from '@/lib/db/client';
import { getCartWithItems } from '@/lib/db';
import ClientCart from './ClientCart';

export default async function CartPage() {
  const supabase = await serverClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?next=/cart');
  }

  const { data: cart } = await getCartWithItems(user.id);
  
  // Clean up typing: CartItem comes with Product and designs object from the query
  const cartItems = cart?.CartItem || [];

  return <ClientCart initialItems={cartItems} cartId={cart?.id} />;
}
