import { useQuery } from '@tanstack/react-query';
import { AuthService } from '@/lib/services/auth.service';

export function useAuth() {
  const { data: authData, isLoading, error } = useQuery({
    queryKey: ['user'],
    queryFn: AuthService.getUser,
    retry: false,
  });

  // AuthService.getUser 返回 { user, error }，所以需要从 data 中提取 user
  const user = authData?.user || null;
  const isAuthenticated = !!user;

  const login = () => {
    AuthService.signInWithGitHub();
  };

  const logout = () => {
    AuthService.signOut().then(() => {
      window.location.href = '/';
    });
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    error: error || authData?.error,
    login,
    logout,
  };
}

