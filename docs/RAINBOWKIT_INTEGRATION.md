# RainbowKit 集成说明

## ✅ 已完成的集成

### 安装的依赖
```json
{
  "@rainbow-me/rainbowkit": "^2.2.9",
  "wagmi": "^2.19.2",
  "viem": "~2.38.0"
}
```

### 新增文件

1. **lib/contexts/RainbowKitProvider.tsx**
   - RainbowKit 配置和初始化
   - 支持 3 个网络：Hardhat Local、Sepolia、Mainnet
   - 自定义主题（黑色强调色）

2. **hooks/use-rainbowkit-adapter.ts**
   - 将 wagmi hooks 适配为 ethers.js 格式
   - 保持与现有 useWeb3() 接口一致

3. **lib/utils/rainbowkit-adapter.ts**
   - viem 到 ethers.js 的转换工具
   - `walletClientToSigner` - WalletClient → JsonRpcSigner
   - `publicClientToProvider` - PublicClient → JsonRpcProvider

4. **components/ConnectWalletButton.tsx**
   - RainbowKit 风格的连接按钮
   - 自定义样式匹配项目设计

### 修改的文件

1. **app/providers.tsx**
   - 包裹 RainbowKitProvider
   - 保持原有 Web3Provider

2. **lib/contexts/Web3Context.tsx**
   - 简化为适配器
   - 使用 useRainbowKitAdapter
   - 保持 API 接口不变

---

## 🎯 优势

### 相比原有实现

✅ **更好的用户体验**
- 美观的连接弹窗
- 多钱包支持（MetaMask、WalletConnect、Coinbase 等）
- 自动重连
- 网络切换更友好

✅ **更稳定**
- 成熟的库，bug 少
- 活跃维护
- 社区支持好

✅ **向后兼容**
- useWeb3() 接口完全不变
- 现有组件无需修改
- 平滑迁移

---

## 🔧 使用方式

### 方式 1: 使用现有的 useWeb3()（推荐）
```typescript
import { useWeb3 } from '@/lib/contexts/Web3Context';

function MyComponent() {
  const { account, isConnected, connect, signer } = useWeb3();
  
}
```

### 方式 2: 使用 RainbowKit 的 ConnectButton
```typescript
import { ConnectWalletButton } from '@/components/ConnectWalletButton';

function MyComponent() {
  return <ConnectWalletButton />;
}
```

### 方式 3: 直接使用 wagmi hooks
```typescript
import { useAccount, useConnect } from 'wagmi';

function MyComponent() {
  const { address } = useAccount();
  const { connect } = useConnect();
  
}
```

---

## 🎨 自定义主题

当前配置（在 RainbowKitProvider.tsx）：
```typescript
theme={{
  lightMode: {
    accentColor: '#000000',
    accentColorForeground: 'white',
    borderRadius: 'large',
  },
}}
```

---

## 🔗 网络配置

支持的网络：
1. **Hardhat Local** (Chain ID: 31337)
2. **Sepolia Testnet** (Chain ID: 11155111)
3. **Ethereum Mainnet** (Chain ID: 1)

---

## ⚠️ 注意事项

1. **WalletConnect 需要 Project ID**
   - 在 .env.local 添加：
   ```
   NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
   ```
   - 从 https://cloud.walletconnect.com/ 获取

2. **保持兼容性**
   - useWeb3() API 完全不变
   - 所有现有组件继续工作
   - 只是底层实现换成了 RainbowKit

3. **ethers.js 适配**
   - viem/wagmi 使用不同的类型
   - 通过适配器转换为 ethers.js
   - 对业务代码透明

---

## 🚀 迁移完成

现在钱包连接更稳定，不会出现 "Connection cancelled" 问题。

用户拒绝连接时会显示友好提示而非错误。

所有 ERC-8004 功能继续正常工作！

