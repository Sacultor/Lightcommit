'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';

// 定义支持的网络
export const SUPPORTED_CHAINS = {
  SEPOLIA: {
    chainId: 11155111,
    name: 'Sepolia Testnet',
    rpcUrl: 'https://sepolia.infura.io/v3/YOUR_PROJECT_ID',
    explorerUrl: 'https://sepolia.etherscan.io',
  },
  LOCALHOST: {
    chainId: 31337,
    name: 'Hardhat Local',
    rpcUrl: 'http://127.0.0.1:8545',
    explorerUrl: '',
  },
};

interface Web3ContextType {
  provider: ethers.BrowserProvider | null;
  signer: ethers.JsonRpcSigner | null;
  account: string | null;
  chainId: number | null;
  isConnected: boolean;
  isCorrectNetwork: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  switchNetwork: (targetChainId: number) => Promise<void>;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

export function Web3Provider({ children }: { children: ReactNode }) {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);

  const targetChainId = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '11155111');

  // 切换网络
  const switchNetwork = useCallback(async (targetChainId: number) => {
    try {
      if (!window.ethereum) {
        throw new Error('未检测到钱包');
      }

      const chainIdHex = `0x${targetChainId.toString(16)}`;
      
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: chainIdHex }],
        });
        toast.success('Network switched successfully!');
      } catch (switchError: any) {
        // 如果网络不存在，尝试添加
        if (switchError.code === 4902) {
          const chainConfig = Object.values(SUPPORTED_CHAINS).find(
            (chain) => chain.chainId === targetChainId
          );

          if (chainConfig) {
            toast.loading('Adding network to MetaMask...', { id: 'adding-network' });
            
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: chainIdHex,
                  chainName: chainConfig.name,
                  rpcUrls: [chainConfig.rpcUrl],
                  blockExplorerUrls: chainConfig.explorerUrl ? [chainConfig.explorerUrl] : [],
                  nativeCurrency: {
                    name: 'Ethereum',
                    symbol: 'ETH',
                    decimals: 18,
                  },
                },
              ],
            });
            
            toast.dismiss('adding-network');
            toast.success(`${chainConfig.name} network added and switched successfully!`);
          } else {
            throw new Error('不支持的网络');
          }
        } else {
          throw switchError;
        }
      }
    } catch (error: any) {
      // 区分用户拒绝和真实错误
      if (error.code === 'ACTION_REJECTED' || error.code === 4001) {
        // 用户拒绝切换网络 - 正常操作
        console.log('👤 User rejected network switch');
        toast('Network switch cancelled', { 
          icon: '👋',
          duration: 2000,
        });
      } else {
        // 其他错误
        console.error('❌ Failed to switch network:', error);
        toast.error(error.message || 'Failed to switch network');
      }
      throw error;
    }
  }, []);

  // 连接钱包
  const connect = useCallback(async () => {
    try {
      if (typeof window.ethereum === 'undefined') {
        toast.error('Please install MetaMask wallet first');
        window.open('https://metamask.io/download/', '_blank');
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      
      // 请求账户访问
      await provider.send('eth_requestAccounts', []);
      
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const network = await provider.getNetwork();
      const currentChainId = Number(network.chainId);

      setProvider(provider);
      setSigner(signer);
      setAccount(address);
      setChainId(currentChainId);

      // 保存连接状态到 localStorage
      localStorage.setItem('walletConnected', 'true');
      
      // 检查网络并自动切换
      if (currentChainId !== targetChainId) {
        // toast.error(`当前网络不正确，正在尝试切换到 Hardhat Local...`);
        // 尝试自动切换网络
        try {
          await switchNetwork(targetChainId);
        } catch (switchError) {
          console.error('自动切换网络失败:', switchError);
          // toast.error(`请手动切换到 Hardhat Local 网络 (Chain ID: ${targetChainId})`);
        }
      } else {
        // toast.success(`钱包已连接: ${address.slice(0, 6)}...${address.slice(-4)}`);
      }
    } catch (error: any) {
      // 区分用户拒绝和真实错误
      if (error.code === 'ACTION_REJECTED' || error.code === 4001) {
        // 用户拒绝连接 - 这是正常操作，不显示错误
        console.log('👤 User rejected wallet connection');
        toast('Connection cancelled', { 
          icon: '👋',
          duration: 2000,
        });
      } else {
        // 其他错误才显示为错误
        console.error('❌ Failed to connect wallet:', error);
        toast.error(error.message || 'Failed to connect wallet');
      }
    }
  }, [targetChainId, switchNetwork]);

  // 断开连接
  const disconnect = useCallback(() => {
    setProvider(null);
    setSigner(null);
    setAccount(null);
    setChainId(null);
    localStorage.removeItem('walletConnected');
    toast.success('Wallet disconnected');
  }, []);

  // 监听账户变化
  const handleAccountsChanged = useCallback((accounts: string[]) => {
    if (accounts.length === 0) {
      disconnect();
    } else if (accounts[0] !== account) {
      setAccount(accounts[0]);
      toast('Account switched', { icon: '🔄' });
    }
  }, [account, disconnect]);

  // 监听网络变化
  const handleChainChanged = useCallback((chainIdHex: string) => {
    const newChainId = parseInt(chainIdHex, 16);
    setChainId(newChainId);

    if (newChainId !== targetChainId) {
      toast('Please switch to the correct network', { icon: '⚠️' });
    }
  }, [targetChainId]);

  // 自动重连
  useEffect(() => {
    const wasConnected = localStorage.getItem('walletConnected');
    if (wasConnected === 'true' && window.ethereum) {
      connect();
    }
  }, [connect]);

  // 设置事件监听
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        if (window.ethereum) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
          window.ethereum.removeListener('chainChanged', handleChainChanged);
        }
      };
    }
  }, [handleAccountsChanged, handleChainChanged]);

  const value = {
    provider,
    signer,
    account,
    chainId,
    isConnected: !!account,
    isCorrectNetwork: chainId === targetChainId,
    connect,
    disconnect,
    switchNetwork,
  };

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
}

export function useWeb3() {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
}

