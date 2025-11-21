# Components 结构优化记录

本次对 `frontend/src/components` 目录进行了完整重组，提高代码可维护性。

---

## ✅ 优化后的结构

```
components/
├── layout/                      # 布局组件
│   ├── header.tsx              # 页面头部（原 header-simple.tsx）
│   ├── footer.tsx              # 页面底部（原 footer-simple.tsx）
│   └── index.ts                # 统一导出
│
├── home/                        # 首页相关组件
│   ├── hero-section.tsx        # 主视觉（原 hero-section-gvc.tsx）
│   ├── about-section.tsx       # 关于我们
│   ├── what-section.tsx        # 功能介绍
│   ├── faq-section.tsx         # 常见问题
│   ├── join-us.tsx             # 加入我们 CTA
│   └── index.ts                # 统一导出
│
├── nft/                         # NFT 收藏相关
│   ├── collection-card.tsx     # NFT 卡片
│   ├── collection-container.tsx # 收藏容器
│   └── index.ts                # 统一导出
│
├── wallet/                      # 钱包相关
│   ├── connect-modal.tsx       # 连接钱包弹窗（原 connect-wallet-modal.tsx）
│   └── index.ts                # 统一导出
│
└── erc8004/                     # ERC-8004 功能组件
    ├── RegisterAgentModal.tsx  # 代理注册弹窗
    ├── ReputationBadge.tsx     # 声誉徽章
    └── ScoreDisplay.tsx        # 评分展示
```

---

## 🗑️ 删除的文件/目录

### 空目录
- ❌ `components/landingpage/`
- ❌ `components/profile/`
- ❌ `components/mint/ui/`
- ❌ `components/dashboard/ui/`
- ❌ `components/dashboard/`（包含 DashboardContent.tsx）

### 未使用的文件
- ❌ `components/footer.tsx`（与 footer-simple 重复）
- ❌ `components/layout/navbar.tsx`（无引用）

---

## 📝 重命名清单

| 旧路径 | 新路径 | 说明 |
|--------|--------|------|
| `header-simple.tsx` | `layout/header.tsx` | 更简洁的命名 |
| `footer-simple.tsx` | `layout/footer.tsx` | 更简洁的命名 |
| `hero-section-gvc.tsx` | `home/hero-section.tsx` | 移除冗余后缀 |
| `about-section.tsx` | `home/about-section.tsx` | 归类到 home |
| `what-section.tsx` | `home/what-section.tsx` | 归类到 home |
| `faq-section.tsx` | `home/faq-section.tsx` | 归类到 home |
| `join-us.tsx` | `home/join-us.tsx` | 归类到 home |
| `collection-card.tsx` | `nft/collection-card.tsx` | 归类到 nft |
| `collection-container.tsx` | `nft/collection-container.tsx` | 归类到 nft |
| `connect-wallet-modal.tsx` | `wallet/connect-modal.tsx` | 归类到 wallet |

---

## 🔄 导入路径变化

### 之前（旧路径）

```typescript
import { HeaderSimple } from '@/components/header-simple';
import { FooterSimple } from '@/components/footer-simple';
import { HeroSectionGVC } from '@/components/hero-section-gvc';
import { CollectionCard } from '@/components/collection-card';
```

### 之后（新路径）

```typescript
// 方式 1：直接导入
import { HeaderSimple } from '@/components/layout/header';
import { FooterSimple } from '@/components/layout/footer';
import { HeroSectionGVC } from '@/components/home/hero-section';
import { CollectionCard } from '@/components/nft/collection-card';

// 方式 2：从 index 导入（推荐）
import { HeaderSimple, FooterSimple } from '@/components/layout';
import { HeroSectionGVC, AboutSection, WhatSection } from '@/components/home';
import { CollectionCard, CollectionContainer } from '@/components/nft';
```

---

## 📦 已更新的文件

### 页面文件
- ✅ `app/page.tsx` - 首页
- ✅ `app/collections/page.tsx` - NFT 收藏页
- ✅ `app/explore/page.tsx` - 探索页
- ✅ `app/roadmap/page.tsx` - 路线图
- ✅ `app/mint/new/page.tsx` - 铸造页
- ✅ `app/erc8004/contributions/page.tsx` - 贡献列表
- ✅ `app/erc8004/validate/[id]/page.tsx` - 验证页

### 组件文件
- ✅ `components/layout/header.tsx` - 更新 ConnectWalletModal 引用

---

## 🎯 优化效果

### 之前的问题
- ❌ 组件散乱在根目录
- ❌ 多个空目录占位
- ❌ 命名不一致（header-simple vs footer-simple）
- ❌ 难以找到相关组件

### 优化后
- ✅ 组件按功能分类（layout/home/nft/wallet/erc8004）
- ✅ 删除所有空目录
- ✅ 统一命名规范
- ✅ 支持统一导出（index.ts）
- ✅ 代码更易维护和扩展

---

## 🚀 后续建议

### 1. 使用统一导出简化导入

```typescript
// 当前（推荐保持）
import { HeaderSimple } from '@/components/layout/header';

// 可优化为（使用 index.ts）
import { HeaderSimple } from '@/components/layout';
```

### 2. 添加通用 UI 组件库

```
components/ui/               # 通用 UI 组件
├── button.tsx              # 按钮组件
├── card.tsx                # 卡片组件
├── modal.tsx               # 弹窗组件
├── badge.tsx               # 徽章组件
└── input.tsx               # 输入框组件
```

### 3. 考虑使用 shadcn/ui

```bash
npx shadcn-ui@latest init
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
```

---

## ✅ 重组完成！

所有组件已按功能分类整理，结构更清晰、更易维护。

