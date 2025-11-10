# ERC-8004 ABI 快速使用指南

## 📦 导出的 ABI 文件

```
✅ AgentIdentityRegistry.json     - 8.1KB
✅ ReputationRegistry.json        - 16KB  
✅ ValidationRegistry.json        - 12KB
✅ CommitNFT.json                 - 20KB
```

位置：`frontend/src/lib/contracts/`

---

## 🚀 最简使用示例

### 完整流程（5步）

```typescript
import { ethers } from 'ethers';
import IdentityABI from '@/lib/contracts/AgentIdentityRegistry.json';
import ReputationABI from '@/lib/contracts/ReputationRegistry.json';
import ValidationABI from '@/lib/contracts/ValidationRegistry.json';

// 初始化
const signer = await provider.getSigner();

const identity = new ethers.Contract(IDENTITY_ADDR, IdentityABI, signer);
const reputation = new ethers.Contract(REPUTATION_ADDR, ReputationABI, signer);
const validation = new ethers.Contract(VALIDATION_ADDR, ValidationABI, signer);

// 1. 注册代理（一次性）
await identity.registerAgent("github-name", "ipfs://QmCard");

// 2. 获取后端签名
const { params, signature } = await fetch(`/api/contributions/${id}/sign`)
  .then(r => r.json());

// 3. 提交评分（使用结构体）
await reputation.submitFeedback(params, signature);

// 4. 请求铸造
const didMint = await validation.requestValidation(
  params.repo,
  params.commitSha,
  params.contributor,
  params.metadataURI
);

// 5. 查询结果
if (didMint) {
  const [, tokenId] = await validation.getValidationStatus(
    params.repo,
    params.commitSha
  );
  console.log('Token ID:', tokenId);
}
```

---

## ⚠️ 关键变更：ReputationRegistry 使用结构体

### 旧接口（已废弃）
```typescript
// ❌ 不再支持
submitFeedback(
  contributor,
  repo,
  commitSha,
  score,
  feedbackHash,
  metadataURI,
  timestamp,
  nonce,
  signature
)
```

### 新接口（当前版本）
```typescript
// ✅ 使用结构体
const params = {
  contributor: "0x...",
  repo: "owner/repo",
  commitSha: "abc123",
  score: 85,
  feedbackHash: "0x...",
  metadataURI: "ipfs://Qm...",
  timestamp: 1699999999,
  nonce: 0
};

submitFeedback(params, signature)
```

---

## 🔐 EIP-712 签名生成

```typescript
import { ethers } from 'ethers';

const domain = {
  name: 'LightCommit Reputation',
  version: '1',
  chainId: await signer.getChainId(),
  verifyingContract: REPUTATION_ADDR
};

const types = {
  Feedback: [
    { name: 'contributor', type: 'address' },
    { name: 'repo', type: 'string' },
    { name: 'commitSha', type: 'string' },
    { name: 'score', type: 'uint256' },
    { name: 'feedbackHash', type: 'bytes32' },
    { name: 'timestamp', type: 'uint256' },
    { name: 'nonce', type: 'uint256' }
  ]
};

const message = {
  contributor: params.contributor,
  repo: params.repo,
  commitSha: params.commitSha,
  score: params.score,
  feedbackHash: params.feedbackHash,
  timestamp: params.timestamp,
  nonce: params.nonce
};

const signature = await signer.signTypedData(domain, types, message);
```

---

## 📊 常用查询函数

```typescript
// 查询代理信息
const agent = await identity.getAgentByGithub("username");

// 查询声誉
const [total, count, avg] = await reputation.getContributorReputation(addr);

// 查询评分详情
const feedback = await reputation.getFeedbackByCommit("repo", "sha");

// 查询 NFT
const nftCount = await commitNFT.getUserTokenCount(addr);
const commitData = await commitNFT.getCommitData(tokenId);

// 查询铸造状态
const [minted, tokenId] = await validation.getValidationStatus("repo", "sha");
```

---

## 🎯 TypeScript 类型定义

已创建类型文件：`frontend/src/types/erc8004.ts`

```typescript
import type { 
  AgentProfile,
  Feedback,
  SubmitParams,
  ValidationStatus,
  CommitData 
} from '@/types/erc8004';
```

---

## 🛠️ 调试技巧

### 1. 监听所有事件
```typescript
reputation.on('FeedbackSubmitted', (...args) => console.log(args));
validation.on('MintTriggered', (...args) => console.log(args));
```

### 2. 解析交易回执
```typescript
const receipt = await tx.wait();
receipt.logs.forEach(log => {
  try {
    const parsed = reputation.interface.parseLog(log);
    console.log('Event:', parsed.name, parsed.args);
  } catch {}
});
```

### 3. 估算 Gas
```typescript
const gasEstimate = await validation.requestValidation.estimateGas(
  repo, sha, contributor, uri
);
console.log('Gas:', gasEstimate.toString());
```

---

## 📋 Checklist

使用前确认：
- [ ] 所有 ABI 文件已导出
- [ ] 环境变量中配置了合约地址
- [ ] Signer 已连接
- [ ] 网络 chainId 正确
- [ ] 评分服务已授予 EVALUATOR_ROLE

---

**ABI 导出时间**: 2025-11-10 00:14  
**编译器版本**: Solidity 0.8.28  
**优化级别**: runs=800

