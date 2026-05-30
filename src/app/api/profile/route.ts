import { NextResponse } from 'next/server';
import { serverClient } from '@/lib/db/client';

export async function GET() {
  try {
    const supabase = await serverClient();
    const { data: { user }, error: authErr } = await supabase.auth.getUser();

    if (authErr || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let profile: any = null;
    try {
      const { data, error } = await supabase
        .from('UserProfile')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        console.warn('Error fetching UserProfile, fallback to empty profile:', error);
      } else {
        profile = data;
      }
    } catch (dbErr) {
      console.error('Database query exception in profile GET:', dbErr);
    }

    // Default NULL values to empty strings as requested.
    // Email is guaranteed to return directly from auth session.
    return NextResponse.json({
      fullName: profile?.full_name || '',
      email: user.email || '',
      phone: profile?.phone || '',
      address: typeof profile?.shipping_address === 'object'
        ? profile?.shipping_address?.street || ''
        : profile?.shipping_address || ''
    });
  } catch (err: any) {
    console.error('Unhandled error in profile GET:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const supabase = await serverClient();
    const { data: { user }, error: authErr } = await supabase.auth.getUser();

    if (authErr || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const fullName = body.fullName || body.full_name || '';
    const phone = body.phone || '';
    const address = body.address || body.shippingAddress || body.shipping_address || '';

    // Use upsert to insert row if missing, or update if exists
    const { data: profile, error } = await supabase
      .from('UserProfile')
      .upsert({
        id: user.id,
        full_name: fullName,
        phone: phone,
        shipping_address: { street: address },
        updated_at: new Date().toISOString()
      })
      .select()
      .maybeSingle();

    if (error) {
      console.error('Error upserting UserProfile:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Also sync updates to the "profiles" table to support frontend store/auth logic
    try {
      await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: fullName,
          preferred_lang: 'fr'
        });
    } catch (syncErr) {
      console.warn('Sync to profiles table failed/skipped:', syncErr);
    }

    return NextResponse.json({
      fullName: profile?.full_name || fullName,
      email: user.email || '',
      phone: profile?.phone || phone,
      address: typeof profile?.shipping_address === 'object'
        ? profile?.shipping_address?.street || address
        : profile?.shipping_address || address
    });
  } catch (err: any) {
    console.error('Unhandled error in profile PUT:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
