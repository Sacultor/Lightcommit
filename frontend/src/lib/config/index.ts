/**
 * 配置管理模块
 * 
 * 核心功能：
 * - 统一管理所有环境变量
 * - 提供类型安全的配置访问接口
 * - 使用单例模式避免重复读取环境变量
 * - 支持默认值和类型转换
 * 
 * 环境变量配置：
 * 1. 复制 env.example 为 .env（注意：是 .env 而不是 .env.local）
 *    ```bash
 *    cd frontend
 *    cp env.example .env
 *    ```
 * 2. 填写所有必需的配置项
 * 3. .env 文件已在 .gitignore 中，不会被提交
 * 
 * 使用方式：
 * ```typescript
 * import { getBlockchainConfig, getGitHubConfig } from '@/lib/config';
 * 
 * const blockchainConfig = getBlockchainConfig();
 * console.log('RPC URL:', blockchainConfig.rpcUrl);
 * ```
 * 
 * 环境变量命名规范：
 * - NEXT_PUBLIC_* : 前端可访问（打包到浏览器）
 * - 无前缀 : 仅后端可访问（如密钥、私钥）
 * 
 * 注意事项：
 * - 所有环境变量从 frontend/.env 文件读取
 * - 敏感信息（私钥、密码）不要用 NEXT_PUBLIC_ 前缀
 * - 生产环境必须配置所有必需的环境变量
 * - 开发环境可以使用默认值
 */

// ============================================================
// 第一部分：配置类型定义
// ============================================================

/**
 * 数据库配置
 * 
 * 支持两种连接方式：
 * 1. 使用连接 URL（推荐）：DATABASE_URL
 * 2. 使用独立参数：host, port, username, password, database
 * 
 * 环境变量：
 * - DATABASE_URL: 完整连接字符串（如 postgresql://user:pass@host:5432/db）
 * - DATABASE_HOST: 数据库主机（默认 localhost）
 * - DATABASE_PORT: 数据库端口（默认 5432）
 * - DATABASE_USER: 数据库用户名
 * - DATABASE_PASSWORD: 数据库密码
 * - DATABASE_NAME: 数据库名称
 */
export interface DatabaseConfig {
  url?: string;              // 连接 URL（优先使用）
  host: string;              // 主机地址
  port: number;              // 端口号
  username?: string;         // 用户名
  password?: string;         // 密码
  database?: string;         // 数据库名
}


/**
 * GitHub OAuth 配置
 * 
 * 用途：
 * - GitHub OAuth 登录
 * - GitHub Webhook 接收
 * - GitHub API 调用
 * 
 * 环境变量：
 * - GITHUB_CLIENT_ID: OAuth 应用的 Client ID
 * - GITHUB_CLIENT_SECRET: OAuth 应用的 Client Secret（敏感）
 * - GITHUB_CALLBACK_URL: OAuth 回调地址（如 http://localhost:3000/auth/callback）
 * - GITHUB_WEBHOOK_SECRET: Webhook 签名密钥（用于验证 Webhook 请求）
 * 
 * 获取方式：
 * 1. 访问 https://github.com/settings/developers
 * 2. 创建 OAuth App
 * 3. 获取 Client ID 和 Client Secret
 * 4. 设置回调 URL
 */
export interface GitHubConfig {
  clientId?: string;         // OAuth Client ID
  clientSecret?: string;     // OAuth Client Secret（敏感）
  callbackUrl?: string;      // OAuth 回调 URL
  webhookSecret?: string;    // Webhook 签名密钥（敏感）
}

/**
 * JWT 配置
 * 
 * 用途：
 * - 用户 session 管理
 * - API 认证
 * 
 * 环境变量：
 * - JWT_SECRET: JWT 签名密钥（必须配置，至少 32 字符）
 * - JWT_EXPIRATION: JWT 过期时间（默认 7 天）
 * 
 * 注意：
 * - JWT_SECRET 必须保密，泄露后任何人都能伪造 JWT
 * - 生产环境必须使用强随机密钥
 * - 过期时间格式：'7d', '24h', '60m', '3600s'
 */
export interface JwtConfig {
  secret?: string;           // JWT 签名密钥（敏感）
  expiresIn: string;         // 过期时间（如 '7d', '24h'）
}

