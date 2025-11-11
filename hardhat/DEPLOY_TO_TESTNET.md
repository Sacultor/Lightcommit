# 测试网部署方案

## 📋 部署前准备清单

### ✅ 1. 环境变量配置

在 `hardhat` 目录下创建或更新 `.env` 文件：

```bash
cd hardhat
# 如果还没有 .env 文件，从示例复制
cp env.example .env
```

编辑 `.env` 文件，填入以下信息：

```env
# Sepolia 测试网 RPC 节点（三选一）
# 选项1: Infura（推荐）
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID

# 选项2: Alchemy
# SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_API_KEY

# 选项3: 公共 RPC（不推荐，可能不稳定）
# SEPOLIA_RPC_URL=https://rpc.sepolia.org

# 部署账户私钥（不要带 0x 前缀，或带都可以）
SEPOLIA_PRIVATE_KEY=your_private_key_here

# Etherscan API Key（用于合约验证，可选但推荐）
ETHERSCAN_API_KEY=your_etherscan_api_key
```

**获取 RPC URL：**
- **Infura**: 访问 https://infura.io 注册账号，创建项目，获取 Sepolia 网络的 RPC URL
- **Alchemy**: 访问 https://alchemy.com 注册账号，创建应用，获取 Sepolia 网络的 RPC URL

**获取 Etherscan API Key：**
- 访问 https://etherscan.io/apis 注册账号，创建 API Key

### ✅ 2. 检查账户余额

确保部署账户有足够的 Sepolia ETH 支付 gas 费用（建议至少 0.1 ETH）。

**获取测试 ETH：**
- Sepolia Faucet: https://sepoliafaucet.com/
- Alchemy Faucet: https://sepoliafaucet.com/
- Infura Faucet: https://www.infura.io/faucet/sepolia

**检查余额命令：**
```bash
cd hardhat
npx hardhat run scripts/check-balance.ts --network sepolia
```

或者使用 Hardhat console：
```bash
npx hardhat console --network sepolia
# 在控制台执行：
const [signer] = await ethers.getSigners()
const balance = await ethers.provider.getBalance(signer.address)
console.log("Balance:", ethers.formatEther(balance), "ETH")
```

### ✅ 3. 确认合约已编译

```bash
cd hardhat
npm run compile
```

---

## 🚀 部署步骤

### 方式一：使用便捷部署脚本（推荐）

```bash
cd hardhat

# 部署到 Sepolia 测试网
npm run redeploy:sepolia
```

或者直接使用：
```bash
npx hardhat run scripts/redeploy.ts --network sepolia
```

### 方式二：使用 Hardhat Ignition

```bash
cd hardhat

# 部署到 Sepolia
npx hardhat ignition deploy ignition/modules/ERC8004System.ts --network sepolia
```

### 方式三：使用原始部署脚本

```bash
cd hardhat

# 部署到 Sepolia
npx hardhat run scripts/deploy-erc8004.ts --network sepolia
```

---

## 📝 部署输出示例

部署成功后，你会看到类似以下的输出：

```
🚀 开始重新部署 ERC-8004 系统合约...

📡 网络: sepolia (Chain ID: 11155111)
👤 部署账户: 0xYourAddress...
💰 账户余额: 0.5 ETH

==================================================
开始部署合约...

1️⃣  部署 AgentIdentityRegistry...
   ✅ 部署成功: 0x1234...

2️⃣  部署 ReputationRegistry...
   ✅ 部署成功: 0x5678...

3️⃣  部署 CommitNFT...
   ✅ 部署成功: 0x9ABC...

4️⃣  部署 ValidationRegistry...
   ✅ 部署成功: 0xDEF0...

==================================================
配置合约权限...

5️⃣  转移 CommitNFT 所有权到 ValidationRegistry...
   ✅ 所有权已转移

6️⃣  授予部署者为 ReputationRegistry 的 EVALUATOR_ROLE...
   ✅ EVALUATOR_ROLE 已授予

7️⃣  授予部署者为 ValidationRegistry 的 VALIDATOR_ROLE...
   ✅ VALIDATOR_ROLE 已授予

==================================================
🎉 部署完成！
==================================================

📋 合约地址汇总：
   AgentIdentityRegistry: 0x1234...
   ReputationRegistry:     0x5678...
   CommitNFT:              0x9ABC...
   ValidationRegistry:     0xDEF0...

💾 部署信息已保存到: deployments/deployment-sepolia-1234567890.json

==================================================
📝 前端环境变量配置：
==================================================

请将以下内容添加到 frontend/.env.local 文件：

NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_IDENTITY_REGISTRY_ADDRESS=0x1234...
NEXT_PUBLIC_REPUTATION_REGISTRY_ADDRESS=0x5678...
NEXT_PUBLIC_VALIDATION_REGISTRY_ADDRESS=0xDEF0...
NEXT_PUBLIC_COMMIT_NFT_ADDRESS=0x9ABC...

==================================================
🔍 合约验证命令：
==================================================

在区块浏览器上验证合约代码：

npx hardhat verify --network sepolia 0x1234...
npx hardhat verify --network sepolia 0x5678...
npx hardhat verify --network sepolia 0x9ABC... "LightCommit" "LCNFT" "https://api.lightcommit.com/metadata/"
npx hardhat verify --network sepolia 0xDEF0... 0x9ABC... 0x5678...

✨ 部署流程完成！
```

