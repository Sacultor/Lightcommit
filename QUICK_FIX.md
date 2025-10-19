# 🚨 快速修复 redirect_uri 错误

## 问题
```
redirect_uri与此应用程序无关
该应用程序可能配置错误或试图将您重定向到您未预料到的网站
```

## ⚡ 快速解决方案（5分钟）

### 1️⃣ 打开 GitHub OAuth App 设置
点击这个链接：
```
https://github.com/settings/developers
```

### 2️⃣ 找到你的应用
- 查找 Client ID: `Ov23liA4VXIdVVsuolv1`
- 点击进入设置

### 3️⃣ 修改回调 URL
在 **Authorization callback URL** 字段中，将：
```
旧的: http://localhost:3000/api/auth/github/callback
```

改为：
```
新的: https://zycrqpwhwmcoejksjrth.supabase.co/auth/v1/callback
```

### 4️⃣ 保存
点击 **"Update application"** 按钮

### 5️⃣ 在 Supabase 配置 GitHub Provider

1. 访问: https://supabase.com/dashboard
2. 选择你的项目
3. 点击左侧 **Authentication** → **Providers**
4. 找到 **GitHub**，点击启用
5. 填入：
   - **Client ID**: `Ov23liA4VXIdVVsuolv1`
   - **Client Secret**: `211f0084277852e2ffc5001920296590d02fd93c`
6. 点击 **Save**

### 6️⃣ 测试
1. 重新访问你的应用
2. 点击"使用 GitHub 登录"
3. 应该能正常工作了！

---

## 🎯 为什么会出错？

使用 Supabase Auth 后：
- ❌ 旧的回调: `http://localhost:3000/api/auth/github/callback`
- ✅ 新的回调: `https://zycrqpwhwmcoejksjrth.supabase.co/auth/v1/callback`

GitHub OAuth 会验证回调 URL 是否匹配，不匹配就会显示错误。

## 📞 还是不行？

检查这些：
1. GitHub OAuth App 的回调 URL 是否正确保存
2. Supabase Dashboard 中 GitHub Provider 是否已启用
3. 清除浏览器缓存和 Cookie
4. 检查浏览器控制台是否有错误信息

