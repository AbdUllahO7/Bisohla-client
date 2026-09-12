import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';

// In-memory cache for processed images
const imageCache = new Map<
  string,
  { buffer: Buffer; contentType: string; timestamp: number }
>();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const imageUrl = searchParams.get('url');

  if (!imageUrl) {
    return new NextResponse('Missing url parameter', { status: 400 });
  }

  // Check in-memory cache
  const cached = imageCache.get(imageUrl);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return new NextResponse(new Uint8Array(cached.buffer), {
      headers: {  
        'Content-Type': cached.contentType,
        'Cache-Control': 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400',
      },
    });
  }

  try {
    // Fetch original image
    const response = await fetch(imageUrl, {
      next: { revalidate: 86400 },
    });

    if (!response.ok) {
      // If fetching fails, redirect to original URL
      return NextResponse.redirect(imageUrl);
    }

    const arrayBuffer = await response.arrayBuffer();
    const inputBuffer = Buffer.from(arrayBuffer);

    // Trim transparent / border whitespace
    let outputBuffer: Buffer;
    let contentType = 'image/webp';

    try {
      outputBuffer = await sharp(inputBuffer)
        .trim()
        .webp({ quality: 90 })
        .toBuffer();
    } catch {
      // If trimming fails (e.g. solid single-color image), fallback to original buffer
      outputBuffer = inputBuffer;
      contentType = response.headers.get('content-type') || 'image/png';
    }

    // Cache processed buffer
    imageCache.set(imageUrl, {
      buffer: outputBuffer,
      contentType,
      timestamp: Date.now(),
    });

    return new NextResponse(new Uint8Array(outputBuffer), {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('Error optimizing logo image:', error);
    // On failure, redirect to original URL so the logo still loads
    return NextResponse.redirect(imageUrl);
  }
}
