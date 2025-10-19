# 🚀 Web3 集成完成指南

## ✅ 已完成的功能

### 1. **前端 Web3 集成**
- ✅ Web3Context - 完整的钱包连接管理
- ✅ useWeb3 & useContract Hooks
- ✅ MetaMask 钱包连接
- ✅ 网络切换功能
- ✅ 账户状态管理
- ✅ 钱包连接 UI 更新（显示地址、断开按钮）

### 2. **智能合约服务**
- ✅ ContractService - 完整的合约交互服务
- ✅ 单个 NFT 铸造
- ✅ 批量 NFT 铸造
- ✅ 合约数据查询
- ✅ 事件监听

### 3. **智能合约部署**
- ✅ CommitNFT 合约 (ERC721)
- ✅ 部署到本地 Hardhat 网络
- ✅ 合约地址: `0x5FbDB2315678afecb367f032d93F642f64180aa3`
- ✅ Chain ID: `31337` (Hardhat Local)

### 4. **测试页面**
- ✅ `/test-contract` - 完整的合约测试界面
- ✅ 实时显示连接状态
- ✅ 合约信息展示
- ✅ NFT 铸造测试功能

---

## 🎯 快速开始

### 环境要求
- Node.js 18+
- MetaMask 浏览器扩展
- pnpm

### 第一步：启动 Hardhat 节点

```bash
cd hardhat
npx hardhat node
```

**保持这个终端运行！** 你会看到：
- RPC 服务器地址: `http://127.0.0.1:8545`
- 20 个测试账户，每个有 10000 ETH

### 第二步：部署合约（如果还没部署）

```bash
# 在新终端
cd hardhat
npx hardhat run scripts/deploy-commit-nft.ts --network localhost
```

**记录合约地址！** 应该是:
```
0x5FbDB2315678afecb367f032d93F642f64180aa3
```

### 第三步：启动前端服务

```bash
cd frontend
pnpm dev
```

前端将运行在: `http://localhost:3001`

### 第四步：配置 MetaMask

#### 添加本地网络

1. 打开 MetaMask
2. 点击网络下拉菜单
3. 点击 "添加网络"
4. 手动添加网络：

```
网络名称: Hardhat Local
RPC URL: http://127.0.0.1:8545
Chain ID: 31337
货币符号: ETH
```

#### 导入测试账户

**Account #0 (推荐使用):**
```
私钥: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
地址: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
余额: 10000 ETH
```

**⚠️ 警告**: 这个私钥仅用于本地测试！不要在任何公开网络使用！

### 第五步：测试合约交互

1. 访问 `http://localhost:3001/test-contract`
2. 点击右上角 "Connect Wallet" 连接钱包
3. 在 MetaMask 中选择 Hardhat Local 网络
4. 确认连接请求
5. 点击 "🚀 铸造测试 NFT" 按钮
6. 在 MetaMask 中确认交易
7. 等待交易完成，查看结果！

---

## 📁 项目结构

### 前端文件

```
frontend/src/
├── lib/
│   ├── contexts/
│   │   └── Web3Context.tsx          # 钱包连接管理
│   ├── hooks/
│   │   └── useContract.ts           # 合约 Hook
│   ├── services/
│   │   └── contract.service.ts      # 合约交互服务
│   └── supabase/
│       └── middleware.ts            # 已修复（支持无 Supabase）
├── components/
│   ├── connect-wallet-modal.tsx    # 钱包连接弹窗（已更新）
│   └── header-simple.tsx           # 导航栏（显示钱包状态）
├── app/
│   ├── providers.tsx               # 集成 Web3Provider
│   └── test-contract/
│       └── page.tsx                # 测试页面
└── types/
    └── window.d.ts                 # TypeScript 类型

hardhat/
├── contracts/
│   └── mint.sol                    # CommitNFT 合约
├── scripts/
│   └── deploy-commit-nft.ts        # 部署脚本
├── contracts-abi.json              # 合约 ABI
└── contracts-config.json           # 合约配置
```

---

## 🔧 配置文件

### frontend/.env.local

```bash
# 区块链配置
NEXT_PUBLIC_CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
NEXT_PUBLIC_CHAIN_ID=31337
NEXT_PUBLIC_RPC_URL=http://127.0.0.1:8545
NEXT_PUBLIC_EXPLORER_URL=

# API 配置
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3001

# Supabase（占位符，可选）
NEXT_PUBLIC_SUPABASE_URL=https://placeholder.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=placeholder_key_for_development
SUPABASE_SERVICE_ROLE_KEY=placeholder_service_role_key
```

---

## 📊 合约信息

