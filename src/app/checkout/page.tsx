import { redirect } from 'next/navigation';
import { serverClient } from '@/lib/db/client';
import { getCartWithItems, getProfile } from '@/lib/db';
import ClientCheckout from './ClientCheckout';

export default async function CheckoutPage() {
  const supabase = await serverClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?next=/checkout');
  }

  const { data: cart } = await getCartWithItems(user.id);
  
  if (!cart || !cart.CartItem || cart.CartItem.length === 0) {
    redirect('/cart');
  }
  
  const { data: profile } = await getProfile(user.id);
  const cartItems = cart.CartItem;
  
  return <ClientCheckout items={cartItems} savedAddress={profile?.shipping_address} />;
}
