import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory rate limiting
const rateLimit = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT = 100; // requests
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

function cleanupOldEntries() {
  const now = Date.now();
  for (const [key, value] of rateLimit.entries()) {
    if (now > value.resetTime) {
      rateLimit.delete(key);
    }
  }
}

export function middleware(request: NextRequest) {
  // Only rate limit image generation endpoints
  if (!request.nextUrl.pathname.match(/\/(brand|podium)\/\d+/)) {
    return NextResponse.next();
  }

  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
  const now = Date.now();
  
  // Cleanup old entries periodically
  if (Math.random() < 0.1) cleanupOldEntries();
  
  const key = ip;
  const current = rateLimit.get(key);
  
  if (!current || now > current.resetTime) {
    // First request or window expired
    rateLimit.set(key, { count: 1, resetTime: now + WINDOW_MS });
    return NextResponse.next();
  }
  
  if (current.count >= RATE_LIMIT) {
    return new NextResponse('Rate limit exceeded', { 
      status: 429,
      headers: {
        'Retry-After': Math.ceil((current.resetTime - now) / 1000).toString(),
        'X-RateLimit-Limit': RATE_LIMIT.toString(),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': Math.ceil(current.resetTime / 1000).toString(),
      }
    });
  }
  
  // Increment counter
  current.count++;
  rateLimit.set(key, current);
  
  // Add rate limit headers to successful responses
  const response = NextResponse.next();
  response.headers.set('X-RateLimit-Limit', RATE_LIMIT.toString());
  response.headers.set('X-RateLimit-Remaining', (RATE_LIMIT - current.count).toString());
  response.headers.set('X-RateLimit-Reset', Math.ceil(current.resetTime / 1000).toString());
  
  return response;
}

export const config = {
  matcher: [
    '/brand/:id*',
    '/podium/:id*'
  ]
};