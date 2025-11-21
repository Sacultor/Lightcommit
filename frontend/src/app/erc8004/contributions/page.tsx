/**
 * ERC-8004 贡献列表页面（核心功能页面）
 * 
 * 路由：/erc8004/contributions
 * 功能：展示当前用户的所有 GitHub 贡献，支持提交到链上
 * 
 * 页面布局：
 * - Header：导航栏（GitHub 登录、钱包连接）
 * - 标题区域：我的贡献 + 声誉徽章
 * - 提示区域：GitHub 登录提示 + 钱包连接提示
 * - 贡献列表：卡片式展示所有贡献
 * - Footer：页脚
 * - RegisterAgentModal：代理注册弹窗（首次使用时自动弹出）
 * 
 * 核心功能：
 * 1. 加载用户的 GitHub 贡献列表（从数据库）
 * 2. 显示每个贡献的评分、状态（待评分/已评分/可上链/已铸造）
 * 3. 显示用户的链上声誉（总分、评分次数、平均分）
 * 4. 首次使用时自动弹出代理注册弹窗
 * 5. 点击贡献进入验证和上链流程
 * 
 * 数据来源：
 * - 贡献列表：数据库（通过 /api/contributions/my）
 * - 声誉数据：链上（通过 ReputationRegistry.getContributorReputation）
 * - 代理状态：链上（通过 AgentIdentityRegistry）
 * 
 * 权限要求：
 * - GitHub 登录：查看贡献列表
 * - 钱包连接：使用 ERC-8004 功能（注册代理、上链）
 * 
 * 使用场景：
 * - 用户查看自己的所有 GitHub 贡献
 * - 选择贡献进入评分和上链流程
 * - 查看自己的链上声誉
 */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useReadContract } from 'wagmi';
import { HeaderSimple } from '@/components/layout/header';
import { FooterSimple } from '@/components/layout/footer';
import { RegisterAgentModal } from '@/components/erc8004/RegisterAgentModal';
import { ReputationBadge } from '@/components/erc8004/ReputationBadge';
import { useAgentRegistry } from '@/hooks/use-agent-registry';
import { useWeb3 } from '@/lib/contexts/Web3Context';
import { useAuth } from '@/hooks/use-auth';
import { ReputationRegistryABI } from '@/lib/contracts';
import { Star, GitCommit, Clock, ArrowRight, Loader2 } from 'lucide-react';

/**
 * 贡献数据类型定义
 */
interface Contribution {
  id: string;                       // 贡献 ID（数据库主键）
  title: string;                    // 标题（commit 消息或 PR 标题）
  description: string;              // 描述
  repository: {
    fullName: string;               // 仓库全名（owner/repo）
  };
  metadata: {
    sha: string;                    // Commit SHA
  };
  score?: number;                   // 评分（0-100）
  scoreBreakdown?: any;             // 评分细节
  eligibility?: string;             // 是否可上链（eligible/ineligible）
  createdAt: string;                // 创建时间
  status: string;                   // 状态（pending/scored/minted/failed）
}

