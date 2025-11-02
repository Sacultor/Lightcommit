# ERC-8004 系统部署指南

## 前置准备

### 1. 安装依赖
```bash
# 根目录
pnpm install

# 合约目录
cd hardhat
pnpm install
```

### 2. 生成评分服务账户
```bash
cd hardhat
npx hardhat console

# 在控制台执行
const wallet = ethers.Wallet.createRandom()
console.log('Address:', wallet.address)
console.log('Private Key:', wallet.privateKey)
```

保存生成的私钥和地址备用。

## 本地部署（开发环境）

### 1. 启动本地区块链
```bash
cd hardhat
npx hardhat node
```

保持终端运行，记录显示的账户信息。

### 2. 编译合约
新开一个终端：
```bash
cd hardhat
npx hardhat compile
```

### 3. 部署合约
```bash
npx hardhat run scripts/deploy-erc8004.ts --network localhost
```

部署成功后会显示四个合约地址，记录下来：
```
- AgentIdentityRegistry: 0x...
- ReputationRegistry: 0x...
- CommitNFT: 0x...
- ValidationRegistry: 0x...
```

### 4. 配置前端环境变量
```bash
cd ../frontend
cp .env.erc8004.example .env.local
```

编辑 `.env.local`，填入：
```env
# 本地网络
NEXT_PUBLIC_CHAIN_ID=31337
NEXT_PUBLIC_RPC_URL=http://127.0.0.1:8545

# 合约地址（从步骤3复制）
NEXT_PUBLIC_IDENTITY_REGISTRY_ADDRESS=0x...
NEXT_PUBLIC_REPUTATION_REGISTRY_ADDRESS=0x...
NEXT_PUBLIC_VALIDATION_REGISTRY_ADDRESS=0x...
NEXT_PUBLIC_COMMIT_NFT_ADDRESS=0x...

# 评分服务私钥（从前置准备步骤2复制）
EVALUATOR_PRIVATE_KEY=0x...

# IPFS（开发环境可使用模拟模式，不填也行）
# PINATA_API_KEY=your_key
# PINATA_SECRET_KEY=your_secret
```

### 5. 授予评分服务权限
```bash
cd ../hardhat
npx hardhat console --network localhost

# 在控制台执行（替换地址为实际值）
const ReputationRegistry = await ethers.getContractFactory("ReputationRegistry")
const registry = await ReputationRegistry.attach("REPUTATION_REGISTRY_ADDRESS")

const EVALUATOR_ROLE = ethers.keccak256(ethers.toUtf8Bytes("EVALUATOR_ROLE"))
await registry.grantRole(EVALUATOR_ROLE, "YOUR_EVALUATOR_ADDRESS")

console.log("EVALUATOR_ROLE granted!")
```

### 6. 启动前端
```bash
cd ../frontend
pnpm dev
```

访问 http://localhost:3000

## 测试流程

### 1. 注册代理身份
```bash
# 在前端连接钱包后，或使用 hardhat console
const IdentityRegistry = await ethers.getContractFactory("AgentIdentityRegistry")
const identity = await IdentityRegistry.attach("IDENTITY_REGISTRY_ADDRESS")

await identity.registerAgent(
  "your-github-username",
  "ipfs://QmYourAgentCard"
)
```

### 2. 模拟贡献评分
访问前端的贡献页面，或直接调用 API：
```bash
curl -X POST http://localhost:3000/api/contributions/score \
  -H "Content-Type: application/json"
```

### 3. 签名并上链
```bash
# 获取签名
curl http://localhost:3000/api/contributions/CONTRIBUTION_ID/sign

# 在前端或通过 hardhat 提交
const ReputationRegistry = await ethers.getContractFactory("ReputationRegistry")
const registry = await ReputationRegistry.attach("REPUTATION_REGISTRY_ADDRESS")

await registry.submitFeedback(
  contributorAddress,
  repo,
  commitSha,
  score,
  feedbackHash,
  metadataURI,
  signature
)
```

