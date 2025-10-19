import { useQuery } from '@tanstack/react-query';
import { authApi } from '@/lib/api';

export function useAuth() {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ['user'],
    queryFn: authApi.getProfile,
    retry: false,
  });

  const isAuthenticated = !!user;

  const login = () => {
    authApi.githubLogin();
  };

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      window.location.href = '/';
    }
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
  };
}

