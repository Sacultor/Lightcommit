# LightCommit 前端架构说明

## 概述

LightCommit 前端是一个基于 Next.js 15 的现代化 Web3 应用，采用 App Router 架构，集成了 RainbowKit 钱包连接、Supabase 数据库、以及 ERC-8004 智能合约交互功能。

## 技术栈

### 核心框架
- **Next.js 15.5.4** - React 框架，使用 App Router
- **React 19.1.0** - UI 库
- **TypeScript 5** - 类型安全

### Web3 相关
- **Wagmi 2.19.2** - React Hooks for Ethereum
- **RainbowKit 2.2.9** - 钱包连接 UI
- **Ethers.js 6.8.1** - 以太坊交互库
- **Viem 2.38.0** - 轻量级以太坊库

### 后端与数据
- **Supabase** - 数据库与认证
  - `@supabase/supabase-js 2.75.1` - Supabase 客户端
  - `@supabase/ssr 0.7.0` - SSR 支持
- **Redis 4.6.10** - 缓存
- **Axios 1.7.7** - HTTP 客户端

### UI 与样式
- **Tailwind CSS 4.1.14** - 原子化 CSS 框架
- **Framer Motion 11.11.17** - 动画库
- **Radix UI** - 无样式组件库
  - `@radix-ui/react-avatar`
  - `@radix-ui/react-slot`
- **Lucide React 0.545.0** - 图标库
- **React Hot Toast 2.4.1** - 通知组件

### 开发工具
- **Storybook 8.6.14** - 组件开发环境
- **ESLint 9** - 代码检查
- **PostCSS 8.5.6** - CSS 处理

## 项目结构

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router 页面
│   │   ├── api/               # API 路由
│   │   │   ├── auth/         # 认证相关 API
│   │   │   ├── contributions/ # 贡献管理 API
│   │   │   ├── github/       # GitHub Webhook
│   │   │   └── ipfs/         # IPFS 上传
│   │   ├── erc8004/          # ERC-8004 相关页面
│   │   ├── dashboard/        # 仪表板
│   │   ├── collections/      # NFT 集合
│   │   ├── mint/             # NFT 铸造
│   │   └── ...
│   ├── components/            # React 组件
│   │   ├── erc8004/          # ERC-8004 专用组件
│   │   ├── landingpage/      # 着陆页组件
│   │   ├── dashboard/        # 仪表板组件
│   │   └── ...
│   ├── hooks/                 # 自定义 Hooks
│   │   ├── use-agent-registry.ts    # 代理注册
│   │   ├── use-auth.ts              # 认证
│   │   ├── use-contributions.ts     # 贡献管理
│   │   └── use-rainbowkit-adapter.ts # 钱包适配
│   ├── lib/                   # 核心库
│   │   ├── contexts/         # React Context
│   │   ├── contracts/        # 合约 ABI
│   │   ├── database/         # 数据库相关
│   │   ├── services/         # 业务服务
│   │   ├── supabase/         # Supabase 配置
│   │   └── utils/            # 工具函数
│   ├── types/                # TypeScript 类型定义
│   └── stories/              # Storybook 故事
├── public/                   # 静态资源
│   ├── assets/              # 图片、图标等
│   └── fonts/               # 字体文件
├── scripts/                 # 工具脚本
└── supabase/               # Supabase 配置
    └── migrations/         # 数据库迁移

```

## 核心模块详解

### 1. 应用入口与布局

#### `src/app/layout.tsx` - 根布局
```typescript
// 定义应用的根布局，包含：
// - 字体配置（Inter 字体）
// - 元数据（标题、描述）
// - Providers 包裹（提供全局状态和上下文）
export default function RootLayout({ children })
```

**功能说明：**
- 设置应用级别的字体样式
- 配置 SEO 元数据（标题："LightCommit"，描述：将代码贡献铸造成 NFT）
- 使用 `<Providers>` 组件包裹所有子组件，提供全局状态

#### `src/app/providers.tsx` - 全局提供者
```typescript
// 提供全局的 Context Providers：
// - RainbowKitProvider: 钱包连接
// - Web3Provider: Web3 状态管理
// - Toaster: 全局通知
export function Providers({ children })
```

**功能说明：**
- **RainbowKitProvider**：配置钱包连接（MetaMask、WalletConnect 等）
- **Web3Provider**：管理 Web3 连接状态、账户、签名器等
- **Toaster**：提供全局的 Toast 通知（顶部右侧，深色主题）

### 2. Web3 集成

#### `src/lib/contexts/RainbowKitProvider.tsx` - RainbowKit 配置
```typescript
// 配置 Wagmi 和 RainbowKit：
// - 定义支持的链（Hardhat Local）
// - 配置 RPC 端点
// - 设置钱包连接器
// - 配置 QueryClient（用于数据缓存）
```

**关键配置：**
- **支持的链**：Hardhat Local (Chain ID: 31337)
- **RPC URL**：`http://127.0.0.1:8545`
- **连接器**：Injected（支持 MetaMask、Trust Wallet 等）

