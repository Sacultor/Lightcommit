/**
 * 获取当前用户的贡献列表接口
 * 
 * 路由：GET /api/contributions/my
 * 功能：返回当前登录用户的所有 GitHub 贡献记录
 * 
 * 权限：需要登录（Bearer Token）
 * 
 * 查询参数：
 * - limit: 每页数量（默认 50）
 * - offset: 偏移量（默认 0）
 * 
 * 返回数据：
 * {
 *   data: Contribution[],     // 当前用户的贡献列表
 *   pagination: {
 *     limit: number,
 *     offset: number,
 *     total: number,
 *   },
 *   user: {
 *     id: string,
 *     username: string,       // GitHub 用户名
 *   }
 * }
 * 
 * 使用场景：
 * - /erc8004/contributions 页面展示用户的所有贡献
 * - 用户查看自己的贡献历史
 * - 显示哪些贡献已评分、可上链或已铸造
 */
import { NextRequest, NextResponse } from 'next/server';
import { ContributionService } from '@/lib/services/contribution.service';
import { AuthService } from '@/lib/services/auth.service';

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

    // 3. 解析分页参数
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50', 10);   // 每页数量
    const offset = parseInt(searchParams.get('offset') || '0', 10);  // 偏移量

    // 4. 从数据库查询当前用户的贡献列表
    // user.id 是 GitHub 用户 ID 或数据库用户 ID
    const contributions = await ContributionService.findByUser(user.id, limit, offset);

    // 5. 返回贡献列表 + 分页信息 + 用户信息
    return NextResponse.json({
      data: contributions,
      pagination: {
        limit,
        offset,
        total: contributions.length,
      },
      user: {
        id: user.id,
        // 从用户元数据中提取 GitHub 用户名（兼容不同字段名）
        username: user.user_metadata?.user_name || user.user_metadata?.preferred_username || user.user_metadata?.login || 'unknown',
      },
    });

  } catch (error) {
    // 6. 捕获所有异常并返回 500 错误
    console.error('Get my contributions error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user contributions' },
      { status: 500 },
    );
  }
}
