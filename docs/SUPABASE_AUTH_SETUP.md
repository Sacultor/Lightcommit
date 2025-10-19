# Supabase Auth 设置指南

本项目已升级为使用 Supabase 内置的 Auth 系统进行 GitHub OAuth 登录。

## 📋 前置要求

1. 已创建 Supabase 项目
2. 项目 URL: `https://zycrqpwhwmcoejksjrth.supabase.co`
3. 已有 GitHub OAuth App

## 🔧 配置步骤

### 1. 在 Supabase Dashboard 配置 GitHub OAuth

#### 步骤 1: 打开 Authentication 设置
1. 登录 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择你的项目
3. 点击左侧菜单的 **Authentication**
4. 点击 **Providers** 标签

#### 步骤 2: 启用 GitHub Provider
1. 找到 **GitHub** provider
2. 打开启用开关
3. 填入以下信息：
   - **Client ID**: 你的 GitHub OAuth App 的 Client ID
   - **Client Secret**: 你的 GitHub OAuth App 的 Client Secret
4. 点击 **Save**

#### 步骤 3: 配置 Redirect URLs
Supabase 会自动使用以下回调 URL：
```
https://zycrqpwhwmcoejksjrth.supabase.co/auth/v1/callback
```

### 2. 在 GitHub OAuth App 中更新回调 URL

1. 访问 [GitHub OAuth Apps 设置](https://github.com/settings/developers)
2. 选择你的 OAuth App (Client ID: `Ov23liA4VXIdVVsuolv1`)
3. 更新 **Authorization callback URL** 为：
   ```
   https://zycrqpwhwmcoejksjrth.supabase.co/auth/v1/callback
   ```
4. 点击 **Update application**

### 3. 配置环境变量

在 `frontend/.env.local` 中确保以下配置：

```bash
# Supabase 配置
SUPABASE_URL=https://zycrqpwhwmcoejksjrth.supabase.co
SUPABASE_ANON_KEY=你的_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=你的_SERVICE_ROLE_KEY

# 前端公开变量
NEXT_PUBLIC_SUPABASE_URL=https://zycrqpwhwmcoejksjrth.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的_ANON_KEY
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000

# GitHub 配置（仅供参考，实际认证由 Supabase 处理）
GITHUB_CLIENT_ID=Ov23liA4VXIdVVsuolv1
GITHUB_CLIENT_SECRET=你的密钥
```

### 4. 执行数据库迁移

运行以下 SQL 来适配 Supabase Auth：

```bash
# 在 Supabase SQL Editor 中执行
cat frontend/src/lib/database/migrations/003-adapt-supabase-auth.sql
```

或者直接在 Supabase Dashboard 的 SQL Editor 中粘贴执行。

**重要步骤：**
1. 执行迁移脚本创建 `users_new` 表
2. 验证数据正常后，重命名表：
   ```sql
   DROP TABLE IF EXISTS users CASCADE;
   ALTER TABLE users_new RENAME TO users;
   ```

### 5. 配置 Row Level Security (RLS)

迁移脚本已包含 RLS 策略，主要策略包括：

- ✅ 认证用户可以查看所有用户
- ✅ 用户可以插入自己的数据
- ✅ 用户可以更新自己的数据
- ✅ Service role 拥有完全访问权限

### 6. 验证自动触发器

迁移脚本会创建一个触发器，当新用户通过 Supabase Auth 注册时，自动在 `public.users` 表创建记录。

验证触发器是否创建成功：
```sql
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
```

## 🚀 使用方式

### 前端登录流程

1. 用户点击"使用 GitHub 登录"
2. 调用 `/api/auth/github` 端点
3. 重定向到 GitHub OAuth 授权页面
4. GitHub 授权后，重定向到 Supabase 回调 URL
5. Supabase 创建 session 后，重定向到 `/api/auth/github/callback`
6. 后端同步用户信息到 `users` 表
7. 重定向到 `/auth/callback?success=true`
8. 前端验证 session 并跳转到 dashboard

### 获取当前用户

```typescript
import { AuthService } from '@/lib/services/auth.service';

// 获取 session
const { session } = await AuthService.getSession();

// 获取用户信息
const { user } = await AuthService.getCurrentUser();
```

### 登出

```typescript
await AuthService.signOut();
```

## 🔍 调试

### 查看 Auth 日志
在 Supabase Dashboard:
1. 点击 **Logs**
2. 选择 **Auth Logs**
3. 查看登录/登出事件

### 检查用户表
```sql
-- 查看 auth.users
SELECT * FROM auth.users;

-- 查看 public.users
SELECT * FROM public.users;
```

### 常见问题

#### 1. 回调地址错误
**错误**: `redirect_uri_mismatch`

**解决**: 确保 GitHub OAuth App 的回调 URL 设置为：
```
https://zycrqpwhwmcoejksjrth.supabase.co/auth/v1/callback
```

#### 2. RLS 策略阻止插入
**错误**: `new row violates row-level security policy`

**解决**: 确保已执行 `003-adapt-supabase-auth.sql` 迁移脚本

#### 3. Session 未找到
**错误**: `Session not found`

**解决**: 
- 检查 cookie 设置
- 确保前端使用了正确的 Supabase 客户端配置
- 验证 PKCE flow 已启用

## 📚 相关资源

- [Supabase Auth 文档](https://supabase.com/docs/guides/auth)
- [GitHub OAuth 文档](https://docs.github.com/en/apps/oauth-apps)
- [Row Level Security 指南](https://supabase.com/docs/guides/auth/row-level-security)

## ✅ 迁移完成检查清单

- [ ] Supabase Dashboard 中启用 GitHub Provider
- [ ] GitHub OAuth App 回调 URL 已更新
- [ ] 环境变量已配置
- [ ] 数据库迁移已执行
- [ ] RLS 策略已验证
- [ ] 触发器已创建
- [ ] 测试登录流程
- [ ] 测试用户信息同步
- [ ] 测试登出功能

## 🎉 完成！

配置完成后，你的应用将使用 Supabase Auth 处理所有的 GitHub OAuth 登录流程，享受以下优势：

- ✨ 更安全的认证机制
- 🔐 自动的 token 刷新
- 📊 内置的用户管理
- 🛡️ Row Level Security 支持
- 📈 详细的认证日志

