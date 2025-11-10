'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useRainbowKitAdapter } from '@/hooks/use-rainbowkit-adapter';
import { ethers } from 'ethers';

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
  const rainbowKit = useRainbowKitAdapter();

  const value = {
    provider: rainbowKit.provider,
    signer: rainbowKit.signer,
    account: rainbowKit.account,
    chainId: rainbowKit.chainId,
    isConnected: rainbowKit.isConnected,
    isCorrectNetwork: rainbowKit.isCorrectNetwork,
    connect: rainbowKit.connect,
    disconnect: rainbowKit.disconnect,
    switchNetwork: rainbowKit.switchNetwork,
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

