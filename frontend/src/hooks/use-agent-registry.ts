/**
 * ERC-8004 代理注册状态 Hook（使用 Viem）
 * 
 * 功能：
 * - 检查用户是否已注册为 ERC-8004 代理
 * - 获取代理资料（GitHub 用户名、Agent Card URI 等）
 * - 提供代理注册方法
 * 
 * 使用场景：
 * - 检查用户是否完成首次注册
 * - 自动弹出注册弹窗（未注册时）
 * - 获取代理信息展示
 * 
 * 依赖：
 * - wagmi：useReadContract, useWriteContract
 * - AgentIdentityRegistry 合约
 * 
 * 返回值：
 * - isRegistered: 是否已注册
 * - loading: 是否正在加载
 * - agentProfile: 代理资料对象
 * - registerAgent(githubUsername?): 注册代理方法
 * - checkRegistration(): 重新检查注册状态
 */
'use client';

import { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useAuth } from './use-auth';
import { AgentIdentityRegistryABI } from '@/lib/contracts';

/**
 * 代理资料类型
 */
interface AgentProfile {
  wallet: string;
  githubUsername: string;
  agentCardURI: string;
  registeredAt: bigint;
  active: boolean;
}

export function useAgentRegistry() {
  // Wagmi hooks：获取钱包地址
  const { address } = useAccount();
  
  // GitHub 用户信息
  const { user } = useAuth();
  
  // Hook 状态
  const [isRegistered, setIsRegistered] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [agentProfile, setAgentProfile] = useState<AgentProfile | null>(null);

  // 从环境变量读取 AgentIdentityRegistry 合约地址
  const identityRegistryAddress = process.env.NEXT_PUBLIC_IDENTITY_REGISTRY_ADDRESS as `0x${string}`;

  /**
   * 使用 viem 读取链上注册状态
   * 
   * 调用 AgentIdentityRegistry.isRegistered(address)
   */
  const { data: isRegisteredData, refetch: refetchIsRegistered } = useReadContract({
    address: identityRegistryAddress,
    abi: AgentIdentityRegistryABI,
    functionName: 'isRegistered',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!identityRegistryAddress,  // 仅当地址存在时查询
    },
  });

  /**
   * 使用 viem 读取代理资料
   * 
   * 调用 AgentIdentityRegistry.getAgentByAddress(address)
   */
  const { data: profileData, refetch: refetchProfile } = useReadContract({
    address: identityRegistryAddress,
    abi: AgentIdentityRegistryABI,
    functionName: 'getAgentByAddress',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!identityRegistryAddress && isRegisteredData === true,  // 仅当已注册时查询
    },
  });

  /**
   * 当地址或注册状态变化时，更新状态
   */
  useEffect(() => {
    if (!address) {
      setIsRegistered(false);
      setAgentProfile(null);
      setLoading(false);
      return;
    }

    // 更新注册状态
    setIsRegistered(isRegisteredData === true);

    // 更新代理资料
    if (isRegisteredData && profileData) {
      setAgentProfile({
        wallet: (profileData as any).wallet,
        githubUsername: (profileData as any).githubUsername,
        agentCardURI: (profileData as any).agentCardURI,
        registeredAt: (profileData as any).registeredAt,
        active: (profileData as any).active,
      });
    } else {
      setAgentProfile(null);
    }

    setLoading(false);
  }, [address, isRegisteredData, profileData]);

  /**
   * 使用 viem 注册代理
   */
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isSuccess } = useWaitForTransactionReceipt({ hash });

  /**
   * 注册为 ERC-8004 代理
   * 
   * 合约调用：AgentIdentityRegistry.registerAgent(githubUsername, agentCardURI)
   * 
   * @param githubUsername - GitHub 用户名（可选，默认从 user 中获取）
   */
  const registerAgent = async (githubUsername?: string) => {
    // 1. 检查钱包是否连接
    if (!address) {
      throw new Error('钱包未连接，请先连接钱包');
    }

    // 2. 检查合约地址是否配置
    if (!identityRegistryAddress) {
      throw new Error('IDENTITY_REGISTRY_ADDRESS 环境变量未配置');
    }

    // 3. 准备 GitHub 用户名
    const username = githubUsername || 
      (user as any)?.login ||                           // JWT session
      (user as any)?.user_metadata?.user_name ||        // Supabase (兼容)
      (user as any)?.user_metadata?.preferred_username || 
      (user as any)?.user_metadata?.login || 
      'unknown';

    // 4. 生成 Agent Card
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

    // 5. 转换为 Base64 编码的 Data URI
    const agentCardJSON = JSON.stringify(agentCard, null, 2);
    const agentCardURI = `data:application/json;base64,${btoa(agentCardJSON)}`;

    // 6. 调用合约 registerAgent()（使用 viem）
    await writeContract({
      address: identityRegistryAddress,
      abi: AgentIdentityRegistryABI,
      functionName: 'registerAgent',
      args: [username, agentCardURI],
    });

    // 注意：交易确认由 useWaitForTransactionReceipt 自动处理
    // 成功后会触发 isSuccess，可以在 useEffect 中监听
  };

  /**
   * 重新检查注册状态
   */
  const checkRegistration = async () => {
    await refetchIsRegistered();
    if (isRegisteredData) {
      await refetchProfile();
    }
  };

  /**
   * 监听注册交易成功，自动刷新状态
   */
  useEffect(() => {
    if (isSuccess) {
      checkRegistration();
    }
  }, [isSuccess]);

  return {
    isRegistered,       // 是否已注册
    loading,            // 是否正在加载
    agentProfile,       // 代理资料对象
    registerAgent,      // 注册代理方法
    checkRegistration,  // 重新检查注册状态方法
    isPending,          // 交易是否正在提交
  };
}
