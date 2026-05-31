import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';

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

    return new Response(standardizedBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
      },
    });

  } catch (error: any) {
    console.error('Error standardizing image:', error);
    return NextResponse.json({ error: error.message || 'Internal server error while standardizing image.' }, { status: 500 });
  }
}
