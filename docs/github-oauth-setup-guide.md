# GitHub OAuth 配置指南

## 🎯 使用 Supabase Auth 的配置

### 方法 1: 更新现有的 OAuth App（简单）

1. 访问: https://github.com/settings/developers
2. 选择你的 OAuth App (Client ID: `Ov23liA4VXIdVVsuolv1`)
3. 修改 **Authorization callback URL** 为:
   ```
   https://zycrqpwhwmcoejksjrth.supabase.co/auth/v1/callback
   ```
4. 点击 **Update application**

### 方法 2: 创建新的 OAuth App（推荐）

为了保留开发环境配置，建议创建一个新的 OAuth App：

#### 步骤：

1. **访问 GitHub 创建页面:**
   ```
   https://github.com/settings/applications/new
   ```

2. **填写信息:**
   - **Application name**: `LightCommit - Supabase`
   - **Homepage URL**: `http://localhost:3000` (或你的生产 URL)
   - **Application description**: `LightCommit with Supabase Auth`
   - **Authorization callback URL**: 
     ```
     https://zycrqpwhwmcoejksjrth.supabase.co/auth/v1/callback
     ```

3. **点击 "Register application"**

4. **获取凭证:**
   - 复制 **Client ID**
   - 点击 **Generate a new client secret**
   - 复制 **Client Secret**

5. **在 Supabase Dashboard 配置:**
   - 进入 Supabase Dashboard → Authentication → Providers → GitHub
   - 填入新的 Client ID 和 Client Secret
   - 保存

## ⚠️ 重要提醒

**单个 GitHub OAuth App 只能配置一个回调 URL！**

如果你需要支持多个环境（开发、生产），有两个选择：

### 选择 A: 使用多个 OAuth Apps
- 开发环境: 一个 OAuth App (回调: `http://localhost:3000/...`)
- 生产环境: 另一个 OAuth App (回调: `https://your-domain.com/...`)

### 选择 B: 使用通配符域名（GitHub 不支持）
❌ GitHub OAuth 不支持通配符回调 URL

## 🔍 当前配置

根据你的 `.env.local`:
```
Client ID: Ov23liA4VXIdVVsuolv1
当前回调 URL: http://localhost:3000/api/auth/github/callback
需要改为: https://zycrqpwhwmcoejksjrth.supabase.co/auth/v1/callback
```

## ✅ 验证配置

更新后，测试登录流程：
1. 访问 `http://localhost:3000`
2. 点击"使用 GitHub 登录"
3. 应该跳转到 GitHub 授权页面
4. 授权后应该成功登录

如果仍然出错，检查：
- [ ] GitHub OAuth App 回调 URL 是否正确
- [ ] Supabase Dashboard 中 GitHub Provider 是否已启用
- [ ] Client ID 和 Secret 是否正确填写在 Supabase 中

