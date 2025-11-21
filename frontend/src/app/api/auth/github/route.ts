/**
 * GitHub OAuth 登录接口（直接 OAuth，无 Supabase）
 * 
 * 路由：GET /api/auth/github
 * 功能：发起 GitHub OAuth 认证流程
 * 
 * 流程说明：
 * 1. 检查 GitHub OAuth 配置是否完整
 * 2. 构造回调地址（origin）
 * 3. 直接构造 GitHub OAuth URL
 * 4. 重定向用户到 GitHub 授权页面
 * 5. 用户授权后，GitHub 会回调到 /auth/callback
 * 
 * 环境变量依赖：
 * - GITHUB_CLIENT_ID：GitHub OAuth App 的 Client ID
 * - GITHUB_CLIENT_SECRET：GitHub OAuth App 的 Client Secret（用于回调）
 * - NEXT_PUBLIC_FRONTEND_URL（可选）：前端地址，用于 OAuth 回调
 * 
 * GitHub OAuth 文档：
 * https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps
 */
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // 1. 检查 GitHub OAuth 配置是否完整
    const clientId = process.env.GITHUB_CLIENT_ID;
    if (!clientId) {
      console.error('❌ GitHub OAuth 未正确配置：缺少 GITHUB_CLIENT_ID');
      return NextResponse.json(
        {
          error: 'GitHub OAuth not configured',
          message: '请在 .env 中配置 GITHUB_CLIENT_ID 和 GITHUB_CLIENT_SECRET',
        },
        { status: 500 },
      );
    }

    // 2. 获取请求的 origin（用于构造 OAuth 回调地址）
    // 优先级：origin header > host header + protocol > 环境变量 > localhost
    const origin = request.headers.get('origin') ||
                   request.headers.get('host') && `${request.headers.get('x-forwarded-proto') || 'http'}://${request.headers.get('host')}` ||
                   process.env.NEXT_PUBLIC_FRONTEND_URL ||
                   'http://localhost:3000';

    // 3. 构造 GitHub OAuth URL
    const redirectUri = `${origin}/api/auth/callback`;  // 直接回调到 API 路由
    const scope = 'user:email read:user';  // 请求的权限范围
    
    const githubAuthUrl = new URL('https://github.com/login/oauth/authorize');
    githubAuthUrl.searchParams.set('client_id', clientId);
    githubAuthUrl.searchParams.set('redirect_uri', redirectUri);
    githubAuthUrl.searchParams.set('scope', scope);
    githubAuthUrl.searchParams.set('state', crypto.randomUUID());  // CSRF 防护（可选）

    // 4. 重定向用户到 GitHub 授权页面
    return NextResponse.redirect(githubAuthUrl.toString());
  } catch (error) {
    // 5. 捕获所有异常并返回 500 错误
    console.error('GitHub OAuth 错误:', error);
    return NextResponse.json(
      { error: 'OAuth initialization failed' },
      { status: 500 },
    );
  }
}
