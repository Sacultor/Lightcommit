/**
 * GitHub 认证状态 Hook
 * 
 * 功能：
 * - 获取当前登录用户信息
 * - 提供登录/登出方法
 * - 自动缓存和刷新认证状态
 * 
 * 使用场景：
 * - 检查用户是否已登录
 * - 获取 GitHub 用户信息（用户名、头像、邮箱）
 * - 触发 GitHub OAuth 登录
 * - 退出登录
 * 
 * 依赖：
 * - @tanstack/react-query：数据缓存和自动刷新
 * - AuthService：认证服务（调用 /api/auth/user）
 * 
 * 返回值：
 * - user: GitHub 用户对象（包含 id, login, name, email, avatar_url）
 * - isAuthenticated: 是否已登录
 * - isLoading: 是否正在加载
 * - error: 错误信息
 * - login(): 触发 GitHub OAuth 登录
 * - logout(): 退出登录并跳转到首页
 */
import { useQuery } from '@tanstack/react-query';
import { AuthService } from '@/lib/services/auth.service';

export function useAuth() {
  // 使用 React Query 获取用户信息
  // queryKey: ['user'] - 缓存键
  // queryFn: AuthService.getUser - 调用 /api/auth/user 获取用户信息
  // retry: false - 失败不重试（避免多次调用）
  const { data: authData, isLoading, error } = useQuery({
    queryKey: ['user'],
    queryFn: AuthService.getUser,
    retry: false,
  });

  // AuthService.getUser 返回 { user, error }，从 data 中提取 user
  const user = authData?.user || null;
  
  // 根据 user 是否存在判断登录状态
  const isAuthenticated = !!user;

  /**
   * 登录方法
   * 
   * 重定向到 /api/auth/github，发起 GitHub OAuth 流程
   */
  const login = () => {
    AuthService.signInWithGitHub();
  };

  /**
   * 登出方法
   * 
   * 调用 /api/auth/logout 清除 JWT session，然后跳转到首页
   */
  const logout = () => {
    AuthService.signOut().then(() => {
      window.location.href = '/';
    });
  };

  return {
    user,                               // GitHub 用户信息
    isAuthenticated,                    // 是否已登录
    isLoading,                          // 是否正在加载
    error: error || authData?.error,    // 错误信息
    login,                              // 登录方法
    logout,                             // 登出方法
  };
}

