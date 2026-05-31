import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Standardize to 1024x1024 PNG with transparent background
    const standardizedBuffer = await sharp(buffer)
      .resize({
        width: 1024,
        height: 1024,
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toBuffer();

    // Initialize Supabase Client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { persistSession: false } }
    );

    // Generate unique temporary filename
    const filename = `standardized_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.png`;

    // Upload to user_designs bucket
    const { error: uploadError } = await supabase.storage
      .from('user_designs')
      .upload(filename, standardizedBuffer, {
        contentType: 'image/png',
        upsert: true
      });

    if (uploadError) {
      console.error('Supabase storage upload error:', uploadError);
      return NextResponse.json({ error: `Upload failed: ${uploadError.message}` }, { status: 500 });
    }

    // Get the public URL of the uploaded standardized design
    const { data } = supabase.storage
      .from('user_designs')
      .getPublicUrl(filename);

    const publicUrl = data?.publicUrl;
    if (!publicUrl) {
      return NextResponse.json({ error: 'Failed to retrieve public URL from Supabase storage.' }, { status: 500 });
    }

    return NextResponse.json({ url: publicUrl }, { status: 200 });

  } catch (error: any) {
    console.error('Error standardizing and uploading image:', error);
    return NextResponse.json({ error: error.message || 'Internal server error while standardizing image.' }, { status: 500 });
  }
}
