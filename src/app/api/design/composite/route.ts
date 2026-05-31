import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { baseImageUrl, designUrl, placement } = body;

    if (!baseImageUrl || !designUrl || !placement) {
      return NextResponse.json({ error: 'Missing required parameters: baseImageUrl, designUrl, and placement are required.' }, { status: 400 });
    }

    const { x, y, width, height } = placement;

    // Fetch the base image
    const baseImageResponse = await fetch(baseImageUrl);
    if (!baseImageResponse.ok) {
      return NextResponse.json({ error: `Failed to fetch base image: ${baseImageResponse.statusText}` }, { status: 400 });
    }
    const baseImageBuffer = Buffer.from(await baseImageResponse.arrayBuffer());
    
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
      const designResponse = await fetch(designUrl);
      if (!designResponse.ok) {
        return NextResponse.json({ error: `Failed to fetch design image: ${designResponse.statusText}` }, { status: 400 });
      }
      designBuffer = Buffer.from(await designResponse.arrayBuffer());
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

    const finalLeft = Math.round(realX);
    const finalTop = Math.round(realY);
    const finalWidth = Math.round(realW);
    const finalHeight = Math.round(realH);

    // Physically resize the design to the calculated real dimensions before compositing
    const resizedDesign = await sharp(designBuffer)
      .resize(finalWidth, finalHeight)
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

    return new Response(compositedImageBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
      },
    });

  } catch (error: any) {
    console.error('Error compositing design:', error);
    return NextResponse.json({ error: error.message || 'Internal server error while compositing design.' }, { status: 500 });
  }
}
