import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const publicPaths = ['/login']

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  const token = request.cookies.get('token')?.value || ''
  
  console.log('Middleware - Path:', path);
  console.log('Middleware - Token:', token ? 'exists' : 'none');

  if (path === '/') {
    const response = NextResponse.redirect(new URL('/login', request.url))
    response.cookies.delete('token')
    return response
  }

  if (path === '/login' || path == '/logout') {
    const response = NextResponse.next()
    response.cookies.delete('token')
    return response
  }


  const isPublicPath = publicPaths.includes(path)

  if (!isPublicPath && !token) {
    console.log('Middleware - Redirecting to login (unauthenticated user on protected path)');
    const response = NextResponse.redirect(new URL('/login', request.url))
    response.cookies.delete('token')
    return response
  }

  console.log('Middleware - Allowing request to proceed');
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
} 