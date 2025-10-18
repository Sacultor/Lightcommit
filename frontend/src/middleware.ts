import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

// 需要认证的页面路由
const protectedRoutes = [
  '/dashboard/mint',
  '/profiles',
  '/contributions',
];

// 需要认证的 API 路由
const protectedApiRoutes = [
  '/api/auth/profile',
  '/api/contributions',
];

// 公开路由
const publicRoutes = [
  '/',
  '/auth',
  '/api/auth/github',
  '/api/auth/logout',
  '/api/health',
];


// 检查路径是否需要认证
function isProtectedRoute(pathname: string): boolean {
  // 检查页面路由
  for (const route of protectedRoutes) {
    if (pathname === route || pathname.startsWith(route + '/')) {
      return true;
    }
  }

  // 检查 API 路由
  for (const route of protectedApiRoutes) {
    if (pathname === route || pathname.startsWith(route + '/')) {
      return true;
    }
  }

  return false;
}

// 检查路径是否为公开路由
function isPublicRoute(pathname: string): boolean {
  // 精确匹配首页
  if (pathname === '/') {
    return true;
  }

  // 检查其他公开路由
  for (const route of publicRoutes) {
    if (route !== '/' && (pathname === route || pathname.startsWith(route + '/'))) {
      return true;
    }
  }
  return false;
}

// 从请求中获取 token
function getTokenFromRequest(request: NextRequest): string | null {
  // 1. 从 Authorization header 获取 (API 请求)
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // 2. 从 Cookie 获取
  const cookieToken = request.cookies.get('lc_token')?.value;
  if (cookieToken) {
    return cookieToken;
  }

  // 3. 从查询参数获取 (用于认证回调)
  const urlToken = request.nextUrl.searchParams.get('token');
  if (urlToken) {
    return urlToken;
  }

  return null;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 跳过静态文件和内部路由
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/static/') ||
    pathname.includes('.') // 跳过文件扩展名的请求
  ) {
    return NextResponse.next();
  }

  // 如果是公开路由，直接允许访问
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // 如果是受保护的路由，检查认证状态
  if (isProtectedRoute(pathname)) {
    const token = getTokenFromRequest(request);

    if (!token) {
      // 没有 token，重定向到登录页
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      // 验证 token
      await jwtVerify(
        token,
        new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret'),
      );

      // token 有效，继续处理请求
      return NextResponse.next();
    } catch {
      // token 无效，重定向到登录页
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 默认允许访问
  return NextResponse.next();
}

// 配置中间件匹配的路径
export const config = {
  matcher: [
    /*
     * 匹配所有路径除了:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
