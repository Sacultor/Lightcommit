import { NextRequest, NextResponse } from 'next/server';
import { ContributionService } from '@/lib/services/contribution.service';
import { AuthService } from '@/lib/services/auth.service';
import { QueryContributionParams } from '@/types/contribution';

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

    const query: QueryContributionParams = {};

    // 添加可选的查询参数
    if (searchParams.get('type')) {
      query.type = searchParams.get('type') as any;
    }

    if (searchParams.get('status')) {
      query.status = searchParams.get('status') as any;
    }

    if (searchParams.get('repositoryId')) {
      query.repositoryId = searchParams.get('repositoryId')!;
    }

    if (searchParams.get('userId')) {
      query.userId = searchParams.get('userId')!;
    }

    // 获取贡献列表
    const contributions = await ContributionService.findAll(query, limit, offset);

    return NextResponse.json({
      data: contributions,
      pagination: {
        limit,
        offset,
        total: contributions.length,
      },
    });

  } catch (error) {
    console.error('Get contributions error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contributions' },
      { status: 500 },
    );
  }
}
