/*
erc8004 contract abi
AgentIdentityRegistryABI: 代理身份注册与管理
ReputationRegistryABI: 评分系统
ValidationRegistryABI: 验证系统
CommitNFTABI: NFT 铸造系统
*/
import AgentIdentityRegistryABI from './AgentIdentityRegistry.json';
import ReputationRegistryABI from './ReputationRegistry.json';
import ValidationRegistryABI from './ValidationRegistry.json';
import CommitNFTABI from './CommitNFT.json';

export {
  AgentIdentityRegistryABI,
  ReputationRegistryABI,
  ValidationRegistryABI,
  CommitNFTABI,
};

export const ABIS = {
  AgentIdentityRegistry: AgentIdentityRegistryABI,
  ReputationRegistry: ReputationRegistryABI,
  ValidationRegistry: ValidationRegistryABI,
  CommitNFT: CommitNFTABI,
} as const;

