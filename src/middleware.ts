import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  // Skip auth routes completely
  if (request.nextUrl.pathname.startsWith('/api/auth')) {
    return NextResponse.next()
  }

  // Get the user's token
  const token = await getToken({ req: request })

  // Check if the request is for the admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!token?.role || token.role.toString() !== 'admin') {
      // Redirect non-admin users to the home page
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return NextResponse.next()
}

// Match all routes except auth-related ones and static files
export const config = {
  matcher: [
    '/admin/:path*',
    '/((?!api/auth/.*|_next/static|_next/image|favicon.ico).*)'
  ]
}
