# frontend/src/lib 目录详解

本文档详细解释 `frontend/src/lib` 目录下所有文件的功能、作用和使用方式。

## 目录结构总览

```
lib/
├── api.ts                          # HTTP 客户端与 API 封装
├── auth/                           # 认证相关
│   └── session.ts                  # JWT Session 管理
├── config/                         # 配置管理
│   └── index.ts                    # 环境变量与配置获取
├── contexts/                       # React Context 全局状态
│   ├── RainbowKitProvider.tsx     # RainbowKit/Wagmi 配置
│   └── Web3Context.tsx            # Web3 连接状态封装
├── contracts/                      # 智能合约 ABI
│   ├── AgentIdentityRegistry.json # 代理身份注册合约 ABI
│   ├── CommitNFT.json             # CommitNFT 合约 ABI
│   ├── ReputationRegistry.json    # 信誉注册合约 ABI
│   ├── ValidationRegistry.json    # 验证注册合约 ABI
│   └── index.ts                   # ABI 导出文件
├── database/                       # 数据库访问层
│   ├── index.ts                   # 数据库查询统一接口
│   ├── supabase.ts                # Supabase 服务封装
│   ├── migrations/                # 数据库迁移脚本
│   └── repositories/              # Repository 模式（数据访问对象）
│       ├── contribution.repository.ts  # 贡献数据访问
│       ├── repository.repository.ts    # 仓库数据访问
│       └── user.repository.ts          # 用户数据访问
├── hooks/                          # 自定义 React Hooks
│   └── useContract.ts             # 合约交互 Hook
├── services/                       # 业务逻辑服务层
│   ├── auth.service.ts            # 认证服务
│   ├── blockchain.service.ts      # 区块链交互服务
│   ├── contract.service.ts        # 合约服务
│   ├── contribution.service.ts    # 贡献业务逻辑
│   ├── erc8004.service.ts         # ERC8004 标准服务
│   ├── github.service.ts          # GitHub API 服务
│   └── scoring.service.ts         # 贡献评分服务
├── supabase/                       # Supabase 客户端
│   ├── client.ts                  # 浏览器端客户端
│   ├── server.ts                  # 服务端客户端
│   ├── service.ts                 # Service Role 客户端
│   └── middleware.ts              # 中间件配置
└── utils/                          # 工具函数
    └── ...
```

---

## 1. api.ts - HTTP 客户端与 API 封装

### 功能
统一的 HTTP 客户端，基于 Axios 封装，提供：
- 自动添加认证 Token
- 统一错误处理（401 自动登出）
- API 方法封装（认证、贡献、健康检查）

### 核心代码解析

```typescript
// 创建 Axios 实例
export const apiClient = axios.create({
  baseURL: API_BASE_URL,  // 默认 http://localhost:3000/api
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器：自动添加 Token
apiClient.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;  // 添加认证头
  }
  return config;
});

// 响应拦截器：统一处理 401 错误
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {  // 未授权
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');   // 清除本地 token
        window.location.href = '/';         // 重定向到首页
      }
    }
    return Promise.reject(error);
  },
);
```

### API 方法封装

#### 认证 API
```typescript
export const authApi = {
  // GitHub 登录（重定向）
  githubLogin: () => {
    window.location.href = `${API_BASE_URL}/auth/github`;
  },

  // 获取当前用户信息
  getProfile: async () => {
    const response = await apiClient.get('/auth/user');
    return response.data;
  },
};
```

#### 贡献 API
```typescript
export const contributionsApi = {
  // 获取所有贡献（支持过滤）
  getAll: async (params?: {
    type?: string;         // 贡献类型：commit, pull_request, issue
    status?: string;       // 状态：pending, scored, minted
    userId?: string;       // 用户 ID
    repositoryId?: string; // 仓库 ID
  }) => {
    const response = await apiClient.get('/contributions', { params });
    return response.data;
  },

  // 获取单个贡献
  getOne: async (id: string) => {
    const response = await apiClient.get(`/contributions/${id}`);
    return response.data;
  },

  // 获取当前用户的贡献
  getMy: async () => {
    const response = await apiClient.get('/contributions/my');
    return response.data;
  },

  // 获取统计信息
  getStats: async (userId?: string) => {
    const response = await apiClient.get('/contributions/stats', {
      params: { userId },
    });
    return response.data;
  },
};
```

### 使用示例
```typescript
import { authApi, contributionsApi } from '@/lib/api';

// 登录
authApi.githubLogin();

// 获取贡献列表
const contributions = await contributionsApi.getAll({ status: 'pending' });

// 获取我的贡献
const myContributions = await contributionsApi.getMy();
```

---

## 2. auth/session.ts - JWT Session 管理

