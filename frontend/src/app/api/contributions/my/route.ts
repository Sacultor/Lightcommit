import { NextRequest, NextResponse } from 'next/server';
import { ContributionService } from '@/lib/services/contribution.service';
import { AuthService } from '@/lib/services/auth.service';

export async function GET(request: NextRequest) {
  try {
    // 验证用户身份
    const authorization = request.headers.get('authorization');

    if (!authorization || !authorization.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 },
      );
    }

    const token = authorization.substring(7);
    const user = await AuthService.getUserFromToken(token);

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 },
      );
    }

    // 解析查询参数
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    // 获取当前用户的贡献
    const contributions = await ContributionService.findByUser(user.id, limit, offset);

    return NextResponse.json({
      data: contributions,
      pagination: {
        limit,
        offset,
        total: contributions.length,
      },
      user: {
        id: user.id,
        username: user.username,
      },
    });

  } catch (error) {
    console.error('Get my contributions error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user contributions' },
      { status: 500 },
    );
  }
}
