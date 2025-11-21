/**
 * 用户登出接口（清除 JWT Session）
 * 
 * 路由：POST /api/auth/logout
 * 功能：退出当前用户登录状态
 * 
 * 流程说明：
 * 1. 清除服务端 cookie 中的 JWT session
 * 2. 返回登出成功消息
 * 
 * 注意事项：
 * - 必须使用 POST 方法（安全考虑）
 * - 登出后前端应该手动跳转到首页或登录页
 * - JWT session 存储在 httpOnly cookie 中，前端无法访问
 */
import { NextRequest, NextResponse } from 'next/server';
import { clearSessionCookie } from '@/lib/auth/session';

export async function POST(_request: NextRequest) {
  try {
    // 1. 清除 JWT session cookie
    await clearSessionCookie();

    // 2. 返回成功消息
    return NextResponse.json({ message: '登出成功' });
  } catch (error) {
    // 3. 捕获异常并返回错误（通常不会发生）
    console.error('登出错误:', error);
    return NextResponse.json(
      { error: '登出失败' },
      { status: 500 },
    );
  }
}