**重要：** 请立即保存这些合约地址！

---

## ✅ 部署后步骤

### 1. 验证合约（推荐）

在 Etherscan 上验证合约代码，这样用户可以在区块浏览器上查看和交互：

```bash
cd hardhat

# 验证 AgentIdentityRegistry
npx hardhat verify --network sepolia <AGENT_IDENTITY_REGISTRY_ADDRESS>

# 验证 ReputationRegistry
npx hardhat verify --network sepolia <REPUTATION_REGISTRY_ADDRESS>

# 验证 CommitNFT（需要构造函数参数）
npx hardhat verify --network sepolia <COMMIT_NFT_ADDRESS> "LightCommit" "LCNFT" "https://api.lightcommit.com/metadata/"

# 验证 ValidationRegistry（需要构造函数参数）
npx hardhat verify --network sepolia <VALIDATION_REGISTRY_ADDRESS> <COMMIT_NFT_ADDRESS> <REPUTATION_REGISTRY_ADDRESS>
```

**注意：** 如果验证失败，等待几分钟后重试（区块浏览器需要时间同步）。

### 2. 更新前端环境变量

编辑 `frontend/.env.local` 文件：

```env
# 区块链网络配置
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
# 或使用 Alchemy
# NEXT_PUBLIC_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_API_KEY

# 合约地址（从部署输出复制）
NEXT_PUBLIC_IDENTITY_REGISTRY_ADDRESS=0x...
NEXT_PUBLIC_REPUTATION_REGISTRY_ADDRESS=0x...
NEXT_PUBLIC_VALIDATION_REGISTRY_ADDRESS=0x...
NEXT_PUBLIC_COMMIT_NFT_ADDRESS=0x...

# 服务端配置
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
SEPOLIA_PRIVATE_KEY=your_private_key_here
CONTRACT_ADDRESS=0x...  # CommitNFT 地址
```

### 3. 配置权限角色（如果需要）

如果评分服务使用不同的账户，需要授予 EVALUATOR_ROLE：

```bash
npx hardhat console --network sepolia
```

在控制台执行：
```javascript
const ReputationRegistry = await ethers.getContractFactory("ReputationRegistry")
const reputationRegistry = await ReputationRegistry.attach("REPUTATION_REGISTRY_ADDRESS")

const EVALUATOR_ROLE = ethers.keccak256(ethers.toUtf8Bytes("EVALUATOR_ROLE"))
const evaluatorAddress = "YOUR_EVALUATOR_ADDRESS"  // 评分服务的钱包地址
await reputationRegistry.grantRole(EVALUATOR_ROLE, evaluatorAddress)
console.log("✅ EVALUATOR_ROLE granted!")
```

### 4. 测试合约功能

使用 Hardhat console 测试基本功能：

```bash
npx hardhat console --network sepolia
```

```javascript
// 测试 CommitNFT
const CommitNFT = await ethers.getContractFactory("CommitNFT")
const nft = await CommitNFT.attach("COMMIT_NFT_ADDRESS")
const name = await nft.name()
const symbol = await nft.symbol()
const maxSupply = await nft.MAX_SUPPLY()
console.log("NFT Name:", name)
console.log("NFT Symbol:", symbol)
console.log("Max Supply:", maxSupply.toString())
```

---

## 🔍 查看部署信息

部署信息会自动保存到 `hardhat/deployments/` 目录，文件名格式：
```
deployment-sepolia-<timestamp>.json
```

你可以查看这个文件获取完整的部署信息。

---

## 🐛 常见问题

### Q1: 部署时提示 "insufficient funds"
**A:** 账户余额不足，需要获取更多 Sepolia ETH。访问 https://sepoliafaucet.com/ 获取测试币。

### Q2: 部署时提示 "network error" 或 "timeout"
**A:** 
- 检查 RPC URL 是否正确
- 尝试使用其他 RPC 提供商（Infura、Alchemy）
- 检查网络连接

### Q3: 合约验证失败
**A:**
- 确保构造函数参数正确
- 等待几分钟后重试（区块浏览器需要时间同步）
- 检查编译器版本和优化设置是否匹配

### Q4: 找不到部署的合约
**A:**
- 检查部署时使用的网络是否正确
- 查看 `deployments/` 目录中的 JSON 文件
- 在 Etherscan 上搜索部署账户地址，查看交易记录

---

## 📚 相关资源

- [Sepolia 测试网浏览器](https://sepolia.etherscan.io/)
- [Infura 文档](https://docs.infura.io/)
- [Alchemy 文档](https://docs.alchemy.com/)
- [Hardhat 部署文档](https://hardhat.org/hardhat-runner/docs/guides/deploying)

---

## 🎯 下一步

部署完成后：
1. ✅ 验证合约代码
2. ✅ 更新前端配置
3. ✅ 测试合约功能
4. ✅ 配置权限角色
5. ✅ 开始集成前端应用

祝你部署顺利！🚀

