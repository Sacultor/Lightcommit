# 快速部署指南

## 🚀 一键部署命令

### 方式一：使用便捷脚本（推荐）

```bash
cd hardhat

# 部署到 Sepolia 测试网
pnpm redeploy:sepolia

# 部署到本地网络
pnpm redeploy:localhost

# 部署到 ZKsync Era Sepolia
pnpm redeploy:zksync
```

### 方式二：使用 Hardhat Ignition

```bash
cd hardhat

# 部署到 Sepolia
pnpm deploy:erc8004:sepolia

# 部署到本地网络
pnpm deploy:erc8004

# 部署到 ZKsync Era Sepolia
pnpm deploy:erc8004:zksync
```

## 📋 部署前检查清单

- [ ] 已安装依赖：`pnpm install`
- [ ] 已配置 `.env` 文件（包含 RPC URL 和私钥）
- [ ] 账户有足够的余额支付 gas 费用
- [ ] 已编译合约：`pnpm compile`

## ⚙️ 环境变量配置

在 `hardhat/.env` 文件中配置：

```env
# Sepolia 测试网
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
SEPOLIA_PRIVATE_KEY=your_private_key_here

# ZKsync Era
WALLET_PRIVATE_KEY=your_private_key_here
```

## 📝 部署后步骤

1. **保存合约地址**：部署脚本会自动保存到 `deployments/` 目录
2. **更新前端配置**：将合约地址添加到 `frontend/.env.local`
3. **配置权限角色**：使用 Hardhat console 授予必要的角色
4. **验证合约**（测试网/主网）：使用 `npx hardhat verify` 命令

## 📚 详细文档

查看 [RE_DEPLOYMENT_GUIDE.md](./RE_DEPLOYMENT_GUIDE.md) 获取完整的部署指南。