### 功能
完整的 JWT Session 管理工具，包括：
- 创建 JWT Token
- 验证 JWT Token
- 从 Cookies 读取/设置 Session
- 获取 GitHub 用户信息

### Session 数据结构
```typescript
export interface SessionData {
  user: {
    id: number;              // GitHub 用户 ID
    login: string;           // GitHub 用户名
    name: string | null;     // GitHub 显示名
    email: string | null;    // GitHub 邮箱
    avatar_url: string;      // GitHub 头像
  };
  accessToken: string;       // GitHub access_token（用于调用 GitHub API）
  createdAt: number;         // Session 创建时间戳
  expiresAt: number;         // Session 过期时间戳
}
```

### 核心功能

#### 1. 创建 Session
```typescript
export async function createSession(sessionData: SessionData): Promise<string> {
  // 使用 jose 库创建 JWT
  const token = await new SignJWT({ ...sessionData })
    .setProtectedHeader({ alg: 'HS256' })                    // 使用 HS256 算法
    .setIssuedAt()                                            // 设置签发时间
    .setExpirationTime(`${SESSION_CONFIG.maxAge}s`)          // 设置过期时间（30 天）
    .sign(SESSION_CONFIG.secret);                            // 使用密钥签名

  return token;
}
```

#### 2. 验证 Session
```typescript
export async function verifySession(token: string): Promise<SessionData | null> {
  try {
    // 使用 jose 库验证 JWT
    const { payload } = await jwtVerify(token, SESSION_CONFIG.secret);
    return payload as unknown as SessionData;
  } catch (error) {
    console.error('JWT 验证失败:', error);
    return null;  // JWT 无效或过期
  }
}
```

#### 3. 设置 Session Cookie
```typescript
export async function setSessionCookie(sessionData: SessionData): Promise<void> {
  // 1. 创建 JWT token
  const token = await createSession(sessionData);

  // 2. 设置 cookie
  const cookieStore = await cookies();
  cookieStore.set(SESSION_CONFIG.cookieName, token, {
    httpOnly: true,                                // 仅服务端可访问（防止 XSS）
    secure: process.env.NODE_ENV === 'production', // 生产环境强制 HTTPS
    sameSite: 'lax',                               // CSRF 防护
    maxAge: SESSION_CONFIG.maxAge,                 // 过期时间（30 天）
    path: '/',                                     // 全站可用
  });
}
```

#### 4. 获取 Session
```typescript
export async function getSession(): Promise<SessionData | null> {
  // 1. 从 cookies 中读取 token
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_CONFIG.cookieName)?.value;

  // 2. 如果没有 token，返回 null
  if (!token) {
    return null;
  }

  // 3. 验证 token 并返回 Session 数据
  return await verifySession(token);
}
```

### 使用示例
```typescript
import { getSession, setSessionCookie, clearSessionCookie } from '@/lib/auth/session';

// 服务端：获取当前 Session
const session = await getSession();
if (session) {
  console.log('当前用户:', session.user.login);
}

// 服务端：设置 Session
await setSessionCookie({
  user: { id: 123, login: 'user', name: 'User', email: 'user@example.com', avatar_url: '' },
  accessToken: 'gho_xxxxx',
  createdAt: Date.now(),
  expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
});

// 服务端：清除 Session
await clearSessionCookie();
```

---

## 3. config/index.ts - 配置管理

### 功能
统一管理所有环境变量和配置，包括：
- 数据库配置
- GitHub OAuth 配置
- JWT 配置
- 区块链配置（合约地址、RPC URL）
- IPFS 配置
- Supabase 配置

### 配置类型定义
```typescript
export interface AppConfig {
  port: number;              // 服务端口
  nodeEnv: string;           // 环境：development/production
  database: DatabaseConfig;  // 数据库配置
  github: GitHubConfig;      // GitHub OAuth 配置
  jwt: JwtConfig;            // JWT 配置
  blockchain: BlockchainConfig;  // 区块链配置
  ipfs: IpfsConfig;          // IPFS 配置
  supabase: SupabaseConfig;  // Supabase 配置
}

export interface BlockchainConfig {
  rpcUrl?: string;                 // RPC URL
  privateKey?: string;             // 部署/交互私钥
  contractAddress?: string;        // CommitNFT 合约地址
  chainId: number;                 // 链 ID
  identityRegistry: string;        // AgentIdentityRegistry 地址
  reputationRegistry: string;      // ReputationRegistry 地址
  validationRegistry: string;      // ValidationRegistry 地址
  commitNFT: string;               // CommitNFT 地址
}
```

