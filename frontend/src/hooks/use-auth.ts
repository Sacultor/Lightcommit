import { useQuery } from '@tanstack/react-query';
import { AuthService } from '@/lib/services/auth.service';

export function useAuth() {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ['user'],
    queryFn: AuthService.getUser,
    retry: false,
  });

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
    error,
    login,
    logout,
  };
}

