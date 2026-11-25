import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/tasks/:path*',
    '/goals/:path*',
    '/habits/:path*',
    '/analytics/:path*',
    '/calendar/:path*',
    '/notifications/:path*',
    '/profile/:path*',
    '/settings/:path*',
    '/auth/:path*',
  ],
};
