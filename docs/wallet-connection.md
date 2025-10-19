# 钱包连接功能文档

## 概述

在导航栏添加了"Connect Wallet"按钮，点击后显示手绘风格的钱包选择弹窗。

## 功能说明

### 1. Connect Wallet 按钮

**位置**: 导航栏右侧，GitHub按钮左边

**样式**:
- 半透明背景：`rgba(220,220,220,0.3)`
- 2px黑色边框
- 圆角：39px
- 偏移阴影：2px → 3px (hover)
- Wallet图标 + 文字

**交互**:
- 点击：显示钱包选择弹窗
- Hover：背景变深，阴影增强，向左上移动

### 2. 钱包选择弹窗

**设计特点**:
- 手绘风格黑色粗边框（5px）
- 米色背景（#F5F1E8）
- 大偏移阴影（8px）
- 圆角：30px
- 居中显示
- 半透明黑色遮罩

**弹窗内容**:

#### 标题区域
- **标题**: "Connect Wallet"（3xl-4xl，黑体）
- **副标题**: "Get started by connecting your preferred wallet below"
- **关闭按钮**: 右上角圆形X按钮

#### 分隔线
- 横线 + 文字 + 横线
- 文字："or select a wallet from the list below"

#### 钱包列表
三个钱包选项：

1. **MetaMask**
   - 图标：🦊
   - 颜色：#F6851B

2. **Phantom**
   - 图标：👻
   - 颜色：#AB9FF2

3. **Coinbase Wallet**
   - 图标：🔵
   - 颜色：#0052FF

#### 底部链接
- "I don't have a wallet"
- 钱包图标 + 文字
- Hover变黑色

## 技术实现

### ConnectWalletModal组件

**Props**:
```typescript
interface ConnectWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}
```

**使用方式**:
```tsx
const [walletModalOpen, setWalletModalOpen] = useState(false);

<ConnectWalletModal
  isOpen={walletModalOpen}
  onClose={() => setWalletModalOpen(false)}
/>
```

### 动画效果

**遮罩动画**:
```tsx
initial={{ opacity: 0 }}
animate={{ opacity: 1 }}
exit={{ opacity: 0 }}
```

**弹窗动画**:
```tsx
initial={{ opacity: 0, scale: 0.9, y: -20 }}
animate={{ opacity: 1, scale: 1, y: 0 }}
exit={{ opacity: 0, scale: 0.9, y: -20 }}
transition={{ type: 'spring', duration: 0.3 }}
```

### 钱包按钮样式

```css
width: 100%
padding: 16px 24px
background: white
border: 3px solid black
border-radius: 16px
box-shadow: 3px 3px 0px 0px rgba(0,0,0,0.8)
```

**Hover效果**:
```css
background: rgba(249, 250, 251, 1)
arrow icon: translateX(4px)
arrow color: black
```

### 关闭按钮

**样式**:
```css
width: 40px
height: 40px
border-radius: 50%
border: 3px solid black
background: white
```

**位置**: 绝对定位，右上角（top: 24px, right: 24px）

## 钱包集成

### 当前状态
- 点击钱包显示console日志
- 未实际连接钱包

### MetaMask集成
```typescript
const handleWalletClick = async (walletName: string) => {
  if (walletName === 'MetaMask') {
    if (typeof window.ethereum !== 'undefined') {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        // 获取账户信息
        // 存储连接状态
      } catch (error) {
        console.error('MetaMask连接失败:', error);
      }
    } else {
      // 提示安装MetaMask
    }
  }
};
```

### Phantom集成
```typescript
if (window.phantom?.solana) {
  await window.phantom.solana.connect();
  // Solana钱包连接
}
```

### Coinbase Wallet集成
```typescript
// 使用Coinbase Wallet SDK
```

## 响应式设计

### 桌面端
- 按钮显示在导航栏右侧
- 点击显示居中弹窗

### 移动端
- 按钮显示在汉堡菜单中
- 在GitHub按钮上方
- 点击显示全屏弹窗

## 配色方案

```css
遮罩: rgba(0,0,0,0.2)
弹窗背景: #F5F1E8 (米色)
按钮背景: #FFFFFF (白色)
边框: #000000 (黑色)
文字-主: #000000 (黑色)
文字-辅: #6B7280 (灰色)
阴影: rgba(0,0,0,1)
```

## 交互流程

```
用户点击 "Connect Wallet"
    ↓
显示弹窗（带动画）
    ↓
用户选择钱包
    ↓
触发钱包连接
    ↓
关闭弹窗
    ↓
显示连接状态
```

## 待实现功能

### 钱包连接
- [ ] MetaMask实际连接
- [ ] Phantom实际连接
- [ ] Coinbase Wallet实际连接
- [ ] 连接状态存储
- [ ] 账户信息显示

### UI增强
- [ ] 已连接状态显示
- [ ] 断开连接功能
- [ ] 切换账户功能
- [ ] 网络切换提示
- [ ] 错误处理UI

### 功能集成
- [ ] 与Mint流程集成
- [ ] 签名功能
- [ ] 交易发送
- [ ] 余额显示
- [ ] 交易历史

## 使用示例

### 基础使用
```tsx
import { ConnectWalletModal } from '@/components/connect-wallet-modal';

const [isOpen, setIsOpen] = useState(false);

<button onClick={() => setIsOpen(true)}>
  Connect Wallet
</button>

<ConnectWalletModal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
/>
```

### 在HeaderSimple中
```tsx
const [walletModalOpen, setWalletModalOpen] = useState(false);

<button onClick={() => setWalletModalOpen(true)}>
  <Wallet /> Connect Wallet
</button>

<ConnectWalletModal
  isOpen={walletModalOpen}
  onClose={() => setWalletModalOpen(false)}
/>
```

## 文件位置

```
frontend/src/components/
├── connect-wallet-modal.tsx    # 新建：钱包弹窗组件
└── header-simple.tsx           # 更新：添加按钮
```

## 依赖

- `framer-motion` - 弹窗动画
- `lucide-react` - 图标
- Next.js - 路由和状态

## 可访问性

- ✅ 遮罩可点击关闭
- ✅ 关闭按钮明显
- ✅ 键盘可访问
- ✅ 清晰的视觉反馈
- ⏳ Esc键关闭（待添加）
- ⏳ 焦点管理（待添加）

## 测试清单

- [x] 按钮显示正常
- [x] 点击打开弹窗
- [x] 点击遮罩关闭
- [x] 点击X关闭
- [x] 动画流畅
- [x] 响应式正常
- [x] 移动端正常
- [x] 无Lint错误
- [ ] 钱包实际连接
- [ ] 错误处理

## 版本历史

- **v1.0** (2025-01-19): 初始版本
  - Connect Wallet按钮
  - 钱包选择弹窗
  - 手绘风格设计
  - 基础交互实现

