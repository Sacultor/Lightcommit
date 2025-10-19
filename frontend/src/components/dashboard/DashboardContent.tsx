'use client';

import { Search, Plus, Star, Users, Activity, Github, Code } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface DashboardContentProps {
  statsData?: Array<{
    title: string
    value: string
    change: string
    changeType: 'positive' | 'negative' | 'neutral'
    icon: string
  }>
  contributionData?: Array<{
    month: string
    contributions: number
  }>
  activities?: Array<{
    type: 'commit' | 'nft' | 'pr' | 'issue'
    title: string
    description: string
    time: string
    status: 'completed' | 'pending' | 'failed'
  }>
}

export function DashboardContent({
  statsData: _statsData,
  contributionData: _contributionData,
  activities: _activities,
}: DashboardContentProps) {
  const router = useRouter();

  const handleCardClick = (title: string) => {
    if (title === 'Web3 Portfolio') {
      if (!isAuthenticated()) {
        window.location.href = '/api/auth/github';
        return;
      }
      router.push('/profiles');
    } else if (title === 'Mint a new commit') {
      if (!isAuthenticated()) {
        window.location.href = '/api/auth/github';
        return;
      }
      router.push('/dashboard/mint');
    }
    // 可以为其他卡片添加不同的跳转逻辑
  };
  const repositoryCards = [
    {
      title: 'Mint a new commit',
      description: 'Create verifiable proof of your work',
      icon: Plus,
      isSpecial: false,
      gradient: 'from-gray-100 to-gray-200',
    },
    {
      title: 'Web3 Portfolio',
      description: 'Showcase your blockchain projects',
      icon: Star,
      isSpecial: false,
      gradient: 'from-gray-100 to-gray-200',
    },
    {
      title: 'Smart Contracts',
      description: 'Solidity development workspace',
      icon: Code,
      isSpecial: false,
      gradient: 'from-gray-100 to-gray-200',
    },
    {
      title: 'DeFi Analytics',
      description: 'Track your DeFi contributions',
      icon: Activity,
      isSpecial: false,
      gradient: 'from-gray-100 to-gray-200',
    },
    {
      title: 'NFT Collections',
      description: 'Manage your digital assets',
      icon: Users,
      isSpecial: false,
      gradient: 'from-gray-100 to-gray-200',
    },
    {
      title: 'GitHub Integration',
      description: 'Connect your repositories',
      icon: Github,
      isSpecial: false,
      gradient: 'from-gray-100 to-gray-200',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col justify-center">
      <div className="max-w-7xl mx-auto px-6 py-12 w-full">
        {/* Header Section - 居中对齐 */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-light text-gray-900 mb-4 font-sans">My Dashboard</h1>
          <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
            It&apos;s kinda lonely here. Why don&apos;t you create your freshly new collections and start your NFT journey with Lightcommit?
          </p>

          {/* Search Bar with Glassmorphism - 居中对齐 */}
          <div className="flex justify-center">
            <div className="relative max-w-lg w-full">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search your repositories..."
                className="w-full pl-12 pr-4 py-4 bg-white/60 backdrop-blur-md border border-gray-200/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-300/50 transition-all duration-200 text-gray-900 placeholder-gray-500 shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* Repository Cards Grid - 改进对称性和间距 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 place-items-center max-w-6xl mx-auto">
          {repositoryCards.map((repo, index) => {
            const Icon = repo.icon;
            return (
              <div
                key={index}
                onClick={() => handleCardClick(repo.title)}
                className={`group relative p-8 rounded-3xl cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl border border-gray-200/50 w-full max-w-sm ${
                  repo.isSpecial
                    ? 'bg-gradient-to-br from-black to-gray-800 text-white'
                    : 'bg-white/60 backdrop-blur-md hover:bg-white/80'
                }`}
              >
                <div className="space-y-6">
                  <div className="flex items-start justify-between">
                    <div className={`p-4 rounded-2xl ${
                      repo.isSpecial
                        ? 'bg-white/20'
                        : 'bg-gray-100'
                    }`}>
                      <Icon className={`w-6 h-6 ${
                        repo.isSpecial ? 'text-white' : 'text-gray-600'
                      }`} />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className={`font-semibold text-xl ${
                      repo.isSpecial ? 'text-white' : 'text-gray-900'
                    }`}>
                      {repo.title}
                    </h3>
                    <p className={`text-sm leading-relaxed ${
                      repo.isSpecial ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      {repo.description}
                    </p>
                  </div>

                  {/* Hover effect overlay */}
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-transparent to-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
