/**
 * GitHub OAuth 回调处理接口
 * 
 * 路由：GET /api/auth/callback
 * 功能：处理 GitHub OAuth 回调，交换 code 获取 access_token，创建 Session
 * 
 * 流程说明：
 * 1. 从 URL 参数中获取 code
 * 2. 用 code 向 GitHub 交换 access_token
 * 3. 用 access_token 获取 GitHub 用户信息
 * 4. 创建 JWT session 并设置 cookie
 * 5. 同步用户信息到数据库（可选）
 * 6. 重定向到首页或指定页面
 * 
 * 环境变量依赖：
 * - GITHUB_CLIENT_ID：GitHub OAuth App 的 Client ID
 * - GITHUB_CLIENT_SECRET：GitHub OAuth App 的 Client Secret
 * - JWT_SECRET：JWT 签名密钥
 * 
 * GitHub OAuth 文档：
 * https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps
 */

import { NextRequest, NextResponse } from 'next/server';
import { setSessionCookie, getGitHubUser, SessionData } from '@/lib/auth/session';

export async function GET(request: NextRequest) {
  try {
    // 1. 从 URL 参数中获取 code（GitHub 返回的授权码）
    const code = request.nextUrl.searchParams.get('code');
    const error = request.nextUrl.searchParams.get('error');

    // 2. 检查是否有错误（用户取消授权等）
    if (error) {
      console.error('GitHub OAuth 错误:', error);
      return NextResponse.redirect(new URL('/?error=oauth_cancelled', request.url));
    }

    // 3. 检查是否有 code
    if (!code) {
      console.error('GitHub OAuth 回调缺少 code 参数');
      return NextResponse.redirect(new URL('/?error=missing_code', request.url));
    }

    // 4. 检查环境变量
    const clientId = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      console.error('❌ GitHub OAuth 配置缺失');
      return NextResponse.redirect(new URL('/?error=config_missing', request.url));
    }

    // 5. 用 code 向 GitHub 交换 access_token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for access_token');
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      console.error('GitHub 返回的 token 数据无效:', tokenData);
      return NextResponse.redirect(new URL('/?error=invalid_token', request.url));
    }

    // 6. 用 access_token 获取 GitHub 用户信息
    const githubUser = await getGitHubUser(accessToken);

    // 7. 构造 Session 数据
    const now = Date.now();
    const sessionData: SessionData = {
      user: {
        id: githubUser.id,
        login: githubUser.login,
        name: githubUser.name || null,
        email: githubUser.email || null,
        avatar_url: githubUser.avatar_url,
      },
      accessToken,
      createdAt: now,
      expiresAt: now + 30 * 24 * 60 * 60 * 1000, // 30 天
    };

    // 8. 创建 JWT session 并设置 cookie
    await setSessionCookie(sessionData);

    // 9. 同步用户信息到数据库（可选，不阻塞登录流程）
    try {
      await syncUserToDatabase(sessionData.user);
    } catch (syncError) {
      console.warn('⚠️ 用户信息同步失败，但登录成功:', syncError);
      // 不阻塞登录流程，继续重定向
    }

    // 10. 重定向到首页或 explore 页面
    return NextResponse.redirect(new URL('/explore', request.url));
  } catch (error) {
    console.error('GitHub OAuth 回调处理失败:', error);
    return NextResponse.redirect(new URL('/?error=callback_failed', request.url));
  }
}

/**
 * 同步用户信息到数据库
 * 
 * @param user - GitHub 用户信息
 */
async function syncUserToDatabase(user: SessionData['user']) {
  try {
    // 调用内部 API 同步用户信息
    const response = await fetch(`${process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000'}/api/users/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        githubId: user.id,
        username: user.login,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatar_url,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to sync user: ${response.statusText}`);
    }

    console.log('✅ 用户信息已同步到数据库:', user.login);
  } catch (error) {
    // 同步失败不影响登录
    console.warn('⚠️ 用户信息同步失败:', error);
    throw error;
  }
}

