import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'A valid prompt is required.' }, { status: 400 });
    }

    const apiKey = process.env.HUGGINGFACE_API_KEY;
    if (!apiKey) {
      console.error('Missing HUGGINGFACE_API_KEY environment variable.');
      return NextResponse.json({ error: 'Image generation service is not configured.' }, { status: 500 });
    }

    // 1. Call Hugging Face Free Inference API
    const response = await fetch(
      'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0',
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify({ inputs: prompt }),
      }
    );

    // 2. Handle Errors (Especially 503 Model Loading)
    if (!response.ok) {
      // The API might return JSON with error details (like estimated loading time)
      const errorData = await response.json().catch(() => null);
      
      if (response.status === 503 && errorData?.estimated_time) {
        return NextResponse.json(
          { error: `The AI model is currently booting up. Please wait ${Math.ceil(errorData.estimated_time)} seconds and try again.` },
          { status: 503 }
        );
      }
      
      console.error('Hugging Face API Error:', errorData || response.statusText);
      return NextResponse.json(
        { error: errorData?.error || 'Failed to generate design from the AI provider.' },
        { status: response.status }
      );
    }

    // 3. Process Binary Blob to Base64
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Image = buffer.toString('base64');
    
    // We try to extract the exact mime type returned, default to jpeg
    const mimeType = response.headers.get('content-type') || 'image/jpeg';
    const dataUri = `data:${mimeType};base64,${base64Image}`;

    return NextResponse.json({ imageUrl: dataUri });

  } catch (error: any) {
    console.error('Error generating AI design:', error);
    return NextResponse.json({ error: 'Internal server error while processing AI design.' }, { status: 500 });
  }
}