### 使用示例
```typescript
import { getBlockchainConfig, getGitHubConfig } from '@/lib/config';

// 获取区块链配置
const blockchainConfig = getBlockchainConfig();
console.log('RPC URL:', blockchainConfig.rpcUrl);
console.log('CommitNFT Address:', blockchainConfig.commitNFT);

// 获取 GitHub 配置
const githubConfig = getGitHubConfig();
console.log('GitHub Client ID:', githubConfig.clientId);
```

---

## 4. contexts/ - React Context 全局状态

### 4.1 RainbowKitProvider.tsx

**功能：** 配置 RainbowKit 和 Wagmi，提供钱包连接能力。

```typescript
import { WagmiProvider, createConfig, http } from 'wagmi';
import { RainbowKitProvider as RKProvider } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// 定义链配置（示例：Hardhat 本地链）
const hardhatLocal = defineChain({
  id: 31337,
  name: 'Hardhat Local',
  nativeCurrency: { decimals: 18, name: 'Ethereum', symbol: 'ETH' },
  rpcUrls: { default: { http: ['http://127.0.0.1:8545'] } },
  testnet: true,
});

// 创建 Wagmi 配置
const config = createConfig({
  chains: [hardhatLocal],
  transports: {
    [hardhatLocal.id]: http('http://127.0.0.1:8545'),
  },
  connectors: [
    injected({ shimDisconnect: true }),  // MetaMask 连接器
  ],
});

// React Query 客户端
const queryClient = new QueryClient();

// Provider 组件
export function RainbowKitProvider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RKProvider modalSize="compact">
          {children}
        </RKProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
```

**使用方式：** 在 `app/layout.tsx` 中包裹整个应用：
```typescript
import { RainbowKitProvider } from '@/lib/contexts/RainbowKitProvider';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <RainbowKitProvider>
          {children}
        </RainbowKitProvider>
      </body>
    </html>
  );
}
```

### 4.2 Web3Context.tsx

**功能：** 封装 Wagmi hooks，提供统一的 Web3 接口。

```typescript
import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain } from 'wagmi';

interface Web3ContextType {
  address: string | undefined;           // 钱包地址
  isConnected: boolean;                  // 是否已连接钱包
  chainId: number | undefined;           // 当前链 ID
  isCorrectNetwork: boolean;             // 是否在正确的网络
  connect: () => void;                   // 连接钱包
  disconnect: () => void;                // 断开钱包
  switchNetwork: (chainId: number) => void;  // 切换网络
}

export function Web3Provider({ children }) {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  const connectWallet = () => {
    const injected = connectors.find(c => c.type === 'injected');
    if (injected) {
      connect({ connector: injected });
    }
  };

  const switchNetwork = (targetChainId: number) => {
    switchChain({ chainId: targetChainId });
  };

  return (
    <Web3Context.Provider value={{
      address,
      isConnected,
      chainId,
      isCorrectNetwork: chainId === parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '31337'),
      connect: connectWallet,
      disconnect,
      switchNetwork,
    }}>
      {children}
    </Web3Context.Provider>
  );
}

// 使用 Hook
export function useWeb3() {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
}
```

**使用示例：**
```typescript
import { useWeb3 } from '@/lib/contexts/Web3Context';

function MyComponent() {
  const { address, isConnected, connect, disconnect } = useWeb3();

  if (!isConnected) {
    return <button onClick={connect}>连接钱包</button>;
  }

  return (
    <div>
      <p>已连接: {address}</p>
      <button onClick={disconnect}>断开连接</button>
    </div>
  );
}
```

---

## 5. contracts/ - 智能合约 ABI

### 目录结构
```
contracts/
├── AgentIdentityRegistry.json  # 代理身份注册合约 ABI
├── CommitNFT.json              # CommitNFT 合约 ABI
├── ReputationRegistry.json     # 信誉注册合约 ABI
├── ValidationRegistry.json     # 验证注册合约 ABI
└── index.ts                    # 统一导出
```

### index.ts - 统一导出
```typescript
import AgentIdentityRegistryABI from './AgentIdentityRegistry.json';
import ReputationRegistryABI from './ReputationRegistry.json';
import ValidationRegistryABI from './ValidationRegistry.json';
import CommitNFTABI from './CommitNFT.json';

export {
  AgentIdentityRegistryABI,
  ReputationRegistryABI,
  ValidationRegistryABI,
  CommitNFTABI,
};

export const ABIS = {
  AgentIdentityRegistry: AgentIdentityRegistryABI,
  ReputationRegistry: ReputationRegistryABI,
  ValidationRegistry: ValidationRegistryABI,
  CommitNFT: CommitNFTABI,
} as const;
```

