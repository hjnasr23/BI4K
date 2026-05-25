import { NextRequest, NextResponse } from 'next/server';
import { adminClient } from '@/lib/db/client';

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'A valid prompt is required.' }, { status: 400 });
    }

    // 1. Fetch from Pollinations AI
    const encodedPrompt = encodeURIComponent(prompt);
    const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&nologo=true`;

    const response = await fetch(pollinationsUrl);

    if (!response.ok) {
      throw new Error(`Pollinations API Error: ${response.statusText}`);
    }

    // 2. Convert to Buffer
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 3. Upload to Supabase Storage using admin privileges
    const supabase = adminClient();
    const filename = `design_${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;

    const { error: uploadError } = await supabase.storage
      .from('user_designs')
      .upload(filename, buffer, {
        contentType: 'image/jpeg',
        upsert: true,
      });

    if (uploadError) {
      throw new Error(`Failed to upload to vault: ${uploadError.message}`);
    }

    // 4. Get Public URL
    const { data: { publicUrl } } = supabase.storage
      .from('user_designs')
      .getPublicUrl(filename);

    return NextResponse.json({ imageUrl: publicUrl });

  } catch (error: any) {
    console.error('Error generating AI design:', error);
    return NextResponse.json({ error: error.message || 'Internal server error while processing AI design.' }, { status: 500 });
  }
}
