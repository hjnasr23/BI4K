'use server';

import { serverClient } from '@/lib/db/client';
import { updateProfile } from '@/lib/db';
import type { ShippingAddress } from '@/lib/db/types';

export async function saveProfileInfo(fullName: string, phone: string, address: ShippingAddress) {
  const supabase = await serverClient();
  const { data: { user }, error: authErr } = await supabase.auth.getUser();

  if (authErr || !user) {
    return { error: 'Authentication required' };
  }

  const { error } = await updateProfile(user.id, {
    full_name: fullName,
    phone: phone,
    shipping_address: address,
  });

  if (error) {
    console.error('Failed to update profile:', error);
    return { error: 'Failed to update profile' };
  }

  return { success: true };
}
