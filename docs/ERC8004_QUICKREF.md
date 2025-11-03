# ERC-8004 快速参考卡片

## 🚀 5分钟快速开始

```bash
# 1. 安装依赖
pnpm install

# 2. 启动本地链
cd hardhat && npx hardhat node &

# 3. 部署合约
npx hardhat run scripts/deploy-erc8004.ts --network localhost

# 4. 配置环境变量（复制显示的合约地址）
cd ../frontend
cp .env.erc8004.example .env.local
# 编辑 .env.local

# 5. 启动前端
pnpm dev
```

---

## 📝 核心合约地址

部署后填写：

```env
NEXT_PUBLIC_IDENTITY_REGISTRY_ADDRESS=0x...
NEXT_PUBLIC_REPUTATION_REGISTRY_ADDRESS=0x...
NEXT_PUBLIC_VALIDATION_REGISTRY_ADDRESS=0x...
NEXT_PUBLIC_COMMIT_NFT_ADDRESS=0x...
```

---

## 🔑 关键函数速查

### AgentIdentityRegistry

```solidity
// 注册代理
registerAgent(string githubUsername, string agentCardURI)

// 更新信息
updateAgentCard(string newURI)

// 查询
getAgentByGithub(string username) → AgentProfile
```

### ReputationRegistry

```solidity
// 提交评分（需签名）
submitFeedback(
  address contributor,
  string repo,
  string commitSha,
  uint256 score,
  bytes32 feedbackHash,
  string metadataURI,
  bytes signature
)

// 查询声誉
getContributorReputation(address) → (totalScore, count, average)
```

### ValidationRegistry

```solidity
// 请求验证（自动铸造）
requestValidation(
  string repo,
  string commitSha,
  address contributor,
  string metadataURI
) → bool shouldMint

// 设置阈值
setMintThreshold(uint256 newThreshold)
```

---

## 🎨 前端集成速查

### 1. 注册代理

```typescript
const tx = await identityRegistry.registerAgent(
  "github-username",
  "ipfs://QmCard"
);
await tx.wait();
```

### 2. 获取签名

```typescript
const { feedback, signature, metadataURI } = 
  await fetch(`/api/contributions/${id}/sign`)
    .then(r => r.json());
```

### 3. 提交评分

```typescript
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
```

### 4. 请求铸造

```typescript
const tx = await validationRegistry.requestValidation(
  repo, commitSha, contributor, metadataURI
);
await tx.wait();
```

---

## 🔐 EIP-712 签名结构

```typescript
{
  domain: {
    name: 'LightCommit Reputation',
    version: '1',
    chainId: 31337,
    verifyingContract: '0x...'
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
  message: { ... }
}
```

---

## 📊 事件监听

```typescript
// 评分提交
reputationRegistry.on('FeedbackSubmitted', 
  (commitHash, contributor, repo, commitSha, score, ...) => {
    console.log('新评分:', score);
  }
);

// NFT 铸造
validationRegistry.on('MintTriggered',
  (commitHash, tokenId, contributor, score, ...) => {
    console.log('NFT铸造:', tokenId);
  }
);
```

---

## 🧪 测试命令

```bash
# 编译
npx hardhat compile

# 测试全部
npx hardhat test

# 测试单个文件
npx hardhat test test/ERC8004.test.ts

# 覆盖率
npx hardhat coverage

# 控制台
npx hardhat console --network localhost
```

---

## 🛠️ 常用 Hardhat 脚本

```bash
# 部署
npx hardhat run scripts/deploy-erc8004.ts --network localhost

# 授权评分者
EVALUATOR_ADDRESS=0x... npx hardhat run scripts/grant-evaluator.ts

# 查询统计
npx hardhat run scripts/get-stats.ts
```

---

## 🌐 IPFS 配置

### Pinata

```env
PINATA_API_KEY=your_key
PINATA_SECRET_KEY=your_secret
```

### Web3.Storage

```env
WEB3_STORAGE_TOKEN=your_token
```

---

## 📈 评分维度

| 维度 | 权重 | 范围 |
|------|------|------|
| Commit Message | 25% | 0-100 |
| 代码规模 | 20% | 0-100 |
| 文件影响 | 20% | 0-100 |
| 合并信号 | 15% | 0-100 |
| 元数据完整性 | 20% | 0-100 |

**铸造阈值**：80 分（可调整）

---

## 🔗 合约交互示例

```typescript
// 连接合约
const registry = new ethers.Contract(
  ADDRESS,
  ABI,
  signer
);

// 调用只读函数（view）
const reputation = await registry.getContributorReputation(address);

// 调用写入函数
const tx = await registry.functionName(...args);
const receipt = await tx.wait();

// 监听事件
registry.on('EventName', (...args) => {
  console.log(args);
});
```

---

## 🐛 故障排查

### 部署失败
```bash
# 检查余额
npx hardhat console --network localhost
> (await ethers.provider.getBalance(address)).toString()

# 清理缓存
rm -rf artifacts cache
npx hardhat clean
npx hardhat compile
```

### 签名验证失败
- 检查 chainId
- 检查 verifyingContract 地址
- 确认 EVALUATOR_ROLE 已授权

### IPFS 上传失败
- 检查 API key 配置
- 使用 mock 模式（开发环境）

---

## 📞 获取帮助

1. 查看完整文档：`docs/ERC8004_README.md`
2. 部署指南：`docs/DEPLOYMENT_GUIDE.md`
3. 使用示例：`docs/ERC8004_USAGE_EXAMPLES.md`
4. GitHub Issues

---

## 📌 重要提示

- ⚠️ 本地开发使用 Chain ID `31337`
- ⚠️ Sepolia 测试网使用 Chain ID `11155111`
- ⚠️ 评分阈值默认 `80` 分
- ⚠️ 每个 commit 只能评分一次
- ⚠️ 签名必须来自授权的 EVALUATOR

---

**版本**: v1.0.0  
**最后更新**: 2025-11-02

