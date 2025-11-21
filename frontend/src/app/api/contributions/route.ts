/**
 * 获取贡献列表接口
 * 
 * 路由：GET /api/contributions
 * 功能：查询所有贡献记录，支持多种筛选条件
 * 
 * 权限：需要登录（Bearer Token）
 * 
 * 查询参数：
 * - limit: 每页数量（默认 50）
 * - offset: 偏移量（默认 0）
 * - type: 贡献类型（commit/pull_request/issue）
 * - status: 状态（pending/scored/minted/failed）
 * - repositoryId: 仓库 ID
 * - userId: 用户 ID
 * 
 * 返回数据：
 * {
 *   data: Contribution[],     // 贡献列表
 *   pagination: {
 *     limit: number,
 *     offset: number,
 *     total: number,
 *   }
 * }
 * 
 * 使用场景：
 * - 管理后台查看所有贡献
 * - 按仓库/用户筛选贡献
 * - 分页浏览贡献记录
 */
import { NextRequest, NextResponse } from 'next/server';
import { ContributionService } from '@/lib/services/contribution.service';
import { AuthService } from '@/lib/services/auth.service';
import { QueryContributionParams, ContributionType, ContributionStatus } from '@/types/contribution';

export async function GET(request: NextRequest) {
  try {
    // 1. 验证用户身份（从 Authorization header 获取 Bearer Token）
    const authorization = request.headers.get('authorization');

    // 检查是否提供了 Authorization header
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 },
      );
    }

    // 2. 调用 AuthService 验证用户（从 JWT session 读取）
    const { user, error } = await AuthService.getServerUser();

    // 如果验证失败或用户不存在，返回 401
    if (error || !user) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 },
      );
    }

    // 3. 解析查询参数（分页 + 筛选条件）
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50', 10);   // 每页数量
    const offset = parseInt(searchParams.get('offset') || '0', 10);  // 偏移量

    // 构造查询条件对象
    const query: QueryContributionParams = {};

    // 4. 添加可选的筛选参数
    // 按类型筛选（commit/pull_request/issue）
    if (searchParams.get('type')) {
      query.type = searchParams.get('type') as ContributionType;
    }

    // 按状态筛选（pending/scored/minted/failed）
    if (searchParams.get('status')) {
      query.status = searchParams.get('status') as ContributionStatus;
    }

    // 按仓库筛选
    if (searchParams.get('repositoryId')) {
      query.repositoryId = searchParams.get('repositoryId')!;
    }

    // 按用户筛选
    if (searchParams.get('userId')) {
      query.userId = searchParams.get('userId')!;
    }

    // 5. 从数据库查询贡献列表
    const contributions = await ContributionService.findAll(query, limit, offset);

    // 6. 返回贡献列表 + 分页信息
    return NextResponse.json({
      data: contributions,
      pagination: {
        limit,
        offset,
        total: contributions.length,
      },
    });

  } catch (error) {
    // 7. 捕获所有异常并返回 500 错误
    console.error('Get contributions error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contributions' },
      { status: 500 },
    );
  }
}
