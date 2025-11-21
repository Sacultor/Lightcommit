# ERC-8004 Trustless Agent 实现文档

## 概述

本项目基于 ERC-8004 标准实现了一个去中心化的 GitHub 贡献评估与链上凭证系统。

## 系统架构

### 核心合约

#### 1. AgentIdentityRegistry（身份注册表）
- **功能**：管理贡献者的链上身份与 GitHub 账户绑定
- **地址**：待部署后填写
- **主要方法**：
  - `registerAgent(githubUsername, agentCardURI)` - 注册新代理
  - `updateAgentCard(newURI)` - 更新代理信息卡
  - `getAgentByGithub(username)` - 通过 GitHub 用户名查询

#### 2. ReputationRegistry（声誉注册表）
- **功能**：存储评分反馈的链上哈希与证明
- **地址**：待部署后填写
- **主要方法**：
  - `submitFeedback(...)` - 提交评分反馈（需 EIP-712 签名）
  - `getContributorReputation(address)` - 查询贡献者声誉
  - **EIP-712 域**：
    - name: "LightCommit Reputation"
    - version: "1"
    - chainId: 动态获取
    - verifyingContract: ReputationRegistry 地址

#### 3. ValidationRegistry（验证与铸造注册表）
- **功能**：验证评分阈值并触发 NFT 铸造
- **地址**：待部署后填写
- **主要方法**：
  - `requestValidation(repo, commitSha, contributor, metadataURI)` - 请求验证
  - `setMintThreshold(newThreshold)` - 设置铸造阈值（默认 80）

#### 4. CommitNFT（ERC-721 凭证）
- **功能**：存储最终的贡献凭证 NFT
- **地址**：待部署后填写
- **owner**：ValidationRegistry（自动铸造）

## 数据流

```
1. GitHub Webhook → 后端入库
2. 评分服务计算分数 → 生成元数据 → IPFS
3. 生成 EIP-712 签名
4. 调用 ReputationRegistry.submitFeedback()
   └─ 事件：FeedbackSubmitted
5. 调用 ValidationRegistry.requestValidation()
   └─ 验证 score >= threshold
   └─ 自动调用 CommitNFT.mintCommit()
   └─ 事件：MintTriggered
6. 前端监听事件，展示 NFT
```

## EIP-712 签名结构

```typescript
{
  domain: {
    name: 'LightCommit Reputation',
    version: '1',
    chainId: 11155111,  // Sepolia 测试网
    verifyingContract: '0x...'  // ReputationRegistry 地址
  },
  types: {
    Feedback: [
      { name: 'contributor', type: 'address' },
      { name: 'repo', type: 'string' },
      { name: 'commitSha', type: 'string' },
      { name: 'score', type: 'uint256' },
      { name: 'feedbackHash', type: 'bytes32' },
      { name: 'timestamp', type: 'uint256' },
      { name: 'nonce', type: 'uint256' }
    ]
  },
  message: {
    contributor: '0x...',
    repo: 'Sacultor/Lightcommit',
    commitSha: 'abc123...',
    score: 85,
    feedbackHash: '0x...',
    timestamp: 1730000000,
    nonce: 0
  }
}
```

## 元数据格式（IPFS）

```json
{
  "score": 85,
  "breakdown": {
    "convention": 90,
    "size": 85,
    "filesImpact": 80,
    "mergeSignal": 90,
    "metadataCompleteness": 85
  },
  "evidence": {
    "diffUrl": "https://github.com/...",
    "testResults": "passed",
    "linterReport": "conforming"
  },
  "commit": "abc123...",
  "repo": "Sacultor/Lightcommit",
  "timestamp": 1730000000,
  "evaluator": "0x..."
}
```

## 部署步骤

### 1. 编译合约
```bash
cd hardhat
npx hardhat compile
```

### 2. 部署到本地网络
```bash
npx hardhat node
npx hardhat run scripts/deploy-erc8004.ts --network localhost
```

### 3. 部署到 Sepolia 测试网
```bash
npx hardhat run scripts/deploy-erc8004.ts --network sepolia
```

### 4. 更新配置文件
将部署后的合约地址更新到：
- `hardhat/contracts-config.json`
- `frontend/.env`

## 前端集成示例

### 1. 提交评分反馈
```typescript
import { ethers } from 'ethers';

async function submitFeedback(contributionId: string) {
  const response = await fetch(`/api/contributions/${contributionId}/sign`);
  const { feedback, signature, metadataURI } = await response.json();
  
  const reputationRegistry = new ethers.Contract(
    REPUTATION_REGISTRY_ADDRESS,
    ReputationRegistryABI,
    signer
  );
  
  const tx = await reputationRegistry.submitFeedback(
    feedback.contributor,
    feedback.repo,
    feedback.commitSha,
    feedback.score,
    feedback.feedbackHash,
    metadataURI,
    signature
  );
  
  await tx.wait();
}
```

### 2. 请求验证与铸造
```typescript
async function requestValidation(repo: string, commitSha: string, contributor: string, metadataURI: string) {
  const validationRegistry = new ethers.Contract(
    VALIDATION_REGISTRY_ADDRESS,
    ValidationRegistryABI,
    signer
  );
  
  const tx = await validationRegistry.requestValidation(
    repo,
    commitSha,
    contributor,
    metadataURI
  );
  
  const receipt = await tx.wait();
  
  const mintEvent = receipt.logs.find(log => 
    log.topics[0] === ethers.id('MintTriggered(bytes32,uint256,address,uint256,string,uint256)')
  );
  
  if (mintEvent) {
    console.log('NFT 铸造成功！Token ID:', mintEvent.args[1]);
  }
}
```

## 角色权限

### ReputationRegistry
- `DEFAULT_ADMIN_ROLE`: 管理员（部署者）
- `EVALUATOR_ROLE`: 评分服务账户（需授权）

### ValidationRegistry
- `DEFAULT_ADMIN_ROLE`: 管理员（部署者）
- `VALIDATOR_ROLE`: 验证者账户

### CommitNFT
- `owner`: ValidationRegistry（自动铸造权限）

## 安全考虑

1. **防重放攻击**：使用 nonce 和 timestamp
2. **签名验证**：EIP-712 域绑定确保签名不可跨合约复用
3. **去重机制**：commitHash 映射防止重复处理
4. **权限控制**：关键操作需要特定角色
5. **暂停机制**：紧急情况可暂停合约

## 事件监听

前端应监听以下事件：
- `FeedbackSubmitted` - 评分已提交
- `ValidationCompleted` - 验证完成
- `MintTriggered` - NFT 已铸造
- `ReputationUpdated` - 声誉已更新

## Gas 优化建议

1. 批量处理：可实现批量 submitFeedback
2. Layer2 部署：建议部署到 Optimism/Arbitrum
3. 元数据链下存储：仅存储 IPFS 哈希

## 下一步计划

- [ ] 集成 Chainlink Functions 实现自动化评分上链
- [ ] 添加 EAS（Ethereum Attestation Service）支持
- [ ] 实现贡献者声誉等级系统
- [ ] 支持多链部署
- [ ] 添加 DAO 治理模块

## 参考资料

- ERC-8004 官方：https://8004.org
- EIP-712：https://eips.ethereum.org/EIPS/eip-712
- OpenZeppelin：https://docs.openzeppelin.com/contracts/