### 使用示例
```typescript
import { CommitNFTABI } from '@/lib/contracts';
import { ethers } from 'ethers';

// 使用 ethers.js
const contract = new ethers.Contract(
  process.env.NEXT_PUBLIC_COMMIT_NFT_ADDRESS!,
  CommitNFTABI,
  signer
);

// 调用方法
const tx = await contract.mintCommit(toAddress, commitData, metadataURI);
await tx.wait();

// 使用 wagmi
import { useReadContract } from 'wagmi';

const { data: totalSupply } = useReadContract({
  address: process.env.NEXT_PUBLIC_COMMIT_NFT_ADDRESS!,
  abi: CommitNFTABI,
  functionName: 'totalSupply',
});
```

---

## 6. database/ - 数据库访问层

### 6.1 index.ts - 统一查询接口

**功能：** 提供统一的数据库查询接口，兼容 PostgreSQL 的 QueryResult 格式。

```typescript
// 查询结果接口
export interface QueryResult<T = any> {
  rows: T[];           // 查询结果行
  rowCount: number;    // 结果行数
  command: string;     // SQL 命令（SELECT/INSERT/UPDATE/DELETE）
  oid: number;         // 对象 ID
  fields: any[];       // 字段信息
}

// 执行查询
export const query = async <T = any>(text: string, params?: unknown[]): Promise<QueryResult<T>> => {
  const start = Date.now();

  try {
    const supabaseService = getSupabaseService();
    const result = await supabaseService.query(text, params);

    // 转换为标准 QueryResult 格式
    const res: QueryResult<T> = {
      rows: Array.isArray(result) ? result : (result ? [result] : []),
      rowCount: Array.isArray(result) ? result.length : (result ? 1 : 0),
      command: text.trim().split(' ')[0].toUpperCase(),
      oid: 0,
      fields: [],
    };

    const duration = Date.now() - start;
    console.log('Executed query', { duration, rows: res.rowCount });

    return res;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

// 数据库健康检查
export const healthCheck = async (): Promise<boolean> => {
  try {
    const supabaseService = getSupabaseService();
    const healthResult = await supabaseService.healthCheck();
    return healthResult.status === 'healthy';
  } catch (error) {
    console.error('数据库健康检查失败:', error);
    return false;
  }
};
```

### 6.2 repositories/ - Repository 模式

#### contribution.repository.ts - 贡献数据访问

**功能：** 封装所有与 `contributions` 表相关的数据库操作。

```typescript
export class ContributionRepository {
  // 根据 ID 查找贡献
  static async findById(id: string): Promise<Contribution | null> {
    const result = await query(
      `SELECT c.*, u.username, u.avatar_url, r.name as repo_name, r.full_name as repo_full_name
       FROM contributions c
       LEFT JOIN users u ON c.user_id = u.id
       LEFT JOIN repositories r ON c.repository_id = r.id
       WHERE c.id = $1`,
      [id],
    );

    return result.rows.length > 0 ? this.mapRowToContribution(result.rows[0]) : null;
  }

  // 查询贡献列表（支持过滤）
  static async findAll(
    params: QueryContributionParams = {}, 
    limit = 50, 
    offset = 0
  ): Promise<Contribution[]> {
    let whereClause = '';
    const values: unknown[] = [];
    let paramIndex = 1;
    const conditions = [];

    // 构建 WHERE 子句
    if (params.type) {
      conditions.push(`c.type = $${paramIndex++}`);
      values.push(params.type);
    }
    if (params.status) {
      conditions.push(`c.status = $${paramIndex++}`);
      values.push(params.status);
    }
    if (params.userId) {
      conditions.push(`c.user_id = $${paramIndex++}`);
      values.push(params.userId);
    }

    if (conditions.length > 0) {
      whereClause = `WHERE ${conditions.join(' AND ')}`;
    }

    values.push(limit, offset);

    const result = await query(
      `SELECT c.*, u.username, u.avatar_url, r.name as repo_name, r.full_name as repo_full_name
       FROM contributions c
       LEFT JOIN users u ON c.user_id = u.id
       LEFT JOIN repositories r ON c.repository_id = r.id
       ${whereClause}
       ORDER BY c.created_at DESC
       LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
      values,
    );

    return result.rows.map(this.mapRowToContribution);
  }

  // 创建贡献
  static async create(contributionData: CreateContributionData): Promise<Contribution> {
    const supabase = getDatabaseClient();
    const { data, error } = await supabase
      .from('contributions')
      .insert({
        githubId: contributionData.githubId,
        type: contributionData.type,
        userId: contributionData.userId,
        repositoryId: contributionData.repositoryId,
        contributor: contributionData.contributor,
        title: contributionData.title,
        description: contributionData.description,
        url: contributionData.url,
        metadata: contributionData.metadata || {},
      })
      .select()
      .single();

    if (error) throw error;
    return this.mapRowToContribution(data);
  }

  // 更新贡献
  static async update(
    id: string, 
    contributionData: UpdateContributionData
  ): Promise<Contribution | null> {
    const supabase = getDatabaseClient();
    const updateData: any = {};

    if (contributionData.status !== undefined) updateData.status = contributionData.status;
    if (contributionData.transactionHash !== undefined) updateData.transactionHash = contributionData.transactionHash;
    if (contributionData.tokenId !== undefined) updateData.tokenId = contributionData.tokenId;
    if (contributionData.metadataUri !== undefined) updateData.metadataUri = contributionData.metadataUri;

    const { data, error } = await supabase
      .from('contributions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data ? this.mapRowToContribution(data) : null;
  }

  // 获取统计信息
  static async getStats(userId?: string): Promise<ContributionStats> {
    let whereClause = '';
    const values: unknown[] = [];

    if (userId) {
      whereClause = 'WHERE user_id = $1';
      values.push(userId);
    }

    const result = await query(
      `SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'minted' THEN 1 END) as minted,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
        COUNT(CASE WHEN type = 'commit' THEN 1 END) as commits,
        COUNT(CASE WHEN type = 'pull_request' THEN 1 END) as pull_requests
       FROM contributions ${whereClause}`,
      values,
    );

    const dbStats = result.rows[0];

    return {
      totalContributions: parseInt(dbStats.total),
      mintedContributions: parseInt(dbStats.minted),
      pendingContributions: parseInt(dbStats.pending),
      // ... 更多统计信息
    };
  }
}
```

---

## 7. services/ - 业务逻辑服务层

### 7.1 auth.service.ts - 认证服务

**功能：** 提供前端调用的认证相关方法。

```typescript
export class AuthService {
  // 使用 GitHub OAuth 登录
  static async signInWithGitHub(redirectTo?: string) {
    const url = '/api/auth/github';
    if (typeof window !== 'undefined') {
      window.location.href = url;
    }
    return { url };
  }

