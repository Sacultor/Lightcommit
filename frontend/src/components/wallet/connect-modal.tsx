'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, Wallet } from 'lucide-react';
import { useWeb3 } from '@/lib/contexts/Web3Context';
import { useState } from 'react';
import toast from 'react-hot-toast';

interface ConnectWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ConnectWalletModal({ isOpen, onClose }: ConnectWalletModalProps) {
  const { connect, chainId, switchNetwork } = useWeb3();
  const [connecting, setConnecting] = useState(false);

  const targetChainId = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '11155111');

  const wallets = [
    {
      name: 'MetaMask',
      icon: '🦊',
      color: '#F6851B',
      available: typeof window !== 'undefined' && window.ethereum,
    },
    {
      name: 'Phantom',
      icon: '👻',
      color: '#AB9FF2',
      available: false, // 暂不支持
    },
    {
      name: 'Coinbase Wallet',
      icon: '🔵',
      color: '#0052FF',
      available: false, // 暂不支持
    },
  ];

  const handleWalletClick = async (walletName: string) => {
    if (walletName !== 'MetaMask') {
      toast.error('This wallet is not supported, please use MetaMask');
      return;
    }

    if (connecting) {
      console.log('Connection in progress...');
      return;
    }

    setConnecting(true);
    try {
      await connect().catch((error) => {
        if (error.code === -32002) {
          toast.error('请检查MetaMask弹窗并确认连接');
          return;
        }
        throw error;
      });

      // 连接后检查网络
      if (chainId && chainId !== targetChainId) {
        await switchNetwork(targetChainId);
      }

      onClose();
    } catch (error: any) {
      console.error('Connect error:', error);
      toast.error(error.message || 'Connection failed');
    } finally {
      setConnecting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 z-50"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            transition={{ type: 'spring', duration: 0.3 }}
            className="fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-lg z-50 px-4"
          >
            <div
              className="relative bg-[#F5F1E8] border-[5px] border-black rounded-[30px] p-8"
              style={{
                boxShadow: '8px 8px 0px 0px rgba(0,0,0,1)',
              }}
            >
              <button
                onClick={onClose}
                className="absolute top-6 right-6 w-10 h-10 rounded-full border-3 border-black bg-white hover:bg-gray-100 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-3xl md:text-4xl font-black text-black mb-3">
                Connect Wallet
              </h2>
              <p className="text-gray-600 mb-8">
                Get started by connecting your preferred wallet below
              </p>

              <div className="flex items-center gap-4 mb-8">
                <div className="flex-1 h-[2px] bg-gray-400" />
                <span className="text-sm text-gray-600">or select a wallet from the list below</span>
                <div className="flex-1 h-[2px] bg-gray-400" />
              </div>

              <div className="space-y-4 mb-6">
                {wallets.map((wallet) => (
                  <button
                    key={wallet.name}
                    onClick={() => handleWalletClick(wallet.name)}
                    disabled={!wallet.available || connecting}
                    className={`w-full px-6 py-4 bg-white border-[3px] border-black rounded-2xl font-bold text-lg flex items-center justify-between transition-colors group ${
                      wallet.available && !connecting
                        ? 'hover:bg-gray-50 cursor-pointer'
                        : 'opacity-50 cursor-not-allowed'
                    }`}
                    style={{
                      boxShadow: wallet.available ? '3px 3px 0px 0px rgba(0,0,0,0.8)' : 'none',
                    }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-3xl">{wallet.icon}</div>
                      <span className="text-black">
                        {wallet.name}
                        {!wallet.available && wallet.name === 'MetaMask' && ' (未安装)'}
                        {!wallet.available && wallet.name !== 'MetaMask' && ' (即将支持)'}
                      </span>
                    </div>
                    {wallet.available && !connecting && (
                      <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-black group-hover:translate-x-1 transition-all" />
                    )}
                    {connecting && wallet.name === 'MetaMask' && (
                      <div className="w-5 h-5 border-2 border-gray-400 border-t-black rounded-full animate-spin" />
                    )}
                  </button>
                ))}
              </div>

              <button
                onClick={onClose}
                className="w-full flex items-center justify-center gap-2 text-gray-600 hover:text-black transition-colors py-2"
              >
                <Wallet className="w-4 h-4" />
                <span className="text-sm font-medium">I don&apos;t have a wallet</span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

