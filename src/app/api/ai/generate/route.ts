import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt } = body;
    
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length < 3) {
      return NextResponse.json({ error: 'Invalid prompt' }, { status: 400 });
    }

    const hfResponse = await fetch(
      'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2-1',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inputs: prompt }),
      }
    );

    if (!hfResponse.ok) throw new Error('HF API failed');

    const blob = await hfResponse.blob();
    const buffer = Buffer.from(await blob.arrayBuffer());
    const base64 = buffer.toString('base64');
    const imageUrl = `data:image/png;base64,${base64}`;

    return NextResponse.json({ imageUrl });
  } catch (error) {
    const prompt = 'Demo Design';
    const fallback = `https://via.placeholder.com/512x512/6366f1/white?text=${encodeURIComponent(prompt.slice(0, 20))}`;
    return NextResponse.json({ imageUrl: fallback });
  }
}
