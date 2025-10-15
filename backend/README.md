# LightCommit Backend

LightCommit 后端服务，基于 NestJS 框架构建，提供 GitHub OAuth 认证、Webhook 处理、区块链 NFT 铸造等功能。

## 技术栈

- **框架**: NestJS 10.x
- **数据库**: PostgreSQL + TypeORM
- **任务队列**: Redis + Bull
- **区块链**: Ethers.js
- **认证**: Passport (GitHub OAuth2.0 + JWT)

## 项目结构

```
backend/
├── src/
│   ├── app.module.ts           # 根模块
│   ├── main.ts                 # 应用入口
│   ├── config/                 # 配置管理
│   ├── auth/                   # 认证模块
│   │   ├── strategies/         # Passport 策略
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   └── auth.module.ts
│   ├── github/                 # GitHub 集成
│   │   ├── github.controller.ts
│   │   ├── github.service.ts
│   │   └── github.module.ts
│   ├── blockchain/             # 区块链交互
│   │   ├── blockchain.service.ts
│   │   └── blockchain.module.ts
│   ├── contribution/           # 贡献管理
│   │   ├── entities/           # 数据实体
│   │   ├── dto/                # 数据传输对象
│   │   ├── contribution.controller.ts
│   │   ├── contribution.service.ts
│   │   └── contribution.module.ts
│   ├── queue/                  # 任务队列
│   │   ├── queue.processor.ts
│   │   └── queue.module.ts
│   └── database/               # 数据库配置
│       └── database.module.ts
└── test/
```

## 环境配置

复制 `.env.example` 为 `.env` 并填写以下配置：

### 基础配置
- `PORT`: 服务端口（默认 3000）
- `NODE_ENV`: 运行环境（development/production）

### 数据库配置
- `DATABASE_URL`: PostgreSQL 连接字符串
- `DATABASE_HOST`: 数据库主机
- `DATABASE_PORT`: 数据库端口
- `DATABASE_USER`: 数据库用户名
- `DATABASE_PASSWORD`: 数据库密码
- `DATABASE_NAME`: 数据库名称

### Redis 配置
- `REDIS_HOST`: Redis 主机
- `REDIS_PORT`: Redis 端口

### GitHub 配置
- `GITHUB_CLIENT_ID`: GitHub OAuth App Client ID
- `GITHUB_CLIENT_SECRET`: GitHub OAuth App Client Secret
- `GITHUB_CALLBACK_URL`: OAuth 回调地址
- `GITHUB_WEBHOOK_SECRET`: Webhook 密钥

### JWT 配置
- `JWT_SECRET`: JWT 签名密钥
- `JWT_EXPIRATION`: Token 过期时间

### 区块链配置
- `SEPOLIA_RPC_URL`: Sepolia 测试网 RPC URL
- `SEPOLIA_PRIVATE_KEY`: 钱包私钥
- `CONTRACT_ADDRESS`: 已部署的智能合约地址

### IPFS 配置
- `IPFS_API_URL`: IPFS API 地址
- `IPFS_API_KEY`: IPFS API Key
- `IPFS_SECRET_KEY`: IPFS Secret Key

## 安装依赖

```bash
npm install
```

## 运行项目

### 开发模式
```bash
npm run start:dev
```

### 生产模式
```bash
npm run build
npm run start:prod
```

## API 端点

### 认证
- `GET /api/auth/github` - 发起 GitHub OAuth
- `GET /api/auth/github/callback` - OAuth 回调
- `GET /api/auth/profile` - 获取用户信息（需要认证）

### GitHub Webhook
- `POST /api/github/webhook` - 接收 GitHub Webhooks

### 贡献管理
- `GET /api/contributions` - 查询贡献列表（需要认证）
- `GET /api/contributions/my` - 获取我的贡献（需要认证）
- `GET /api/contributions/stats` - 获取统计信息（需要认证）
- `GET /api/contributions/:id` - 获取贡献详情（需要认证）

## 数据库迁移

```bash
npm run migration:generate -- -n MigrationName
npm run migration:run
```

## 测试

```bash
npm run test
npm run test:watch
npm run test:cov
```

## 核心功能

### 1. GitHub OAuth 认证
使用 Passport GitHub Strategy 实现 OAuth2.0 认证流程，自动创建或更新用户信息。

### 2. Webhook 处理
接收并验证 GitHub Webhooks，解析 push 和 pull_request 事件，创建贡献记录。

### 3. 异步任务队列
使用 Bull 队列处理 NFT 铸造任务，避免阻塞主线程。

### 4. 区块链集成
通过 Ethers.js 与智能合约交互，实现贡献的 NFT 化。

### 5. 元数据管理
将贡献信息上传至 IPFS，生成永久存储的元数据 URI。

## 注意事项

1. 确保 PostgreSQL 和 Redis 服务正在运行
2. 智能合约需要先部署到 Sepolia 测试网
3. GitHub App 需要配置正确的 Webhook URL
4. 钱包需要有足够的测试网 ETH 用于 Gas 费用

## License

MIT

