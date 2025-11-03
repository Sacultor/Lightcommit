import { supabase } from '@/lib/supabase/client';
import { createClient } from '@/lib/supabase/server';
import type { User, Session } from '@supabase/supabase-js';

export class AuthService {
  /**
   * 使用 GitHub OAuth 登录
   */
  static async signInWithGitHub(redirectTo?: string) {
    const baseUrl = redirectTo ||
      (typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000');

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${baseUrl}/auth/callback`,
        scopes: 'user:email read:user',
      },
    });

    if (error) {
      console.error('GitHub OAuth 初始化失败:', error);
      throw error;
    }

    return data;
  }

  /**
   * 登出
   */
  static async signOut() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('登出失败:', error);
      throw error;
    }
  }

  /**
   * 获取当前用户 session (客户端)
   */
  static async getSession(): Promise<{ session: Session | null; error: any }> {
    const { data, error } = await supabase.auth.getSession();
    return { session: data.session, error };
  }

  /**
   * 获取当前用户信息 (客户端)
   */
  static async getUser(): Promise<{ user: User | null; error: any }> {
    const { data, error } = await supabase.auth.getUser();
    return { user: data.user, error };
  }

  /**
   * 获取当前用户 session (服务端)
   */
  static async getServerSession(): Promise<{ session: Session | null; error: any }> {
    const supabaseServer = createClient();
    const { data, error } = await supabaseServer.auth.getSession();
    return { session: data.session, error };
  }

  /**
   * 获取当前用户信息 (服务端)
   */
  static async getServerUser(): Promise<{ user: User | null; error: any }> {
    const supabaseServer = createClient();
    const { data, error } = await supabaseServer.auth.getUser();
    return { user: data.user, error };
  }

  /**
   * 监听认证状态变化
   */
  static onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }

  /**
   * 同步用户信息到应用数据库
   */
  static async syncUserToDatabase(user: User) {
    try {
      console.log('🔄 开始同步用户信息:', {
        userId: user.id,
        email: user.email,
        metadata: user.user_metadata,
      });

      // 准备要插入的数据
      const userData = {
        id: user.id,
        email: user.email,
        githubId: user.user_metadata?.user_name || user.user_metadata?.preferred_username || user.user_metadata?.login,
        username: user.user_metadata?.user_name || user.user_metadata?.preferred_username || user.user_metadata?.login,
        avatarUrl: user.user_metadata?.avatar_url,
        accessToken: null, // 不存储访问令牌
        walletAddress: null,
        updatedAt: new Date().toISOString(),
      };

      console.log('📝 准备插入的用户数据:', userData);

      // 首先检查表是否存在
      const { error: tableError } = await supabase
        .from('users')
        .select('id')
        .limit(1);

      if (tableError) {
        console.error('❌ 检查 users 表时出错:', tableError);
        console.log('💡 可能的原因：');
        console.log('   1. users 表不存在');
        console.log('   2. 没有访问权限');
        console.log('   3. RLS (Row Level Security) 策略阻止了访问');
        return; // 不抛出错误，避免阻止登录
      }

      console.log('✅ users 表检查通过');

      const { data, error } = await supabase
        .from('users')
        .upsert(userData, {
          onConflict: 'id',
        });

      if (error) {
        console.error('同步用户信息失败:', error);
        console.error('错误详情:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        });

        // 尝试简单的插入而不是 upsert
        console.log('🔄 尝试简单插入...');
        const { error: insertError } = await supabase
          .from('users')
          .insert(userData);

        if (insertError) {
          console.error('插入也失败:', insertError);
          return; // 不抛出错误，避免阻止登录
        }
      }

      console.log('✅ 用户信息同步成功', data);
    } catch (error) {
      console.error('❌ 同步用户信息到数据库失败:', error);
      // 不抛出错误，避免阻止登录流程
    }
  }
}
