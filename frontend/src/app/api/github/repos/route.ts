/**
 * 获取 GitHub 仓库列表接口
 * 
 * 路由：GET /api/github/repos
 * 功能：获取用户的 GitHub 仓库列表
 * 
 * 权限：需要登录（使用用户的 GitHub access token）
 * 
 * 查询参数：
 * - username?: GitHub 用户名（可选，不传则获取当前用户的仓库）
 * 
 * 返回数据：
 * {
 *   data: GitHubApiRepository[]
 * }
 * 
 * 使用场景：
 * - 用户选择要监听的仓库
 * - 展示用户的仓库列表
 */
import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/services/auth.service';
import { GitHubService } from '@/lib/services/github.service';

export async function GET(request: NextRequest) {
  try {
    // 1. 验证用户身份
    const { user, error } = await AuthService.getServerUser();

    if (error || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 },
      );
    }

    // 2. 解析查询参数
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username') || user.username;

    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 },
      );
    }

    // 3. 调用 GitHub API 获取仓库列表
    // 使用用户的 access token（如果有）
    const repos = await GitHubService.getUserRepositories(
      username,
      user.accessToken,
    );

    // 4. 返回仓库列表
    return NextResponse.json({
      data: repos,
    });

  } catch (error: any) {
    console.error('Get GitHub repos error:', error);
    
    // 处理 GitHub API 错误
    if (error.message?.includes('Failed to fetch')) {
      return NextResponse.json(
        { error: 'Failed to fetch repositories from GitHub' },
        { status: 503 },
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}


