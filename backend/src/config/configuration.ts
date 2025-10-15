export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  database: {
    url: process.env.DATABASE_URL,
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
    username: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
  },
  
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
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

