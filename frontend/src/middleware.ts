import { NextResponse } from 'next/server';

// Route protection is handled client-side via layout components
// This middleware handles basic redirects
export function middleware() {
  return NextResponse.next();
}

export const config = {
  matcher: ['/borrower/:path*', '/dashboard/:path*'],
};
