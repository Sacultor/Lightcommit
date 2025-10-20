import { NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

// 需要认证的页面路由
const protectedRoutes = [
  '/dashboard/mint',
  '/profiles',
  '/contributions',
]

// 需要认证的 API 路由
const protectedApiRoutes = [
  '/api/auth/user',
  '/api/contributions',
]

// 公开路由
const publicRoutes = [
  '/',
  '/discover',
  '/auth/callback',
  '/auth/error',
  '/api/auth/github',
  '/api/auth/logout',
  '/api/health',
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 对于所有请求，更新 Supabase session
  return await updateSession(request)
}

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