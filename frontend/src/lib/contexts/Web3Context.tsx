/**
 * Web3 Context（简化版，直接使用 Wagmi）
 * 
 * 功能：
 * - 提供统一的 Web3 接口
 * - 封装 wagmi hooks，简化组件使用
 * - 不再需要 ethers.js 适配层
 * 
 * 使用方式：
 * ```typescript
 * const { address, isConnected, chainId } = useWeb3();
 * ```
 * 
 * 注意：
 * - 此 Context 现在只是 wagmi hooks 的简单封装
 * - 合约交互请直接使用 wagmi 的 useReadContract/useWriteContract
 * - 不再提供 provider/signer（使用 viem 替代）
 */
'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain } from 'wagmi';

/**
 * Web3 Context 类型定义
 */
interface Web3ContextType {
  address: string | undefined;           // 钱包地址（viem 格式）
  isConnected: boolean;                  // 是否已连接钱包
  chainId: number | undefined;           // 当前链 ID
  isCorrectNetwork: boolean;             // 是否在正确的网络
  connect: () => void;                   // 连接钱包
  disconnect: () => void;                // 断开钱包
  switchNetwork: (chainId: number) => void;  // 切换网络
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

/**
 * Web3 Provider 组件
 * 
 * 封装 wagmi hooks，提供统一的 Web3 接口
 */
export function Web3Provider({ children }: { children: ReactNode }) {
  // Wagmi hooks
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  /**
   * 连接 MetaMask 钱包
   */
  const connectWallet = () => {
    const injected = connectors.find(c => c.type === 'injected');
    if (injected) {
      connect({ connector: injected });
    }
  };

  /**
   * 切换网络
   */
  const switchNetwork = (targetChainId: number) => {
    switchChain({ chainId: targetChainId });
  };

  // 检查是否在正确的网络
  const targetChainId = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '31337');
  const isCorrectNetwork = chainId === targetChainId;

  const value: Web3ContextType = {
    address,
    isConnected,
    chainId,
    isCorrectNetwork,
    connect: connectWallet,
    disconnect,
    switchNetwork,
  };

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
}

/**
 * useWeb3 Hook
 * 
 * 使用方式：
 * ```typescript
 * const { address, isConnected, chainId } = useWeb3();
 * ```
 * 
 * 合约交互请使用 wagmi hooks：
 * ```typescript
 * import { useReadContract, useWriteContract } from 'wagmi';
 * 
 * // 读取数据
 * const { data } = useReadContract({
 *   address: '0x...',
 *   abi: MyABI,
 *   functionName: 'balanceOf',
 *   args: [address],
 * });
 * 
 * // 调用方法
 * const { writeContract } = useWriteContract();
 * await writeContract({
 *   address: '0x...',
 *   abi: MyABI,
 *   functionName: 'transfer',
 *   args: [to, amount],
 * });
 * ```
 */
export function useWeb3() {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
}
