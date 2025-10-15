import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '../../../../../lib/services/auth.service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    // 检查是否有错误
    if (error) {
      console.error('GitHub OAuth error:', error);
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      return NextResponse.redirect(`${frontendUrl}/auth/error?error=${encodeURIComponent(error)}`);
    }

    // 检查必需参数
    if (!code) {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      return NextResponse.redirect(`${frontendUrl}/auth/error?error=missing_code`);
    }

    // 验证 state 参数（如果使用）
    if (state && !AuthService.verifyState(state)) {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      return NextResponse.redirect(`${frontendUrl}/auth/error?error=invalid_state`);
    }

    // 交换授权码获取访问令牌
    const accessToken = await AuthService.exchangeCodeForToken(code);

    // 获取 GitHub 用户信息
    const githubUser = await AuthService.getGitHubUser(accessToken);

    // 验证并创建/更新用户
    const user = await AuthService.validateGithubUser(githubUser);

    // 登录用户并生成 JWT
    const loginData = await AuthService.login(user);

    // 重定向到前端，携带 token
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    return NextResponse.redirect(`${frontendUrl}/auth/callback?token=${loginData.accessToken}`);

  } catch (error) {
    console.error('GitHub callback error:', error);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    return NextResponse.redirect(`${frontendUrl}/auth/error?error=callback_failed`);
  }
}