  // 登出
  static async signOut() {
    const response = await fetch('/api/auth/logout', { method: 'POST' });
    if (!response.ok) throw new Error('登出失败');
    return await response.json();
  }

  // 获取当前用户 session
  static async getSession(): Promise<{ session: SessionData | null; error: any }> {
    try {
      const response = await fetch('/api/auth/user', { credentials: 'include' });
      if (!response.ok) {
        if (response.status === 401) return { session: null, error: null };
        throw new Error('获取 session 失败');
      }
      const data = await response.json();
      return { session: data.session, error: null };
    } catch (error) {
      return { session: null, error };
    }
  }

  // 同步用户信息到数据库
  static async syncUserToDatabase(user: SessionData['user']) {
    const response = await fetch('/api/users/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        githubId: user.id,
        username: user.login,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatar_url,
      }),
    });
    if (!response.ok) throw new Error(`Failed to sync user: ${response.statusText}`);
    return await response.json();
  }
}
```

### 7.2 blockchain.service.ts - 区块链交互服务

**功能：** 封装所有区块链交互操作。

```typescript
export class BlockchainService {
  private static provider: EthersProvider | null = null;
  private static wallet: EthersWallet | null = null;
  private static contract: EthersContract | null = null;

  // 初始化区块链连接
  static async initializeBlockchain(): Promise<void> {
    const config = getConfig();

    // 初始化提供者
    this.provider = new ethers.JsonRpcProvider(config.blockchain.rpcUrl);

    // 初始化钱包
    if (config.blockchain.privateKey) {
      this.wallet = new ethers.Wallet(config.blockchain.privateKey, this.provider);
    }

    // 初始化合约
    if (config.blockchain.contractAddress) {
      this.contract = new ethers.Contract(
        config.blockchain.contractAddress,
        CommitNFT.abi,
        this.wallet || this.provider,
      );
    }
  }

