# ERC-8004 合约 ABI 参考文档

## 📁 ABI 文件位置

所有 ABI 文件已导出到：`frontend/src/lib/contracts/`

```
frontend/src/lib/contracts/
├── AgentIdentityRegistry.json    (8.1KB)
├── ReputationRegistry.json       (16KB)
├── ValidationRegistry.json       (12KB)
└── CommitNFT.json                (20KB)
```

---

## 1️⃣ AgentIdentityRegistry

### 核心函数

#### `registerAgent(string githubUsername, string agentCardURI)`
```typescript
// 注册新代理
await identityRegistry.registerAgent(
  "your-github-username",
  "ipfs://QmYourAgentCard"
);
```

#### `updateAgentCard(string newAgentCardURI)`
```typescript
// 更新代理信息
await identityRegistry.updateAgentCard("ipfs://QmNewCard");
```

#### `getAgentByAddress(address wallet) → AgentProfile`
```typescript
// 通过地址查询
const agent = await identityRegistry.getAgentByAddress(walletAddress);
```

#### `getAgentByGithub(string githubUsername) → AgentProfile`
```typescript
// 通过 GitHub 用户名查询
const agent = await identityRegistry.getAgentByGithub("username");
```

### 事件

```typescript
event AgentRegistered(
  address indexed wallet,
  string githubUsername,
  string agentCardURI,
  uint256 timestamp
);

event AgentUpdated(
  address indexed wallet,
  string newAgentCardURI,
  uint256 timestamp
);
```

---

## 2️⃣ ReputationRegistry

### 核心函数

#### `submitFeedback(SubmitParams params, bytes signature)`

**⚠️ 重要：参数结构已优化为结构体**

```typescript
// TypeScript 调用示例
const params = {
  contributor: "0x...",
  repo: "Sacultor/Lightcommit",
  commitSha: "abc123...",
  score: 85,
  feedbackHash: "0x...",
  metadataURI: "ipfs://Qm...",
  timestamp: Math.floor(Date.now() / 1000),
  nonce: 0
};

await reputationRegistry.submitFeedback(params, signature);
```

**Solidity 结构体定义**：
```solidity
struct SubmitParams {
    address contributor;
    string repo;
    string commitSha;
    uint16 score;
    bytes32 feedbackHash;
    string metadataURI;
    uint256 timestamp;
    uint256 nonce;
}
```

#### `getFeedbackByCommit(string repo, string commitSha) → Feedback`
```typescript
// 查询评分反馈
const feedback = await reputationRegistry.getFeedbackByCommit(
  "Sacultor/Lightcommit",
  "abc123"
);
```

#### `getContributorReputation(address) → (totalScore, count, average)`
```typescript
// 查询贡献者声誉
const [totalScore, feedbackCount, averageScore] = 
  await reputationRegistry.getContributorReputation(address);
```

#### `isCommitProcessed(string repo, string commitSha) → bool`
```typescript
// 检查是否已处理
const processed = await reputationRegistry.isCommitProcessed(
  "Sacultor/Lightcommit",
  "abc123"
);
```

### EIP-712 签名

**Domain**:
```typescript
{
  name: 'LightCommit Reputation',
  version: '1',
  chainId: 31337,
  verifyingContract: reputationRegistryAddress
}
```

**Types**:
```typescript
{
  Feedback: [
    { name: 'contributor', type: 'address' },
    { name: 'repo', type: 'string' },
    { name: 'commitSha', type: 'string' },
    { name: 'score', type: 'uint256' },
    { name: 'feedbackHash', type: 'bytes32' },
    { name: 'timestamp', type: 'uint256' },
    { name: 'nonce', type: 'uint256' }
  ]
}
```

### 事件

```typescript
event FeedbackSubmitted(
  bytes32 indexed commitHash,
  address indexed contributor,
  string repo,
  string commitSha,
  uint256 score,
  bytes32 feedbackHash,
  string metadataURI,
  address evaluator,
  uint256 timestamp
);

event ReputationUpdated(
  address indexed contributor,
  uint256 newTotalScore,
  uint256 feedbackCount,
  uint256 averageScore
);
```

