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
    if (!account || !identityRegistryAddress) {
      setLoading(false);
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
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
    } finally {
      setLoading(false);
    }
  };

  const registerAgent = async (githubUsername?: string) => {
    if (!account || !signer || !identityRegistryAddress) {
      throw new Error('钱包未连接');
    }

    const username = githubUsername || user?.githubUsername || 'unknown';

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

    const contract = new ethers.Contract(
      identityRegistryAddress,
      AgentIdentityRegistryABI,
      signer,
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
