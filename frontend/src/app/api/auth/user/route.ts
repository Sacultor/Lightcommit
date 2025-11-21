/**
 * 获取当前用户信息接口（从 JWT Session 读取）
 * 
 * 路由：GET /api/auth/user
 * 功能：返回当前登录用户的详细信息
 * 
 * 流程说明：
 * 1. 从服务端 cookies 读取 JWT session
 * 2. 验证 JWT 并解析用户信息
 * 3. 返回用户对象
 * 
 * 返回数据结构：
 * {
 *   session: {
 *     user: {
 *       id: number,            // GitHub 用户 ID
 *       login: string,         // GitHub 用户名
 *       name: string | null,   // GitHub 显示名
 *       email: string | null,  // GitHub 邮箱
 *       avatar_url: string,    // GitHub 头像
 *     },
 *     accessToken: string,     // GitHub access_token（前端可能需要）
 *     createdAt: number,       // Session 创建时间
 *     expiresAt: number,       // Session 过期时间
 *   }
 * }
 * 
 * 错误处理：
 * - 401: 未登录或 session 过期
 * - 500: 服务端错误
 */
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';

export async function GET(_request: NextRequest) {
  try {
    // 1. 从 cookies 中获取 JWT session
    const session = await getSession();

    // 2. 如果没有 session（未登录或 JWT 过期），返回 401
    if (!session) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    // 3. 返回 session 数据（包含用户信息和 accessToken）
    return NextResponse.json({ session });
  } catch (error) {
    // 4. 捕获所有异常并返回 500 错误
    console.error('获取用户信息错误:', error);
    return NextResponse.json(
      { error: '获取用户信息失败' },
      { status: 500 },
    );
  }
}
