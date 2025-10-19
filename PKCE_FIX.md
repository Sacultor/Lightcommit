# 🔐 PKCE 流程修复

## 问题说明

之前的错误：
```
invalid request: both auth code and code verifier should be non-empty
```

### 原因
Supabase Auth 使用 PKCE (Proof Key for Code Exchange) 流程：
1. OAuth 开始时生成 `code_verifier` 和 `code_challenge`
2. `code_verifier` 存储在浏览器 localStorage 中
3. 回调时需要 `code_verifier` 来验证和交换授权码

我们之前**手动调用** `exchangeCodeForSession`，但没有提供 `code_verifier`。

## ✅ 修复方案

### 不再手动交换授权码

**之前（错误）：**
```typescript
// ❌ 手动调用，缺少 code_verifier
const { session } = await AuthService.handleOAuthCallback(code);
```

**现在（正确）：**
```typescript
// ✅ 让 Supabase 自动处理
// Supabase 会自动检测 URL 中的 code 并处理 PKCE
await new Promise(resolve => setTimeout(resolve, 1000));
const { session } = await AuthService.getSession();
```

### 工作原理

1. **Supabase 客户端配置：**
   ```typescript
   {
     auth: {
       detectSessionInUrl: true,  // 自动检测 URL 中的 OAuth 回调
       flowType: 'pkce'           // 使用 PKCE 流程
     }
   }
   ```

2. **自动处理流程：**
   - Supabase 客户端初始化时检测 URL 中的 `code` 参数
   - 从 localStorage 读取 `code_verifier`
   - 自动调用 Supabase Auth API 交换授权码
   - 创建并存储 session

3. **回调页面等待：**
   - 等待 1 秒让 Supabase 完成自动处理
   - 然后获取已创建的 session
   - 同步用户信息到数据库

## 🔄 完整流程

```
1. 用户点击 "GitHub 登录"
   ↓
2. Supabase 生成 code_verifier 并存储到 localStorage
   ↓
3. 重定向到 GitHub（带 code_challenge）
   ↓
4. GitHub 授权后回调到 Supabase
   ↓
5. Supabase 回调到前端 /auth/callback?code=xxx
   ↓
6. Supabase 客户端自动检测到 code
   ↓
7. 从 localStorage 读取 code_verifier
   ↓
8. 自动交换授权码获取 session ✅
   ↓
9. 前端回调页面获取 session
   ↓
10. 同步用户信息到数据库
   ↓
11. 显示成功消息并跳转
```

## 🎯 现在测试

1. **清除浏览器所有数据**（重要！）
   - Cookies
   - localStorage
   - 缓存

2. **重新登录**

3. **观察控制台：**
   ```
   🔍 回调参数: { hasCode: true, success: null, error: null }
   🔄 检查 Supabase session...
   ✅ Session 已创建: user@example.com
   🔄 同步用户信息到数据库...
   ✅ 用户信息同步成功
   🎉 登录成功！用户: user@example.com
   ```

4. **应该看到：**
   - ✅ 绿色 "🎉 登录成功！" 卡片
   - ✅ 1.5秒后跳转到 /dashboard
   - ✅ 没有任何错误

## 📚 参考

- [Supabase PKCE Flow](https://supabase.com/docs/guides/auth/server-side/pkce-flow)
- [OAuth 2.0 PKCE](https://oauth.net/2/pkce/)

