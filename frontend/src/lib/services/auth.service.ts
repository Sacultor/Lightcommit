/**
 * 认证服务（基于 JWT Session，无 Supabase）
 * 
 * 功能：
 * - 提供前端调用的认证相关方法
 * - 与 /api/auth/* 路由配合使用
 * - 支持 GitHub OAuth 登录
 * 
 * 注意：
 * - 所有方法都是调用内部 API，不直接操作 session
 * - Session 管理由服务端 JWT 完成
 */

import type { SessionData } from '@/lib/auth/session';

export class AuthService {
  /**
   * 使用 GitHub OAuth 登录
   * 
   * 前端调用此方法会重定向到 /api/auth/github
   * 然后跳转到 GitHub 授权页面
   */
  static async signInWithGitHub(_redirectTo?: string) {
    // 直接重定向到 GitHub OAuth 接口
    const url = '/api/auth/github';
    if (typeof window !== 'undefined') {
      window.location.href = url;
    }
    return { url };
  }

  /**
   * 登出
   * 
   * 调用 /api/auth/logout 清除 JWT session
   */
  static async signOut() {
    const response = await fetch('/api/auth/logout', {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error('登出失败');
    }

    return await response.json();
  }

  /**
   * 获取当前用户 session（客户端）
   * 
   * 调用 /api/auth/user 获取 JWT session
   */
  static async getSession(): Promise<{ session: SessionData | null; error: any }> {
    try {
      const response = await fetch('/api/auth/user', {
        credentials: 'include', // 确保发送 cookies
      });

      if (!response.ok) {
        if (response.status === 401) {
          // 未登录
          return { session: null, error: null };
        }
        throw new Error('获取 session 失败');
      }

      const data = await response.json();
      return { session: data.session, error: null };
    } catch (error) {
      return { session: null, error };
    }
  }

  /**
   * 获取当前用户信息（客户端）
   * 
   * 从 session 中提取 user 字段
   */
  static async getUser(): Promise<{ user: SessionData['user'] | null; error: any }> {
    const { session, error } = await this.getSession();

    if (error) {
      return { user: null, error };
    }

    if (!session) {
      return { user: null, error: null };
    }

    return { user: session.user, error: null };
  }

  /**
   * 获取当前用户 session（服务端）
   * 
   * 注意：服务端应该直接使用 getSession() from '@/lib/auth/session'
   * 此方法仅用于兼容旧代码
   */
  static async getServerSession(): Promise<{ session: SessionData | null; error: any }> {
    // 服务端应该直接使用 getSession()
    // 此方法不应该在服务端被调用
    console.warn('⚠️ getServerSession() 不应在服务端被调用，请直接使用 getSession() from "@/lib/auth/session"');
    return { session: null, error: new Error('Use getSession() from @/lib/auth/session instead') };
  }

  /**
   * 获取当前用户信息（服务端）
   * 
   * 注意：服务端应该直接使用 getSession() from '@/lib/auth/session'
   * 此方法仅用于兼容旧代码
   */
  static async getServerUser(): Promise<{ user: SessionData['user'] | null; error: any }> {
    // 服务端应该直接使用 getSession()
    // 此方法不应该在服务端被调用
    console.warn('⚠️ getServerUser() 不应在服务端被调用，请直接使用 getSession() from "@/lib/auth/session"');
    return { user: null, error: new Error('Use getSession() from @/lib/auth/session instead') };
  }

  /**
   * 监听认证状态变化
   * 
   * 注意：JWT session 不支持实时监听
   * 可以使用轮询或 SSE 实现类似功能
   */
  static onAuthStateChange(_callback: (event: string, session: SessionData | null) => void) {
    console.warn('⚠️ JWT session 不支持实时监听，请使用轮询或其他方式');
    return {
      data: { subscription: null },
      unsubscribe: () => {},
    };
  }

  /**
   * 同步用户信息到数据库
   * 
   * @param user - GitHub 用户信息
   */
  static async syncUserToDatabase(user: SessionData['user']) {
    try {
      const response = await fetch('/api/users/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          githubId: user.id,
          username: user.login,
          name: user.name,
          email: user.email,
          avatarUrl: user.avatar_url,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to sync user: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('用户信息同步失败:', error);
      throw error;
    }
  }
}
