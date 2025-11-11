'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { HeaderSimple } from '@/components/header-simple';
import { FooterSimple } from '@/components/footer-simple';
import { RegisterAgentModal } from '@/components/erc8004/RegisterAgentModal';
import { ReputationBadge } from '@/components/erc8004/ReputationBadge';
import { useAgentRegistry } from '@/hooks/use-agent-registry';
import { useWeb3 } from '@/lib/contexts/Web3Context';
import { useAuth } from '@/hooks/use-auth';
import { Star, GitCommit, Clock, ArrowRight, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface Contribution {
  id: string;
  title: string;
  description: string;
  repository: {
    fullName: string;
  };
  metadata: {
    sha: string;
  };
  score?: number;
  scoreBreakdown?: any;
  eligibility?: string;
  createdAt: string;
  status: string;
}

export default function ERC8004ContributionsPage() {
  const router = useRouter();
  const { isConnected, account, connect } = useWeb3();
  const { isAuthenticated } = useAuth();
  const { isRegistered, loading: agentLoading } = useAgentRegistry();

  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [reputation, setReputation] = useState({ totalScore: 0, feedbackCount: 0, averageScore: 0 });

  const loadContributions = async () => {
    try {
      setLoading(true);

      const authResponse = await fetch('/api/auth/user');
      const authData = await authResponse.json();
      
      if (!authData?.session?.access_token) {
        console.log('未登录，跳过加载贡献');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/contributions/my', {
        headers: {
          'Authorization': `Bearer ${authData.session.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error('获取贡献失败');
      }

      const data = await response.json();
      setContributions(data.data || []);
    } catch (error) {
      console.error('加载贡献失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadReputation = async () => {
    if (!account) return;

    // 检查环境变量是否配置
    const reputationRegistryAddress = process.env.NEXT_PUBLIC_REPUTATION_REGISTRY_ADDRESS;
    if (!reputationRegistryAddress) {
      console.warn('REPUTATION_REGISTRY_ADDRESS 环境变量未配置');
      return;
    }

    // 检查 window.ethereum 是否存在
    if (!window.ethereum) {
      console.warn('MetaMask 未安装或未检测到');
      return;
    }

    try {
      const { ethers } = await import('ethers');
      const { ReputationRegistryABI } = await import('@/lib/contracts');

      const provider = new ethers.BrowserProvider(window.ethereum as any);
      const contract = new ethers.Contract(
        reputationRegistryAddress,
        ReputationRegistryABI,
        provider,
      );

      const [totalScore, feedbackCount, averageScore] = await contract.getContributorReputation(account);

      setReputation({
        totalScore: Number(totalScore),
        feedbackCount: Number(feedbackCount),
        averageScore: Number(averageScore),
      });
    } catch (error) {
      console.error('加载声誉失败:', error);
    }
  };

  useEffect(() => {
    if (isConnected && !agentLoading && !isRegistered) {
      setShowRegisterModal(true);
    }
  }, [isConnected, isRegistered, agentLoading]);

  useEffect(() => {
    if (isAuthenticated) {
      loadContributions();
      loadReputation();
    }
  }, [isAuthenticated, account]);


  const handleContributionClick = (contribution: Contribution) => {
    router.push(`/erc8004/validate/${contribution.id}`);
  };

  const getStatusBadge = (contribution: Contribution) => {
    if (contribution.status === 'minted') {
      return <span className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full border-2 border-black">已铸造</span>;
    }
    if (contribution.eligibility === 'eligible' && contribution.score) {
      return <span className="px-3 py-1 bg-blue-500 text-white text-xs font-bold rounded-full border-2 border-black">可上链</span>;
    }
    if (contribution.score) {
      return <span className="px-3 py-1 bg-yellow-500 text-white text-xs font-bold rounded-full border-2 border-black">已评分</span>;
    }
    return <span className="px-3 py-1 bg-gray-300 text-gray-600 text-xs font-bold rounded-full border-2 border-black">待评分</span>;
  };


  return (
    <div className="min-h-screen bg-[#F5F1E8]">
      <HeaderSimple />

      <main className="pt-32 pb-20">
        <div className="container mx-auto px-6 max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center justify-between mb-12">
              <div>
                <h1 className="text-5xl font-black text-black mb-2">我的贡献</h1>
                <p className="text-gray-600">
                  管理你的所有 GitHub 贡献并提交到链上
                </p>
              </div>

              {reputation.feedbackCount > 0 && (
                <ReputationBadge
                  totalScore={reputation.totalScore}
                  feedbackCount={reputation.feedbackCount}
                  averageScore={reputation.averageScore}
                  size="large"
                />
              )}
            </div>

            {!isAuthenticated && (
              <div className="mb-8 p-6 bg-yellow-50 border-2 border-yellow-400 rounded-2xl">
                <p className="text-yellow-800 mb-4 font-bold">
                  📝 提示：需要 GitHub 登录才能查看贡献列表
                </p>
                <button
                  onClick={() => window.location.href = '/api/auth/github'}
                  className="px-6 py-3 bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition-colors"
                >
                  使用 GitHub 登录
                </button>
              </div>
            )}

            {!isConnected && isAuthenticated && (
              <div className="mb-8 p-6 bg-blue-50 border-2 border-blue-400 rounded-2xl">
                <p className="text-blue-800 mb-4 font-bold">
                  🔗 需要连接钱包才能使用 ERC-8004 功能
                </p>
                <button
                  onClick={connect}
                  className="px-6 py-3 bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition-colors"
                >
                  连接钱包
                </button>
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-black" />
              </div>
            ) : contributions.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6 border-3 border-black">
                  <GitCommit className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-2xl font-black text-black mb-2">暂无贡献记录</h3>
                <p className="text-gray-600 mb-6">
                  开始在 GitHub 上提交代码，你的贡献将自动同步到这里
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {contributions.map((contribution, index) => (
                  <motion.div
                    key={contribution.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    onClick={() => handleContributionClick(contribution)}
                    className="bg-white border-[3px] border-black rounded-2xl p-6 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer"
                    style={{ boxShadow: '3px 3px 0px 0px rgba(0,0,0,0.8)' }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <GitCommit className="w-5 h-5 text-gray-600" />
                          <h3 className="text-lg font-bold text-black">
                            {contribution.title || 'Untitled Contribution'}
                          </h3>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                          <span className="font-mono">
                            {contribution.repository?.fullName || 'unknown/repo'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {new Date(contribution.createdAt).toLocaleDateString('zh-CN')}
                          </span>
                        </div>

                        {contribution.description && (
                          <p className="text-sm text-gray-700 line-clamp-2 mb-3">
                            {contribution.description}
                          </p>
                        )}

                        <div className="flex items-center gap-2">
                          {getStatusBadge(contribution)}
                          {contribution.score !== undefined && contribution.score !== null && (
                            <span className="px-3 py-1 bg-black text-white text-xs font-bold rounded-full flex items-center gap-1">
                              <Star className="w-3 h-3 fill-white" />
                              {contribution.score}/100
                            </span>
                          )}
                        </div>
                      </div>

                      <ArrowRight className="w-6 h-6 text-gray-400 flex-shrink-0" />
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </main>

      <FooterSimple />

      <RegisterAgentModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        onSuccess={loadReputation}
      />
    </div>
  );
}