---

## 3️⃣ ValidationRegistry

### 核心函数

#### `requestValidation(string repo, string commitSha, address contributor, string metadataURI) → bool didMint`
```typescript
// 请求验证（自动铸造）
const didMint = await validationRegistry.requestValidation(
  "Sacultor/Lightcommit",
  "abc123",
  contributorAddress,
  "ipfs://QmMetadata"
);

console.log('是否铸造:', didMint);
```

#### `getValidationStatus(string repo, string commitSha) → (hasBeenMinted, tokenId)`
```typescript
// 查询验证状态
const [hasBeenMinted, tokenId] = await validationRegistry.getValidationStatus(
  "Sacultor/Lightcommit",
  "abc123"
);
```

#### `setMintThreshold(uint256 newThreshold)`
```typescript
// 管理员调整阈值
await validationRegistry.setMintThreshold(85);
```

### 只读变量

```typescript
await validationRegistry.mintThreshold();  // 当前阈值
await validationRegistry.totalValidations();  // 总验证数
await validationRegistry.totalMints();  // 总铸造数
await validationRegistry.isMinted(commitHash);  // 是否已铸造
```

### 事件

```typescript
event ValidationRequested(
  bytes32 indexed commitHash,
  address indexed contributor,
  string repo,
  string commitSha,
  uint256 score,
  uint256 timestamp
);

event ValidationCompleted(
  bytes32 indexed commitHash,
  bool approved,
  uint256 score,
  uint256 threshold,
  uint256 timestamp
);

event MintTriggered(
  bytes32 indexed commitHash,
  uint256 indexed tokenId,
  address indexed contributor,
  uint256 score,
  string metadataURI,
  uint256 timestamp
);
```

---

## 4️⃣ CommitNFT

### 核心函数

#### `mintCommit(address to, CommitData commitData, string metadataURI)`
```typescript
// 铸造单个 NFT（仅 owner）
const commitData = {
  repo: "Sacultor/Lightcommit",
  commit: "abc123",
  linesAdded: 100,
  linesDeleted: 50,
  testsPass: true,
  timestamp: Math.floor(Date.now() / 1000),
  author: "0x...",
  message: "feat: add feature",
  merged: true
};

await commitNFT.mintCommit(toAddress, commitData, "ipfs://QmMetadata");
```

#### `getCommitData(uint256 tokenId) → CommitData`
```typescript
// 查询 Commit 数据
const commitData = await commitNFT.getCommitData(tokenId);
```

#### `isCommitMinted(string commitHash) → bool`
```typescript
// 检查是否已铸造
const minted = await commitNFT.isCommitMinted("abc123");
```

#### `getUserTokenCount(address user) → uint256`
```typescript
// 查询用户 NFT 数量
const count = await commitNFT.getUserTokenCount(address);
```

#### `totalSupply() → uint256`
```typescript
// 查询总供应量
const supply = await commitNFT.totalSupply();
```

### 事件

```typescript
event CommitMinted(
  uint256 indexed tokenId,
  address indexed to,
  string repo,
  string commit,
  uint256 linesAdded,
  bool testsPass,
  bool merged
);
```

---

## 🔧 前端集成示例

### 1. 初始化合约实例

