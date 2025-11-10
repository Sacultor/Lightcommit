# 本地环境变量配置指南

## 📝 创建 .env.local 文件

在 `frontend/` 目录下创建 `.env.local` 文件：

```bash
cd frontend
touch .env.local
```

然后复制以下内容到 `.env.local`：

---

## 🔧 完整的 .env.local 内容

```env
# ========================================
# 区块链配置（本地开发）
# ========================================
NEXT_PUBLIC_CHAIN_ID=31337
NEXT_PUBLIC_RPC_URL=http://127.0.0.1:8545

# ========================================
# ERC-8004 合约地址（本地部署后的地址）
# ========================================
NEXT_PUBLIC_IDENTITY_REGISTRY_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
NEXT_PUBLIC_REPUTATION_REGISTRY_ADDRESS=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
NEXT_PUBLIC_VALIDATION_REGISTRY_ADDRESS=0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9
NEXT_PUBLIC_COMMIT_NFT_ADDRESS=0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0

# ========================================
# 评分服务私钥（后端使用，Hardhat 第一个测试账户）
# ========================================
EVALUATOR_PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
EVALUATOR_ADDRESS=0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266

# ========================================
# WalletConnect Project ID（可选，用于 WalletConnect）
# ========================================
# 如果不使用 WalletConnect，可以留空或使用任意值
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=0000000000000000000000000000000000000000

# ========================================
# Supabase 配置（用于 GitHub 登录和数据存储）
# ========================================
# 如果有 Supabase 项目，填写真实值
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# 如果没有 Supabase，可以暂时填写示例值（GitHub 登录会失败，但钱包功能可用）
# NEXT_PUBLIC_SUPABASE_URL=https://example.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.example

# ========================================
# 区块浏览器 URL（可选）
# ========================================
NEXT_PUBLIC_EXPLORER_URL=https://sepolia.etherscan.io

# ========================================
# API URL（可选）
# ========================================
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000

# ========================================
# IPFS 配置（可选，用于元数据上传）
# ========================================
# Pinata（如果有）
# PINATA_API_KEY=your_pinata_api_key
# PINATA_SECRET_KEY=your_pinata_secret_key

# 或 Web3.Storage（如果有）
# WEB3_STORAGE_TOKEN=your_web3_storage_token

# 如果都没有，系统会使用 Mock 模式（开发环境可用）
```

---

## 🎯 最小配置（只测试钱包连接）

如果只想测试钱包连接和 ERC-8004，最少需要这些：

```env
NEXT_PUBLIC_CHAIN_ID=31337
NEXT_PUBLIC_RPC_URL=http://127.0.0.1:8545

NEXT_PUBLIC_IDENTITY_REGISTRY_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
NEXT_PUBLIC_REPUTATION_REGISTRY_ADDRESS=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
NEXT_PUBLIC_VALIDATION_REGISTRY_ADDRESS=0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9
NEXT_PUBLIC_COMMIT_NFT_ADDRESS=0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0

EVALUATOR_PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=0000000000000000000000000000000000000000
```

---

## 📋 快速设置命令

### 一键创建 .env.local

在 `frontend/` 目录执行：

```bash
cat > .env.local << 'EOF'
NEXT_PUBLIC_CHAIN_ID=31337
NEXT_PUBLIC_RPC_URL=http://127.0.0.1:8545

NEXT_PUBLIC_IDENTITY_REGISTRY_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
NEXT_PUBLIC_REPUTATION_REGISTRY_ADDRESS=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
NEXT_PUBLIC_VALIDATION_REGISTRY_ADDRESS=0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9
NEXT_PUBLIC_COMMIT_NFT_ADDRESS=0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0

EVALUATOR_PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
EVALUATOR_ADDRESS=0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266

NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=0000000000000000000000000000000000000000
EOF
```

### 重启前端使环境变量生效

```bash
# 停止当前前端
pkill -f "next dev"

# 重启
pnpm dev
```

---

## ✅ 验证配置

### 检查环境变量是否生效

在浏览器控制台（F12 → Console）执行：

```javascript
console.log({
  chainId: process.env.NEXT_PUBLIC_CHAIN_ID,
  rpc: process.env.NEXT_PUBLIC_RPC_URL,
  identity: process.env.NEXT_PUBLIC_IDENTITY_REGISTRY_ADDRESS,
});
```

应该看到正确的值而不是 `undefined`。

---

## 🔍 变量说明

### NEXT_PUBLIC_* 变量
- 以 `NEXT_PUBLIC_` 开头的变量会暴露给浏览器
- 用于前端调用合约

### 私密变量（无 NEXT_PUBLIC_）
- 只在服务端可用
- 用于后端 API
- 如：EVALUATOR_PRIVATE_KEY

### 合约地址
- 从部署脚本的输出复制
- 每次重新部署本地链都会变化
- 如果重新部署，需要更新这些地址

---

## 🎯 下一步

1. ✅ 创建 `.env.local` 文件
2. ✅ 复制上面的配置
3. ✅ 重启前端（`pkill -f "next dev" && pnpm dev`）
4. ✅ 刷新浏览器
5. ✅ 测试钱包连接

**配置后链 ID 错误应该就解决了！** 🚀

