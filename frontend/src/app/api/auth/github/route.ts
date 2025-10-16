import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/services/auth.service';

export async function GET(_request: NextRequest) {
  try {
    // 生成 GitHub 授权 URL
    const authUrl = await AuthService.getGitHubAuthUrl();

    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('GitHub auth error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate GitHub authentication' },
      { status: 500 },
    );
  }
}
