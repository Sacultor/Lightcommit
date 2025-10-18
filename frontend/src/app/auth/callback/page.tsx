'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { setAuthToken } from '@/lib/auth';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const token = params.get('token');
      if (token) {
        // 使用统一的认证工具函数存储 token
        setAuthToken(token);
        router.replace('/dashboard');
      } else {
        router.replace('/auth/error');
      }
    } catch {
      router.replace('/auth/error');
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-600">Processing login...</p>
    </div>
  );
}
