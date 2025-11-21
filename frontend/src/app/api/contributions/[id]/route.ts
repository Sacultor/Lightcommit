/**
 * 获取单个贡献详情接口
 * 
 * 路由：GET /api/contributions/[id]
 * 功能：返回指定 ID 的贡献详细信息
 * 
 * 权限：需要登录（Bearer Token）
 * 
 * 路径参数：
 * - id: 贡献 ID（数据库主键）
 * 
 * 返回数据：
 * {
 *   id: string,
 *   title: string,             // 标题
 *   description: string,       // 描述
 *   type: string,              // commit/pull_request/issue
 *   status: string,            // pending/scored/minted/failed
 *   score: number,             // 评分（0-100）
 *   scoreBreakdown: {          // 评分细节
 *     convention: number,
 *     size: number,
 *     filesImpact: number,
 *     mergeSignal: number,
 *     metadataCompleteness: number,
 *   },
 *   eligibility: string,       // eligible/ineligible（是否可上链）
 *   repository: {...},         // 仓库信息
 *   user: {...},               // 用户信息
 *   metadata: {...},           // GitHub 原始数据
 *   createdAt: string,
 *   updatedAt: string,
 * }
 * 
 * 使用场景：
 * - /erc8004/validate/[id] 页面显示贡献详情
 * - 查看单个贡献的完整信息
 * - 准备提交到链上前的数据确认
 */
import { NextRequest, NextResponse } from 'next/server';
import { ContributionService } from '@/lib/services/contribution.service';
import { AuthService } from '@/lib/services/auth.service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
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

    // 3. 从路径参数中获取贡献 ID
    const { id } = await params;
    const contributionId = id;

    // 检查贡献 ID 是否存在
    if (!contributionId) {
      return NextResponse.json(
        { error: 'Missing contribution ID' },
        { status: 400 },
      );
    }

    // 4. 从数据库查询贡献详情
    const contribution = await ContributionService.findOne(contributionId);

    // 如果贡献不存在，返回 404
    if (!contribution) {
      return NextResponse.json(
        { error: 'Contribution not found' },
        { status: 404 },
      );
    }

    // 5. 返回贡献详情（包含所有字段）
    return NextResponse.json(contribution);

  } catch (error) {
    // 6. 捕获所有异常并返回 500 错误
    console.error('Get contribution error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contribution' },
      { status: 500 },
    );
  }
}
