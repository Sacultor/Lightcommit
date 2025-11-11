'use client';

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWeb3 } from '@/lib/contexts/Web3Context';
import { useAuth } from './use-auth';
import { AgentIdentityRegistryABI } from '@/lib/contracts';

export function useAgentRegistry() {
  const { account, signer } = useWeb3();
  const { user } = useAuth();
  const [isRegistered, setIsRegistered] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [agentProfile, setAgentProfile] = useState<any>(null);

  const identityRegistryAddress = process.env.NEXT_PUBLIC_IDENTITY_REGISTRY_ADDRESS;

  useEffect(() => {
    checkRegistration();
  }, [account]);

  const checkRegistration = async () => {
    if (!account) {
      setLoading(false);
      setIsRegistered(false);
      return;
    }

    if (!identityRegistryAddress) {
      console.warn('IDENTITY_REGISTRY_ADDRESS 环境变量未配置');
      setLoading(false);
      setIsRegistered(false);
      return;
    }

    if (!window.ethereum) {
      console.warn('MetaMask 未安装或未检测到');
      setLoading(false);
      setIsRegistered(false);
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum as any);
      const contract = new ethers.Contract(
        identityRegistryAddress,
        AgentIdentityRegistryABI,
        provider,
      );

      const registered = await contract.isRegistered(account);
      setIsRegistered(registered);

      if (registered) {
        const profile = await contract.getAgentByAddress(account);
        setAgentProfile({
          wallet: profile.wallet,
          githubUsername: profile.githubUsername,
          agentCardURI: profile.agentCardURI,
          registeredAt: profile.registeredAt,
          active: profile.active,
        });
      }
    } catch (error) {
      console.error('检查代理注册失败:', error);
      setIsRegistered(false);
    } finally {
      setLoading(false);
    }
  };

  const registerAgent = async (githubUsername?: string) => {
    // 检查账户
    if (!account) {
      throw new Error('钱包未连接，请先连接钱包');
    }

    // 检查环境变量
    if (!identityRegistryAddress) {
      throw new Error('IDENTITY_REGISTRY_ADDRESS 环境变量未配置，请检查 .env.local 文件');
    }

    // 获取 signer（优先使用已有的，否则从 provider 获取）
    let agentSigner = signer;
    
    if (!agentSigner) {
      // 如果 signer 不存在，尝试从 provider 获取
      if (!window.ethereum) {
        throw new Error('MetaMask 未安装或未检测到');
      }
      
      try {
        const provider = new ethers.BrowserProvider(window.ethereum as any);
        agentSigner = await provider.getSigner();
        
        if (!agentSigner) {
          throw new Error('无法获取签名者，请确保钱包已连接并解锁');
        }
      } catch (error: any) {
        if (error.message) {
          throw error;
        }
        throw new Error('无法获取签名者，请确保钱包已连接并解锁');
      }
    }

    // 准备注册数据
    // 从 user_metadata 获取 GitHub 用户名，或使用传入的参数
    const username = githubUsername || 
      (user as any)?.user_metadata?.user_name || 
      (user as any)?.user_metadata?.preferred_username || 
      (user as any)?.user_metadata?.login || 
      'unknown';

    const agentCard = {
      name: username,
      version: '1.0.0',
      description: `LightCommit agent for ${username}`,
      capabilities: ['code-review', 'commit-scoring'],
      contact: {
        github: username,
      },
      createdAt: new Date().toISOString(),
    };

    const agentCardJSON = JSON.stringify(agentCard, null, 2);
    const agentCardURI = `data:application/json;base64,${btoa(agentCardJSON)}`;

    // 创建合约实例并执行注册
    const contract = new ethers.Contract(
      identityRegistryAddress,
      AgentIdentityRegistryABI,
      agentSigner,
    );

    const tx = await contract.registerAgent(username, agentCardURI);
    await tx.wait();

    await checkRegistration();

    return tx;
  };

  return {
    isRegistered,
    loading,
    agentProfile,
    registerAgent,
    checkRegistration,
  };
}
