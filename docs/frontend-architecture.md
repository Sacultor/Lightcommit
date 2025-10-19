# 前端架构文档

## 概述

前端采用统一的手绘风格设计系统，基于Next.js 14+ App Router构建。

## 📂 文件结构

```
frontend/src/
├── app/
│   ├── page.tsx                    # 首页 Landing Page
│   ├── layout.tsx                  # 根布局
│   ├── globals.css                 # 全局样式
│   ├── providers.tsx               # Provider配置
│   │
│   ├── collections/                # Gallery - NFT收藏
│   │   └── page.tsx
│   │
│   ├── nfts/                       # NFT展示页
│   │   └── page.tsx
│   │
│   ├── explore/                    # Repository浏览
│   │   └── page.tsx
│   │
│   ├── roadmap/                    # 产品路线图
│   │   └── page.tsx
│   │
│   ├── mint/                       # NFT铸造流程
│   │   └── new/
│   │       └── page.tsx            # 3步铸造流程
│   │
│   ├── stats/                      # 统计页面（保留）
│   │   └── page.tsx
│   │
│   ├── auth/                       # 认证相关
│   │   ├── callback/page.tsx
│   │   └── error/page.tsx
│   │
│   └── api/                        # API路由
│       ├── auth/
│       ├── contributions/
│       └── github/
│
├── components/                     # 手绘风格组件
│   ├── header-simple.tsx           # 导航栏
│   ├── footer-simple.tsx           # 底部栏
│   ├── footer.tsx                  # 底部栏（备用）
│   ├── join-us.tsx                 # 社交媒体组件
│   │
│   ├── hero-section-gvc.tsx        # Hero动物场景
│   ├── about-section.tsx           # About Us
│   ├── what-section.tsx            # What's LightCommit
│   ├── faq-section.tsx             # FAQ
│   │
│   ├── collection-card.tsx         # NFT卡片
│   └── collection-container.tsx    # 手绘容器
│
├── hooks/                          # 自定义Hooks
│   ├── use-auth.ts
│   └── use-contributions.ts
│
├── lib/                            # 工具库
│   ├── api.ts
│   ├── auth.ts
│   ├── utils.ts
│   ├── config/
│   ├── database/
│   └── services/
│
└── types/                          # TypeScript类型
    ├── api.ts
    ├── auth.ts
    ├── blockchain.ts
    ├── contribution.ts
    ├── github.ts
    ├── repository.ts
    └── user.ts
```

## 🎨 设计系统

### 统一的手绘风格

**颜色方案**:
```css
主背景: #F5F1E8 (米色)
容器背景: #E8DCC8 (浅棕色)
卡片背景: #FFFFFF (白色)
边框: #000000 (黑色)
主按钮: #E63946 (红色)
蓝色主题: #3B82F6 (网络选择)
```

**边框系统**:
```css
细边框: 2-3px solid black
中等边框: 4px solid black
粗边框: 5-8px solid black
```

**阴影系统**:
```css
小阴影: 2px 2px 0px 0px rgba(0,0,0,0.8)
中阴影: 3-4px 3-4px 0px 0px rgba(0,0,0,0.8)
大阴影: 6-8px 6-8px 0px 0px rgba(0,0,0,1)
```

**圆角系统**:
```css
小圆角: 8-12px
中圆角: 16-20px
大圆角: 24-40px
圆形: 50% / 9999px
```

## 🗺️ 页面路由

### 公开页面
```
/                → Landing Page (手绘风格)
/explore         → Repository浏览 (手绘风格)
/roadmap         → 产品路线图 (手绘风格)
/collections     → NFT Gallery (手绘风格)
/nfts            → NFT展示 (手绘风格)
/mint/new        → NFT铸造流程 (手绘风格)
/stats           → 统计页面 (需更新为手绘风格)
```

### 认证页面
```
/auth/callback   → OAuth回调
/auth/error      → 认证错误
```

### API路由
```
/api/auth/github         → GitHub OAuth
/api/auth/logout         → 登出
/api/contributions       → 贡献API
/api/github/webhook      → GitHub Webhook
```

## 🧩 组件库

### 布局组件
```tsx
<HeaderSimple />         # 顶部导航栏
<FooterSimple />         # 底部栏（JOIN US）
<Footer />               # 底部栏（备用）
```

