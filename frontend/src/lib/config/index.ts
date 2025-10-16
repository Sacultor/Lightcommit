// 配置类型定义
export interface DatabaseConfig {
  url?: string;
  host: string;
  port: number;
  username?: string;
  password?: string;
  database?: string;
}

export interface RedisConfig {
  host: string;
  port: number;
}

export interface GitHubConfig {
  clientId?: string;
  clientSecret?: string;
  callbackUrl?: string;
  webhookSecret?: string;
}

export interface JwtConfig {
  secret?: string;
  expiresIn: string;
}

export interface BlockchainConfig {
  rpcUrl?: string;
  privateKey?: string;
  contractAddress?: string;
}

export interface IpfsConfig {
  apiUrl?: string;
  apiKey?: string;
  secretKey?: string;
}

export interface AppConfig {
  port: number;
  nodeEnv: string;
  database: DatabaseConfig;
  redis: RedisConfig;
  github: GitHubConfig;
  jwt: JwtConfig;
  blockchain: BlockchainConfig;
  ipfs: IpfsConfig;
}

// 配置获取函数
export const getConfig = (): AppConfig => ({
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',

  database: {
    url: process.env.DATABASE_URL,
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432', 10),
    username: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
  },

  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
  },

  github: {
    clientId: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackUrl: process.env.GITHUB_CALLBACK_URL,
    webhookSecret: process.env.GITHUB_WEBHOOK_SECRET,
  },

  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRATION || '7d',
  },

  blockchain: {
    rpcUrl: process.env.SEPOLIA_RPC_URL,
    privateKey: process.env.SEPOLIA_PRIVATE_KEY,
    contractAddress: process.env.CONTRACT_ADDRESS,
  },

  ipfs: {
    apiUrl: process.env.IPFS_API_URL,
    apiKey: process.env.IPFS_API_KEY,
    secretKey: process.env.IPFS_SECRET_KEY,
  },
});

// 单例配置实例
let configInstance: AppConfig | null = null;

export const config = (): AppConfig => {
  if (!configInstance) {
    configInstance = getConfig();
  }
  return configInstance;
};

// 便捷的配置访问函数
export const getDatabaseConfig = (): DatabaseConfig => config().database;
export const getRedisConfig = (): RedisConfig => config().redis;
export const getGitHubConfig = (): GitHubConfig => config().github;
export const getJwtConfig = (): JwtConfig => config().jwt;
export const getBlockchainConfig = (): BlockchainConfig => config().blockchain;
export const getIpfsConfig = (): IpfsConfig => config().ipfs;
