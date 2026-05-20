'use server';

import { serverClient } from '@/lib/db/client';
import { getCartWithItems, insertOrder, clearCart } from '@/lib/db';
import type { ShippingAddress, InsertCommande, InsertLigneCommande } from '@/lib/db/types';

export async function processCheckout(shippingAddress: ShippingAddress) {
  const supabase = await serverClient();
  const { data: { user }, error: authErr } = await supabase.auth.getUser();

  if (authErr || !user) {
    return { error: 'Authentication required' };
  }

  // 1. Get current cart and items
  const { data: cart } = await getCartWithItems(user.id);
  
  if (!cart || !cart.CartItem || cart.CartItem.length === 0) {
    return { error: 'Your cart is empty' };
  }

  const items = cart.CartItem;
  const totalPrice = items.reduce((sum: number, item: any) => sum + (item.price_unit * item.quantity), 0);

  // 2. Prepare Order Payload
  const orderPayload: InsertCommande = {
    user_id: user.id,
    status: 'confirmed',
    total_price: totalPrice,
    order_notes: null,
    shipping_address: shippingAddress,
    payment_method: 'card',
    payment_status: 'paid', // Simulating successful payment
  };

  // 3. Prepare Line Items Payload
  const lineItems: InsertLigneCommande[] = items.map((item: any) => ({
    commande_id: '', // Will be injected by insertOrder
    product_id: item.product_id,
    design_id: item.design_id,
    customization_coordinates: {
      color: item.selected_color,
      size: item.selected_size,
    },
    quantity: item.quantity,
    price_unit: item.price_unit,
    preview_url: item.designs?.url || null,
  }));

  // 4. Insert Order and Lines atomically
  const { data: order, error: orderErr } = await insertOrder(orderPayload, lineItems);

  if (orderErr) {
    console.error('Checkout Error:', orderErr);
    return { error: 'Failed to process order' };
  }

  // 5. Clear the cart
  await clearCart(cart.id);

  return { success: true, orderId: order?.id };
}