```typescript
import { ethers } from 'ethers';
import AgentIdentityRegistryABI from '@/lib/contracts/AgentIdentityRegistry.json';
import ReputationRegistryABI from '@/lib/contracts/ReputationRegistry.json';
import ValidationRegistryABI from '@/lib/contracts/ValidationRegistry.json';
import CommitNFTABI from '@/lib/contracts/CommitNFT.json';

const provider = new ethers.JsonRpcProvider(rpcUrl);
const signer = await provider.getSigner();

const identityRegistry = new ethers.Contract(
  IDENTITY_REGISTRY_ADDRESS,
  AgentIdentityRegistryABI,
  signer
);

const reputationRegistry = new ethers.Contract(
  REPUTATION_REGISTRY_ADDRESS,
  ReputationRegistryABI,
  signer
);

const validationRegistry = new ethers.Contract(
  VALIDATION_REGISTRY_ADDRESS,
  ValidationRegistryABI,
  signer
);

const commitNFT = new ethers.Contract(
  COMMIT_NFT_ADDRESS,
  CommitNFTABI,
  provider
);
```

### 2. 完整业务流程

```typescript
// Step 1: 注册代理（一次性）
await identityRegistry.registerAgent(
  "github-username",
  "ipfs://QmAgentCard"
);

// Step 2: 获取评分签名（后端 API）
const response = await fetch(`/api/contributions/${id}/sign`);
const { params, signature } = await response.json();

// Step 3: 提交评分反馈
const tx1 = await reputationRegistry.submitFeedback(params, signature);
await tx1.wait();

// Step 4: 请求验证与铸造
const tx2 = await validationRegistry.requestValidation(
  params.repo,
  params.commitSha,
  params.contributor,
  params.metadataURI
);
const receipt = await tx2.wait();

// Step 5: 监听事件获取结果
const mintEvent = receipt.logs.find(log => 
  log.topics[0] === ethers.id('MintTriggered(bytes32,uint256,address,uint256,string,uint256)')
);

if (mintEvent) {
  console.log('NFT 铸造成功！Token ID:', mintEvent.args[1]);
}
```

### 3. 查询用户数据

```typescript
// 查询声誉
const [totalScore, count, average] = 
  await reputationRegistry.getContributorReputation(userAddress);

// 查询 NFT 数量
const nftCount = await commitNFT.getUserTokenCount(userAddress);

// 查询代理信息
const agent = await identityRegistry.getAgentByAddress(userAddress);
```

---

## 📦 导入 ABI 的方式

```typescript
// 方式 1：直接导入 JSON
import AgentIdentityRegistryABI from '@/lib/contracts/AgentIdentityRegistry.json';

// 方式 2：动态导入
const abi = await import('@/lib/contracts/ReputationRegistry.json');

// 方式 3：类型安全导入
import type { Abi } from 'viem';
import ValidationRegistryABI from '@/lib/contracts/ValidationRegistry.json';
const abi = ValidationRegistryABI as Abi;
```

---

## 🎯 关键接口变更

### ⚠️ ReputationRegistry.submitFeedback 参数变更

**旧版本（9个参数）**：
```solidity
function submitFeedback(
  address contributor,
  string calldata repo,
  string calldata commitSha,
  uint256 score,
  bytes32 feedbackHash,
  string calldata metadataURI,
  uint256 signatureTimestamp,
  uint256 signatureNonce,
  bytes calldata signature
)
```

**新版本（2个参数，使用结构体）**：
```solidity
function submitFeedback(
  SubmitParams calldata params,
  bytes calldata signature
)
```

### ✨ 优势
- ✅ 解决栈深度问题
- ✅ 前端调用更清晰
- ✅ Gas 优化
- ✅ 易于扩展

---

## 📝 使用注意事项

1. **ReputationRegistry** 使用 `SubmitParams` 结构体，前端需要适配
2. **ValidationRegistry** 的 `isMinted` 只在实际铸造时设为 true
3. **签名有效期**：300 秒（5分钟）
4. **评分范围**：0-100（使用 uint16 优化存储）
5. **阈值范围**：60-100（默认 80）

---

## 🔗 相关文档

- [实现文档](./ERC8004_IMPLEMENTATION.md)
- [部署指南](./DEPLOYMENT_GUIDE.md)
- [使用示例](./ERC8004_USAGE_EXAMPLES.md)

---

**最后更新**: 2025-11-10  
**ABI 版本**: v2.0.0（优化版）