#### `src/lib/contexts/Web3Context.tsx` - Web3 状态管理
```typescript
// Web3Context 提供以下状态和方法：
interface Web3ContextType {
  provider: ethers.BrowserProvider | null;  // 以太坊提供者
  signer: ethers.JsonRpcSigner | null;      // 签名器
  account: string | null;                    // 当前账户地址
  chainId: number | null;                    // 当前链 ID
  isConnected: boolean;                      // 是否已连接
  isCorrectNetwork: boolean;                 // 是否在正确的网络
  connect: () => Promise<void>;              // 连接钱包
  disconnect: () => void;                    // 断开连接
  switchNetwork: (targetChainId: number) => Promise<void>;  // 切换网络
}
```

**功能说明：**
- 统一管理 Web3 连接状态
- 提供钱包连接/断开功能
- 提供网络切换功能
- 通过 Context 向下传递状态和方法

#### `src/hooks/use-rainbowkit-adapter.ts` - RainbowKit 适配器
```typescript
// 将 Wagmi 的 hooks 适配为 Ethers.js 格式：
// - useAccount -> account (地址)
// - useWalletClient -> signer (签名器)
// - usePublicClient -> provider (提供者)
// - useChainId -> chainId (链 ID)
```

**功能说明：**
- 将 Wagmi 的 viem 格式转换为 Ethers.js 格式
- 提供统一的钱包连接接口
- 处理钱包连接状态的延迟更新问题

### 3. ERC-8004 智能合约集成

#### `src/lib/contracts/index.ts` - 合约 ABI 管理
```typescript
// 导出四个核心合约的 ABI：
export {
  AgentIdentityRegistryABI,    // 代理身份注册与管理
  ReputationRegistryABI,       // 评分系统
  ValidationRegistryABI,       // 验证系统
  CommitNFTABI,               // NFT 铸造系统
}
```

**合约说明：**
1. **AgentIdentityRegistry**：管理代理身份的注册和验证
2. **ReputationRegistry**：记录和查询贡献者的链上声誉
3. **ValidationRegistry**：处理贡献的验证和签名
4. **CommitNFT**：铸造代表代码贡献的 NFT

#### `src/hooks/use-agent-registry.ts` - 代理注册 Hook
```typescript
// 提供代理注册相关功能：
export function useAgentRegistry() {
  return {
    isRegistered: boolean,           // 是否已注册
    loading: boolean,                // 加载状态
    agentProfile: AgentProfile,      // 代理档案
    registerAgent: (githubUsername) => Promise,  // 注册代理
    checkRegistration: () => Promise,            // 检查注册状态
  }
}
```

**功能流程：**
1. 连接到 `AgentIdentityRegistry` 合约
2. 检查当前钱包地址是否已注册
3. 如果未注册，提供注册功能：
   - 从 GitHub 认证获取用户名
   - 生成 Agent Card（JSON 格式，包含能力、联系方式等）
   - 调用合约的 `registerAgent` 方法
   - 等待交易确认

#### `src/lib/services/erc8004.service.ts` - ERC-8004 服务
```typescript
// ERC-8004 协议的核心实现：
export class ERC8004Service {
  // 生成反馈哈希（用于唯一标识一次评分）
  static generateFeedbackHash(repo, commitSha, score, timestamp): string
  
  // 生成元数据 JSON（包含评分详情、证据等）
  static async generateMetadataJSON(feedback, breakdown, evidence): Promise<string>
  
  // EIP-712 签名相关（结构化签名）
  static getEIP712Domain(chainId, verifyingContract)
  static getEIP712Types()
  static async signFeedback(feedback, signer, chainId, verifyingContract): Promise<string>
  static async verifySignature(feedback, signature, chainId, verifyingContract): Promise<string>
  
  // IPFS 相关（元数据存储）
  static async uploadToIPFS(content): Promise<string>
  static parseIPFSUri(uri): string
  static async fetchMetadataFromIPFS(uri): Promise<ERC8004Metadata>
}
```

