# 🔄 登录重定向流程图

## 当前完整流程

```
1. 用户点击 "使用 GitHub 登录"
   ↓
2. GET /api/auth/github
   - AuthService.signInWithGitHub()
   - 获取 Supabase Auth 的 GitHub OAuth URL
   ↓
3. 重定向到 GitHub 授权页面
   - 用户授权应用
   ↓
4. GitHub 重定向到 Supabase 回调
   - https://zycrqpwhwmcoejksjrth.supabase.co/auth/v1/callback
   - Supabase 处理 OAuth 并创建 session
   ↓
5. Supabase 重定向到我们的后端回调
   - GET /api/auth/github/callback?code=<uuid>
   - 交换授权码获取 session
   - 同步用户信息到 public.users 表
   ↓
6. 后端回调重定向到前端
   - GET /auth/callback?success=true
   ↓
7. 前端回调页面处理
   - 验证 session
   - 显示 "🎉 登录成功！" 消息 (1.5秒)
   - 自动重定向到 /dashboard
   ↓
8. 用户进入 Dashboard 页面 ✅
```

## 📁 涉及的文件

### 1. 登录入口
**文件**: `frontend/src/app/api/auth/github/route.ts`
```typescript
// 调用 Supabase Auth 获取 GitHub OAuth URL
const { url } = await AuthService.signInWithGitHub();
return NextResponse.redirect(url); // 跳转到 GitHub
```

### 2. 后端回调处理
**文件**: `frontend/src/app/api/auth/github/callback/route.ts`
```typescript
// Supabase 回调后的处理
const { session } = await AuthService.handleOAuthCallback(code);
await AuthService.mapSupabaseUserToAppUser(supabaseUser); // 同步用户信息
return NextResponse.redirect(`${frontendUrl}/auth/callback?success=true`);
```

### 3. 前端回调页面
**文件**: `frontend/src/app/auth/callback/page.tsx`
```typescript
const { session } = await AuthService.getSession();
if (session) {
  setStatus('success');
  console.log('✅ 登录成功！用户:', session.user.email);
  setTimeout(() => router.replace('/dashboard'), 1500);
}
```

### 4. 中间件 (路由守卫)
**文件**: `frontend/src/middleware.ts`
```typescript
// 公开路由列表
const publicRoutes = [
  '/',
  '/discover',
  '/dashboard',  // ✅ dashboard 是公开的，不需要认证
  '/auth',
  // ...
];

// 受保护的路由 (需要认证)
const protectedRoutes = [
  '/dashboard/mint',  // 仅 mint 需要认证
  '/profiles',
  '/contributions',
];
```

## 🔑 关键配置

### 环境变量 (.env.local)
```bash
SUPABASE_URL=https://zycrqpwhwmcoejksjrth.supabase.co
SUPABASE_ANON_KEY=你的_ANON_KEY
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000

# GitHub OAuth (在 Supabase Dashboard 配置)
GITHUB_CLIENT_ID=Ov23liA4VXIdVVsuolv1
```

### GitHub OAuth App 配置
```
Authorization callback URL:
https://zycrqpwhwmcoejksjrth.supabase.co/auth/v1/callback
```

### Supabase Dashboard 配置
1. Authentication → Providers → GitHub
2. 启用 GitHub Provider
3. 填入 Client ID 和 Client Secret
4. Redirect URLs 自动设置为：
   `http://localhost:3000/auth/callback`

## ✅ 预期行为

### 成功登录时：
1. 用户在 GitHub 授权
2. 后端成功创建 session
3. 用户信息同步到数据库
4. 显示 "🎉 登录成功！" 绿色卡片
5. 控制台输出: `✅ 登录成功！用户: user@email.com`
6. 1.5秒后自动跳转到 `/dashboard`

### 失败情况：
1. GitHub 授权失败 → `/auth/error?error=...`
2. Session 创建失败 → `/auth/error?error=session_exchange_failed`
3. 用户信息获取失败 → `/auth/error?error=user_fetch_failed`

## 🐛 调试检查点

### 检查 Session
```javascript
// 在浏览器控制台
const { data } = await window.supabase.auth.getSession()
console.log(data.session)
```

### 检查 Cookies
在浏览器开发工具 → Application → Cookies 中查看：
- `sb-access-token`
- `sb-refresh-token`

### 检查终端日志
```
✅ 登录成功！用户: user@email.com
GET /auth/callback?success=true 200
GET /dashboard 200
```

## 🎯 当前状态

- ✅ GitHub OAuth 配置正确
- ✅ Supabase Auth 集成完成
- ✅ 回调流程正常工作
- ✅ 重定向到 `/dashboard`
- ✅ 登录成功提示显示
- ✅ 数据库用户同步工作正常

