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

    // const token = authorization.substring(7); // 不再需要
    const { user, error } = await AuthService.getServerUser();

    if (error || !user) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 },
      );
    }

    // 解析查询参数
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const repositoryId = searchParams.get('repositoryId');
    const global = searchParams.get('global') === 'true';

    let stats;

    if (global) {
      // 获取全局统计
      stats = await ContributionService.getGlobalStats();
    } else if (repositoryId) {
      // 获取仓库统计
      stats = await ContributionService.getRepositoryContributionStats(repositoryId);
    } else if (userId) {
      // 获取用户统计
      stats = await ContributionService.getUserContributionStats(userId);
    } else {
      // 默认获取当前用户统计
      stats = await ContributionService.getUserContributionStats(user.id);
    }

    return NextResponse.json(stats);

  } catch (error) {
    console.error('Get contribution stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contribution statistics' },
      { status: 500 },
    );
  }
}
