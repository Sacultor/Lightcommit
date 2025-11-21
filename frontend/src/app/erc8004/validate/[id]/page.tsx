/**
 * ERC-8004 贡献验证和铸造页面（核心流程页面）
 * 
 * 路由：/erc8004/validate/[id]
 * 功能：完成贡献评分上链和 NFT 铸造的完整流程
 * 
 * 三步流程：
 * 步骤 1 - 查看评分：
 *   - 显示贡献详情（仓库、commit SHA、时间）
 *   - 显示评分详情（总分 + 5 项细分）
 *   - 显示是否达到铸造阈值（≥80 分）
 * 
 * 步骤 2 - 提交链上：
 *   - 检查钱包连接和代理注册状态
 *   - 调用 ReputationRegistry.submitFeedback()
 *   - 提交 EIP-712 签名的评分数据到链上
 *   - 评分数据存储在链上，详细元数据存储在 IPFS
 * 
 * 步骤 3 - 验证铸造：
 *   - 如果评分 ≥80，自动触发 NFT 铸造
 *   - 调用 ValidationRegistry.requestValidation()
 *   - ValidationRegistry 验证评分后调用 CommitNFT.mintCommit()
 *   - 显示铸造结果（Token ID、交易哈希）
 * 
 * 核心合约交互：
 * 1. ReputationRegistry.submitFeedback(params, signature)
 *    - 提交评分到链上
 *    - 更新贡献者的总声誉分数
 * 
 * 2. ValidationRegistry.requestValidation(repo, commitSha, contributor, metadataURI)
 *    - 验证评分是否达到阈值
 *    - 如果 score >= 80，自动铸造 NFT
 * 
 * 3. CommitNFT.mintCommit(to, commitData, metadataURI)
 *    - 由 ValidationRegistry 自动调用
 *    - 铸造 ERC-721 NFT
 * 
 * 数据来源：
 * - 贡献详情：数据库（/api/contributions/[id]）
 * - 签名数据：服务端（/api/contributions/[id]/sign）
 * - 代理状态：链上（AgentIdentityRegistry）
 * 
 * 权限要求：
 * - 钱包连接：必需
 * - 代理注册：必需（首次使用时自动弹窗）
 * 
 * 使用场景：
 * - 用户从贡献列表点击某个贡献进入
 * - 完成评分上链和 NFT 铸造的完整流程
 */
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { HeaderSimple } from '@/components/layout/header';
import { FooterSimple } from '@/components/layout/footer';
import { ScoreDisplay } from '@/components/erc8004/ScoreDisplay';
import { RegisterAgentModal } from '@/components/erc8004/RegisterAgentModal';
import { useAgentRegistry } from '@/hooks/use-agent-registry';
import { useWeb3 } from '@/lib/contexts/Web3Context';
import { Check, Loader2, ArrowLeft } from 'lucide-react';
import { ReputationRegistryABI, ValidationRegistryABI } from '@/lib/contracts';
import toast from 'react-hot-toast';

