import { NextRequest, NextResponse } from 'next/server';

// Define public routes that do not require authentication
const publicRoutes = [
  '/', // Assuming home page is public
  '/explore',
  '/sign-in',
  '/sign-up',
  '/api/auth/login',
  '/api/auth/register',
  '/api/threads/public', // If you have public API endpoints
];

// Function to check if a path matches any of the public route patterns
function isPublicPath(pathname: string): boolean {
  if (publicRoutes.includes(pathname)) {
    return true;
  }
  // Example for dynamic public routes like /thread/[id]
  if (pathname.startsWith('/thread/') && pathname.split('/').length === 3) {
    // Basic check, assumes /thread/[someId] is public
    return true;
  }
  // Example for API public routes
  if (pathname.startsWith('/api/public/')) {
    return true;
  }
  return false;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const authSessionCookie = req.cookies.get('auth_session');

  // Allow public routes
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // If trying to access a protected route without a session cookie
  if (!authSessionCookie?.value) {
    const signInUrl = new URL('/sign-in', req.url);
    signInUrl.searchParams.set('redirect_url', pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Session cookie exists, proceed to the requested page
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - Any paths with a file extension (e.g., .svg, .png, .jpg, .js, .css)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
};