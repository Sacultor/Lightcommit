'use client';

import { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ethers } from 'ethers';
import { HeaderSimple } from '@/components/header-simple';
import { FooterSimple } from '@/components/footer-simple';
import { ScoreDisplay } from '@/components/erc8004/ScoreDisplay';
import { RegisterAgentModal } from '@/components/erc8004/RegisterAgentModal';
import { useAgentRegistry } from '@/hooks/use-agent-registry';
import { useWeb3 } from '@/lib/contexts/Web3Context';
import { Check, Loader2, ArrowLeft } from 'lucide-react';
import { ReputationRegistryABI, ValidationRegistryABI } from '@/lib/contracts';
import toast from 'react-hot-toast';

function ValidatePageContent() {
  const params = useParams();
  const router = useRouter();
  const contributionId = params.id as string;

  const { account, isConnected, connect, signer } = useWeb3();
  const { isRegistered, loading: agentLoading } = useAgentRegistry();

  const [currentStep, setCurrentStep] = useState(1);
  const [contribution, setContribution] = useState<Record<string, unknown> | null>(null);
  const [signData, setSignData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [mintedTokenId, setMintedTokenId] = useState<string | null>(null);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);

  const loadContribution = async () => {
    try {
      setLoading(true);

      const response = await fetch(`/api/contributions/${contributionId}`);
      if (!response.ok) {
        throw new Error('获取贡献失败');
      }

      const data = await response.json();
      setContribution(data);

      if (!data.score) {
        toast.error('此贡献尚未评分');
        router.push('/erc8004/contributions');
        return;
      }

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

  useEffect(() => {
    loadContribution();
  }, [contributionId]);

  useEffect(() => {
    if (isConnected && !agentLoading && !isRegistered) {
      setShowRegisterModal(true);
    }
  }, [isConnected, isRegistered, agentLoading]);

  const handleSubmitFeedback = async () => {
    if (!isConnected || !account) {
      toast.error('请先连接钱包');
      await connect();
      return;
    }

    if (!isRegistered) {
      setShowRegisterModal(true);
      return;
    }

    if (!signData || !signer) {
      toast.error('签名数据未准备好');
      return;
    }

    setSubmitting(true);
    setProgress(0);

    try {
      toast.loading('正在提交评分到链上...', { id: 'submit' });
      setProgress(20);

      const reputationRegistry = new ethers.Contract(
        process.env.NEXT_PUBLIC_REPUTATION_REGISTRY_ADDRESS!,
        ReputationRegistryABI,
        signer,
      );

      setProgress(40);

      const tx = await reputationRegistry.submitFeedback(
        signData.params,
        signData.signature,
      );

      setProgress(60);
      toast.dismiss('submit');
      toast.loading('等待区块确认...', { id: 'confirm' });

      const receipt = await tx.wait();
      setProgress(80);

      toast.dismiss('confirm');
      toast.success('评分已成功提交到链上！');

      setTransactionHash(receipt.hash);
      setProgress(100);

      setTimeout(() => {
        setCurrentStep(3);
      }, 500);

    } catch (error: any) {
      console.error('提交失败:', error);
      toast.dismiss('submit');
      toast.dismiss('confirm');

      if (error.code === 'ACTION_REJECTED' || error.code === 4001) {
        toast.error('交易已取消');
      } else if (error.message?.includes('Already processed')) {
        toast.error('此贡献已经提交过评分');
        setCurrentStep(3);
      } else {
        toast.error(error.reason || error.message || '提交失败');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleRequestValidation = async () => {
    if (!signer || !signData) {
      toast.error('数据未准备好');
      return;
    }

    setSubmitting(true);
    setProgress(0);

    try {
      toast.loading('正在请求验证与铸造...', { id: 'validate' });
      setProgress(20);

      const validationRegistry = new ethers.Contract(
        process.env.NEXT_PUBLIC_VALIDATION_REGISTRY_ADDRESS!,
        ValidationRegistryABI,
        signer,
      );

      setProgress(40);

      const tx = await validationRegistry.requestValidation(
        signData.params.repo,
        signData.params.commitSha,
        signData.params.contributor,
        signData.params.metadataURI,
      );

      setProgress(60);
      toast.dismiss('validate');
      toast.loading('等待区块确认...', { id: 'confirm' });

      const receipt = await tx.wait();
      setProgress(80);

      const mintEvent = receipt.logs.find((log: any) => {
        try {
          const parsed = validationRegistry.interface.parseLog(log);
          return parsed?.name === 'MintTriggered';
        } catch {
          return false;
        }
      });

      if (mintEvent) {
        const parsed = validationRegistry.interface.parseLog(mintEvent);
        setMintedTokenId(parsed?.args[1]?.toString() || null);
        toast.dismiss('confirm');
        toast.success('NFT 铸造成功！');
      } else {
        toast.dismiss('confirm');
        toast('验证完成，但分数未达到铸造阈值', { icon: 'ℹ️' });
      }

      setProgress(100);
      setTransactionHash(receipt.hash);

      setTimeout(() => {
        setSubmitting(false);
      }, 500);

    } catch (error: any) {
      console.error('验证失败:', error);
      toast.dismiss('validate');
      toast.dismiss('confirm');

      if (error.code === 'ACTION_REJECTED' || error.code === 4001) {
        toast.error('交易已取消');
      } else {
        toast.error(error.reason || error.message || '验证失败');
      }

      setSubmitting(false);
      setProgress(0);
    }
  };

  const steps = [
    { number: 1, title: '查看评分', active: true },
    { number: 2, title: '提交链上', active: false },
    { number: 3, title: '验证铸造', active: false },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F1E8] flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-black" />
      </div>
    );
  }

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
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-black mb-8 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              返回贡献列表
            </button>

            <div className="flex gap-4 mb-12 justify-center flex-wrap">
              {steps.map((step) => (
                <button
                  key={step.number}
                  onClick={() => currentStep >= step.number && setCurrentStep(step.number)}
                  disabled={currentStep < step.number}
                  className={`px-6 py-3 rounded-2xl font-bold text-base border-3 transition-all ${
                    currentStep === step.number
                      ? 'bg-black text-white border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
                      : currentStep > step.number
                        ? 'bg-green-500 text-white border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)]'
                        : 'bg-white text-gray-400 border-gray-300 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] cursor-not-allowed'
                  }`}
                >
                  {currentStep > step.number && <Check className="w-4 h-4 inline mr-2" />}
                  {step.number}. {step.title}
                </button>
              ))}
            </div>

            {currentStep === 1 && contribution && signData && (
              <div className="max-w-4xl mx-auto space-y-6">
                <div className="bg-white border-[3px] border-black rounded-2xl p-6 mb-6"
                  style={{ boxShadow: '4px_4px 0px 0px rgba(0,0,0,0.8)' }}>
                  <h2 className="text-2xl font-black text-black mb-4">
                    {contribution.title || 'Untitled Contribution'}
                  </h2>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p><span className="font-bold">仓库:</span> {contribution.repository?.fullName}</p>
                    <p><span className="font-bold">Commit:</span> <span className="font-mono">{contribution.metadata?.sha}</span></p>
                    <p><span className="font-bold">时间:</span> {new Date(contribution.createdAt).toLocaleString('zh-CN')}</p>
                  </div>
                </div>

                <ScoreDisplay
                  score={contribution.score}
                  breakdown={signData.breakdown}
                  threshold={80}
                />

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

            {currentStep === 2 && (
              <div className="max-w-4xl mx-auto">
                <div className="bg-white border-[3px] border-black rounded-2xl p-8 mb-6"
                  style={{ boxShadow: '4px_4px 0px 0px rgba(0,0,0,0.8)' }}>
                  <h2 className="text-3xl font-black text-black mb-6">提交评分到链上</h2>

                  <div className="space-y-4 mb-8">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border-2 border-gray-200">
                      <span className="text-sm text-gray-600">钱包地址</span>
                      <span className="font-mono text-sm font-bold">{account?.slice(0, 6)}...{account?.slice(-4)}</span>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border-2 border-gray-200">
                      <span className="text-sm text-gray-600">评分</span>
                      <span className="text-2xl font-black text-black">{contribution?.score}/100</span>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border-2 border-gray-200">
                      <span className="text-sm text-gray-600">是否可铸造</span>
                      <span className={`font-bold ${signData?.shouldMint ? 'text-green-600' : 'text-gray-600'}`}>
                        {signData?.shouldMint ? '✓ 是' : '✗ 否 (需 ≥80 分)'}
                      </span>
                    </div>

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