  // 铸造贡献 NFT
  static async mintContribution(contributionId: string): Promise<string> {
    await this.ensureInitialized();

    // 1. 获取贡献信息
    const contribution = await ContributionRepository.findById(contributionId);
    if (!contribution) throw new Error('Contribution not found');
    if (contribution.status === ContributionStatus.MINTED) {
      throw new Error('Contribution already minted');
    }

    // 2. 上传元数据到 IPFS
    const metadataUri = await this.uploadMetadataToIPFS(contribution);

    // 3. 组装 CommitData
    const commitData = {
      repo: contribution.repository?.fullName || '',
      commit: contribution.metadata.sha || contribution.githubId,
      linesAdded: contribution.metadata.additions || 0,
      linesDeleted: contribution.metadata.deletions || 0,
      testsPass: contribution.metadata.testsPass || false,
      timestamp: Math.floor(new Date(contribution.createdAt).getTime() / 1000),
      author: contribution.contributor,
      message: contribution.title || contribution.description || '',
      merged: contribution.type === 'pull_request' || contribution.metadata.merged,
    };

    // 4. 调用智能合约铸造 NFT
    const tx = await this.contract.mintCommit(
      this.wallet.address,
      commitData,
      metadataUri,
    );

    console.log('Minting transaction sent:', tx.hash);

    // 5. 等待交易确认
    const receipt = await tx.wait();
    console.log('Minting transaction confirmed:', receipt.hash);

    // 6. 解析 tokenId
    let tokenId: string | undefined;
    const event = receipt.logs.find((log: any) => {
      const parsed = this.contract.interface.parseLog(log);
      return parsed?.name === 'CommitMinted';
    });
    if (event) {
      const parsed = this.contract.interface.parseLog(event);
      tokenId = parsed?.args?.tokenId?.toString();
    }

    // 7. 更新贡献状态
    await ContributionRepository.update(contributionId, {
      status: ContributionStatus.MINTED,
      transactionHash: receipt.hash,
      tokenId,
      metadataUri,
    });

    return receipt.hash;
  }

  // 上传元数据到 IPFS
  static async uploadMetadataToIPFS(contribution: Contribution): Promise<string> {
    const metadata = {
      name: `Contribution #${contribution.id}`,
      description: contribution.description || `Contribution by ${contribution.contributor}`,
      image: '',
      attributes: [
        { trait_type: 'Type', value: contribution.type },
        { trait_type: 'Contributor', value: contribution.contributor },
        { trait_type: 'Repository', value: contribution.repositoryId },
        { trait_type: 'Created At', value: contribution.createdAt.toISOString() },
      ],
      external_url: contribution.url || '',
    };

    // 使用 Web3.Storage
    if (process.env.WEB3_STORAGE_TOKEN) {
      const res = await fetch('https://api.web3.storage/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.WEB3_STORAGE_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(metadata),
      });
      if (!res.ok) throw new Error(`Web3.Storage upload failed: ${res.statusText}`);
      const json = await res.json();
      return `ipfs://${json.cid}`;
    }

    throw new Error('No IPFS/Web3.Storage configuration provided');
  }

  // 批量铸造贡献
  static async batchMintContributions(contributionIds: string[]): Promise<string[]> {
    const results: string[] = [];

    for (const contributionId of contributionIds) {
      try {
        const txHash = await this.mintContribution(contributionId);
        results.push(txHash);
      } catch (error) {
        console.error(`Failed to mint contribution ${contributionId}:`, error);
      }
    }

    return results;
  }
}
```

### 7.3 scoring.service.ts - 贡献评分服务

**功能：** 多维度评分系统。

```typescript
export interface ScoreBreakdown {
  convention: number;          // 规范性评分（0-100）
  size: number;                // 代码变更量评分（0-100）
  filesImpact: number;         // 文件影响范围评分（0-100）
  mergeSignal: number;         // 合并状态评分（0-100）
  metadataCompleteness: number; // 元数据完整度评分（0-100）
}

export class ScoringService {
  // 1. 规范性评分（Conventional Commits）
  static conventionalScore(message: string): number {
    // 检查是否符合 Conventional Commits 格式
    const prefixOk = /^(feat|fix|docs|refactor|test|chore|perf|style|build|ci)(\(.+\))?:\s+/.test(message);
    // 检查提交信息长度是否充足
    const lengthOk = message.split('\n')[0].trim().length >= 8;
    return Math.round((prefixOk ? 70 : 30) + (lengthOk ? 30 : 0));
  }

  // 2. 代码变更量评分
  static sizeScore(additions: number, deletions: number): number {
    const total = additions + deletions;
    if (total === 0) return 40;
    if (total <= 50) return 95;    // 小改动，质量高
    if (total <= 200) return 85;   // 中等改动
    if (total <= 500) return 70;   // 较大改动
    if (total <= 1000) return 55;  // 大改动
    return 40;                      // 超大改动，可能需要拆分
  }

  // 3. 文件影响范围评分
  static filesImpactScore(files: Array<{ filename: string; additions?: number; deletions?: number }>): number {
    if (!files || files.length === 0) return 40;
    
    let score = 60;
    
    // 是否包含测试文件（加分）
    const hasTests = files.some(f => /test|spec|__tests__/i.test(f.filename));
    if (hasTests) score += 15;
    
    // 是否全是文档文件（减分）
    const mostlyDocs = files.every(f => /\.(md|mdx)$/i.test(f.filename));
    if (mostlyDocs) score -= 20;
    
    // 是否有超大文件（减分）
    const heavyFiles = files.filter(f => (f.additions || 0) + (f.deletions || 0) > 500).length;
    if (heavyFiles > 0) score -= 10;
    
    return Math.max(30, Math.min(95, score));
  }

