import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  // Get the user's token
  const token = await getToken({ req: request })

  // Check if the request is for the admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!token?.role || token.role !== 'admin') {
      // Redirect non-admin users to the home page
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/admin/:path*',
}
