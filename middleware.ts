import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isAuthenticated = !!req.auth

  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/register', '/reset-password']
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))

  // API routes that should be public
  const publicApiRoutes = ['/api/auth']
  const isPublicApiRoute = publicApiRoutes.some(route => pathname.startsWith(route))

  // Protected routes
  const protectedRoutes = ['/trips', '/profile']
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))

  // If user is authenticated and trying to access login/register, redirect to trips
  if (isAuthenticated && isPublicRoute) {
    return NextResponse.redirect(new URL('/trips', req.url))
  }

  // If user is not authenticated and trying to access protected routes, redirect to login
  if (!isAuthenticated && isProtectedRoute) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Allow the request to proceed
  return NextResponse.next()
})

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