**ERC-8004 反馈结构：**
```typescript
interface ERC8004Feedback {
  contributor: string;    // 贡献者地址
  repo: string;          // 仓库名称
  commitSha: string;     // Commit SHA
  score: number;         // 评分（0-100）
  feedbackHash: string;  // 反馈哈希
  timestamp: number;     // 时间戳
  nonce: number;        // 防重放攻击
}
```

**元数据结构：**
```typescript
interface ERC8004Metadata {
  score: number;                    // 总分
  breakdown: ScoreBreakdown;        // 评分细节
  evidence: {                       // 证据
    diffUrl: string;               // 代码差异 URL
    testResults: string;           // 测试结果
    linterReport: string;          // 代码检查报告
  };
  commit: string;                   // Commit SHA
  repo: string;                     // 仓库
  timestamp: number;                // 时间戳
  evaluator: string;                // 评估者地址
}
```

### 4. 认证系统

#### GitHub OAuth 认证流程

**1. 发起认证：** `src/app/api/auth/github/route.ts`
```typescript
// GET /api/auth/github
// - 构建 GitHub OAuth URL
// - 重定向到 GitHub 授权页面
// - 传递 client_id、redirect_uri、scope 等参数
```

**2. 回调处理：** `src/app/auth/callback/page.tsx`
```typescript
// 接收 GitHub 回调：
// - 获取 authorization code
// - 调用 Supabase Auth signInWithOAuth
// - 创建会话
// - 跳转到主页或原页面
```

**3. 会话管理：** `src/hooks/use-auth.ts`
```typescript
export function useAuth() {
  return {
    user: User | null,              // 当前用户
    session: Session | null,        // 会话信息
    isAuthenticated: boolean,       // 是否已认证
    loading: boolean,              // 加载状态
    signOut: () => Promise<void>,  // 退出登录
  }
}
```

**4. 用户信息：** `src/app/api/auth/user/route.ts`
```typescript
// GET /api/auth/user
// 返回当前用户信息：
{
  user: {
    id: string,
    email: string,
    user_metadata: {
      avatar_url: string,
      full_name: string,
      user_name: string,  // GitHub username
      // ...更多 GitHub 信息
    }
  },
  session: {
    access_token: string,
    refresh_token: string,
    expires_at: number,
  }
}
```

### 5. 贡献管理系统

#### 数据流程

**1. GitHub Webhook：** `src/app/api/github/webhook/route.ts`
```typescript
// POST /api/github/webhook
// 监听 GitHub 事件：
// - push: 代码推送
// - pull_request: PR 创建/更新
// - commit_comment: Commit 评论
// 
// 处理流程：
// 1. 验证 GitHub 签名
// 2. 解析 webhook payload
// 3. 提取贡献信息（仓库、commit、作者等）
// 4. 存储到 Supabase 数据库
```

**2. 贡献列表：** `src/app/api/contributions/my/route.ts`
```typescript
// GET /api/contributions/my
// 获取当前用户的所有贡献
// 
// 返回格式：
{
  data: [
    {
      id: string,
      title: string,
      description: string,
      repository: { fullName: string },
      metadata: { sha: string },
      score: number,           // 可选：如果已评分
      scoreBreakdown: {...},   // 可选：评分详情
      eligibility: string,     // 可选：是否可上链
      createdAt: string,
      status: string,          // pending, scored, minted
    }
  ]
}
```

**3. 评分系统：** `src/lib/services/scoring.service.ts`
```typescript
// 多维度评分系统：
interface ScoreBreakdown {
  codeQuality: number;      // 代码质量 (0-30)
  impact: number;           // 影响力 (0-25)
  complexity: number;       // 复杂度 (0-20)
  documentation: number;    // 文档完整性 (0-15)
  testing: number;         // 测试覆盖 (0-10)
}

// 总分 = sum(各维度分数)，满分 100
```

**4. 贡献详情页：** `src/app/erc8004/validate/[id]/page.tsx`
```typescript
// 显示单个贡献的详细信息：
// - 基本信息（标题、描述、仓库）
// - 评分详情（各维度分数）
// - 验证状态
// - 上链操作（如果符合条件）
```

