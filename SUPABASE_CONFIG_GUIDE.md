# 🔧 Supabase URL 配置指南

## 📍 需要修改的配置

### 1. 登录 Supabase Dashboard

访问：https://supabase.com/dashboard

选择你的项目：`zycrqpwhwmcoejksjrth`

---

### 2. 配置 Redirect URLs

**路径：** Authentication → URL Configuration

#### Site URL（站点 URL）
```
http://localhost:3000
```

#### Redirect URLs（允许的重定向 URL）
添加以下 URL（点击 "Add URL" 按钮）：

```
http://localhost:3000/api/auth/github/callback
```

**重要：** 这个 URL 必须精确匹配，Supabase 会在 GitHub OAuth 成功后重定向到这里。

---

### 3. 保存配置

点击页面底部的 **"Save"** 按钮。

---

## ✅ 配置后的完整流程

修改配置后，登录流程将是：

```
1. 用户点击 "使用 GitHub 登录"
   ↓
2. GET /api/auth/github
   ↓
3. 重定向到 GitHub 授权页面
   ↓
4. 用户在 GitHub 授权
   ↓
5. GitHub 重定向到 Supabase
   - https://zycrqpwhwmcoejksjrth.supabase.co/auth/v1/callback
   ↓
6. Supabase 处理 OAuth 并创建 session
   ↓
7. Supabase 重定向到你的后端回调 ✅
   - http://localhost:3000/api/auth/github/callback?code=xxx
   ↓
8. 后端处理：
   - 交换授权码
   - 同步用户信息到数据库
   - 重定向到前端: /auth/callback?success=true
   ↓
9. 前端显示 "🎉 登录成功！"
   ↓
10. 1.5秒后跳转到 /dashboard ✅
```

---

## 📊 预期的终端日志

配置成功后，终端应该显示：

```bash
GET /api/auth/github 307 in 250ms
📥 GitHub 回调接收: { code: '...', error: null }
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

---

## 🐛 如果还是不行

### 检查 1: Supabase URL 配置
确保在 **Authentication → URL Configuration** 中：
- ✅ Site URL = `http://localhost:3000`
- ✅ Redirect URLs 包含 `http://localhost:3000/api/auth/github/callback`

### 检查 2: GitHub OAuth App
确保在 GitHub OAuth App 设置中：
- ✅ Authorization callback URL = `https://zycrqpwhwmcoejksjrth.supabase.co/auth/v1/callback`

### 检查 3: 清除缓存
1. 清除浏览器缓存和 Cookies
2. 重启开发服务器：
   ```bash
   cd frontend
   npm run dev
   ```

### 检查 4: 环境变量
确保 `.env.local` 中配置正确：
```bash
SUPABASE_URL=https://zycrqpwhwmcoejksjrth.supabase.co
SUPABASE_ANON_KEY=你的_ANON_KEY
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000
```

---

## 📸 配置截图位置

在 Supabase Dashboard 中：

```
左侧菜单
  └─ Authentication
       └─ URL Configuration  ← 在这里配置
            ├─ Site URL: http://localhost:3000
            └─ Redirect URLs:
                 └─ http://localhost:3000/api/auth/github/callback
```

---

## 🎯 配置完成后测试

1. 访问 `http://localhost:3000`
2. 点击 "使用 GitHub 登录"
3. 在 GitHub 授权
4. 应该看到：
   - ✅ 绿色的 "🎉 登录成功！" 卡片
   - ✅ 控制台输出 "✅ 登录成功！用户: xxx@xxx.com"
   - ✅ 1.5秒后自动跳转到 `/dashboard`

---

## 💡 提示

- 修改 Supabase 配置后**不需要**重启服务器
- 但建议**清除浏览器缓存**后重新测试
- 如果还有问题，查看浏览器控制台和终端日志

---

祝你配置顺利！🚀

