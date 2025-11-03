# 环境变量配置说明

## 🔧 创建 .env 文件

在 `frontend` 目录下创建 `.env` 文件，并添加以下内容：

```bash
# ===== 区块链配置 (本地测试网) =====
NEXT_PUBLIC_CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
NEXT_PUBLIC_CHAIN_ID=31337
NEXT_PUBLIC_RPC_URL=http://127.0.0.1:8545
NEXT_PUBLIC_EXPLORER_URL=

# ===== API 配置 =====
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000

# ===== Supabase 配置 (请填写你的实际值) =====
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# ===== GitHub OAuth 配置 (请填写你的实际值) =====
GITHUB_CLIENT_ID=your_github_client_id_here
GITHUB_CLIENT_SECRET=your_github_client_secret_here
```

## 📝 配置说明

### 区块链配置

- **NEXT_PUBLIC_CONTRACT_ADDRESS**: CommitNFT 合约地址
  - 本地测试: `0x5FbDB2315678afecb367f032d93F642f64180aa3`
  - Sepolia测试网: 部署后获得

- **NEXT_PUBLIC_CHAIN_ID**: 网络 Chain ID
  - 本地 Hardhat: `31337`
  - Sepolia: `11155111`
  - Ethereum Mainnet: `1`

- **NEXT_PUBLIC_RPC_URL**: RPC 节点地址
  - 本地: `http://127.0.0.1:8545`
  - Sepolia: `https://sepolia.infura.io/v3/YOUR_PROJECT_ID`

## 🚀 启动步骤

1. **确保 Hardhat 节点正在运行**
   ```bash
   cd hardhat
   npx hardhat node
   ```

2. **创建 .env 文件**
   ```bash
   cd frontend
   cp ENV_SETUP.md .env
   # 编辑 .env 填写实际配置
   ```

3. **启动前端服务**
   ```bash
   pnpm dev
   ```

4. **访问测试页面**
   ```
   http://localhost:3000/test-contract
   ```

## 🦊 MetaMask 配置

### 添加本地 Hardhat 网络

1. 打开 MetaMask
2. 点击网络下拉菜单
3. 点击 "添加网络"
4. 输入以下信息：
   - 网络名称: `Hardhat Local`
   - RPC URL: `http://127.0.0.1:8545`
   - Chain ID: `31337`
   - 货币符号: `ETH`

### 导入测试账户

Hardhat 提供了预配置的测试账户，私钥为：
```
0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

**⚠️ 警告**: 这个私钥仅用于本地测试，不要在主网或测试网使用！

## 🧪 测试流程

1. 确保 Hardhat 节点运行中
2. 前端服务运行中
3. MetaMask 连接到本地网络
4. 访问 `/test-contract` 页面
5. 点击 "Connect Wallet" 连接钱包
6. 点击 "铸造测试 NFT" 测试合约交互

## 📡 切换到 Sepolia 测试网

如果要部署到 Sepolia 测试网：

1. **部署合约**
   ```bash
   cd hardhat
   npx hardhat run scripts/deploy-commit-nft.ts --network sepolia
   ```

2. **更新 .env**
   ```bash
   NEXT_PUBLIC_CONTRACT_ADDRESS=<新的合约地址>
   NEXT_PUBLIC_CHAIN_ID=11155111
   NEXT_PUBLIC_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
   ```

3. **在 MetaMask 中切换到 Sepolia 网络**

4. **获取测试 ETH**: https://sepoliafaucet.com/

