import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { baseImageUrl, designUrl, placement } = body;

    if (!baseImageUrl || !designUrl || !placement) {
      return NextResponse.json({ error: 'Missing required parameters: baseImageUrl, designUrl, and placement are required.' }, { status: 400 });
    }

    const { x, y, width, height } = placement;

    // Fetch the base image
    let baseImageBuffer: Buffer;
    try {
      const baseImageResponse = await fetch(baseImageUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
        }
      });
      if (!baseImageResponse.ok) {
        throw new Error(`Failed to fetch base image: ${baseImageResponse.statusText} (${baseImageResponse.status})`);
      }
      baseImageBuffer = Buffer.from(await baseImageResponse.arrayBuffer());
    } catch (fetchError: any) {
      console.error('Error fetching base image:', fetchError);
      return NextResponse.json({ error: `Failed to fetch base image asset: ${fetchError.message}` }, { status: 400 });
    }
    
    // Get base image dimensions
    const baseImageSharp = sharp(baseImageBuffer);
    const baseMetadata = await baseImageSharp.metadata();
    const baseImageWidth = baseMetadata.width || 500;
    const baseImageHeight = baseMetadata.height || 500;

    // Extract the design image buffer
    let designBuffer: Buffer;
    if (designUrl.startsWith('data:')) {
      const base64Data = designUrl.split(',')[1];
      designBuffer = Buffer.from(base64Data, 'base64');
    } else {
      try {
        const designResponse = await fetch(designUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
          }
        });
        if (!designResponse.ok) {
          throw new Error(`Failed to fetch design image: ${designResponse.statusText} (${designResponse.status})`);
        }
        designBuffer = Buffer.from(await designResponse.arrayBuffer());
      } catch (fetchError: any) {
        console.error('Error fetching design image:', fetchError);
        return NextResponse.json({ error: `Failed to fetch design asset: ${fetchError.message}` }, { status: 400 });
      }
    }

    // Calculate percentage-based mapping relative to the 500x500 Canvas
    // percentage = (canvasValue / 500) * 100
    const percentageX = (x / 500) * 100;
    const percentageY = (y / 500) * 100;
    const percentageW = (width / 500) * 100;
    const percentageH = (height / 500) * 100;

    // Apply percentage to the real Base Image dimensions
    // realValue = (percentage / 100) * baseImageDimension
    const realX = (percentageX / 100) * baseImageWidth;
    const realY = (percentageY / 100) * baseImageHeight;
    const realW = (percentageW / 100) * baseImageWidth;
    const realH = (percentageH / 100) * baseImageHeight;

    let finalLeft = Math.round(realX);
    let finalTop = Math.round(realY);
    const finalWidth = Math.round(realW);
    const finalHeight = Math.round(realH);

    // Apply center-origin offset subtraction if coordinates are center-based
    if (placement.originX === 'center' || placement.centerBased) {
      finalLeft -= Math.round(finalWidth / 2);
    }
    if (placement.originY === 'center' || placement.centerBased) {
      finalTop -= Math.round(finalHeight / 2);
    }

    // Physically resize the design to the calculated real dimensions before compositing
    const resizedDesign = await sharp(designBuffer)
      .resize(finalWidth, finalHeight, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .toBuffer();

    // Composite the design onto the base image
    const compositedImageBuffer = await baseImageSharp
      .composite([
        {
          input: resizedDesign,
          left: finalLeft,
          top: finalTop,
          blend: 'over',
        },
      ])
      .png()
      .toBuffer();

    // Initialize Supabase Client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { persistSession: false } }
    );

    // Generate unique filename
    const filename = `mockup_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.png`;

    // Upload to user_designs bucket
    const { error: uploadError } = await supabase.storage
      .from('user_designs')
      .upload(filename, compositedImageBuffer, {
        contentType: 'image/png',
        upsert: true
      });

    if (uploadError) {
      console.error('Supabase storage composite upload error:', uploadError);
      return NextResponse.json({ error: `Upload failed: ${uploadError.message}` }, { status: 500 });
    }

    // Get the public URL of the uploaded composited mockup
    const { data } = supabase.storage
      .from('user_designs')
      .getPublicUrl(filename);

    const publicUrl = data?.publicUrl;
    if (!publicUrl) {
      return NextResponse.json({ error: 'Failed to retrieve public URL from Supabase storage.' }, { status: 500 });
    }

    return NextResponse.json({ url: publicUrl }, { status: 200 });

  } catch (error: any) {
    console.error('Error compositing design:', error);
    return NextResponse.json({ error: error.message || 'Internal server error while compositing design.' }, { status: 500 });
  }
}