### CommitNFT 合约

**地址**: `0x5FbDB2315678afecb367f032d93F642f64180aa3`

**主要功能**:
- `mintCommit(address, CommitData, string)` - 铸造单个 NFT
- `batchMintCommits(address, CommitData[], string[])` - 批量铸造
- `getCommitData(uint256)` - 获取 Commit 数据
- `isCommitMinted(string)` - 检查是否已铸造
- `totalSupply()` - 总供应量
- `getUserTokenCount(address)` - 用户持有数量

**CommitData 结构**:
```typescript
{
  repo: string;           // 仓库名
  commit: string;         // commit 哈希
  linesAdded: number;     // 添加行数
  linesDeleted: number;   // 删除行数
  testsPass: boolean;     // 测试是否通过
  timestamp: number;      // 时间戳
  author: string;         // 作者
  message: string;        // commit 消息
  merged: boolean;        // 是否合并
}
```

---

## 🎨 UI 组件使用

### 在任意页面使用钱包功能

```tsx
'use client';

import { useWeb3 } from '@/lib/contexts/Web3Context';
import { useContract } from '@/lib/hooks/useContract';
import { ContractService } from '@/lib/services/contract.service';

export default function MyPage() {
  const { account, isConnected, connect } = useWeb3();
  const contract = useContract();

  const handleMint = async () => {
    if (!contract || !account) return;
    
    const service = new ContractService(contract);
    const result = await service.mintCommit(
      account,
      commitData,
      metadataURI
    );
  };

  return (
    <div>
      {!isConnected ? (
        <button onClick={connect}>连接钱包</button>
      ) : (
        <p>已连接: {account}</p>
      )}
    </div>
  );
}
```

---

## 🌐 部署到测试网 (Sepolia)

### 准备工作

1. **获取测试 ETH**
   - 访问: https://sepoliafaucet.com/
   - 输入你的钱包地址
   - 获取免费测试 ETH

2. **获取 Infura API Key**
   - 注册: https://infura.io/
   - 创建项目
   - 复制 Project ID

### 部署步骤

1. **配置 hardhat/.env**

```bash
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
SEPOLIA_PRIVATE_KEY=your_private_key_here
```

2. **部署合约**

```bash
cd hardhat
npx hardhat run scripts/deploy-commit-nft.ts --network sepolia
```

3. **更新前端配置**

```bash
# frontend/.env.local
NEXT_PUBLIC_CONTRACT_ADDRESS=<新的合约地址>
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
NEXT_PUBLIC_EXPLORER_URL=https://sepolia.etherscan.io
```

4. **在 MetaMask 切换到 Sepolia 网络**

---

## 🐛 常见问题

### 1. MetaMask 没有弹出连接请求
- 检查是否已安装 MetaMask
- 刷新页面重试
- 检查是否在正确的网络

### 2. 交易失败
- 确认 Hardhat 节点正在运行
- 检查账户是否有足够的 ETH
- 查看 MetaMask 错误信息
- 查看终端日志

### 3. 合约地址不正确
- 确认使用正确的合约地址
- 重新部署合约并更新 .env.local

### 4. 网络不匹配
- 在 MetaMask 中切换到 Hardhat Local (Chain ID 31337)
- 检查 .env.local 中的 NEXT_PUBLIC_CHAIN_ID

### 5. 前端无法连接到合约
- 检查 Hardhat 节点是否运行
- 确认 RPC URL: `http://127.0.0.1:8545`
- 查看浏览器控制台错误

---

## 📝 下一步

### 建议的功能扩展

1. **集成真实的 GitHub API**
   - 获取用户的真实 commits
   - 自动填充 CommitData

2. **NFT 元数据服务**
   - 创建 API 端点生成 NFT 元数据
   - 上传到 IPFS

3. **用户 Dashboard**
   - 展示用户已铸造的 NFTs
   - NFT 画廊

4. **批量铸造界面**
   - 选择多个 commits
   - 一次性铸造

5. **Sepolia 测试网部署**
   - 部署到真实的测试网
   - 可以公开分享

---

## 🎉 成功！

你现在有了一个完整的 Web3 + 智能合约 + Next.js 集成！

### 当前运行的服务：

1. ✅ **Hardhat 节点**: `http://127.0.0.1:8545`
2. ✅ **前端服务**: `http://localhost:3001`
3. ✅ **测试页面**: `http://localhost:3001/test-contract`

### 测试流程：

1. 连接 MetaMask 到 Hardhat Local
2. 访问测试页面
3. 连接钱包
4. 铸造 NFT
5. 查看交易记录

**享受你的 Web3 之旅！** 🚀