#### 贡献状态机

```
pending (待评分)
    ↓ (AI 评分)
scored (已评分)
    ↓ (人工验证/签名)
validated (已验证)
    ↓ (上链铸造)
minted (已铸造)
```

### 6. 页面结构

#### 首页：`src/app/page.tsx`
```typescript
// 着陆页，包含以下模块：
// - HeaderSimple: 简洁头部（导航、连接钱包）
// - HeroSectionGVC: 主视觉区（大标题、CTA）
// - WhatSection: 产品介绍
// - AboutSection: 关于我们
// - FAQSection: 常见问题
// - JoinUs: 加入我们
// - FooterSimple: 页脚
```

**设计风格：**
- 使用 Neobrutalism（新粗野主义）设计风格
- 粗黑边框（`border-[3px] border-black`）
- 突出阴影（`shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]`）
- 明亮色彩（黄色、蓝色、绿色）
- 米黄色背景（`bg-[#F5F1E8]`）

#### ERC-8004 贡献页：`src/app/erc8004/contributions/page.tsx`
```typescript
// 用户的贡献管理中心：
// 
// 功能模块：
// 1. 身份检查
//    - 检查是否连接钱包
//    - 检查是否 GitHub 登录
//    - 检查是否注册为代理
// 
// 2. 声誉展示
//    - 总分
//    - 反馈次数
//    - 平均分
// 
// 3. 贡献列表
//    - 显示所有贡献
//    - 状态标签（待评分/已评分/可上链/已铸造）
//    - 评分显示
//    - 点击进入详情页
```

**状态检查流程：**
```
1. 检查 isAuthenticated (GitHub 登录)
   ↓ 否 → 显示"使用 GitHub 登录"按钮
   ↓ 是
2. 检查 isConnected (钱包连接)
   ↓ 否 → 显示"连接钱包"按钮
   ↓ 是
3. 检查 isRegistered (代理注册)
   ↓ 否 → 弹出注册模态框
   ↓ 是
4. 加载贡献列表和声誉数据
```

#### 验证页面：`src/app/erc8004/validate/[id]/page.tsx`
```typescript
// 贡献验证和上链页面：
// 
// 显示内容：
// - 贡献基本信息
// - 代码差异（diff）
// - 评分详情（各维度分数）
// - 验证证据（测试结果、Linter 报告）
// 
// 操作按钮：
// - 签名验证（为贡献签名）
// - 上链铸造（铸造 NFT）
// - 分享到社交媒体
```

### 7. 数据库架构

#### Supabase 表结构

**users 表**
```sql
CREATE TABLE users (
  id uuid PRIMARY KEY,
  github_id text UNIQUE NOT NULL,
  github_username text NOT NULL,
  email text,
  avatar_url text,
  wallet_address text,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);
```

**repositories 表**
```sql
CREATE TABLE repositories (
  id uuid PRIMARY KEY,
  full_name text UNIQUE NOT NULL,  -- owner/repo
  description text,
  url text,
  language text,
  stars integer,
  forks integer,
  created_at timestamp DEFAULT now()
);
```

**contributions 表**
```sql
CREATE TABLE contributions (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES users(id),
  repository_id uuid REFERENCES repositories(id),
  title text NOT NULL,
  description text,
  commit_sha text NOT NULL,
  commit_url text,
  diff_url text,
  additions integer,
  deletions integer,
  files_changed integer,
  
  -- 评分相关
  score integer,                    -- 总分 0-100
  score_breakdown jsonb,            -- 各维度分数
  eligibility text,                 -- eligible/not_eligible
  
  -- 验证相关
  feedback_hash text,               -- ERC-8004 feedback hash
  signature text,                   -- 评估者签名
  metadata_uri text,                -- IPFS URI
  
  -- 状态
  status text DEFAULT 'pending',    -- pending/scored/validated/minted
  
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);
```

**validations 表**
```sql
CREATE TABLE validations (
  id uuid PRIMARY KEY,
  contribution_id uuid REFERENCES contributions(id),
  validator_address text NOT NULL,
  signature text NOT NULL,
  timestamp bigint NOT NULL,
  nonce bigint NOT NULL,
  created_at timestamp DEFAULT now()
);
```

#### 数据访问层：`src/lib/database/repositories/`

