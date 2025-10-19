'use client';

import { useEffect, useState } from 'react';
import { Github, Calendar, Wallet } from 'lucide-react';
import { AuthService } from '@/lib/services/auth.service';
import Image from 'next/image';

interface UserProfile {
  id: string;
  githubId: string;
  username: string;
  email?: string;
  avatarUrl?: string;
  walletAddress?: string;
  createdAt: string;
  updatedAt: string;
}

export function ProfileContent() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { user, error } = await AuthService.getUser();
        
        if (error || !user) {
          // 直接重定向到登录页面
          window.location.href = '/api/auth/github';
          return;
        }

        // 从用户信息构建 profile 对象
        const profileData: UserProfile = {
          id: user.id,
          githubId: user.user_metadata?.user_name || user.user_metadata?.preferred_username || '',
          username: user.user_metadata?.user_name || user.user_metadata?.preferred_username || '',
          email: user.email,
          avatarUrl: user.user_metadata?.avatar_url,
          walletAddress: undefined, // 需要从数据库获取
          createdAt: user.created_at,
          updatedAt: user.updated_at || user.created_at
        };

        setProfile(profileData);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : '获取用户资料失败');
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col justify-center">
        <div className="max-w-4xl mx-auto px-6 py-12 w-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">加载用户信息中...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col justify-center">
        <div className="max-w-4xl mx-auto px-6 py-12 w-full">
          <div className="text-center">
            <div className="bg-red-50 border border-red-200 rounded-2xl p-8 max-w-md mx-auto">
              <h2 className="text-xl font-semibold text-red-800 mb-2">加载失败</h2>
              <p className="text-red-600 mb-4">{error}</p>
              <a
                href="/api/auth/github"
                className="inline-flex items-center px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                <Github className="w-4 h-4 mr-2" />
                重新登录
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col justify-center">
        <div className="max-w-4xl mx-auto px-6 py-12 w-full">
          <div className="text-center">
            <p className="text-gray-600">未找到用户信息</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-center">
      <div className="max-w-4xl mx-auto px-6 py-12 w-full">
        {/* Header Section */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-light text-gray-900 mb-4 font-sans">用户资料</h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            您的 GitHub 授权信息和开发者档案
          </p>
        </div>

        {/* Profile Card */}
        <div className="bg-white/60 backdrop-blur-md border border-gray-200/50 rounded-3xl p-8 shadow-lg max-w-3xl mx-auto">
          {/* Avatar and Basic Info */}
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-8">
            <div className="relative">
              <Image
                src={profile.avatarUrl || '/default-avatar.png'}
                alt={profile.username}
                width={96}
                height={96}
                className="w-24 h-24 rounded-full border-4 border-white shadow-lg"
              />
              <div className="absolute -bottom-2 -right-2 bg-green-500 w-6 h-6 rounded-full border-2 border-white"></div>
            </div>

            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                {profile.username}
              </h2>
              <p className="text-gray-600 mb-2">@{profile.username}</p>
              <p className="text-gray-700 mb-4">GitHub ID: {profile.githubId}</p>

              {/* Basic Stats */}
              <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Github className="w-4 h-4" />
                  <span>GitHub 用户</span>
                </div>
                {profile.walletAddress && (
                  <div className="flex items-center gap-1">
                    <Wallet className="w-4 h-4" />
                    <span>已连接钱包</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contact Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">联系信息</h3>

              <div className="flex items-center gap-3 text-gray-600">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Github className="w-4 h-4" />
                </div>
                <span>GitHub: @{profile.username}</span>
              </div>

              {profile.email && (
                <div className="flex items-center gap-3 text-gray-600">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                    <span className="text-sm">@</span>
                  </div>
                  <span>{profile.email}</span>
                </div>
              )}

              {profile.walletAddress && (
                <div className="flex items-center gap-3 text-gray-600">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Wallet className="w-4 h-4" />
                  </div>
                  <span className="font-mono text-sm break-all">{profile.walletAddress}</span>
                </div>
              )}
            </div>

            {/* Account Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">账户信息</h3>

              <div className="flex items-center gap-3 text-gray-600">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
                <span>加入时间: {new Date(profile.createdAt).toLocaleDateString('zh-CN')}</span>
              </div>

              <div className="flex items-center gap-3 text-gray-600">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Github className="w-4 h-4" />
                </div>
                <span>GitHub ID: {profile.githubId}</span>
              </div>

              <div className="flex items-center gap-3 text-gray-600">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                  <span className="text-sm">#</span>
                </div>
                <span>用户 ID: {profile.id}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 pt-6 border-t border-gray-200/50 flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={`https://github.com/${profile.username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              <Github className="w-4 h-4 mr-2" />
              查看 GitHub 资料
            </a>

            <a
              href="/dashboard"
              className="inline-flex items-center justify-center px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              返回 Dashboard
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
