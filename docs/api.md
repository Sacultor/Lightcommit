### API 规范

所有返回均为 JSON。除标注外，其余端点需要 `Authorization: Bearer <token>`，会话由 Supabase 管理。

### 认证

- `GET /api/auth/github`
  - 说明: 获取 GitHub OAuth 重定向 URL 并跳转
  - 认证: 否
- `GET /api/auth/user`
  - 说明: 获取当前登录用户 `{ user }`
  - 认证: 是（服务端读取会话）
- `POST /api/auth/logout`
  - 说明: 登出
  - 认证: 是

### 贡献

- `GET /api/contributions`
  - 查询参数: `type`、`status`、`repositoryId`、`userId`、`limit`、`offset`
  - 响应: `{ data: Contribution[], pagination: { limit, offset, total } }`
- `GET /api/contributions/my`
  - 查询参数: `limit`、`offset`
  - 响应: `{ data: Contribution[], pagination: {...}, user: { id, username } }`
- `GET /api/contributions/[id]`
  - 路径参数: `id`
  - 响应: `Contribution`
- `GET /api/contributions/stats`
  - 查询参数: `global`、`userId`、`repositoryId`
  - 响应: `ContributionStats`

### GitHub Webhook

- `POST /api/github/webhook`
  - 头: `x-hub-signature-256`、`x-github-event`
  - 说明: 校验签名后处理 `push`、`pull_request` 事件
  - 响应: `{ success: true }`

### 健康检查

- `GET /api/health`
  - 说明: 返回版本、环境与服务健康状态
- `HEAD /api/health`
  - 说明: 存活探针，200 即可

### 类型参考

- `frontend/src/types/contribution.ts`
- `frontend/src/types/api.ts`
