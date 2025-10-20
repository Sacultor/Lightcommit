'use client';

import { useMemo } from 'react';
import { ethers } from 'ethers';
import { useWeb3 } from '@/lib/contexts/Web3Context';
import ContractABI from '@/../hardhat/contracts-abi.json';

export function useContract() {
  const { signer, provider } = useWeb3();
  
  const contract = useMemo(() => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
    
    if (!contractAddress) {
      console.warn('Contract address not configured');
      return null;
    }
    
    if (!signer && !provider) {
      console.warn('No signer or provider available');
      return null;
    }
    
    return new ethers.Contract(
      contractAddress,
      ContractABI.abi,
      signer || provider
    );
  }, [signer, provider]);

  return contract;
}

// 导出合约地址供其他地方使用
export function useContractAddress() {
  return process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '';
}

// 导出 ABI
export function useContractABI() {
  return ContractABI.abi;
}

