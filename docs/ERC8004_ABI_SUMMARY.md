# ERC-8004 ABI 接口总结

## ✅ 已完成

### 1. ABI 文件已导出（4个）

```bash
frontend/src/lib/contracts/
├── AgentIdentityRegistry.json     ✅ 8.1KB
├── ReputationRegistry.json        ✅ 16KB
├── ValidationRegistry.json        ✅ 12KB
└── CommitNFT.json                 ✅ 20KB
```

### 2. TypeScript 类型定义已创建

```typescript
// frontend/src/types/erc8004.ts
export interface SubmitParams { ... }
export interface Feedback { ... }
export interface AgentProfile { ... }
export interface ValidationStatus { ... }
```

### 3. 统一导出文件已创建

```typescript
// frontend/src/lib/contracts/index.ts
import { ABIS } from '@/lib/contracts';

const abi = ABIS.ReputationRegistry;
```

---

## 🎯 关键接口

### ReputationRegistry（最重要变更）

#### ⚠️ 参数使用结构体

```typescript
// 准备参数
const params = {
  contributor: userAddress,
  repo: "Sacultor/Lightcommit",
  commitSha: "abc123",
  score: 85,
  feedbackHash: ethers.keccak256(...),
  metadataURI: "ipfs://QmXXX",
  timestamp: Math.floor(Date.now() / 1000),
  nonce: 0
};

// 调用
await reputationRegistry.submitFeedback(params, signature);
```

#### 📝 EIP-712 签名必需字段

```typescript
{
  contributor: address,
  repo: string,
  commitSha: string,
  score: uint256,       // 虽然存储用 uint16，签名仍用 uint256
  feedbackHash: bytes32,
  timestamp: uint256,
  nonce: uint256
}
```

---

## 📋 核心函数速查表

### AgentIdentityRegistry

| 函数 | 参数 | 返回值 | 权限 |
|------|------|--------|------|
| `registerAgent` | githubUsername, agentCardURI | - | 任何人 |
| `updateAgentCard` | newURI | - | 注册者 |
| `getAgentByAddress` | wallet | AgentProfile | view |
| `getAgentByGithub` | username | AgentProfile | view |
| `isAgentActive` | wallet | bool | view |

### ReputationRegistry

| 函数 | 参数 | 返回值 | 权限 |
|------|------|--------|------|
| `submitFeedback` | SubmitParams, signature | - | 任何人 |
| `getFeedbackByCommit` | repo, commitSha | Feedback | view |
| `getContributorReputation` | contributor | (total, count, avg) | view |
| `isCommitProcessed` | repo, commitSha | bool | view |

### ValidationRegistry

| 函数 | 参数 | 返回值 | 权限 |
|------|------|--------|------|
| `requestValidation` | repo, sha, contributor, uri | bool didMint | 任何人 |
| `getValidationStatus` | repo, commitSha | (minted, tokenId) | view |
| `setMintThreshold` | newThreshold | - | ADMIN |

### CommitNFT

| 函数 | 参数 | 返回值 | 权限 |
|------|------|--------|------|
| `mintCommit` | to, commitData, uri | - | owner |
| `getCommitData` | tokenId | CommitData | view |
| `isCommitMinted` | commitHash | bool | view |
| `getUserTokenCount` | user | uint256 | view |
| `totalSupply` | - | uint256 | view |

---

## 🔥 最常用的 3 个调用

### 1. 提交评分上链

```typescript
const { params, signature } = await fetch(`/api/contributions/${id}/sign`)
  .then(r => r.json());

const tx = await reputationRegistry.submitFeedback(params, signature);
await tx.wait();
```

### 2. 请求铸造

```typescript
const didMint = await validationRegistry.requestValidation(
  "Sacultor/Lightcommit",
  "abc123",
  userAddress,
  "ipfs://QmMetadata"
);
```

### 3. 查询声誉

```typescript
const [totalScore, count, average] = 
  await reputationRegistry.getContributorReputation(userAddress);
```

---

## 📦 推荐封装（Hook）

```typescript
// hooks/useERC8004Contracts.ts
import { useMemo } from 'react';
import { ethers } from 'ethers';
import { useEthersSigner } from './useEthersSigner';
import { ABIS } from '@/lib/contracts';

export function useERC8004Contracts() {
  const signer = useEthersSigner();
  
  const contracts = useMemo(() => {
    if (!signer) return null;
    
    return {
      identity: new ethers.Contract(
        process.env.NEXT_PUBLIC_IDENTITY_REGISTRY_ADDRESS!,
        ABIS.AgentIdentityRegistry,
        signer
      ),
      reputation: new ethers.Contract(
        process.env.NEXT_PUBLIC_REPUTATION_REGISTRY_ADDRESS!,
        ABIS.ReputationRegistry,
        signer
      ),
      validation: new ethers.Contract(
        process.env.NEXT_PUBLIC_VALIDATION_REGISTRY_ADDRESS!,
        ABIS.ValidationRegistry,
        signer
      ),
      nft: new ethers.Contract(
        process.env.NEXT_PUBLIC_COMMIT_NFT_ADDRESS!,
        ABIS.CommitNFT,
        signer
      )
    };
  }, [signer]);
  
  return contracts;
}
```

使用：
```typescript
const contracts = useERC8004Contracts();

if (contracts) {
  await contracts.reputation.submitFeedback(params, sig);
}
```

---

## 🎉 完成清单

- [x] ✅ 编译所有合约
- [x] ✅ 导出 4 个 ABI 文件
- [x] ✅ 创建 TypeScript 类型定义
- [x] ✅ 创建统一导出文件
- [x] ✅ 编写 ABI 使用文档
- [x] ✅ 提供完整代码示例

---

**下一步**：
1. 部署合约到本地/测试网
2. 配置环境变量
3. 创建前端 UI 组件
4. 集成到应用

详见：
- [部署指南](./DEPLOYMENT_GUIDE.md)
- [ABI 参考](./ABI_REFERENCE.md)
- [使用示例](./ERC8004_USAGE_EXAMPLES.md)

