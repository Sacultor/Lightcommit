import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // 在客户端实现的 JWT 登出通常只需要客户端删除 token
    // 这里可以添加服务端的登出逻辑，比如将 token 加入黑名单
    
    // 获取 token（如果需要加入黑名单）
    const authorization = request.headers.get('authorization');
    const token = authorization?.substring(7); // 移除 "Bearer " 前缀

    // TODO: 可以在这里实现 token 黑名单逻辑
    // 例如：将 token 存储到 Redis 黑名单中

    return NextResponse.json({ 
      message: 'Logged out successfully',
      success: true 
    });

  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Failed to logout' },
      { status: 500 }
    );
  }
}