### 4. 触发验证与铸造
```bash
const ValidationRegistry = await ethers.getContractFactory("ValidationRegistry")
const validation = await ValidationRegistry.attach("VALIDATION_REGISTRY_ADDRESS")

await validation.requestValidation(
  repo,
  commitSha,
  contributorAddress,
  metadataURI
)
```

如果 score >= 80，会自动铸造 NFT。

### 5. 查看结果
```bash
# 查看 NFT
const CommitNFT = await ethers.getContractFactory("CommitNFT")
const nft = await CommitNFT.attach("COMMIT_NFT_ADDRESS")

const balance = await nft.balanceOf(contributorAddress)
console.log("NFT Count:", balance.toString())

const tokenId = await nft.tokenOfOwnerByIndex(contributorAddress, 0)
const tokenURI = await nft.tokenURI(tokenId)
console.log("Token URI:", tokenURI)

# 查看声誉
const reputation = await registry.getContributorReputation(contributorAddress)
console.log("Total Score:", reputation.totalScore.toString())
console.log("Average Score:", reputation.averageScore.toString())
```

## Sepolia 测试网部署

### 1. 准备测试 ETH
从 [Sepolia Faucet](https://sepoliafaucet.com/) 获取测试 ETH

### 2. 配置 hardhat
编辑 `hardhat/hardhat.config.ts`：
```typescript
networks: {
  sepolia: {
    url: process.env.SEPOLIA_RPC_URL,
    accounts: [process.env.SEPOLIA_PRIVATE_KEY!]
  }
}
```

### 3. 部署到 Sepolia
```bash
cd hardhat
npx hardhat run scripts/deploy-erc8004.ts --network sepolia
```

### 4. 验证合约（可选）
```bash
npx hardhat verify --network sepolia IDENTITY_REGISTRY_ADDRESS
npx hardhat verify --network sepolia REPUTATION_REGISTRY_ADDRESS
npx hardhat verify --network sepolia COMMIT_NFT_ADDRESS "LightCommit" "LCNFT" "https://api.lightcommit.com/metadata/"
npx hardhat verify --network sepolia VALIDATION_REGISTRY_ADDRESS COMMIT_NFT_ADDRESS REPUTATION_REGISTRY_ADDRESS
```

### 5. 更新前端配置
```env
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
NEXT_PUBLIC_IDENTITY_REGISTRY_ADDRESS=0x...
NEXT_PUBLIC_REPUTATION_REGISTRY_ADDRESS=0x...
NEXT_PUBLIC_VALIDATION_REGISTRY_ADDRESS=0x...
NEXT_PUBLIC_COMMIT_NFT_ADDRESS=0x...
```

## IPFS 配置

### 方案 A：Pinata（推荐）
1. 注册 https://pinata.cloud
2. 创建 API Key
3. 在 `.env.local` 中配置：
```env
PINATA_API_KEY=your_api_key
PINATA_SECRET_KEY=your_secret_key
```

### 方案 B：Web3.Storage
1. 注册 https://web3.storage
2. 创建 API Token
3. 在 `.env.local` 中配置：
```env
WEB3_STORAGE_TOKEN=your_token
```

## 常见问题

### Q1: 部署时 gas 估算失败
A: 确保账户有足够的 ETH，本地网络至少 1 ETH

### Q2: 签名验证失败
A: 检查 chainId 和 verifyingContract 地址是否正确

### Q3: NFT 没有铸造
A: 检查评分是否 >= 80，查看 ValidationRegistry 事件日志

### Q4: IPFS 上传失败
A: 检查 API key 配置，或使用模拟模式（自动生成假哈希）

## 下一步

- [ ] 集成前端 UI 组件
- [ ] 添加事件监听与通知
- [ ] 实现批量处理
- [ ] 集成 Chainlink Automation
- [ ] 添加监控与告警

## 相关文档

- [ERC-8004 实现文档](./ERC8004_IMPLEMENTATION.md)
- [API 参考](./API_REFERENCE.md)
- [前端集成指南](./FRONTEND_INTEGRATION_GUIDE.md)