  // 4. 合并状态评分
  static mergeSignalScore(merged: boolean): number {
    return merged ? 90 : 50;  // 已合并的 PR/commit 质量更高
  }

  // 5. 元数据完整度评分
  static metadataCompletenessScore(message: string, hasLink: boolean): number {
    let score = 50;
    if (message && message.length > 0) score += 20;    // 有提交信息
    if (hasLink) score += 20;                          // 有关联链接
    if (/close[sd]?\s+#\d+/i.test(message)) score += 10;  // 关闭 issue
    return Math.min(95, score);
  }

  // 聚合评分（加权平均）
  static aggregate(
    weights: Partial<Record<keyof ScoreBreakdown, number>>, 
    b: ScoreBreakdown
  ): number {
    // 默认权重
    const w = { 
      convention: 0.25,           // 规范性占 25%
      size: 0.2,                  // 代码量占 20%
      filesImpact: 0.2,           // 文件影响占 20%
      mergeSignal: 0.15,          // 合并状态占 15%
      metadataCompleteness: 0.2,  // 元数据完整度占 20%
      ...weights 
    };
    
    const total = 
      w.convention * b.convention + 
      w.size * b.size + 
      w.filesImpact * b.filesImpact + 
      w.mergeSignal * b.mergeSignal + 
      w.metadataCompleteness * b.metadataCompleteness;
    
    return Math.round(total);
  }
}
```

**使用示例：**
```typescript
import { ScoringService } from '@/lib/services/scoring.service';

// 计算各维度评分
const conventionScore = ScoringService.conventionalScore('feat: add new feature');
const sizeScore = ScoringService.sizeScore(50, 10);
const filesImpactScore = ScoringService.filesImpactScore([
  { filename: 'src/index.ts', additions: 30, deletions: 5 },
  { filename: 'src/__tests__/index.test.ts', additions: 20, deletions: 5 },
]);
const mergeScore = ScoringService.mergeSignalScore(true);
const metadataScore = ScoringService.metadataCompletenessScore('feat: add feature\n\nCloses #123', true);

// 聚合评分
const breakdown = {
  convention: conventionScore,
  size: sizeScore,
  filesImpact: filesImpactScore,
  mergeSignal: mergeScore,
  metadataCompleteness: metadataScore,
};

const finalScore = ScoringService.aggregate({}, breakdown);
console.log('最终评分:', finalScore);  // 输出：0-100 的分数
```

---

## 8. supabase/ - Supabase 客户端

### 8.1 client.ts - 浏览器端客户端

**功能：** 供前端组件使用的 Supabase 客户端。

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// 检查 Supabase 是否正确配置
const isSupabaseConfigured =
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes('placeholder') &&
  !supabaseAnonKey.includes('placeholder') &&
  supabaseUrl.startsWith('https://');

if (!isSupabaseConfigured) {
  console.warn('⚠️ Supabase 未正确配置，GitHub OAuth 功能将不可用');
}

// 创建 Supabase 客户端实例
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      autoRefreshToken: true,      // 自动刷新 token
      persistSession: true,         // 持久化会话到 localStorage
      detectSessionInUrl: true,     // 从 URL 检测会话（OAuth 回调）
    },
  },
);

export { isSupabaseConfigured };
export default supabase;
```

### 8.2 server.ts - 服务端客户端

**功能：** 供 Next.js Server Components/API Routes 使用的 Supabase 客户端。

```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr';

export function createClient(cookieStore?: any) {
  // 如果没有提供 cookieStore，返回一个基本的客户端
  if (!cookieStore) {
    return createBasicClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
  }

  // 创建 Server Client（支持 cookies 操作）
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // Server Component 中无法设置 cookies
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch {
            // Server Component 中无法删除 cookies
          }
        },
      },
    },
  );
}

// 服务端专用函数
export async function createServerOnlyClient() {
  if (typeof window !== 'undefined') {
    throw new Error('This function can only be used on the server side');
  }

  const { cookies } = await import('next/headers');
  const cookieStore = cookies();
  return createClient(cookieStore);
}
```

### 8.3 service.ts - Service Role 客户端

**功能：** 使用 Service Role Key 的客户端，拥有完全权限（绕过 RLS）。

```typescript
import { createClient } from '@supabase/supabase-js';

// Service Role Key（后端专用，拥有完全权限）
const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || 
            process.env.SUPABASE_ANON_KEY || 
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!url || !key) {
  console.warn('Supabase service client missing URL or KEY');
}

export const serviceSupabase = createClient(
  url || 'https://placeholder.supabase.co', 
  key || 'placeholder-key', 
  {
    auth: {
      persistSession: false,      // 不持久化会话
      autoRefreshToken: false,    // 不自动刷新 token
    },
  }
);

export default serviceSupabase;
```

---

## 9. 使用流程总结

### 完整的数据流示例

```
用户操作
  ↓
前端组件 (React Component)
  ↓
使用 Custom Hook (useAuth, useContributions)
  ↓
调用 API 客户端 (api.ts)
  ↓
发送 HTTP 请求到 Next.js API Routes
  ↓
API Routes 调用 Service 层 (*.service.ts)
  ↓
Service 层调用 Repository 层 (*.repository.ts)
  ↓
Repository 层执行 SQL 查询 (database/index.ts)
  ↓
通过 Supabase Client 访问数据库
  ↓
返回数据并逐层向上传递
  ↓
前端更新状态并重新渲染
```

### 典型使用场景

#### 场景 1：用户登录
```typescript
// 1. 前端：点击登录按钮
import { AuthService } from '@/lib/services/auth.service';
AuthService.signInWithGitHub();

// 2. 重定向到 /api/auth/github
// 3. GitHub OAuth 认证
// 4. 回调到 /auth/callback
// 5. 设置 JWT Session Cookie
import { setSessionCookie } from '@/lib/auth/session';
await setSessionCookie(sessionData);

// 6. 前端：获取用户信息
const { user } = await AuthService.getUser();
```

#### 场景 2：连接钱包
```typescript
import { useWeb3 } from '@/lib/contexts/Web3Context';

function MyComponent() {
  const { address, isConnected, connect } = useWeb3();

  if (!isConnected) {
    return <button onClick={connect}>连接钱包</button>;
  }

  return <div>已连接: {address}</div>;
}
```

#### 场景 3：铸造 NFT
```typescript
import { BlockchainService } from '@/lib/services/blockchain.service';

// 铸造单个贡献
const txHash = await BlockchainService.mintContribution(contributionId);
console.log('交易哈希:', txHash);

// 批量铸造
const contributionIds = ['id1', 'id2', 'id3'];
const txHashes = await BlockchainService.batchMintContributions(contributionIds);
```

#### 场景 4：查询贡献
```typescript
import { ContributionRepository } from '@/lib/database/repositories/contribution.repository';

// 查询所有待铸造的贡献
const pendingContributions = await ContributionRepository.findAll(
  { status: 'pending' },
  50,
  0
);

// 查询单个贡献
const contribution = await ContributionRepository.findById('contribution-id');

// 获取统计信息
const stats = await ContributionRepository.getStats('user-id');
```

---

## 10. 环境变量配置清单

为了让 `lib/` 目录下的代码正常工作,需要配置以下环境变量：

### 前端 `.env`
```bash
# Next.js
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# Supabase（客户端）
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# 区块链（客户端）
NEXT_PUBLIC_RPC_URL=http://127.0.0.1:8545
NEXT_PUBLIC_CHAIN_ID=31337
NEXT_PUBLIC_IDENTITY_REGISTRY_ADDRESS=0x...
NEXT_PUBLIC_REPUTATION_REGISTRY_ADDRESS=0x...
NEXT_PUBLIC_VALIDATION_REGISTRY_ADDRESS=0x...
NEXT_PUBLIC_COMMIT_NFT_ADDRESS=0x...
```

### 后端 `.env`
```bash
# Supabase（服务端）
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# JWT
JWT_SECRET=your-jwt-secret-at-least-32-characters-long

# GitHub OAuth
GITHUB_CLIENT_ID=your_github_oauth_client_id
GITHUB_CLIENT_SECRET=your_github_oauth_client_secret
GITHUB_CALLBACK_URL=http://localhost:3000/auth/callback
GITHUB_WEBHOOK_SECRET=your_webhook_secret

# 区块链（服务端）
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/your_key
SEPOLIA_PRIVATE_KEY=0x...
CONTRACT_ADDRESS=0x...

# IPFS
WEB3_STORAGE_TOKEN=your_web3_storage_token
# 或者使用 Pinata
IPFS_API_URL=https://api.pinata.cloud
IPFS_API_KEY=your_pinata_api_key
IPFS_SECRET_KEY=your_pinata_secret_key
```

---

## 总结

`frontend/src/lib` 目录是整个应用的核心基础设施，提供了：

1. **统一的数据访问接口**（`api.ts`, `database/`）
2. **完整的认证体系**（`auth/`, `services/auth.service.ts`）
3. **区块链交互能力**（`services/blockchain.service.ts`, `contracts/`）
4. **全局状态管理**（`contexts/`）
5. **业务逻辑封装**（`services/`）
6. **配置管理**（`config/`）

通过清晰的分层架构，确保了代码的可维护性、可测试性和可扩展性。