/**
 * 区块链配置
 * 
 * 用途：
 * - 连接以太坊网络（Sepolia 测试网、主网、本地 Hardhat）
 * - 部署和调用智能合约
 * - 铸造 NFT
 * 
 * 环境变量：
 * - SEPOLIA_RPC_URL: Sepolia 测试网 RPC URL（如 Infura、Alchemy）
 * - SEPOLIA_PRIVATE_KEY: 部署账户的私钥（敏感，仅后端使用）
 * - CONTRACT_ADDRESS: CommitNFT 合约地址（通用）
 * - NEXT_PUBLIC_CHAIN_ID: 链 ID（31337=Hardhat本地, 11155111=Sepolia）
 * - NEXT_PUBLIC_IDENTITY_REGISTRY_ADDRESS: AgentIdentityRegistry 合约地址
 * - NEXT_PUBLIC_REPUTATION_REGISTRY_ADDRESS: ReputationRegistry 合约地址
 * - NEXT_PUBLIC_VALIDATION_REGISTRY_ADDRESS: ValidationRegistry 合约地址
 * - NEXT_PUBLIC_COMMIT_NFT_ADDRESS: CommitNFT 合约地址
 * 
 * 链 ID 说明：
 * - 1: 以太坊主网
 * - 11155111: Sepolia 测试网
 * - 31337: Hardhat 本地网络（开发用）
 * 
 * 注意：
 * - 私钥绝不能用 NEXT_PUBLIC_ 前缀（会暴露到前端）
 * - 合约地址可以用 NEXT_PUBLIC_（前端需要调用合约）
 */
export interface BlockchainConfig {
  rpcUrl?: string;                 // RPC URL（后端专用）
  privateKey?: string;             // 部署私钥（敏感，后端专用）
  contractAddress?: string;        // CommitNFT 合约地址（通用）
  chainId: number;                 // 链 ID
  identityRegistry: string;        // AgentIdentityRegistry 合约地址
  reputationRegistry: string;      // ReputationRegistry 合约地址
  validationRegistry: string;      // ValidationRegistry 合约地址
  commitNFT: string;               // CommitNFT 合约地址
}

/**
 * RPC 配置（前端专用）
 * 
 * 用途：
 * - 前端连接区块链网络
 * - 钱包交互（MetaMask、WalletConnect）
 * - 查询合约状态
 * 
 * 环境变量：
 * - NEXT_PUBLIC_RPC_URL: 前端 RPC URL（默认本地 Hardhat）
 * - NEXT_PUBLIC_CHAIN_ID: 链 ID
 * 
 * 注意：
 * - 前端 RPC 可以使用公共节点（如 Infura、Alchemy 的免费套餐）
 * - 不要在前端 RPC 中使用私钥
 */
export interface RpcConfig {
  url: string;                     // RPC URL
  chainId: number;                 // 链 ID
}

/**
 * IPFS 配置
 * 
 * 用途：
 * - 存储 NFT 元数据（图片、描述、属性）
 * - 去中心化文件存储
 * 
 * 支持的服务：
 * - Web3.Storage（推荐，免费）
 * - Pinata（付费）
 * - 自建 IPFS 节点
 * 
 * 环境变量：
 * - IPFS_API_URL: IPFS API 地址（如 https://api.pinata.cloud）
 * - IPFS_API_KEY: API 密钥（如 Pinata JWT）
 * - IPFS_SECRET_KEY: Secret 密钥（部分服务需要）
 * 
 * 或者使用 Web3.Storage：
 * - WEB3_STORAGE_TOKEN: Web3.Storage API Token
 */
export interface IpfsConfig {
  apiUrl?: string;                 // IPFS API URL
  apiKey?: string;                 // API 密钥
  secretKey?: string;              // Secret 密钥
}

/**
 * Supabase 配置
 * 
 * 用途：
 * - 数据库（PostgreSQL）
 * - 认证（GitHub OAuth）
 * - 实时订阅（Realtime）
 * 
 * 环境变量：
 * - SUPABASE_URL 或 NEXT_PUBLIC_SUPABASE_URL: Supabase 项目 URL
 * - SUPABASE_ANON_KEY 或 NEXT_PUBLIC_SUPABASE_ANON_KEY: 匿名密钥（前端可用）
 * - SUPABASE_SERVICE_ROLE_KEY: 服务角色密钥（敏感，后端专用，绕过 RLS）
 * 
 * 获取方式：
 * 1. 访问 https://supabase.com
 * 2. 创建项目
 * 3. 在 Settings > API 中获取密钥
 * 
 * 注意：
 * - ANON_KEY 可以暴露到前端（有 RLS 保护）
 * - SERVICE_ROLE_KEY 绝不能暴露（绕过所有 RLS）
 */
