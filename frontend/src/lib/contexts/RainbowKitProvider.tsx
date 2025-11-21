/**
 * RainbowKit Provider 配置
 * 
 * 功能：
 * - 配置 RainbowKit 钱包连接 UI
 * - 配置 Wagmi（以太坊交互库）
 * - 配置支持的区块链网络
 * - 配置钱包连接器（MetaMask）
 * 
 * 技术栈：
 * - RainbowKit：钱包连接 UI 组件
 * - Wagmi：React Hooks for Ethereum
 * - Viem：TypeScript 以太坊库
 * - TanStack Query：数据缓存和状态管理
 * 
 * Provider 层级：
 * WagmiProvider（最外层 - 提供 Web3 能力）
 *   └─ QueryClientProvider（数据缓存）
 *       └─ RainbowKitProvider（钱包 UI）
 *           └─ children（应用组件）
 * 
 * 使用场景：
 * - 在 app/providers.tsx 中引用
 * - 包裹整个应用，提供钱包连接能力
 * 
 * 环境变量：
 * - NEXT_PUBLIC_CHAIN_ID: 链 ID（默认 31337 Hardhat）
 * - NEXT_PUBLIC_RPC_URL: RPC 节点地址
 */
'use client';

import '@rainbow-me/rainbowkit/styles.css';
import { RainbowKitProvider as RKProvider } from '@rainbow-me/rainbowkit';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { defineChain } from 'viem';

/**
 * 自定义链配置：Hardhat Local
 * 
 * Hardhat 是以太坊本地开发网络
 * - Chain ID: 31337（Hardhat 默认）
 * - RPC URL: http://127.0.0.1:8545
 * - 用于本地开发和测试
 */
const hardhatLocal = defineChain({
  id: 31337,                    // 链 ID（Hardhat 默认）
  name: 'Hardhat Local',        // 显示名称
  nativeCurrency: {
    decimals: 18,               // ETH 精度
    name: 'Ethereum',           // 货币名称
    symbol: 'ETH',              // 货币符号
  },
  rpcUrls: {
    default: { http: ['http://127.0.0.1:8545'] },  // RPC 节点地址
  },
  testnet: true,                // 标记为测试网
});

/**
 * Wagmi 配置
 * 
 * 配置项：
 * - chains: 支持的区块链网络列表
 * - transports: 每个链的 RPC 传输配置
 * - connectors: 钱包连接器列表（仅 MetaMask）
 */
const config = createConfig({
  chains: [hardhatLocal],       // 支持的链（当前仅 Hardhat Local）
  transports: {
    [hardhatLocal.id]: http('http://127.0.0.1:8545'),  // Hardhat RPC
  },
  connectors: [
    injected({
      shimDisconnect: true,     // 支持断开连接
    }),
  ],
});

/**
 * TanStack Query Client 实例
 * 
 * 用于：
 * - 缓存 wagmi hooks 的查询结果
 * - 自动重试失败的请求
 * - 自动刷新过期数据
 */
const queryClient = new QueryClient();

/**
 * RainbowKit Provider 组件
 * 
 * 包裹应用，提供钱包连接能力
 * 
 * 使用方式：
 * ```typescript
 * <RainbowKitProvider>
 *   <App />
 * </RainbowKitProvider>
 * ```
 */
export function RainbowKitProvider({ children }: { children: ReactNode }) {
  return (
    // 1. WagmiProvider：提供 Web3 能力（wagmi hooks）
    <WagmiProvider config={config}>
      {/* 2. QueryClientProvider：提供数据缓存能力 */}
      <QueryClientProvider client={queryClient}>
        {/* 3. RKProvider：提供钱包连接 UI */}
        <RKProvider modalSize="compact">
          {children}
        </RKProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}


