### 部署与运维

### 前端 (Vercel/自托管)

- 环境变量:
  - `NEXT_PUBLIC_CONTRACT_ADDRESS`
  - `NEXT_PUBLIC_CHAIN_ID`
  - `NEXT_PUBLIC_RPC_URL`
  - `NEXT_PUBLIC_API_URL`
  - `NEXT_PUBLIC_FRONTEND_URL`
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

- 构建命令: `pnpm --filter frontend build`
- 启动命令: `pnpm --filter frontend start`

### 合约

- 网络: 本地 `localhost:8545`、测试网 `sepolia`
- 私钥与 RPC 在 `hardhat/.env` 配置：
  - `SEPOLIA_RPC_URL`
  - `SEPOLIA_PRIVATE_KEY`

部署示例:
```bash
cd hardhat
npx hardhat run scripts/deploy-commit-nft.ts --network sepolia
```

### 数据库

- Supabase 仪表盘配置 URL 与 Key
- 在 SQL Editor 依次执行迁移脚本
- 使用 `frontend/scripts/verify-db-config.js` 验证配置

### 健康检查与监控

- `GET /api/health` 返回服务状态
- 建议增加区块链与 GitHub API 连通性探针

### 版本与变更

- 更新合约或接口时同步更新 `docs` 与环境变量
- 遵循用户规则: 当更新版本/模块时删除旧版本/模块

