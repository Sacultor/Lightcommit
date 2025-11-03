import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/services/auth.service';

export async function POST(_request: NextRequest) {
  try {
    await AuthService.signOut();

    return NextResponse.json({ message: '登出成功' });
  } catch (error) {
    console.error('登出错误:', error);
    return NextResponse.json(
      { error: '登出失败' },
      { status: 500 },
    );
  }
}