**contribution.repository.ts**
```typescript
export class ContributionRepository {
  // 创建贡献记录
  static async create(data: CreateContributionData): Promise<Contribution>
  
  // 获取用户的贡献
  static async findByUserId(userId: string): Promise<Contribution[]>
  
  // 获取单个贡献
  static async findById(id: string): Promise<Contribution | null>
  
  // 更新评分
  static async updateScore(id: string, score: number, breakdown: ScoreBreakdown)
  
  // 更新验证信息
  static async updateValidation(id: string, signature: string, metadataUri: string)
  
  // 更新状态
  static async updateStatus(id: string, status: string)
}
```

### 8. 服务层

#### `src/lib/services/github.service.ts` - GitHub 服务
```typescript
export class GitHubService {
  // 获取用户信息
  static async getUserInfo(accessToken: string): Promise<GitHubUser>
  
  // 获取用户仓库
  static async getUserRepos(accessToken: string): Promise<Repository[]>
  
  // 获取 Commit 详情
  static async getCommit(owner: string, repo: string, sha: string): Promise<Commit>
  
  // 获取 PR 详情
  static async getPullRequest(owner: string, repo: string, number: number): Promise<PullRequest>
  
  // 解析 Webhook Payload
  static parseWebhookPayload(event: string, payload: any): ContributionData
}
```

#### `src/lib/services/blockchain.service.ts` - 区块链服务
```typescript
export class BlockchainService {
  // 获取合约实例
  static getContract(address: string, abi: any, signerOrProvider): Contract
  
  // 检查代理注册状态
  static async isAgentRegistered(address: string): Promise<boolean>
  
  // 注册代理
  static async registerAgent(githubUsername: string, agentCardURI: string, signer): Promise<Transaction>
  
  // 提交反馈到链上
  static async submitFeedback(feedback: ERC8004Feedback, signature: string, signer): Promise<Transaction>
  
  // 查询声誉
  static async getReputation(address: string): Promise<Reputation>
  
  // 铸造 NFT
  static async mintNFT(to: string, tokenURI: string, signer): Promise<Transaction>
}
```

#### `src/lib/services/scoring.service.ts` - 评分服务
```typescript
export class ScoringService {
  // 计算贡献评分
  static async scoreContribution(contribution: Contribution): Promise<ScoreResult>
  
  // 各维度评分方法
  static scoreCodeQuality(diff: string, linterReport: any): number
  static scoreImpact(additions: number, deletions: number, filesChanged: number): number
  static scoreComplexity(diff: string, language: string): number
  static scoreDocumentation(diff: string): number
  static scoreTesting(testFiles: string[]): number
  
  // 判断是否符合上链条件
  static checkEligibility(score: number, breakdown: ScoreBreakdown): string
}
```

**评分规则：**

1. **代码质量** (0-30)
   - Linter 错误数量
   - 代码风格一致性
   - 潜在 Bug 数量

2. **影响力** (0-25)
   - 修改行数（增加 + 删除）
   - 修改文件数
   - 是否修改核心文件

3. **复杂度** (0-20)
   - 代码复杂度（循环、条件分支）
   - 函数长度
   - 嵌套深度

4. **文档** (0-15)
   - 是否有注释
   - README 更新
   - API 文档更新

5. **测试** (0-10)
   - 是否包含测试
   - 测试覆盖率
   - 测试质量

**上链条件：**
- 总分 >= 60
- 代码质量 >= 15
- 至少三个维度 >= 10

### 9. 组件库

#### 核心组件

**1. RegisterAgentModal** - 代理注册模态框
```typescript
// src/components/erc8004/RegisterAgentModal.tsx
// 
// 功能：
// - 显示注册表单
// - 获取 GitHub 用户名
// - 调用 registerAgent hook
// - 显示注册进度和结果
```

**2. ReputationBadge** - 声誉徽章
```typescript
// src/components/erc8004/ReputationBadge.tsx
// 
// 显示内容：
// - 总分（大号数字）
// - 反馈次数
// - 平均分
// - 等级图标（根据分数）
```

**3. HeaderSimple** - 简洁头部
```typescript
// src/components/header-simple.tsx
// 
// 包含：
// - Logo
// - 导航链接（首页、贡献、文档）
// - 连接钱包按钮（集成 RainbowKit）
// - 用户菜单（已登录时）
```

