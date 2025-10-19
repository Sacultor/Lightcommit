# 🔍 Session 问题诊断

## 当前问题
```
❌ 获取 Session 失败: null
```

## 🧪 诊断步骤

### 1. 打开浏览器控制台
重新登录，观察日志中是否有：

```
🔍 回调参数: { hasCode: true, codeLength: 36, ... }
📦 localStorage 中的认证相关 keys: [...]
🔍 尝试获取 session (1/20)...
```

### 2. 检查 localStorage

**在浏览器控制台执行：**
```javascript
// 查看所有 localStorage 内容
console.table(Object.entries(localStorage));

// 查找 Supabase 相关的 key
Object.keys(localStorage).filter(k => 
  k.includes('supabase') || 
  k.includes('auth') ||
  k.includes('pkce')
);
```

**应该看到类似：**
```
supabase.auth.token
sb-zycrqpwhwmcoejksjrth-auth-token
```

### 3. 检查 code_verifier

**问题可能是：**
- ✅ OAuth 开始时生成了 `code_verifier` 并存储
- ❌ 回调时 localStorage 被清空了
- ❌ 使用了不同的域名/端口
- ❌ Supabase 没有正确配置

### 4. 可能的原因

#### A. Supabase 配置问题

**检查 Supabase Dashboard:**
1. Authentication → URL Configuration
2. Redirect URLs 必须包含：
   ```
   http://localhost:3000/auth/callback
   ```
3. Site URL:
   ```
   http://localhost:3000
   ```

#### B. 跨域或安全策略

- 检查浏览器是否阻止了 localStorage 访问
- 检查是否在隐私模式下运行（会阻止 localStorage）

#### C. Supabase 的 detectSessionInUrl 未触发

可能需要在更早的阶段初始化 Supabase 客户端。

## 🔧 解决方案选项

### 方案 A: 改用后端处理（推荐）

在 Supabase Dashboard 中配置 Redirect URL 为：
```
http://localhost:3000/api/auth/github/callback
```

让后端处理 OAuth，然后前端只处理 `success=true`。

**优点：**
- 不依赖浏览器 localStorage
- 后端可以使用 Service Role Key
- 更安全

**缺点：**
- 多一次重定向

### 方案 B: 手动处理 PKCE（当前方案）

保持 Redirect URL 为前端，但需要确保：
1. `code_verifier` 正确存储
2. Supabase 客户端正确配置
3. 浏览器允许 localStorage

### 方案 C: 使用 Supabase Auth Helpers for Next.js

使用官方的 Next.js 集成包：
```bash
npm install @supabase/auth-helpers-nextjs
```

这个包会自动处理所有 PKCE 流程。

## 🎯 下一步

### 立即尝试：检查 localStorage

1. 重新登录
2. 在回调页面打开控制台
3. 执行：
   ```javascript
   Object.keys(localStorage)
   ```
4. 把结果告诉我

### 如果 localStorage 为空

说明 `code_verifier` 没有被正确存储，需要：
1. 检查 Supabase 客户端初始化时机
2. 或者改用后端处理（方案 A）

### 如果 localStorage 有数据但仍然失败

说明 Supabase 的 PKCE 交换失败，需要：
1. 检查 Supabase Dashboard 配置
2. 查看网络请求，看是否有 API 调用失败
3. 检查浏览器控制台的 Network 标签页

## 📞 需要的信息

请提供：
1. 浏览器控制台的完整日志
2. `Object.keys(localStorage)` 的输出
3. Network 标签页中是否有失败的 API 请求

