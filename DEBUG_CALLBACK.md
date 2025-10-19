# 🔍 回调问题诊断

## 当前状态
- ✅ GitHub 授权成功
- ❌ 回调处理失败，重定向到 `/auth/error?error=callback_failed`

## 🧪 诊断步骤

### 1. 检查终端日志

重新登录一次，然后查看终端应该显示：

```bash
GET /api/auth/github 307
📥 GitHub 回调接收: { code: '...', error: null }
🔄 正在交换授权码...
```

**如果看不到这些 emoji 日志，说明：**
- 回调没有到达后端 `/api/auth/github/callback`
- Supabase 直接重定向到了前端

### 2. 检查 Supabase 回调配置

在 Supabase Dashboard → Authentication → URL Configuration 中：

**必须配置：**
```
Redirect URLs:
http://localhost:3000/api/auth/github/callback
```

### 3. 如果看到 emoji 日志但还是失败

查看具体在哪一步失败：

#### A. 如果停在 "🔄 正在交换授权码..."
**问题：** `exchangeCodeForSession` 失败
**原因：** 授权码无效或已过期

#### B. 如果显示 "❌ 交换授权码失败"
**问题：** Supabase Auth 无法交换授权码
**可能原因：**
- GitHub OAuth App 配置错误
- Supabase GitHub Provider 未启用
- Client ID/Secret 不匹配

#### C. 如果显示 "❌ 获取用户信息失败"
**问题：** Session 创建成功，但无法获取用户信息
**可能原因：** Supabase Auth 配置问题

#### D. 如果显示 "⚠️ 同步用户信息失败"
**问题：** 数据库同步失败
**可能原因：**
- RLS 策略问题
- users 表不存在或结构不匹配

### 4. 手动测试回调端点

在浏览器中访问（使用测试 code）：
```
http://localhost:3000/api/auth/github/callback?code=test123
```

应该看到终端输出：
```
📥 GitHub 回调接收: { code: 'test123', error: null }
🔄 正在交换授权码...
❌ 交换授权码失败: [错误信息]
```

## 🔧 快速修复

### 修复1: 确保中间件不阻止回调
已添加到公开路由：
```typescript
'/api/auth/github/callback'  // ✅
```

### 修复2: 重启开发服务器
```bash
# 杀掉所有 Next.js 进程
pkill -f "next dev"

# 重新启动
cd frontend
npm run dev
```

### 修复3: 清除浏览器数据
1. 清除所有 Cookies
2. 清除缓存
3. 重新登录

## 📊 预期的完整日志

成功登录时，终端应该显示：

```bash
GET /api/auth/github 307 in 250ms
📥 GitHub 回调接收: { code: '75c61733...', error: null }
🔄 正在交换授权码...
✅ Session 创建成功: user@example.com
🔄 获取用户信息...
✅ 用户信息获取成功: user@example.com
🔄 同步用户信息到数据库...
✅ 用户信息同步成功
🎉 登录流程完成，重定向到前端回调页面
GET /auth/callback?success=true 200 in 50ms
✅ 登录成功！用户: user@example.com
GET /dashboard 200 in 100ms
```

## 🎯 下一步

1. **重启服务器**：杀掉所有旧进程，重新启动
2. **重新登录**：清除 Cookies 后重新测试
3. **查看日志**：观察终端输出，找出在哪一步失败
4. **反馈错误**：告诉我具体看到了什么错误信息

---

现在请：
1. 重启开发服务器
2. 重新登录一次
3. 把终端显示的完整日志发给我

