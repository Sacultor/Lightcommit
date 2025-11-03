'use client';

import { HeaderSimple } from '@/components/header-simple';
import { FooterSimple } from '@/components/footer-simple';
import { motion } from 'framer-motion';
import { ChevronDown, Check, Wallet as WalletIcon } from 'lucide-react';
import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useWeb3 } from '@/lib/contexts/Web3Context';
import { useContract } from '@/lib/hooks/useContract';
import { ContractService } from '@/lib/services/contract.service';
import toast from 'react-hot-toast';

function NewMintPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Web3 hooks
  const { account, isConnected, chainId, connect } = useWeb3();
  const contract = useContract();

  const initialStep = parseInt(searchParams.get('step') || '1');
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedNetwork, setSelectedNetwork] = useState('Choose Network');
  const [showNetworkDropdown, setShowNetworkDropdown] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [mintingProgress, setMintingProgress] = useState(0);

  // 交易结果状态
  const [mintedTokenId, setMintedTokenId] = useState<string | null>(null);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);

  const networks = [
    {
      name: 'Ethereum Mainnet',
      chainId: 1,
      color: '#627EEA',
      icon: 'ethereum',
    },
    {
      name: 'Sepolia Testnet',
      chainId: 11155111,
      color: '#627EEA',
      icon: 'ethereum',
    },
    {
      name: 'Goerli Testnet',
      chainId: 5,
      color: '#627EEA',
      icon: 'ethereum',
    },
    {
      name: 'Polygon Mainnet',
      chainId: 137,
      color: '#8247E5',
      icon: 'polygon',
    },
    {
      name: 'Polygon Mumbai',
      chainId: 80001,
      color: '#8247E5',
      icon: 'polygon',
    },
  ];

  const getNetworkIcon = (iconType: string, _color: string) => {
    if (iconType === 'ethereum') {
      return (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="white">
          <path d="M11.944 17.97L4.58 13.62 11.943 24l7.37-10.38-7.372 4.35h.003zM12.056 0L4.69 12.223l7.365 4.354 7.365-4.35L12.056 0z"/>
        </svg>
      );
    } else if (iconType === 'polygon') {
      return (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="white">
          <path d="M17.408 5.503c-.296-.197-.691-.197-1.086 0l-3.358 2.07-2.27 1.382-3.36 2.071c-.295.197-.69.197-1.085 0l-2.664-1.678c-.296-.197-.493-.592-.493-.986V5.9c0-.395.197-.79.493-.987l2.664-1.677c.296-.197.691-.197 1.086 0l2.664 1.677c.296.197.493.592.493.987v2.07l2.27-1.382V4.517c0-.395-.197-.79-.493-.987L9.605.987c-.296-.197-.691-.197-1.086 0L4.857 3.53c-.296.197-.493.592-.493.987v5.164c0 .395.197.79.493.987l3.662 2.268c.296.197.691.197 1.086 0l3.36-2.071 2.27-1.382 3.358-2.07c.296-.198.691-.198 1.086 0l2.664 1.677c.296.197.493.592.493.987v3.163c0 .395-.197.79-.493.987l-2.664 1.677c-.296.197-.691.197-1.086 0l-2.664-1.677c-.296-.197-.493-.592-.493-.987v-2.07l-2.27 1.382v2.07c0 .395.197.79.493.987l3.662 2.268c.296.197.691.197 1.086 0l3.662-2.268c.296-.197.493-.592.493-.987V6.49c0-.395-.197-.79-.493-.987l-3.662-2.268z"/>
        </svg>
      );
    }
  };

  const selectedNetworkData = networks.find(n => n.name === selectedNetwork);

  const handleMint = async () => {
    // 检查钱包连接
    if (!isConnected || !account) {
      toast.error('请先连接钱包');
      try {
        await connect();
      } catch (error) {
        console.error('Connect wallet failed:', error);
      }
      return;
    }

    // 检查合约实例
    if (!contract) {
      toast.error('合约未初始化，请检查配置');
      return;
    }

    // 验证输入
    if (!title.trim()) {
      toast.error('请输入 NFT 标题');
      return;
    }

    setIsMinting(true);
    setMintingProgress(10);

    try {
      const service = new ContractService(contract);

      // 构造 CommitData
      const commitData = {
        repo: 'lightcommit/demo',
        commit: `commit-${Date.now()}`,
        linesAdded: 100,
        linesDeleted: 50,
        testsPass: true,
        timestamp: Math.floor(Date.now() / 1000),
        author: account,
        message: title,
        merged: true,
      };

      setMintingProgress(30);
      toast.loading('正在准备交易...', { id: 'minting' });

      // 调用真实的合约铸造
      const result = await service.mintCommit(
        account,
        commitData,
        `https://api.lightcommit.com/metadata/${Date.now()}`,
      );

      setMintingProgress(60);

      if (result.success) {
        setMintingProgress(90);
        toast.dismiss('minting');
        toast.success('NFT 铸造成功！');

        // 保存铸造结果
        setMintedTokenId(result.tokenId || null);
        setTransactionHash(result.transactionHash || null);

        setMintingProgress(100);

        // 延迟跳转到成功页面
        setTimeout(() => {
          setIsMinting(false);
          setCurrentStep(3);
        }, 500);
      } else {
        throw new Error(result.error || '铸造失败');
      }
    } catch (error: any) {
      console.error('Mint error:', error);
      toast.dismiss('minting');

      // 区分不同类型的错误
      if (error.code === 'ACTION_REJECTED' || error.code === 4001) {
        // 用户拒绝了交易
        toast('交易已取消', {
          icon: '❌',
          duration: 3000,
        });
      } else if (error.message?.includes('insufficient funds')) {
        // 余额不足
        toast.error('余额不足，请确保有足够的 ETH 支付 Gas 费用');
      } else if (error.message?.includes('network')) {
        // 网络错误
        toast.error('网络连接失败，请检查您的网络设置');
      } else {
        // 其他错误
        const errorMsg = error.reason || error.message || '铸造失败，请重试';
        toast.error(errorMsg);
      }

      setIsMinting(false);
      setMintingProgress(0);
    }
  };

  const steps = [
    { number: 1, title: 'Configure NFT', active: true },
    { number: 2, title: 'Preview & Network', active: false },
    { number: 3, title: 'Minting......', active: false },
  ];

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
            <div className="flex gap-4 mb-12 justify-center flex-wrap">
              {steps.map((step) => (
                <button
                  key={step.number}
                  onClick={() => setCurrentStep(step.number)}
                  className={`px-6 py-3 rounded-2xl font-bold text-base border-3 transition-all ${
                    currentStep === step.number
                      ? 'bg-black text-white border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
                      : 'bg-white text-black border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,0.5)]'
                  }`}
                >
                  {step.number}.{step.title}
                </button>
              ))}
            </div>

            {currentStep === 1 && (
              <div className="max-w-2xl mx-auto">
                <h2 className="text-4xl font-black text-black mb-8">
                  Configure NFT Metadata
                </h2>

                <div className="space-y-6">
                  <div>
                    <label className="block text-xl font-black text-black mb-3">
                      NFT Title
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="FEAT: IMPLEMENT USER AUTHENTICATION AND DARK MODE"
                      className="w-full px-6 py-4 text-base bg-white border-3 border-black rounded-2xl focus:outline-none focus:ring-0 placeholder:text-gray-400 font-normal"
                      style={{
                        boxShadow: '3px 3px 0px 0px rgba(0,0,0,0.8)',
                      }}
                    />
                  </div>

                  <div>
                    <label className="block text-xl font-black text-black mb-3">
                      Description
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-4 w-12 h-12 bg-gray-200 rounded-lg border-2 border-gray-300" />
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="DETAILED DESCRIPTION OF YOUR CONTRIBUTION."
                        rows={6}
                        className="w-full pl-20 pr-6 py-4 text-base bg-white border-3 border-black rounded-2xl focus:outline-none focus:ring-0 placeholder:text-gray-400 font-normal resize-none"
                        style={{
                          boxShadow: '3px 3px 0px 0px rgba(0,0,0,0.8)',
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end mt-8">
                    <button
                      onClick={() => setCurrentStep(2)}
                      className="px-8 py-3 bg-black text-white rounded-full font-bold text-base shadow-[3px_3px_0px_0px_rgba(0,0,0,0.5)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  {/* 钱包连接状态 */}
                  <div className="bg-white border-[3px] border-black rounded-2xl p-6"
                    style={{ boxShadow: '3px 3px 0px 0px rgba(0,0,0,0.8)' }}>
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                      <WalletIcon className="w-5 h-5" />
                      钱包状态
                    </h3>
                    {!isConnected ? (
                      <button
                        onClick={connect}
                        className="w-full px-6 py-3 bg-red-400 hover:bg-red-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
                      >
                        <WalletIcon className="w-5 h-5" />
                        连接钱包以铸造
                      </button>
                    ) : (
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-gray-600">地址:</span>
                          <span className="font-mono font-bold">{account?.slice(0, 6)}...{account?.slice(-4)}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-gray-600">网络:</span>
                          <span className="font-mono">Chain ID: {chainId}</span>
                        </div>
                        <div className="flex justify-between py-2">
                          <span className="text-gray-600">状态:</span>
                          <span className="text-green-600 font-bold flex items-center gap-1">
                            <span className="inline-block w-2 h-2 bg-green-600 rounded-full"></span>
                            已连接
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="relative">
                    <button
                      onClick={() => setShowNetworkDropdown(!showNetworkDropdown)}
                      className="w-full px-6 py-4 text-left bg-white border-[3px] border-black rounded-2xl font-bold flex items-center justify-between"
                      style={{
                        boxShadow: '3px 3px 0px 0px rgba(0,0,0,0.8)',
                      }}
                    >
                      <div className="flex items-center gap-3">
                        {selectedNetworkData && (
                          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: selectedNetworkData.color }}>
                            {getNetworkIcon(selectedNetworkData.icon, selectedNetworkData.color)}
                          </div>
                        )}
                        <span className={selectedNetwork === 'Choose Network' ? 'text-gray-600' : 'text-black'}>
                          {selectedNetwork}
                        </span>
                      </div>
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    </button>

                    {showNetworkDropdown && (
                      <div
                        className="absolute top-full left-0 right-0 mt-2 bg-white border-[3px] border-black rounded-2xl overflow-hidden z-10"
                        style={{
                          boxShadow: '3px 3px 0px 0px rgba(0,0,0,0.8)',
                        }}
                      >
                        {networks.map((network) => (
                          <button
                            key={network.chainId}
                            onClick={() => {
                              setSelectedNetwork(network.name);
                              setShowNetworkDropdown(false);
                            }}
                            className="w-full px-6 py-4 hover:bg-blue-50 transition-colors text-left flex items-center gap-3 border-b border-gray-100 last:border-b-0"
                          >
                            <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: network.color }}>
                              {getNetworkIcon(network.icon, network.color)}
                            </div>
                            <div className="flex-1">
                              <div className="font-bold text-black">{network.name}</div>
                              <div className="text-xs text-gray-500">Chain ID: {network.chainId}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <div
                    className="relative bg-white border-[5px] border-black rounded-[30px] p-6 min-h-[600px]"
                    style={{
                      boxShadow: '8px 8px 0px 0px rgba(0,0,0,1)',
                    }}
                  >
                    <div className="aspect-[3/4] rounded-2xl mb-6 overflow-hidden">
                      <img
                        src="/assets/images/avatar-7.jpg"
                        alt="NFT Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-black text-xl flex-shrink-0">
                          LC
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-gray-800 line-clamp-2 mb-1">
                            {title || 'FEAT: IMPLEMENT USER AUTHENTICATION AND DARK MODE'}
                          </h3>
                          <p className="text-xs text-gray-500">Creator: 0xAbc, EFG</p>
                        </div>
                        <span className="text-xs text-gray-500 flex-shrink-0">5m ago</span>
                      </div>

                      <div className="text-sm text-gray-600">
                        Collection: <span className="font-bold">Astral Arcana</span>
                      </div>
                    </div>

                    {!isMinting ? (
                      <button
                        onClick={handleMint}
                        disabled={!isConnected}
                        className={`absolute bottom-6 right-6 px-8 py-3 rounded-full font-bold text-base transition-all ${
                          isConnected
                            ? 'bg-black text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,0.5)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] hover:translate-x-[-1px] hover:translate-y-[-1px] cursor-pointer'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)]'
                        }`}
                      >
                        {isConnected ? 'Mint NFT' : '请先连接钱包'}
                      </button>
                    ) : (
                      <div className="absolute bottom-6 left-6 right-6">
                        <div className="mb-3 flex items-center justify-end text-sm">
                          <span className="font-mono text-gray-600">{mintingProgress}%</span>
                        </div>
                        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden border-2 border-black">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${mintingProgress}%` }}
                            transition={{ duration: 0.3 }}
                            className="h-full bg-gradient-to-r from-black to-gray-500"
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-2 text-center">
                          {mintingProgress < 30 && '准备交易...'}
                          {mintingProgress >= 30 && mintingProgress < 60 && '等待区块链确认...'}
                          {mintingProgress >= 60 && mintingProgress < 90 && '写入合约数据...'}
                          {mintingProgress >= 90 && '完成铸造...'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="flex flex-col items-center justify-center py-20 max-w-2xl mx-auto">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, type: 'spring' }}
                  className="w-48 h-48 rounded-full border-[6px] border-black bg-white flex items-center justify-center mb-12"
                  style={{
                    boxShadow: '8px 8px 0px 0px rgba(0,0,0,0.8)',
                  }}
                >
                  <Check className="w-24 h-24 text-black" strokeWidth={4} />
                </motion.div>

                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-4xl md:text-5xl font-black text-black mb-6 text-center"
                >
                  NFT Minted Successfully!
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-lg text-gray-600 mb-8 text-center max-w-lg"
                >
                  Your digital collectible is now secured on the blockchain.
                </motion.p>

                {/* 交易详情 */}
                {transactionHash && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="mb-8 bg-white border-[3px] border-black rounded-2xl p-6 w-full max-w-lg"
                    style={{ boxShadow: '4px 4px 0px 0px rgba(0,0,0,0.8)' }}
                  >
                    <h3 className="font-bold text-lg mb-4 text-center">交易详情</h3>
                    <div className="space-y-3">
                      {mintedTokenId && (
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="text-gray-600">Token ID:</span>
                          <span className="font-mono font-bold text-lg">{mintedTokenId}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600">接收地址:</span>
                        <span className="font-mono text-sm">{account?.slice(0, 6)}...{account?.slice(-4)}</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-gray-600">交易哈希:</span>
                        <a
                          href={`${process.env.NEXT_PUBLIC_EXPLORER_URL || 'https://sepolia.etherscan.io'}/tx/${transactionHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-blue-600 hover:text-blue-800 hover:underline text-xs flex items-center gap-1"
                        >
                          {transactionHash.slice(0, 10)}...{transactionHash.slice(-8)}
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      </div>
                    </div>
                  </motion.div>
                )}

                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  onClick={() => router.push('/collections')}
                  className="px-12 py-4 bg-white border-[3px] border-black rounded-2xl font-bold text-lg hover:bg-gray-50 transition-colors"
                  style={{
                    boxShadow: '4px 4px 0px 0px rgba(0,0,0,0.8)',
                  }}
                >
                  View My Profile
                </motion.button>
              </div>
            )}
          </motion.div>
        </div>
      </main>
      <FooterSimple />
    </div>
  );
}

export default function NewMintPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NewMintPageContent />
    </Suspense>
  );
}