**4. CollectionCard** - NFT 卡片
```typescript
// src/components/collection-card.tsx
// 
// 显示：
// - NFT 图片/封面
// - 标题和描述
// - 元数据（仓库、评分、时间）
// - 操作按钮（查看详情、分享）
```

### 10. 状态管理

#### Context Providers 层次结构

```
<RainbowKitProvider>        # 钱包连接
  <WagmiProvider>           # Wagmi 配置
    <QueryClientProvider>   # React Query
      <RKProvider>          # RainbowKit UI
        <Web3Provider>      # Web3 状态
          <App />           # 应用内容
          <Toaster />       # 全局通知
        </Web3Provider>
      </RKProvider>
    </QueryClientProvider>
  </WagmiProvider>
</RainbowKitProvider>
```

#### 状态流转

**钱包连接状态：**
```
未连接 → 连接中 → 已连接 → 已验证
  ↓         ↓         ↓         ↓
  -      Loading   address   signer
```

**贡献状态：**
```
创建 → 待评分 → 已评分 → 已验证 → 已铸造
 ↓       ↓        ↓        ↓        ↓
创建   AI评分   人工验证   链上签名   NFT铸造
```

**用户认证状态：**
```
未登录 → GitHub授权 → 创建会话 → 已登录
  ↓         ↓           ↓         ↓
  -     OAuth Flow   Token    Authenticated
```

### 11. API 路由设计

#### 认证相关
- `GET /api/auth/github` - 发起 GitHub OAuth
- `GET /api/auth/user` - 获取当前用户
- `POST /api/auth/logout` - 退出登录

#### 贡献相关
- `GET /api/contributions/my` - 获取我的贡献
- `GET /api/contributions/[id]` - 获取贡献详情
- `POST /api/contributions/[id]/sign` - 签名验证贡献
- `POST /api/contributions` - 创建贡献（仅限 webhook）

#### GitHub 集成
- `POST /api/github/webhook` - GitHub Webhook 回调

#### IPFS 相关
- `POST /api/ipfs/upload` - 上传元数据到 IPFS

#### 健康检查
- `GET /api/health` - API 健康检查

### 12. 环境变量配置

```bash
# .env 文件

# Next.js
NEXT_PUBLIC_APP_URL=http://localhost:3000

# 区块链
NEXT_PUBLIC_CHAIN_ID=31337
NEXT_PUBLIC_RPC_URL=http://127.0.0.1:8545

# 合约地址
NEXT_PUBLIC_IDENTITY_REGISTRY_ADDRESS=0x...
NEXT_PUBLIC_REPUTATION_REGISTRY_ADDRESS=0x...
NEXT_PUBLIC_VALIDATION_REGISTRY_ADDRESS=0x...
NEXT_PUBLIC_COMMIT_NFT_ADDRESS=0x...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# GitHub OAuth
GITHUB_CLIENT_ID=xxx
GITHUB_CLIENT_SECRET=xxx
GITHUB_REDIRECT_URI=http://localhost:3000/auth/callback

# GitHub Webhook
GITHUB_WEBHOOK_SECRET=xxx

# IPFS
IPFS_API_URL=https://ipfs.infura.io:5001
IPFS_GATEWAY_URL=https://ipfs.io/ipfs/

# 评估者（用于签名）
EVALUATOR_PRIVATE_KEY=0x...
NEXT_PUBLIC_EVALUATOR_ADDRESS=0x...

# Redis（可选）
REDIS_URL=redis://localhost:6379
```

### 13. 开发工作流

#### 本地开发
```bash
# 安装依赖
npm install

# 启动开发服务器（使用 Turbopack）
npm run dev

# 访问 http://localhost:3000
```

#### 构建生产版本
```bash
# 构建（使用 Turbopack）
npm run build

# 启动生产服务器
npm start
```

#### Storybook 开发
```bash
# 启动 Storybook
npm run storybook

# 访问 http://localhost:6006

# 构建 Storybook 静态站点
npm run build-storybook
```

#### 代码检查
```bash
# 运行 ESLint
npm run lint
```

### 14. 关键技术实现

#### EIP-712 结构化签名

