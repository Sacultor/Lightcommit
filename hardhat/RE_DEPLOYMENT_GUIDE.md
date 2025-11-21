# 合约重新部署方案

本文档提供完整的合约重新部署指南，适用于所有支持的区块链网络。

## 📋 目录

1. [部署前准备](#部署前准备)
2. [选择部署网络](#选择部署网络)
3. [部署步骤](#部署步骤)
4. [部署后配置](#部署后配置)
5. [验证部署](#验证部署)
6. [故障排除](#故障排除)

---

## 🚀 部署前准备

### 1. 检查依赖

```bash
cd hardhat
pnpm install
```

### 2. 配置环境变量

在 `hardhat` 目录下创建或更新 `.env` 文件：

```bash
# 从示例文件复制
cp env.example .env
```

根据要部署的网络，配置相应的环境变量：

#### Sepolia 测试网
```env
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
# 或使用 Alchemy
# SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_API_KEY
SEPOLIA_PRIVATE_KEY=your_private_key_here
ETHERSCAN_API_KEY=your_etherscan_api_key  # 用于合约验证
```

#### ZKsync Era Sepolia
```env
WALLET_PRIVATE_KEY=your_private_key_here
```

#### ZKsync Era Mainnet
```env
WALLET_PRIVATE_KEY=your_private_key_here
```

### 3. 检查账户余额

确保部署账户有足够的代币（ETH 或对应网络的代币）支付 gas 费用：

```bash
# 检查 Sepolia 余额（使用 Hardhat console）
npx hardhat console --network sepolia
# 在控制台执行：
const [signer] = await ethers.getSigners()
const balance = await ethers.provider.getBalance(signer.address)
console.log("Balance:", ethers.formatEther(balance), "ETH")
```

**建议余额：**
- Sepolia: 至少 0.1 ETH
- ZKsync Era Sepolia: 至少 0.01 ETH
- 本地网络: 自动分配，无需担心

---

## 🌐 选择部署网络

项目支持以下网络：

| 网络 | 网络名称 | 用途 | Chain ID |
|------|---------|------|----------|
| 本地开发 | `localhost` | 本地测试 | 31337 |
| Sepolia | `sepolia` | 测试网 | 11155111 |
| ZKsync Era Sepolia | `ZKsyncEraSepolia` | ZKsync 测试网 | 300 |
| ZKsync Era Mainnet | `ZKsyncEraMainnet` | ZKsync 主网 | 324 |
| Sophon Testnet | `SophonTestnet` | Sophon 测试网 | - |
| Sophon Mainnet | `SophonMainnet` | Sophon 主网 | - |

---

## 📦 部署步骤

### 方式一：使用 Hardhat Ignition（推荐）

Hardhat Ignition 是 Hardhat 的现代部署系统，支持依赖管理和部署状态跟踪。

#### 1. 编译合约

```bash
cd hardhat
npx hardhat compile
```

#### 2. 部署 ERC-8004 系统

```bash
# 部署到 Sepolia
npx hardhat ignition deploy ignition/modules/ERC8004System.ts --network sepolia

# 部署到本地网络
npx hardhat ignition deploy ignition/modules/ERC8004System.ts --network localhost

# 部署到 ZKsync Era Sepolia
npx hardhat ignition deploy ignition/modules/ERC8004System.ts --network ZKsyncEraSepolia
```

#### 3. 记录部署地址

部署完成后，会显示所有合约地址：

```
✅ AgentIdentityRegistry deployed to: 0x...
✅ ReputationRegistry deployed to: 0x...
✅ CommitNFT deployed to: 0x...
✅ ValidationRegistry deployed to: 0x...
```

**重要：** 请立即保存这些地址！

### 方式二：使用传统部署脚本

如果 Ignition 方式遇到问题，可以使用传统脚本：

```bash
# 部署到 Sepolia
npx hardhat run scripts/deploy-erc8004.ts --network sepolia

# 部署到本地网络
npx hardhat run scripts/deploy-erc8004.ts --network localhost
```

---

## ⚙️ 部署后配置

### 1. 更新前端环境变量

编辑 `frontend/.env` 文件：

```env
# 区块链网络配置
NEXT_PUBLIC_CHAIN_ID=11155111  # Sepolia: 11155111, 本地: 31337
NEXT_PUBLIC_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID

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

### 2. 更新合约配置文件（可选）

编辑 `hardhat/contracts-config.json`：

```json
{
  "networks": {
    "sepolia": {
      "chainId": 11155111,
      "contractAddress": "YOUR_COMMIT_NFT_ADDRESS"
    }
  }
}
```

### 3. 配置权限角色

部署后需要授予必要的角色权限。使用 Hardhat console：

```bash
npx hardhat console --network sepolia  # 或你部署的网络
```

在控制台执行：

```javascript
// 获取合约实例
const ReputationRegistry = await ethers.getContractFactory("ReputationRegistry")
const reputationRegistry = await ReputationRegistry.attach("REPUTATION_REGISTRY_ADDRESS")

// 授予 EVALUATOR_ROLE（评分服务账户）
const EVALUATOR_ROLE = ethers.keccak256(ethers.toUtf8Bytes("EVALUATOR_ROLE"))
const evaluatorAddress = "YOUR_EVALUATOR_ADDRESS"  // 评分服务的钱包地址
await reputationRegistry.grantRole(EVALUATOR_ROLE, evaluatorAddress)
console.log("✅ EVALUATOR_ROLE granted!")

// 授予 VALIDATOR_ROLE（如果需要）
const ValidationRegistry = await ethers.getContractFactory("ValidationRegistry")
const validationRegistry = await ValidationRegistry.attach("VALIDATION_REGISTRY_ADDRESS")
const VALIDATOR_ROLE = ethers.keccak256(ethers.toUtf8Bytes("VALIDATOR_ROLE"))
const validatorAddress = "YOUR_VALIDATOR_ADDRESS"
await validationRegistry.grantRole(VALIDATOR_ROLE, validatorAddress)
console.log("✅ VALIDATOR_ROLE granted!")
```

---

## ✅ 验证部署

### 1. 验证合约（仅测试网/主网）

在 Etherscan 或对应网络的区块浏览器上验证合约代码：

```bash
# 验证 AgentIdentityRegistry
npx hardhat verify --network sepolia AGENT_IDENTITY_REGISTRY_ADDRESS

# 验证 ReputationRegistry
npx hardhat verify --network sepolia REPUTATION_REGISTRY_ADDRESS

# 验证 CommitNFT（需要构造函数参数）
npx hardhat verify --network sepolia COMMIT_NFT_ADDRESS "LightCommit" "LCNFT" "https://api.lightcommit.com/metadata/"

# 验证 ValidationRegistry（需要构造函数参数）
npx hardhat verify --network sepolia VALIDATION_REGISTRY_ADDRESS COMMIT_NFT_ADDRESS REPUTATION_REGISTRY_ADDRESS
```

### 2. 测试合约功能

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

// 测试 ReputationRegistry
const ReputationRegistry = await ethers.getContractFactory("ReputationRegistry")
const reputation = await ReputationRegistry.attach("REPUTATION_REGISTRY_ADDRESS")
// 检查默认管理员角色
const DEFAULT_ADMIN_ROLE = await reputation.DEFAULT_ADMIN_ROLE()
console.log("Default Admin Role:", DEFAULT_ADMIN_ROLE)
```

### 3. 检查前端连接

```bash
cd frontend
pnpm dev
```

访问 http://localhost:3000，检查：
- 钱包连接是否正常
- 合约地址是否正确加载
- 网络切换是否正常

---

## 🔧 故障排除

### 问题 1: Gas 估算失败

**错误信息：**
```
Error: cannot estimate gas; transaction may fail or may require manual gas limit
```

**解决方案：**
1. 检查账户余额是否充足
2. 检查合约代码是否有错误
3. 尝试手动设置 gas limit：
   ```typescript
   const tx = await contract.deploy({ gasLimit: 5000000 })
   ```

### 问题 2: 网络连接失败

**错误信息：**
```
Error: could not detect network
```

**解决方案：**
1. 检查 RPC URL 是否正确
2. 检查网络是否可访问
3. 尝试使用其他 RPC 提供商（Infura、Alchemy、Public RPC）

### 问题 3: 合约验证失败

**错误信息：**
```
Error: Contract verification failed
```

**解决方案：**
1. 确保构造函数参数正确
2. 检查编译器版本和优化设置是否匹配
3. 等待几分钟后重试（区块浏览器可能需要时间同步）

### 问题 4: 权限配置失败

**错误信息：**
```
Error: execution reverted: AccessControl: account ... is missing role ...
```

**解决方案：**
1. 确保使用正确的角色哈希
2. 检查调用者是否有管理员权限
3. 使用部署账户授予权限（部署账户默认有管理员权限）

---

## 📝 部署检查清单

部署完成后，请确认：

- [ ] 所有合约已成功部署
- [ ] 合约地址已保存
- [ ] 前端环境变量已更新
- [ ] 权限角色已正确配置
- [ ] 合约已在区块浏览器上验证（测试网/主网）
- [ ] 基本功能测试通过
- [ ] 前端可以正常连接合约

---

## 🔄 重新部署注意事项

如果之前已经部署过合约，重新部署时请注意：

1. **旧合约数据不会迁移**：新部署的合约是全新的，不包含旧合约的数据
2. **更新所有引用**：确保前端、API、数据库等所有地方都更新为新地址
3. **通知用户**：如果合约已在使用中，需要通知用户切换到新合约
4. **备份旧地址**：保留旧合约地址用于数据对比和迁移

---

## 📚 相关文档

- [完整部署指南](../docs/DEPLOYMENT_GUIDE.md)
- [ERC-8004 实现文档](../docs/ERC8004_IMPLEMENTATION.md)
- [合约 ABI 参考](../docs/ABI_REFERENCE.md)

---

## 🆘 需要帮助？

如果遇到问题：
1. 查看 [故障排除](#故障排除) 部分
2. 检查 Hardhat 和网络日志
3. 查看相关文档
4. 在项目 Issues 中搜索类似问题