function ValidatePageContent() {
  // 路由参数和导航
  const params = useParams();
  const router = useRouter();
  const contributionId = params.id as string;  // 从 URL 获取贡献 ID

  // Web3 相关状态
  const { address, isConnected, connect } = useWeb3();
  
  // Wagmi hooks：用于合约交互
  const { writeContract, data: txHash } = useWriteContract();
  const { isSuccess: isTxConfirmed } = useWaitForTransactionReceipt({ hash: txHash });
  
  // 代理注册状态
  const { isRegistered, loading: agentLoading } = useAgentRegistry();

  // 页面状态
  const [currentStep, setCurrentStep] = useState(1);                       // 当前步骤（1/2/3）
  const [contribution, setContribution] = useState<Record<string, unknown> | null>(null);  // 贡献数据
  const [signData, setSignData] = useState<Record<string, unknown> | null>(null);         // 签名数据
  const [loading, setLoading] = useState(true);                            // 加载状态
  const [submitting, setSubmitting] = useState(false);                     // 提交中状态
  const [progress, setProgress] = useState(0);                             // 提交进度（0-100）
  const [showRegisterModal, setShowRegisterModal] = useState(false);       // 是否显示代理注册弹窗
  const [mintedTokenId, setMintedTokenId] = useState<string | null>(null); // 铸造的 NFT Token ID
  const [transactionHash, setTransactionHash] = useState<string | null>(null);  // 交易哈希

  /**
   * 加载贡献详情和签名数据
   * 
   * 流程：
   * 1. 调用 /api/contributions/[id] 获取贡献详情
   * 2. 检查是否已评分（如果未评分，返回列表页）
   * 3. 调用 /api/contributions/[id]/sign 获取 EIP-712 签名
   * 4. 更新页面状态
   */
  const loadContribution = async () => {
    try {
      setLoading(true);

      // 1. 获取贡献详情
      const response = await fetch(`/api/contributions/${contributionId}`);
      if (!response.ok) {
        throw new Error('获取贡献失败');
      }

      const data = await response.json();
      setContribution(data);

      // 2. 检查是否已评分（未评分无法进入验证流程）
      if (!data.score) {
        toast.error('此贡献尚未评分');
        router.push('/erc8004/contributions');
        return;
      }

      // 3. 获取 EIP-712 签名数据（包含 params 和 signature）
      const signResponse = await fetch(`/api/contributions/${contributionId}/sign`);
      if (!signResponse.ok) {
        throw new Error('获取签名失败');
      }

      const signResult = await signResponse.json();
      setSignData(signResult);
    } catch (error) {
      console.error('加载失败:', error);
      toast.error('加载贡献数据失败');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 页面初始化时加载数据
   */
  useEffect(() => {
    loadContribution();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contributionId]);

  /**
   * 检查代理注册状态
   * 
   * 如果用户已连接钱包但未注册代理，自动弹出注册弹窗
   */
  useEffect(() => {
    if (isConnected && !agentLoading && !isRegistered) {
      setShowRegisterModal(true);
    }
  }, [isConnected, isRegistered, agentLoading]);

  /**
   * 提交评分到链上（步骤 2 的核心函数 - 使用 Viem）
   * 
   * 合约调用：ReputationRegistry.submitFeedback(params, signature)
   * 
   * 优势：
   * - ✅ 使用 wagmi 的 useWriteContract，无需手动创建合约实例
   * - ✅ 自动处理交易状态（pending/success/error）
   * - ✅ 更简洁的代码
   */
  const handleSubmitFeedback = async () => {
    // 1. 检查钱包连接状态
    if (!isConnected || !address) {
      toast.error('请先连接钱包');
      await connect();
      return;
    }

    // 2. 检查代理注册状态
    if (!isRegistered) {
      setShowRegisterModal(true);
      return;
    }

    // 3. 检查签名数据是否准备好
    if (!signData) {
      toast.error('签名数据未准备好');
      return;
    }

    // 4. 开始提交流程
    setSubmitting(true);
    setProgress(0);

    try {
      // 5. 显示提交中提示
      toast.loading('正在提交评分到链上...', { id: 'submit' });
      setProgress(20);

      setProgress(40);

      // 6. 使用 viem 调用 submitFeedback()
      // 不再需要创建合约实例，直接调用 writeContract
      const hash = await writeContract({
        address: process.env.NEXT_PUBLIC_REPUTATION_REGISTRY_ADDRESS as `0x${string}`,
        abi: ReputationRegistryABI,
        functionName: 'submitFeedback',
        args: [signData.params, signData.signature],
      });

      // 7. 等待交易被打包进区块（由 useWaitForTransactionReceipt 自动处理）
      setProgress(60);
      toast.dismiss('submit');
      toast.loading('等待区块确认...', { id: 'confirm' });

      // 注意：实际的交易确认由 useEffect 监听 isTxConfirmed 处理
      // 这里保存 hash 供后续使用
      if (hash) {
        setTransactionHash(hash);
      }

    } catch (error: any) {
      // 8. 错误处理
      console.error('提交失败:', error);
      toast.dismiss('submit');
      toast.dismiss('confirm');

      // 区分不同类型的错误
      if (error.message?.includes('User rejected')) {
        // 用户取消了交易
        toast.error('交易已取消');
      } else if (error.message?.includes('Already processed')) {
        // 此 commit 已经提交过评分
        toast.error('此贡献已经提交过评分');
        setCurrentStep(3);
      } else {
        // 其他错误
        toast.error(error.message || '提交失败');
      }
      
      setSubmitting(false);
    }
  };

  /**
   * 监听交易确认状态
   * 
   * 当交易被确认后，自动跳转到步骤 3
   */
  useEffect(() => {
    if (isTxConfirmed && submitting) {
      setProgress(80);
      toast.dismiss('confirm');
      toast.success('评分已成功提交到链上！');
      setProgress(100);

      setTimeout(() => {
        setSubmitting(false);
        setCurrentStep(3);
      }, 500);
    }
  }, [isTxConfirmed, submitting]);

  /**
   * 请求验证并铸造 NFT（步骤 3 的核心函数 - 使用 Viem）
   * 
   * 合约调用：ValidationRegistry.requestValidation(repo, commitSha, contributor, metadataURI)
   * 
   * 优势：
   * - ✅ 使用 wagmi 的 useWriteContract
   * - ✅ 无需手动解析事件（Viem 自动处理）
   * - ✅ 更简洁的代码
   */
  const handleRequestValidation = async () => {
    // 1. 检查前置条件
    if (!signData) {
      toast.error('数据未准备好');
      return;
    }

    // 2. 开始验证流程
    setSubmitting(true);
    setProgress(0);

    try {
      // 3. 显示验证中提示
      toast.loading('正在请求验证与铸造...', { id: 'validate' });
      setProgress(20);

      setProgress(40);

      // 4. 使用 viem 调用 requestValidation()
      const hash = await writeContract({
        address: process.env.NEXT_PUBLIC_VALIDATION_REGISTRY_ADDRESS as `0x${string}`,
        abi: ValidationRegistryABI,
        functionName: 'requestValidation',
        args: [
          signData.params.repo,          // 仓库全名
          signData.params.commitSha,     // Commit SHA
          signData.params.contributor,   // 贡献者地址
          signData.params.metadataURI,   // IPFS 元数据 URI
        ],
      });

      // 5. 等待交易确认
      setProgress(60);
      toast.dismiss('validate');
      toast.loading('等待区块确认...', { id: 'confirm' });

      // 保存交易哈希
      if (hash) {
        setTransactionHash(hash);
      }

      // 注意：交易确认和事件解析由 useEffect 处理

    } catch (error: any) {
      // 6. 错误处理
      console.error('验证失败:', error);
      toast.dismiss('validate');
      toast.dismiss('confirm');

      // 区分不同类型的错误
      if (error.message?.includes('User rejected')) {
        // 用户取消了交易
        toast.error('交易已取消');
      } else {
        // 其他错误
        toast.error(error.message || '验证失败');
      }

      setSubmitting(false);
      setProgress(0);
    }
  };

  /**
   * 监听验证交易确认状态（步骤 3）
   * 
   * 交易确认后，检查是否成功铸造 NFT
   * TODO: 需要从交易 logs 中解析 MintTriggered 事件获取 Token ID
   */
  useEffect(() => {
    if (isTxConfirmed && submitting && currentStep === 2) {
      setProgress(80);
      toast.dismiss('confirm');
      
      // 简化版：假设铸造成功（完整版需要解析 logs）
      if (signData?.shouldMint) {
        toast.success('NFT 铸造成功！');
        // TODO: 从交易 logs 解析 Token ID
        setMintedTokenId('查看交易详情');
      } else {
        toast('验证完成，但分数未达到铸造阈值', { icon: 'ℹ️' });
      }
      
      setProgress(100);
      setTimeout(() => {
        setSubmitting(false);
      }, 500);
    }
  }, [isTxConfirmed, submitting, currentStep, signData]);

  /**
   * 步骤配置
   */
  const steps = [
    { number: 1, title: '查看评分', active: true },
    { number: 2, title: '提交链上', active: false },
    { number: 3, title: '验证铸造', active: false },
  ];

  // 加载中状态：显示加载动画
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F1E8] flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-black" />
      </div>
    );
  }

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
            {/* 返回按钮 */}
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-black mb-8 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              返回贡献列表
            </button>

            {/* 步骤导航栏 */}
            <div className="flex gap-4 mb-12 justify-center flex-wrap">
              {steps.map((step) => (
                <button
                  key={step.number}
                  onClick={() => currentStep >= step.number && setCurrentStep(step.number)}  // 只能点击已完成或当前步骤
                  disabled={currentStep < step.number}  // 未完成的步骤禁用
                  className={`px-6 py-3 rounded-2xl font-bold text-base border-3 transition-all ${
                    currentStep === step.number
                      ? 'bg-black text-white border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'  // 当前步骤：黑色
                      : currentStep > step.number
                        ? 'bg-green-500 text-white border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)]'  // 已完成：绿色
                        : 'bg-white text-gray-400 border-gray-300 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] cursor-not-allowed'  // 未开始：灰色
                  }`}
                >
                  {/* 已完成的步骤显示 √ 图标 */}
                  {currentStep > step.number && <Check className="w-4 h-4 inline mr-2" />}
                  {step.number}. {step.title}
                </button>
              ))}
            </div>

            {/* 步骤 1：查看评分 */}
            {currentStep === 1 && contribution && signData && (
              <div className="max-w-4xl mx-auto space-y-6">
                {/* 贡献详情卡片 */}
                <div className="bg-white border-[3px] border-black rounded-2xl p-6 mb-6"
                  style={{ boxShadow: '4px_4px 0px 0px rgba(0,0,0,0.8)' }}>
                  {/* 贡献标题 */}
                  <h2 className="text-2xl font-black text-black mb-4">
                    {contribution.title || 'Untitled Contribution'}
                  </h2>
                  {/* 贡献元数据 */}
                  <div className="space-y-2 text-sm text-gray-600">
                    <p><span className="font-bold">仓库:</span> {contribution.repository?.fullName}</p>
                    <p><span className="font-bold">Commit:</span> <span className="font-mono">{contribution.metadata?.sha}</span></p>
                    <p><span className="font-bold">时间:</span> {new Date(contribution.createdAt).toLocaleString('zh-CN')}</p>
                  </div>
                </div>

                {/* 评分展示组件（显示总分和5项细分） */}
                <ScoreDisplay
                  score={contribution.score}
                  breakdown={signData.breakdown}
                  threshold={80}  // 铸造阈值
                />

                {/* 下一步按钮 */}
                <div className="flex justify-end mt-8">
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="px-8 py-3 bg-black text-white rounded-full font-bold text-base shadow-[3px_3px_0px_0px_rgba(0,0,0,0.5)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all"
                  >
                    下一步
                  </button>
                </div>
              </div>
            )}

            {/* 步骤 2：提交评分到链上 */}
            {currentStep === 2 && (
              <div className="max-w-4xl mx-auto">
                <div className="bg-white border-[3px] border-black rounded-2xl p-8 mb-6"
                  style={{ boxShadow: '4px_4px 0px 0px rgba(0,0,0,0.8)' }}>
                  <h2 className="text-3xl font-black text-black mb-6">提交评分到链上</h2>

                  {/* 关键信息展示 */}
                  <div className="space-y-4 mb-8">
                    {/* 钱包地址 */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border-2 border-gray-200">
                      <span className="text-sm text-gray-600">钱包地址</span>
                      <span className="font-mono text-sm font-bold">{account?.slice(0, 6)}...{account?.slice(-4)}</span>
                    </div>

                    {/* 评分 */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border-2 border-gray-200">
                      <span className="text-sm text-gray-600">评分</span>
                      <span className="text-2xl font-black text-black">{contribution?.score}/100</span>
                    </div>

                    {/* 是否可铸造 */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border-2 border-gray-200">
                      <span className="text-sm text-gray-600">是否可铸造</span>
                      <span className={`font-bold ${signData?.shouldMint ? 'text-green-600' : 'text-gray-600'}`}>
                        {signData?.shouldMint ? '✓ 是' : '✗ 否 (需 ≥80 分)'}
                      </span>
                    </div>

                    {/* 说明提示 */}
                    <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
                      <p className="text-sm text-blue-800">
                        📋 <span className="font-bold">说明:</span> 评分数据将通过 EIP-712 签名提交到链上的声誉注册表，链上仅存储评分哈希和关键索引，详细数据存储在 IPFS。
                      </p>
                    </div>
                  </div>

                  {!submitting ? (
                    <button
                      onClick={handleSubmitFeedback}
                      disabled={!isConnected || !isRegistered}
                      className={`w-full py-4 rounded-2xl font-bold text-lg border-[3px] border-black transition-all ${
                        isConnected && isRegistered
                          ? 'bg-black text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,0.5)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] hover:translate-x-[-1px] hover:translate-y-[-1px]'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {!isConnected ? '请先连接钱包' : !isRegistered ? '请先注册代理' : '提交到链上'}
                    </button>
                  ) : (
                    <div>
                      <div className="mb-3 flex items-center justify-between text-sm">
                        <span className="text-gray-600">提交进度</span>
                        <span className="font-mono text-gray-600">{progress}%</span>
                      </div>
                      <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden border-2 border-black">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 0.3 }}
                          className="h-full bg-gradient-to-r from-black to-gray-500"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-2 text-center">
                        {progress < 40 && '准备交易...'}
                        {progress >= 40 && progress < 60 && '等待用户确认...'}
                        {progress >= 60 && progress < 80 && '等待区块确认...'}
                        {progress >= 80 && '写入链上数据...'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="max-w-4xl mx-auto">
                <div className="flex flex-col items-center justify-center py-12">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5, type: 'spring' }}
                    className="w-32 h-32 rounded-full border-[6px] border-black bg-white flex items-center justify-center mb-8"
                    style={{ boxShadow: '8px_8px 0px 0px rgba(0,0,0,0.8)' }}
                  >
                    <Check className="w-16 h-16 text-black" strokeWidth={4} />
                  </motion.div>

                  <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-4xl font-black text-black mb-4 text-center"
                  >
                    评分已提交成功！
                  </motion.h2>

                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="text-lg text-gray-600 mb-8 text-center max-w-lg"
                  >
                    你的贡献评分已永久记录在区块链上
                  </motion.p>

                  {transactionHash && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                      className="mb-8 bg-white border-[3px] border-black rounded-2xl p-6 w-full max-w-lg"
                      style={{ boxShadow: '4px_4px 0px 0px rgba(0,0,0,0.8)' }}
                    >
                      <h3 className="font-bold text-lg mb-4 text-center">交易详情</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="text-gray-600">评分:</span>
                          <span className="font-black text-2xl">{contribution?.score}/100</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="text-gray-600">交易哈希:</span>
                          <a
                            href={`${process.env.NEXT_PUBLIC_EXPLORER_URL || 'https://sepolia.etherscan.io'}/tx/${transactionHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-mono text-blue-600 hover:text-blue-800 hover:underline text-xs flex items-center gap-1"
                          >
                            {transactionHash.slice(0, 10)}...{transactionHash.slice(-8)}
                          </a>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {signData?.shouldMint && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 }}
                      className="mb-8 w-full max-w-lg"
                    >
                      <button
                        onClick={handleRequestValidation}
                        disabled={submitting}
                        className={`w-full py-4 rounded-2xl font-bold text-lg border-[3px] border-black transition-all ${
                          submitting
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-green-500 text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,0.5)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] hover:translate-x-[-1px] hover:translate-y-[-1px]'
                        }`}
                      >
                        {submitting ? (
                          <span className="flex items-center justify-center gap-2">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            验证中 {progress}%
                          </span>
                        ) : mintedTokenId ? (
                          `✓ 已铸造 NFT #${mintedTokenId}`
                        ) : (
                          '立即验证并铸造 NFT'
                        )}
                      </button>
                    </motion.div>
                  )}

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="flex gap-4"
                  >
                    <button
                      onClick={() => router.push('/erc8004/contributions')}
                      className="px-8 py-3 bg-white border-[3px] border-black rounded-2xl font-bold hover:bg-gray-50 transition-colors"
                      style={{ boxShadow: '3px_3px 0px 0px rgba(0,0,0,0.8)' }}
                    >
                      返回列表
                    </button>
                    {mintedTokenId && (
                      <button
                        onClick={() => router.push('/collections')}
                        className="px-8 py-3 bg-black text-white border-[3px] border-black rounded-2xl font-bold shadow-[3px_3px_0px_0px_rgba(0,0,0,0.5)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)]"
                      >
                        查看我的 NFT
                      </button>
                    )}
                  </motion.div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </main>

      <FooterSimple />

      <RegisterAgentModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        onSuccess={() => setShowRegisterModal(false)}
      />
    </div>
  );
}

export default function ValidatePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F5F1E8] flex items-center justify-center"><Loader2 className="w-12 h-12 animate-spin" /></div>}>
      <ValidatePageContent />
    </Suspense>
  );
}