export default function ERC8004ContributionsPage() {
  // Next.js 路由实例
  const router = useRouter();
  
  // Web3 相关状态（钱包连接、账户地址）
  const { isConnected, address, connect } = useWeb3();
  
  // GitHub 认证状态
  const { isAuthenticated } = useAuth();
  
  // 代理注册状态（是否已注册到 AgentIdentityRegistry）
  const { isRegistered, loading: agentLoading } = useAgentRegistry();

  // 页面状态
  const [contributions, setContributions] = useState<Contribution[]>([]);  // 贡献列表
  const [loading, setLoading] = useState(true);                            // 加载状态
  const [showRegisterModal, setShowRegisterModal] = useState(false);       // 是否显示注册弹窗

  /**
   * 使用 viem 自动从链上读取声誉数据
   * 
   * 优势：
   * - ✅ 自动缓存
   * - ✅ 自动刷新
   * - ✅ 无需手动创建 provider
   */
  const { data: reputationData } = useReadContract({
    address: process.env.NEXT_PUBLIC_REPUTATION_REGISTRY_ADDRESS as `0x${string}`,
    abi: ReputationRegistryABI,
    functionName: 'getContributorReputation',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,  // 仅当钱包连接时查询
    },
  });

  // 从 viem 返回的数据中提取声誉信息
  const reputation = {
    totalScore: reputationData ? Number(reputationData[0]) : 0,
    feedbackCount: reputationData ? Number(reputationData[1]) : 0,
    averageScore: reputationData ? Number(reputationData[2]) : 0,
  };

  /**
   * 加载用户的 GitHub 贡献列表
   * 
   * 流程：
   * 1. 获取当前用户的 session（access_token）
   * 2. 调用 /api/contributions/my 获取贡献列表
   * 3. 更新贡献状态
   */
  const loadContributions = async () => {
    try {
      setLoading(true);

      // 1. 获取当前用户的 session（包含 GitHub access_token）
      const authResponse = await fetch('/api/auth/user');
      const authData = await authResponse.json();
      
      // 2. 检查是否已登录
      if (!authData?.session?.access_token) {
        console.log('未登录，跳过加载贡献');
        setLoading(false);
        return;
      }

      // 3. 调用 /api/contributions/my 获取贡献列表
      const response = await fetch('/api/contributions/my', {
        headers: {
          'Authorization': `Bearer ${authData.session.access_token}`,  // 使用 Bearer Token 认证
        },
      });

      // 4. 检查响应状态
      if (!response.ok) {
        throw new Error('获取贡献失败');
      }

      // 5. 解析响应数据并更新状态
      const data = await response.json();
      setContributions(data.data || []);
    } catch (error) {
      // 6. 错误处理（静默失败，不打断用户）
      console.error('加载贡献失败:', error);
    } finally {
      // 7. 无论成功失败，都关闭加载状态
      setLoading(false);
    }
  };

  /**
   * 从链上加载用户的声誉数据（使用 Viem）
   * 
   * 使用 wagmi 的 useReadContract 直接读取链上数据
   * 不再需要 ethers.js 和手动创建 provider
   */
  const loadReputation = async () => {
    // 注意：声誉数据现在通过 useReadContract 自动加载
    // 这个函数保留用于手动刷新
    console.log('声誉数据已通过 useReadContract 自动加载');
  };

  /**
   * 检查代理注册状态
   * 
   * 如果用户已连接钱包但未注册代理，自动弹出注册弹窗
   * 这是 ERC-8004 的必需步骤（首次使用时）
   */
  useEffect(() => {
    if (isConnected && !agentLoading && !isRegistered) {
      setShowRegisterModal(true);  // 显示代理注册弹窗
    }
  }, [isConnected, isRegistered, agentLoading]);

  /**
   * 加载贡献列表
   * 
   * 当用户登录后，自动加载 GitHub 贡献列表
   * 声誉数据由 useReadContract 自动加载，无需手动调用
   */
  useEffect(() => {
    if (isAuthenticated) {
      loadContributions();   // 加载贡献列表
      // loadReputation() 已移除，声誉数据自动加载
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, address]);

  /**
   * 点击贡献卡片的处理函数
   * 
   * 跳转到验证和上链流程页面
   * 
   * @param contribution - 贡献对象
   */
  const handleContributionClick = (contribution: Contribution) => {
    router.push(`/erc8004/validate/${contribution.id}`);
  };

  /**
   * 根据贡献状态返回对应的徽章组件
   * 
   * 状态优先级：
   * 1. minted（已铸造）- 绿色
   * 2. eligible（可上链）- 蓝色
   * 3. scored（已评分）- 黄色
   * 4. pending（待评分）- 灰色
   * 
   * @param contribution - 贡献对象
   * @returns 徽章 JSX 元素
   */
  const getStatusBadge = (contribution: Contribution) => {
    // 1. 已铸造 NFT（最终状态）
    if (contribution.status === 'minted') {
      return <span className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full border-2 border-black">已铸造</span>;
    }
    // 2. 已评分且达到上链标准（score >= 80）
    if (contribution.eligibility === 'eligible' && contribution.score) {
      return <span className="px-3 py-1 bg-blue-500 text-white text-xs font-bold rounded-full border-2 border-black">可上链</span>;
    }
    // 3. 已评分但未达到上链标准
    if (contribution.score) {
      return <span className="px-3 py-1 bg-yellow-500 text-white text-xs font-bold rounded-full border-2 border-black">已评分</span>;
    }
    // 4. 待评分（初始状态）
    return <span className="px-3 py-1 bg-gray-300 text-gray-600 text-xs font-bold rounded-full border-2 border-black">待评分</span>;
  };


  return (
    <div className="min-h-screen bg-[#F5F1E8]">
      {/* 页面头部导航栏 */}
      <HeaderSimple />

      {/* 主内容区域 */}
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-6 max-w-7xl">
          {/* 整体容器动画（淡入 + 上移） */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* 页面标题和声誉徽章区域 */}
            <div className="flex items-center justify-between mb-12">
              {/* 左侧：标题 */}
              <div>
                <h1 className="text-5xl font-black text-black mb-2">我的贡献</h1>
                <p className="text-gray-600">
                  管理你的所有 GitHub 贡献并提交到链上
                </p>
              </div>

              {/* 右侧：声誉徽章（仅当有评分记录时显示） */}
              {reputation.feedbackCount > 0 && (
                <ReputationBadge
                  totalScore={reputation.totalScore}
                  feedbackCount={reputation.feedbackCount}
                  averageScore={reputation.averageScore}
                  size="large"
                />
              )}
            </div>

            {/* 提示区域 1：GitHub 未登录提示 */}
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

            {/* 提示区域 2：钱包未连接提示（已登录但未连接钱包） */}
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