```typescript
// 1. 定义域分隔符（Domain Separator）
const domain = {
  name: 'LightCommit Reputation',
  version: '1',
  chainId: 31337,
  verifyingContract: '0x...',  // ReputationRegistry 地址
};

// 2. 定义类型（Types）
const types = {
  Feedback: [
    { name: 'contributor', type: 'address' },
    { name: 'repo', type: 'string' },
    { name: 'commitSha', type: 'string' },
    { name: 'score', type: 'uint256' },
    { name: 'feedbackHash', type: 'bytes32' },
    { name: 'timestamp', type: 'uint256' },
    { name: 'nonce', type: 'uint256' },
  ],
};

// 3. 定义值（Value）
const value = {
  contributor: '0x123...',
  repo: 'owner/repo',
  commitSha: 'abc123...',
  score: 85,
  feedbackHash: '0xdef...',
  timestamp: Date.now(),
  nonce: 1,
};

// 4. 签名
const signature = await signer.signTypedData(domain, types, value);

// 5. 验证签名
const recoveredAddress = ethers.verifyTypedData(domain, types, value, signature);
```

#### IPFS 元数据上传

```typescript
// 1. 准备元数据
const metadata = {
  score: 85,
  breakdown: {
    codeQuality: 25,
    impact: 20,
    complexity: 18,
    documentation: 12,
    testing: 10,
  },
  evidence: {
    diffUrl: 'https://github.com/owner/repo/commit/abc123.diff',
    testResults: 'All tests passed',
    linterReport: 'No errors',
  },
  commit: 'abc123...',
  repo: 'owner/repo',
  timestamp: Date.now(),
  evaluator: '0x...',
};

// 2. 转换为 JSON
const metadataJSON = JSON.stringify(metadata, null, 2);

// 3. 上传到 IPFS
const response = await fetch('/api/ipfs/upload', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ content: metadataJSON }),
});

const { ipfsHash } = await response.json();
const metadataURI = `ipfs://${ipfsHash}`;

// 4. 存储 URI 到数据库
await ContributionRepository.updateValidation(contributionId, signature, metadataURI);
```

#### RainbowKit 与 Ethers.js 适配

```typescript
// Wagmi 使用 viem，需要转换为 Ethers.js 格式

// 1. PublicClient -> Provider
export function publicClientToProvider(publicClient: PublicClient) {
  const { chain, transport } = publicClient;
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  };
  
  return new ethers.BrowserProvider(
    transport,
    network,
  );
}

// 2. WalletClient -> Signer
export function walletClientToSigner(walletClient: WalletClient) {
  const { account, chain, transport } = walletClient;
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  };
  
  const provider = new ethers.BrowserProvider(transport, network);
  return provider.getSigner(account.address);
}
```

### 15. 性能优化

#### 代码分割
```typescript
// 动态导入组件，减少初始加载
const RegisterAgentModal = dynamic(
  () => import('@/components/erc8004/RegisterAgentModal'),
  { ssr: false }
);
```

#### 图片优化
```typescript
// 使用 Next.js Image 组件
import Image from 'next/image';

<Image
  src="/assets/logo.png"
  alt="Logo"
  width={200}
  height={50}
  priority  // 优先加载
/>
```

#### 缓存策略
```typescript
// API 路由缓存
export const revalidate = 60;  // 60 秒后重新验证

