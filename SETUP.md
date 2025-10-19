# LightCommit 开发环境配置

## 📋 快速开始

### 1. 环境要求
- Node.js 18+
- npm 或 pnpm
- Supabase 账号

### 2. 安装依赖
```bash
cd frontend
npm install
```

### 3. 配置环境变量
编辑 `frontend/.env.local`，确保包含：

```bash
# Supabase 配置（必需）
SUPABASE_URL=https://zycrqpwhwmcoejksjrth.supabase.co
SUPABASE_ANON_KEY=your_key_here

# GitHub OAuth（必需）
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret
GITHUB_CALLBACK_URL=http://localhost:3000/api/auth/github/callback

# JWT（必需）
JWT_SECRET=your_jwt_secret
```

### 4. 数据库迁移

**⚠️ 重要：首次运行前需要执行数据库迁移**

在 Supabase Dashboard 执行：
1. 访问 https://app.supabase.com/project/zycrqpwhwmcoejksjrth/sql/new
2. 复制并执行 `frontend/EXECUTE_MIGRATION.sql`

验证迁移成功：
```bash
node scripts/check-db-status.js
```

### 5. 启动开发服务器
```bash
npm run dev
```

访问 http://localhost:3000

## 📁 项目结构

```
frontend/
├── src/
│   ├── app/           # Next.js 应用路由
│   ├── components/    # React 组件
│   ├── lib/
│   │   ├── database/  # 数据库层（Supabase）
│   │   ├── services/  # 业务逻辑层
│   │   └── supabase/  # Supabase 客户端
│   └── types/         # TypeScript 类型定义
├── scripts/           # 工具脚本
└── supabase/         # Supabase 配置和迁移
```

## 🔧 常用命令

```bash
# 开发
npm run dev

# 构建
npm run build

# 启动生产服务器
npm start

# 检查数据库状态
node scripts/check-db-status.js

# 测试 Supabase 连接
node scripts/test-supabase-connection.js
```

## 📝 开发说明

### 数据库
- 使用 Supabase 作为数据库后端
- 所有数据访问通过 Repository 层
- 主要表：`users`, `repositories`, `contributions`

### 认证
- GitHub OAuth 登录
- JWT token 管理
- 中间件保护路由

### API 路由
- `/api/auth/*` - 认证相关
- `/api/contributions/*` - 贡献记录
- `/api/github/webhook` - GitHub Webhook

## 🐛 故障排查

### 数据库连接失败
```bash
# 检查环境变量
cat .env.local | grep SUPABASE

# 验证连接
node scripts/verify-db-config.js
```

### GitHub 登录失败
检查 GitHub OAuth 应用配置：
- Homepage URL: `http://localhost:3000`
- Callback URL: `http://localhost:3000/api/auth/github/callback`

## 📚 相关文档

- [Supabase 文档](https://supabase.com/docs)
- [Next.js 文档](https://nextjs.org/docs)
- [GitHub OAuth 配置](https://docs.github.com/en/developers/apps/building-oauth-apps)

---

**准备好了吗？运行 `npm run dev` 开始开发！**

