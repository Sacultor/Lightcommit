/**
 * 获取最新贡献列表接口
 * 
 * 路由：GET /api/contributions/latest
 * 功能：获取最新的贡献记录，用于 Explore 页面展示
 * 
 * 权限：公开接口（不需要登录）
 * 
 * 查询参数：
 * - limit: 返回数量（默认 20）
 * - type: 贡献类型（可选）
 * 
 * 返回数据：
 * {
 *   data: Contribution[]  // 包含 user 和 repository 信息的贡献列表
 * }
 * 
 * 使用场景：
 * - Explore 页面展示最新的 commit
 * - 首页展示最近活动
 */
import { NextRequest, NextResponse } from 'next/server';
import { ContributionService } from '@/lib/services/contribution.service';
import { ContributionType } from '@/types/contribution';

export async function GET(request: NextRequest) {
  try {
    // 1. 解析查询参数
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const type = searchParams.get('type') as ContributionType | undefined;

    // 2. 构造查询条件
    const query: any = {};
    if (type) {
      query.type = type;
    }

    // 3. 获取最新贡献（按创建时间倒序）
    const contributions = await ContributionService.findAll(query, limit, 0);

    // 4. 返回数据
    return NextResponse.json({
      data: contributions,
    });

  } catch (error) {
    console.error('Get latest contributions error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch latest contributions' },
      { status: 500 },
    );
  }
}


