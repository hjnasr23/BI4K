"use server";

import { createClient } from '@supabase/supabase-js';

const getAdminClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
};

export async function fetchUsersAction() {
  const { data, error } = await getAdminClient()
    .from('profiles')
    .select('*')
    .order('updated_at', { ascending: false });
    
  if (error) {
    console.error('Error in fetchUsersAction:', error);
    return { error: error.message };
  }
  return { data };
}

export async function toggleBanUserAction(userId: string, isBanned: boolean) {
  const { error } = await getAdminClient()
    .from('profiles')
    .update({ is_banned: isBanned })
    .eq('id', userId);
    
  if (error) {
    console.error('Error in toggleBanUserAction:', error);
    return { error: error.message };
  }
  return { success: true };
}

export async function deleteUserAction(userId: string) {
  const { error } = await getAdminClient()
    .from('profiles')
    .delete()
    .eq('id', userId);
    
  if (error) {
    console.error('Error in deleteUserAction:', error);
    return { error: error.message };
  }
  return { success: true };
}

export async function applyDiscountAction(userId: string, percentage: number, validDays: number) {
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + validDays);
  
  const { error } = await getAdminClient()
    .from('profiles')
    .update({
      discount_rate: percentage,
      discount_expires_at: expiryDate.toISOString()
    })
    .eq('id', userId);
    
  if (error) {
    console.error('Error in applyDiscountAction:', error);
    return { error: error.message };
  }
  return { success: true, expiresAt: expiryDate.toISOString() };
}
