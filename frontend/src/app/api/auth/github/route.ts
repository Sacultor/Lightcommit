import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/services/auth.service'

export async function GET(request: NextRequest) {
  try {
    // 获取请求的 origin 或使用环境变量
    const origin = request.headers.get('origin') || 
                   request.headers.get('host') && `${request.headers.get('x-forwarded-proto') || 'http'}://${request.headers.get('host')}` ||
                   process.env.NEXT_PUBLIC_FRONTEND_URL || 
                   'http://localhost:3000';
    
    const data = await AuthService.signInWithGitHub(origin);
    
    if (data.url) {
      return NextResponse.redirect(data.url);
    }
    
    return NextResponse.json({ error: 'Failed to get OAuth URL' }, { status: 500 });
  } catch (error) {
    console.error('GitHub OAuth 错误:', error);
    return NextResponse.json(
      { error: 'OAuth initialization failed' },
      { status: 500 }
    );
  }
}
