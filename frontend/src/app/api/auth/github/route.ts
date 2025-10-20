import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/services/auth.service'
import { isSupabaseConfigured } from '@/lib/supabase/client'

export async function GET(request: NextRequest) {
  try {
    // 检查 Supabase 是否正确配置
    if (!isSupabaseConfigured) {
      console.error('❌ Supabase 未正确配置');
      return NextResponse.json(
        { 
          error: 'Supabase not configured',
          message: '请在 .env.local 中配置真实的 Supabase 环境变量。查看终端日志了解详情。'
        },
        { status: 500 }
      );
    }

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