// React Query 缓存
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,  // 5 分钟
      cacheTime: 1000 * 60 * 10,  // 10 分钟
    },
  },
});
```

#### 并发请求
```typescript
// 并行获取多个数据
const [contributions, reputation, profile] = await Promise.all([
  fetch('/api/contributions/my'),
  fetch('/api/reputation'),
  fetch('/api/profile'),
]);
```

### 16. 错误处理

#### 全局错误边界
```typescript
// src/app/error.tsx
'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="error-container">
      <h2>出错了！</h2>
      <p>{error.message}</p>
      <button onClick={reset}>重试</button>
    </div>
  );
}
```

#### API 错误处理
```typescript
// API 路由统一错误处理
export async function GET(request: Request) {
  try {
    // 业务逻辑
    const data = await fetchData();
    return Response.json({ success: true, data });
  } catch (error) {
    console.error('API Error:', error);
    return Response.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
```

#### 合约交互错误处理
```typescript
try {
  const tx = await contract.registerAgent(username, agentCardURI);
  await tx.wait();
  toast.success('注册成功！');
} catch (error: any) {
  if (error.code === 'ACTION_REJECTED') {
    toast.error('用户取消了交易');
  } else if (error.code === 'INSUFFICIENT_FUNDS') {
    toast.error('余额不足');
  } else {
    toast.error(`交易失败: ${error.message}`);
  }
  console.error('Contract error:', error);
}
```

### 17. 安全措施

#### 1. 环境变量保护
```typescript
// 敏感信息只在服务端使用
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;  // 仅服务端
const NEXT_PUBLIC_APP_URL = process.env.NEXT_PUBLIC_APP_URL;     // 客户端可用
```

#### 2. API 路由认证
```typescript
// 验证请求是否已认证
export async function GET(request: Request) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const session = await verifyToken(token);
  if (!session) {
    return Response.json({ error: 'Invalid token' }, { status: 401 });
  }
  
  // 继续处理
}
```

#### 3. Webhook 签名验证
```typescript
// 验证 GitHub Webhook 签名
import crypto from 'crypto';

function verifyGitHubSignature(payload: string, signature: string): boolean {
  const secret = process.env.GITHUB_WEBHOOK_SECRET!;
  const hmac = crypto.createHmac('sha256', secret);
  const digest = 'sha256=' + hmac.update(payload).digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(digest)
  );
}
```

#### 4. XSS 防护
```typescript
// React 自动转义内容，但需注意 dangerouslySetInnerHTML
// 使用 DOMPurify 清理 HTML
import DOMPurify from 'dompurify';

const sanitizedHTML = DOMPurify.sanitize(userInput);
<div dangerouslySetInnerHTML={{ __html: sanitizedHTML }} />
```

#### 5. CSRF 防护
```typescript
// Next.js 自动处理 CSRF，但 API 路由需要额外保护
// 使用 SameSite Cookie 和 CSRF Token
```

### 18. 测试策略

#### 单元测试（推荐使用 Jest）
```typescript
// __tests__/hooks/use-agent-registry.test.ts
describe('useAgentRegistry', () => {
  it('should check registration status', async () => {
    // 测试逻辑
  });
  
  it('should register agent successfully', async () => {
    // 测试逻辑
  });
});
```

#### 集成测试（推荐使用 Playwright）
```typescript
// tests/e2e/agent-registration.spec.ts
test('complete agent registration flow', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.click('button:has-text("连接钱包")');
  // ... 更多测试步骤
});
```

#### 组件测试（Storybook + Testing Library）
```typescript
// src/components/erc8004/RegisterAgentModal.stories.tsx
export const Default: Story = {
  args: {
    isOpen: true,
    onClose: () => {},
    onSuccess: () => {},
  },
};
```

### 19. 部署指南

#### Vercel 部署（推荐）
```bash
# 1. 安装 Vercel CLI
npm i -g vercel

# 2. 登录
vercel login

# 3. 部署
vercel

# 4. 生产部署
vercel --prod
```

#### 环境变量配置
```bash
# 在 Vercel 项目设置中添加所有环境变量
# Settings -> Environment Variables

# 关键变量：
# - NEXT_PUBLIC_* (客户端可见)
# - SUPABASE_* (服务端私有)
# - GITHUB_* (服务端私有)
```

#### 自定义域名
```bash
# 在 Vercel 项目设置中添加
# Settings -> Domains
```

### 20. 总结

LightCommit 前端是一个功能完整的 Web3 应用，具备以下特点：

**核心优势：**
1. **现代化技术栈**：Next.js 15 + React 19 + TypeScript
2. **完整的 Web3 集成**：RainbowKit + Wagmi + Ethers.js
3. **ERC-8004 协议实现**：链上声誉系统
4. **GitHub 深度集成**：OAuth 认证 + Webhook 自动同步
5. **美观的 UI 设计**：Neobrutalism 风格
6. **完善的数据管理**：Supabase 数据库 + Redis 缓存
7. **多维度评分系统**：AI + 人工验证
8. **IPFS 存储**：去中心化元数据存储

**主要功能模块：**
- 钱包连接与管理
- GitHub 认证与同步
- 代理身份注册
- 贡献管理与评分
- 链上验证与签名
- NFT 铸造
- 声誉查询与展示

**未来扩展方向：**
- 移动端适配（响应式设计）
- 多链支持（Polygon、Arbitrum 等）
- 社交功能（评论、点赞、分享）
- 数据分析（贡献趋势、排行榜）
- AI 增强评分（GPT-4 代码审查）
- 去中心化存储（IPFS、Arweave）
