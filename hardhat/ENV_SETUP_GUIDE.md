# .env 文件填写指南

本文档详细说明如何填写 `hardhat/.env` 文件中的每个配置项。

## 📋 必需配置项（部署到 Sepolia 测试网）

### 1. SEPOLIA_RPC_URL

**作用：** 连接到 Sepolia 测试网的 RPC 节点地址

**如何获取：**

#### 方式一：使用 Infura（推荐）

1. 访问 https://infura.io
2. 注册账号并登录
3. 创建新项目（Create New Key）
4. 选择网络：**Ethereum**
5. 在项目设置中找到 **Sepolia** 网络的 Endpoint
6. 复制 URL，格式类似：`https://sepolia.infura.io/v3/YOUR_PROJECT_ID`

**填写示例：**
```env
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/abc123def456ghi789jkl012mno345pq
```

#### 方式二：使用 Alchemy

1. 访问 https://alchemy.com
2. 注册账号并登录
3. 创建新应用（Create App）
4. 选择网络：**Ethereum** → **Sepolia**
5. 在应用详情页找到 **HTTP** 地址
6. 复制 URL，格式类似：`https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY`

**填写示例：**
```env
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/AbCdEf123456GhIjKl789012MnOpQr
```

#### 方式三：使用公共 RPC（不推荐，可能不稳定）

```env
SEPOLIA_RPC_URL=https://rpc.sepolia.org
```

**⚠️ 注意：** 公共 RPC 可能不稳定，建议使用 Infura 或 Alchemy。

---

### 2. SEPOLIA_PRIVATE_KEY

**作用：** 用于部署合约的钱包私钥

**如何获取：**

#### 方式一：使用 MetaMask 导出私钥

1. 打开 MetaMask 浏览器扩展
2. 点击右上角账户图标 → **账户详情**
3. 点击 **导出私钥**
4. 输入密码确认
5. 复制私钥（64 位十六进制字符串，通常以 `0x` 开头）

**填写示例：**
```env
SEPOLIA_PRIVATE_KEY=0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef
```

**或者不带 0x 前缀也可以：**
```env
SEPOLIA_PRIVATE_KEY=1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef
```

#### 方式二：使用 Hardhat 生成新账户（仅用于测试）

```bash
cd hardhat
npx hardhat console
```

在控制台执行：
```javascript
const wallet = ethers.Wallet.createRandom()
console.log('Address:', wallet.address)
console.log('Private Key:', wallet.privateKey)
```

**⚠️ 安全提示：**
- **永远不要**将私钥提交到 Git 仓库
- **永远不要**分享你的私钥给任何人
- 确保 `.env` 文件在 `.gitignore` 中
- 如果私钥泄露，立即转移资金并创建新账户

---

## 🔧 可选配置项

### 3. ETHERSCAN_API_KEY

**作用：** 用于在 Etherscan 上验证合约源代码

**如何获取：**

1. 访问 https://etherscan.io/apis
2. 如果没有账号，先注册并登录
3. 点击 **Add** 创建新的 API Key
4. 输入 API Key 名称（如：`MyProject`）
5. 复制生成的 API Key

**填写示例：**
```env
ETHERSCAN_API_KEY=ABC123DEF456GHI789JKL012MNO345PQ
```

**用途：**
- 部署后验证合约代码：`npx hardhat verify --network sepolia <CONTRACT_ADDRESS>`
- 让用户可以在 Etherscan 上查看和验证你的合约源代码

**是否必需：** 不是必需的，但强烈推荐。没有它也可以部署，但无法在 Etherscan 上验证合约。

---

## 📝 其他网络配置（可选）

如果你将来要部署到其他网络，可以配置以下项：

### POLYGON_MUMBAI_RPC_URL
Polygon Mumbai 测试网的 RPC URL（类似 Sepolia 的获取方式）

### ARBITRUM_SEPOLIA_RPC_URL
Arbitrum Sepolia 测试网的 RPC URL（通常使用公共 RPC 或 Alchemy）

### POLYGONSCAN_API_KEY
用于在 Polygonscan 上验证合约

### ARBISCAN_API_KEY
用于在 Arbiscan 上验证合约

---

## ✅ 完整配置示例

以下是一个完整的 `.env` 文件示例（仅部署到 Sepolia）：

```env
# Hardhat Environment Variables

# Sepolia Testnet Configuration
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/your_infura_project_id_here
SEPOLIA_PRIVATE_KEY=0xyour_private_key_here_without_quotes

# Etherscan API Key (for contract verification)
ETHERSCAN_API_KEY=your_etherscan_api_key_here
```

---

## 🔍 验证配置是否正确

配置完成后，可以使用以下命令验证：

### 1. 检查账户余额

```bash
cd hardhat
npx hardhat run scripts/check-balance.ts --network sepolia
```

如果配置正确，会显示账户地址和余额。

### 2. 测试连接

```bash
npx hardhat console --network sepolia
```

在控制台执行：
```javascript
const [signer] = await ethers.getSigners()
console.log("Connected address:", signer.address)
const balance = await ethers.provider.getBalance(signer.address)
console.log("Balance:", ethers.formatEther(balance), "ETH")
```

如果能看到地址和余额，说明配置正确。

---

## ⚠️ 常见错误

### 错误 1: "Invalid JSON RPC response"
**原因：** RPC URL 不正确或网络问题
**解决：** 
- 检查 RPC URL 是否正确
- 尝试使用其他 RPC 提供商
- 检查网络连接

### 错误 2: "invalid private key"
**原因：** 私钥格式不正确
**解决：**
- 确保私钥是 64 位十六进制字符串
- 如果带 `0x` 前缀，确保格式正确
- 检查是否有额外的空格或换行

### 错误 3: "insufficient funds"
**原因：** 账户余额不足
**解决：**
- 访问 https://sepoliafaucet.com/ 获取测试 ETH
- 确保账户至少有 0.1 ETH

---

## 🛡️ 安全建议

1. **永远不要提交 `.env` 到 Git**
   - 确保 `.env` 在 `.gitignore` 中
   - 只提交 `env.example` 作为模板

2. **使用环境变量管理工具**（生产环境）
   - 使用密钥管理服务（如 AWS Secrets Manager）
   - 使用 CI/CD 环境变量

3. **定期轮换密钥**
   - 如果私钥可能泄露，立即更换
   - 定期更新 API Key

4. **使用不同的账户**
   - 测试网使用测试账户
   - 主网使用专门的部署账户
   - 不要在主网账户中存储大量资金

---

## 📚 相关资源

- [Infura 文档](https://docs.infura.io/)
- [Alchemy 文档](https://docs.alchemy.com/)
- [Etherscan API 文档](https://docs.etherscan.io/api-endpoints)
- [MetaMask 文档](https://docs.metamask.io/)

---

## ❓ 需要帮助？

如果配置过程中遇到问题：
1. 检查上述常见错误部分
2. 确认所有 URL 和密钥格式正确
3. 使用验证命令测试配置
4. 查看 Hardhat 错误日志获取详细信息

祝你配置顺利！🚀

