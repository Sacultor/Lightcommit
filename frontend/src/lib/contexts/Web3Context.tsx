'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';

// 定义支持的网络
export const SUPPORTED_CHAINS = {
  SEPOLIA: {
    chainId: 11155111,
    name: 'Sepolia',
    rpcUrl: 'https://sepolia.infura.io/v3/YOUR_PROJECT_ID',
    explorerUrl: 'https://sepolia.etherscan.io',
  },
  LOCALHOST: {
    chainId: 31337,
    name: 'Localhost',
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

  // 连接钱包
  const connect = async () => {
    try {
      if (typeof window.ethereum === 'undefined') {
        toast.error('请先安装 MetaMask 钱包');
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
      
      // 检查网络
      if (currentChainId !== targetChainId) {
        toast.error(`请切换到正确的网络 (Chain ID: ${targetChainId})`);
      } else {
        toast.success(`钱包已连接: ${address.slice(0, 6)}...${address.slice(-4)}`);
      }
    } catch (error: any) {
      console.error('连接钱包失败:', error);
      toast.error(error.message || '连接钱包失败');
    }
  };

  // 断开连接
  const disconnect = () => {
    setProvider(null);
    setSigner(null);
    setAccount(null);
    setChainId(null);
    localStorage.removeItem('walletConnected');
    toast.success('钱包已断开');
  };

  // 切换网络
  const switchNetwork = async (targetChainId: number) => {
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
        toast.success('网络切换成功');
      } catch (switchError: any) {
        // 如果网络不存在，尝试添加
        if (switchError.code === 4902) {
          const chainConfig = Object.values(SUPPORTED_CHAINS).find(
            (chain) => chain.chainId === targetChainId
          );

          if (chainConfig && targetChainId === SUPPORTED_CHAINS.SEPOLIA.chainId) {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: chainIdHex,
                  chainName: chainConfig.name,
                  rpcUrls: [chainConfig.rpcUrl],
                  blockExplorerUrls: [chainConfig.explorerUrl],
                  nativeCurrency: {
                    name: 'Ethereum',
                    symbol: 'ETH',
                    decimals: 18,
                  },
                },
              ],
            });
          }
        } else {
          throw switchError;
        }
      }
    } catch (error: any) {
      console.error('切换网络失败:', error);
      toast.error(error.message || '切换网络失败');
    }
  };

  // 监听账户变化
  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      disconnect();
    } else if (accounts[0] !== account) {
      setAccount(accounts[0]);
      toast.info('账户已切换');
    }
  };

  // 监听网络变化
  const handleChainChanged = (chainIdHex: string) => {
    const newChainId = parseInt(chainIdHex, 16);
    setChainId(newChainId);
    
    if (newChainId !== targetChainId) {
      toast.warning('请切换到正确的网络');
    }
    
    // 刷新页面以重新初始化
    window.location.reload();
  };

  // 自动重连
  useEffect(() => {
    const wasConnected = localStorage.getItem('walletConnected');
    if (wasConnected === 'true' && window.ethereum) {
      connect();
    }
  }, []);

  // 设置事件监听
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [account, targetChainId]);

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