export interface SupabaseConfig {
  url?: string;                    // Supabase 项目 URL
  anonKey?: string;                // 匿名密钥
}

/**
 * 应用总配置
 * 
 * 聚合所有子配置，提供统一的配置对象
 */
export interface AppConfig {
  port: number;                    // 应用端口（默认 3000）
  nodeEnv: string;                 // 运行环境（development/production）
  database: DatabaseConfig;        // 数据库配置
  github: GitHubConfig;            // GitHub 配置
  jwt: JwtConfig;                  // JWT 配置
  blockchain: BlockchainConfig;    // 区块链配置
  rpc: RpcConfig;                  // RPC 配置（前端）
  ipfs: IpfsConfig;                // IPFS 配置
  supabase: SupabaseConfig;        // Supabase 配置
}

// ============================================================
// 第二部分：配置获取函数
// ============================================================

/**
 * 获取应用配置
 * 
 * 功能：从环境变量读取所有配置，并提供默认值
 * 
 * 工作原理：
 * 1. 读取 process.env 中的环境变量
 * 2. 类型转换（如字符串转数字）
 * 3. 提供默认值（如 PORT 默认 3000）
 * 4. 返回结构化的配置对象
 * 
 * 注意：
 * - 这个函数每次调用都会重新读取环境变量
 * - 建议使用 config() 单例模式（见下方）
 * - 敏感信息不要打印到日志
 * 
 * @returns 应用配置对象
 * 
 * @example
 * const appConfig = getConfig();
 * console.log('端口:', appConfig.port);
 * console.log('环境:', appConfig.nodeEnv);
 */
export const getConfig = (): AppConfig => ({
  // 应用基础配置
  port: parseInt(process.env.PORT || '3000', 10),     // 服务端口（默认 3000）
  nodeEnv: process.env.NODE_ENV || 'development',     // 运行环境（development/production）

  // 数据库配置
  database: {
    url: process.env.DATABASE_URL,                    // 连接 URL（优先使用）
    host: process.env.DATABASE_HOST || 'localhost',   // 主机（默认 localhost）
    port: parseInt(process.env.DATABASE_PORT || '5432', 10),  // 端口（默认 5432，PostgreSQL 默认端口）
    username: process.env.DATABASE_USER,              // 用户名
    password: process.env.DATABASE_PASSWORD,          // 密码
    database: process.env.DATABASE_NAME,              // 数据库名
  },

  // GitHub OAuth 配置
  github: {
    clientId: process.env.GITHUB_CLIENT_ID,           // OAuth Client ID
    clientSecret: process.env.GITHUB_CLIENT_SECRET,   // OAuth Client Secret（敏感）
    callbackUrl: process.env.GITHUB_CALLBACK_URL,     // OAuth 回调 URL
    webhookSecret: process.env.GITHUB_WEBHOOK_SECRET, // Webhook 签名密钥（敏感）
  },

  // JWT 配置
  jwt: {
    secret: process.env.JWT_SECRET,                   // JWT 签名密钥（敏感）
    expiresIn: process.env.JWT_EXPIRATION || '7d',    // 过期时间（默认 7 天）
  },

  // 区块链配置（后端）
  blockchain: {
    rpcUrl: process.env.SEPOLIA_RPC_URL,              // Sepolia RPC URL（后端专用）
    privateKey: process.env.SEPOLIA_PRIVATE_KEY,      // 部署私钥（敏感，后端专用）
    contractAddress: process.env.CONTRACT_ADDRESS,    // CommitNFT 合约地址
    chainId: parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '11155111', 10),  // 链 ID（默认 Sepolia: 11155111）
    identityRegistry: process.env.NEXT_PUBLIC_IDENTITY_REGISTRY_ADDRESS || '',      // AgentIdentityRegistry 地址
    reputationRegistry: process.env.NEXT_PUBLIC_REPUTATION_REGISTRY_ADDRESS || '',  // ReputationRegistry 地址
    validationRegistry: process.env.NEXT_PUBLIC_VALIDATION_REGISTRY_ADDRESS || '',  // ValidationRegistry 地址
    commitNFT: process.env.NEXT_PUBLIC_COMMIT_NFT_ADDRESS || '',                   // CommitNFT 地址
  },

  // RPC 配置（前端）
  rpc: {
    url: process.env.NEXT_PUBLIC_RPC_URL || 'http://localhost:8545',  // RPC URL（默认本地 Hardhat）
    chainId: parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '31337', 10),  // 链 ID（默认 Hardhat: 31337）
  },

  // IPFS 配置
  ipfs: {
    apiUrl: process.env.IPFS_API_URL,                 // IPFS API URL
    apiKey: process.env.IPFS_API_KEY,                 // IPFS API 密钥
    secretKey: process.env.IPFS_SECRET_KEY,           // IPFS Secret 密钥
  },

  // Supabase 配置
  supabase: {
    url: process.env.SUPABASE_URL,                    // Supabase 项目 URL
    anonKey: process.env.SUPABASE_ANON_KEY,           // Supabase 匿名密钥
  },
});

