import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '../../../../lib/services/auth.service';

export async function GET(request: NextRequest) {
  try {
    // 从请求头获取 Authorization token
    const authorization = request.headers.get('authorization');
    
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      );
    }

    const token = authorization.substring(7); // 移除 "Bearer " 前缀

    // 验证 JWT 并获取用户信息
    const user = await AuthService.getUserFromToken(token);

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // 返回用户信息（不包含敏感数据）
    const userProfile = {
      id: user.id,
      githubId: user.githubId,
      username: user.username,
      email: user.email,
      avatarUrl: user.avatarUrl,
      walletAddress: user.walletAddress,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return NextResponse.json(userProfile);

  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user profile' },
      { status: 500 }
    );
  }
}