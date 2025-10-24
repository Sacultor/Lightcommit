### 前端架构

### 技术栈与结构

- Next.js 15、React 19、TypeScript、Tailwind CSS、ethers v6
- 目录要点:
  - `src/app/api/*` API 路由
  - `src/lib/contexts/Web3Context.tsx` 钱包与网络管理
  - `src/lib/hooks/useContract.ts` 合约实例与地址/ABI 导出
  - `src/lib/services/*.ts` 业务服务层
  - `src/lib/supabase/*` Supabase 客户端与中间件
  - `src/lib/database/*` 数据访问与健康检查

### 认证

- 中间件: `src/middleware.ts` 调用 `updateSession` 同步会话
- 客户端: `src/lib/supabase/client.ts` 校验配置并创建客户端
- 服务端: `src/lib/supabase/server.ts` 通过 cookies 创建服务端客户端
- API:
  - `GET /api/auth/github` 初始化 GitHub OAuth
  - `GET /api/auth/user` 获取当前用户
  - `POST /api/auth/logout` 退出登录

### 贡献数据 API

- `GET /api/contributions` 查询贡献，支持 `type`、`status`、`repositoryId`、`userId`、`limit`、`offset`
- `GET /api/contributions/my` 查询当前用户贡献
- `GET /api/contributions/[id]` 获取单条贡献
- `GET /api/contributions/stats` 获取贡献统计，支持 `global`、`userId`、`repositoryId`

以上端点要求 `Authorization: Bearer <token>`，服务端通过 `AuthService.getServerUser` 校验。

### GitHub Webhook

- `POST /api/github/webhook` 校验 `x-hub-signature-256`，调用 `GitHubService.handleWebhook` 处理 `push`、`pull_request` 事件并写入 `contributions`。

### 合约集成

- 上下文: `Web3Context` 提供 `provider/signer`、账户与网络切换
- Hook: `useContract` 读取 `NEXT_PUBLIC_CONTRACT_ADDRESS` 与 `CommitNFT.json` 创建实例
- 服务: `ContractService` 提供 `mintCommit`、`batchMintCommits`、`getCommitData` 等
