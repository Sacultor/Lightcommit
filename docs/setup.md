### 环境与快速开始

### 前置要求

- Node.js 18+
- pnpm 10+
- 浏览器安装 MetaMask
- Supabase 项目与 GitHub OAuth 应用

### 安装依赖

```bash
pnpm install
pnpm --filter frontend install
pnpm --filter hardhat install
```

### 配置环境变量

在 `frontend` 目录创建 `.env.local`，示例参考 `frontend/ENV_SETUP.md`。

```bash
NEXT_PUBLIC_CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
NEXT_PUBLIC_CHAIN_ID=31337
NEXT_PUBLIC_RPC_URL=http://127.0.0.1:8545
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000

NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

GITHUB_CLIENT_ID=your_github_client_id_here
GITHUB_CLIENT_SECRET=your_github_client_secret_here
```

### 启动本地链与部署合约

```bash
cd hardhat
npx hardhat node
npx hardhat run scripts/deploy-commit-nft.ts --network localhost
```

### Supabase 配置与迁移

- 本地配置: `frontend/supabase/config.toml`
- 迁移脚本:
  - `frontend/src/lib/database/migrations/001-initial-schema.sql`
  - `frontend/src/lib/database/migrations/002-create-rpc-functions.sql`
  - `frontend/src/lib/database/migrations/003-adapt-supabase-auth.sql`
- 辅助脚本:
  - `frontend/scripts/verify-db-config.js`
  - `frontend/scripts/test-supabase-connection.js`
  - `frontend/scripts/run-migration.js`

推荐在 Supabase Dashboard SQL Editor 依次执行迁移脚本。

### 启动前端

```bash
cd frontend
pnpm dev
```

访问 `http://localhost:3000/test-contract` 验证合约交互。