// ============================================================
// 第三部分：单例模式配置
// ============================================================

/**
 * 配置实例缓存
 * 
 * 作用：
 * - 避免重复读取和解析环境变量
 * - 提高性能（环境变量读取有一定开销）
 * - 确保配置一致性（多次调用返回相同对象）
 * 
 * 单例模式：
 * - 第一次调用 config() 时，创建并缓存配置对象
 * - 后续调用直接返回缓存的对象
 * - 整个应用生命周期内只创建一次
 */
let configInstance: AppConfig | null = null;

/**
 * 获取配置（单例模式）
 * 
 * 功能：
 * - 首次调用时创建配置对象并缓存
 * - 后续调用返回缓存的配置对象
 * - 避免重复读取环境变量
 * 
 * 使用场景：
 * - 服务启动时初始化
 * - Service 层读取配置
 * - API Routes 中使用配置
 * 
 * @returns 应用配置对象（单例）
 * 
 * @example
 * import { config } from '@/lib/config';
 * 
 * // 第一次调用：创建并缓存配置
 * const cfg1 = config();
 * 
 * // 第二次调用：直接返回缓存（不重新读取环境变量）
 * const cfg2 = config();
 * 
 * console.log(cfg1 === cfg2);  // true（同一个对象）
 */
export const config = (): AppConfig => {
  // 如果配置实例不存在，创建并缓存
  if (!configInstance) {
    configInstance = getConfig();
  }
  // 返回缓存的配置实例
  return configInstance;
};

// ============================================================
// 第四部分：便捷访问函数
// ============================================================

/**
 * 获取数据库配置
 * 
 * @returns 数据库配置对象
 * 
 * @example
 * import { getDatabaseConfig } from '@/lib/config';
 * 
 * const dbConfig = getDatabaseConfig();
 * console.log('数据库主机:', dbConfig.host);
 * console.log('数据库端口:', dbConfig.port);
 */
export const getDatabaseConfig = (): DatabaseConfig => config().database;

/**
 * 获取 GitHub 配置
 * 
 * @returns GitHub 配置对象
 * 
 * @example
 * import { getGitHubConfig } from '@/lib/config';
 * 
 * const githubConfig = getGitHubConfig();
 * console.log('Client ID:', githubConfig.clientId);
 */
export const getGitHubConfig = (): GitHubConfig => config().github;

/**
 * 获取 JWT 配置
 * 
 * @returns JWT 配置对象
 * 
 * @example
 * import { getJwtConfig } from '@/lib/config';
 * 
 * const jwtConfig = getJwtConfig();
 * console.log('JWT 密钥:', jwtConfig.secret);
 * console.log('过期时间:', jwtConfig.expiresIn);
 */
export const getJwtConfig = (): JwtConfig => config().jwt;

/**
 * 获取区块链配置
 * 
 * @returns 区块链配置对象
 * 
 * @example
 * import { getBlockchainConfig } from '@/lib/config';
 * 
 * const blockchainConfig = getBlockchainConfig();
 * console.log('RPC URL:', blockchainConfig.rpcUrl);
 * console.log('链 ID:', blockchainConfig.chainId);
 * console.log('CommitNFT 地址:', blockchainConfig.commitNFT);
 */
export const getBlockchainConfig = (): BlockchainConfig => config().blockchain;

/**
 * 获取 IPFS 配置
 * 
 * @returns IPFS 配置对象
 * 
 * @example
 * import { getIpfsConfig } from '@/lib/config';
 * 
 * const ipfsConfig = getIpfsConfig();
 * console.log('IPFS API:', ipfsConfig.apiUrl);
 */
export const getIpfsConfig = (): IpfsConfig => config().ipfs;

/**
 * 获取 Supabase 配置
 * 
 * @returns Supabase 配置对象
 * 
 * @example
 * import { getSupabaseConfig } from '@/lib/config';
 * 
 * const supabaseConfig = getSupabaseConfig();
 * console.log('Supabase URL:', supabaseConfig.url);
 */
export const getSupabaseConfig = (): SupabaseConfig => config().supabase;
