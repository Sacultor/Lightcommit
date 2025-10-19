# LightCommit Frontend

基于 Next.js 15 和 React 19 构建的 LightCommit 前端应用，采用类似 BAYC 的设计风格。

## 技术栈

- **框架**: Next.js 15 + React 19
- **样式**: Tailwind CSS 4
- **动画**: Framer Motion
- **数据获取**: TanStack Query (React Query)
- **HTTP 客户端**: Axios
- **图标**: Lucide React
- **通知**: React Hot Toast

## 功能特性

### 已实现

- ✅ 响应式布局（Header + Footer）
- ✅ Hero Section（类似 BAYC 的视觉风格）
- ✅ NFT 展示网格
- ✅ 特性展示区
- ✅ 使用流程说明
- ✅ 流畅的动画和过渡效果
- ✅ API 客户端封装
- ✅ React Query 数据获取 hooks
- ✅ GitHub OAuth 认证流程
- ✅ Dashboard 控制面板
- ✅ NFT 收藏页面
- ✅ 统计数据页面

### 页面结构

```
/                     # 首页（Hero + Features + NFT Grid + How it Works）
/auth/callback        # GitHub OAuth 回调页面
/dashboard           # 用户控制面板
/nfts                # NFT 收藏展示
/stats               # 平台统计数据
```

## 安装和运行

### 安装依赖

```bash
pnpm install
```

### 配置环境变量

复制 `.env.example` 为 `.env.local`：

```bash
cp .env.example .env.local
```

编辑 `.env.local` 并设置后端 API 地址：

```
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### 开发模式

```bash
pnpm dev
```

访问 http://localhost:3001

### 生产构建

```bash
pnpm build
pnpm start
```

## 项目结构

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── auth/              # 认证相关页面
│   │   ├── dashboard/         # 控制面板
│   │   ├── nfts/              # NFT 展示
│   │   ├── stats/             # 统计页面
│   │   ├── layout.tsx         # 根布局
│   │   ├── page.tsx           # 首页
│   │   └── providers.tsx      # 全局 Providers
│   ├── components/            # 可复用组件
│   │   ├── header.tsx
│   │   ├── footer.tsx
│   │   ├── hero-section.tsx
│   │   ├── features-section.tsx
│   │   ├── nft-card.tsx
│   │   ├── nft-grid.tsx
│   │   └── how-it-works.tsx
│   ├── hooks/                 # 自定义 Hooks
│   │   ├── use-auth.ts
│   │   └── use-contributions.ts
│   ├── lib/                   # 工具函数
│   │   ├── api.ts             # API 客户端
│   │   └── utils.ts           # 通用工具
│   └── types/                 # TypeScript 类型定义
├── public/                    # 静态资源
└── package.json
```

## 设计风格

### 色彩方案

- **主色**: 深色背景 (#000000)
- **强调色**: 紫色渐变 (#a855f7 → #ec4899)
- **文本**: 白色 + 灰色层次
- **边框**: 灰色 + 紫色高光

### 特色元素

- ✨ 暗黑主题设计
- 🎨 渐变色彩应用
- 🎭 磨砂玻璃效果
- 🌊 流畅的页面动画
- 📱 完全响应式布局
- 🎯 悬停交互效果

## 与后端集成

### API 端点

前端通过 Axios 客户端调用后端 API：

- `GET /api/auth/profile` - 获取用户信息
- `GET /api/contributions` - 获取贡献列表
- `GET /api/contributions/my` - 获取我的贡献
- `GET /api/contributions/stats` - 获取统计数据
- `GET /api/contributions/:id` - 获取单个贡献详情

### 认证流程

1. 用户点击"连接 GitHub"按钮
2. 跳转到后端的 `/api/auth/github`
3. GitHub OAuth 认证
4. 回调到 `/auth/callback?token=xxx`
5. 前端保存 token 到 localStorage
6. 重定向到 Dashboard

## 待优化项

### 素材替换

当前使用占位符，需要替换为实际素材：

- [ ] Logo 和品牌标识
- [ ] 背景纹理图片
- [ ] NFT 卡片示例图
- [ ] 图标和装饰元素
- [ ] 加载动画

### 功能增强

- [ ] NFT 详情弹窗
- [ ] 筛选和排序功能
- [ ] 分页加载
- [ ] 分享功能
- [ ] 钱包连接（Web3）
- [ ] 链上数据展示
- [ ] 搜索功能
- [ ] 用户设置页面

## 许可证

MIT
