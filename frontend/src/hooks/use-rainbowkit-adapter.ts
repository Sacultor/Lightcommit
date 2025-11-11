'use client';

import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain } from 'wagmi';
import { useWalletClient, usePublicClient } from 'wagmi';
import { useMemo } from 'react';
import { walletClientToSigner, publicClientToProvider } from '@/lib/utils/rainbowkit-adapter';

export function useRainbowKitAdapter() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  const provider = useMemo(() => {
    if (!publicClient) return null;
    return publicClientToProvider(publicClient);
  }, [publicClient]);

  const signer = useMemo(() => {
    if (!walletClient) return null;
    return walletClientToSigner(walletClient);
  }, [walletClient]);

  const connectWallet = async () => {
    const metamask = connectors.find(c => c.name === 'MetaMask');
    if (metamask) {
      connect({ connector: metamask });
    }
  };

  const switchNetwork = async (targetChainId: number) => {
    switchChain({ chainId: targetChainId });
  };

  // 使用 address 作为更可靠的钱包连接判断，因为 isConnected 可能延迟更新
  // 如果 address 存在，说明钱包已经连接
  const walletConnected = isConnected || !!address;

  return {
    provider,
    signer,
    account: address || null,
    chainId,
    isConnected: walletConnected, // 返回更可靠的连接状态
    isCorrectNetwork: chainId === parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '31337'),
    connect: connectWallet,
    disconnect,
    switchNetwork,
  };
}