### 内容组件
```tsx
<HeroSectionGVC />       # Hero场景（7个动物角色）
<AboutSection />         # About Us内容
<WhatSection />          # What + How It Works
<FAQSection />           # FAQ手风琴
<JoinUs />               # 社交媒体图标
```

### Gallery组件
```tsx
<CollectionContainer>    # 手绘风格容器
  <CollectionCard />     # NFT卡片
</CollectionContainer>
```

## 🔄 用户流程

### 完整NFT创建流程
```
Landing Page
    ↓ (点击导航GALLERY)
Collections (空状态)
    ↓ (点击Create new collection)
Explore (搜索repositories)
    ↓ (点击repository卡片)
Mint Step 2 (Preview & Network)
    ↓ (选择网络，点击Mint)
Mint Step 3 (Success!)
    ↓ (点击View My Profile)
Collections (查看新NFT)
```

## 🛠️ 技术栈

### 核心框架
- Next.js 14+ (App Router)
- React 18+
- TypeScript

### 样式
- Tailwind CSS
- 自定义手绘风格系统

### 动画
- Framer Motion
- CSS Transitions

### 图标
- Lucide React
- 自定义SVG（Discord, Ethereum等）

### 状态管理
- React Hooks (useState, useEffect)
- Next.js Hooks (useRouter, useSearchParams)
- SWR (数据获取)

## 📱 响应式设计

### 断点系统
```css
sm: 640px   (平板)
md: 768px   (平板横屏)
lg: 1024px  (桌面)
xl: 1280px  (大桌面)
```

### 布局策略
- 移动优先设计
- 1列 → 2列 → 3列 网格布局
- 灵活的flex布局
- 响应式间距和字体

## 🔐 认证流程

```
用户点击 "Start with GitHub"
    ↓
跳转到 /api/auth/github
    ↓
GitHub OAuth授权
    ↓
回调到 /auth/callback
    ↓
设置cookie，存储用户信息
    ↓
跳转到相应页面
```

## 🎯 API集成

### GitHub集成
- OAuth认证
- Repository数据获取
- Webhook接收

### 后端API
- 贡献数据CRUD
- 用户数据管理
- NFT元数据存储

### 区块链集成
- 网络选择
- NFT铸造
- 交易追踪

## 📊 数据流

```
GitHub API
    ↓
后端API处理
    ↓
前端展示 (Explore)
    ↓
用户选择并配置
    ↓
铸造到区块链
    ↓
存储元数据
    ↓
Gallery展示
```

## 🎨 设计原则

### 1. 一致性
- 统一的手绘风格
- 一致的边框和阴影
- 统一的圆角系统
- 统一的配色方案

### 2. 简洁性
- 清晰的视觉层次
- 简洁的信息展示
- 直观的交互逻辑

### 3. 趣味性
- 动物角色元素
- 手绘边框装饰
- 流畅的动画效果
- 友好的文案

### 4. 可用性
- 清晰的导航
- 明确的CTA按钮
- 友好的错误提示
- 流畅的用户体验

## 📝 命名规范

### 文件命名
- 组件文件：kebab-case (hero-section-gvc.tsx)
- 页面文件：page.tsx
- 工具文件：kebab-case (use-auth.ts)

### 组件命名
- PascalCase (HeroSectionGVC)
- 描述性命名
- 避免缩写

### 变量命名
- camelCase
- 描述性命名
- 布尔值用is/has前缀

## 🚀 性能优化

### 已实现
- ✅ 代码分割（页面级）
- ✅ 动态导入
- ✅ 图片优化
- ✅ CSS优化

### 待优化
- [ ] 图片懒加载
- [ ] 虚拟滚动
- [ ] 缓存策略
- [ ] CDN部署

## 📖 相关文档

- [用户流程文档](./user-flow-complete.md)
- [Gallery设计文档](./collections-usage.md)
- [Roadmap设计文档](./roadmap-design.md)
- [Mint流程文档](./mint-step2-preview-network.md)
- [JoinUs组件文档](./join-us-component.md)

## 版本历史

- **v2.0** (2025-01-19): 完全迁移到手绘风格
  - 删除所有旧风格组件（33个文件）
  - 统一设计系统
  - 完整的NFT创建流程
  - 优化的代码结构

