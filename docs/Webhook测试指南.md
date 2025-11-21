# Webhook 测试指南

本文档说明如何测试 GitHub Webhook 的完整数据流：GitHub → 后端 → 数据库 → 前端。

## 📋 目录

1. [数据流程图](#数据流程图)
2. [环境准备](#环境准备)
3. [方法一：本地测试（推荐）](#方法一本地测试推荐)
4. [方法二：模拟 Webhook 请求](#方法二模拟-webhook-请求)
5. [方法三：生产环境测试](#方法三生产环境测试)
6. [验证数据流](#验证数据流)
7. [常见问题排查](#常见问题排查)

---

## 数据流程图

```
GitHub 仓库
    ↓ (用户 push 代码)
GitHub Webhook
    ↓ (HTTP POST 请求)
Next.js API Route
    ↓ (/api/github/webhook)
签名验证
    ↓
GitHubService.handleWebhook()
    ↓
ContributionRepository.create()
    ↓
PostgreSQL 数据库
    ↓ (contributions 表)
前端 API 查询
    ↓ (/api/contributions/latest)
React Query
    ↓
前端页面显示
```

---

## 环境准备

### 1. 环境变量配置

确保以下环境变量已配置：

```bash
# frontend/.env
DATABASE_URL=postgresql://user:password@localhost:5432/lightcommit
GITHUB_WEBHOOK_SECRET=your_webhook_secret_here
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
JWT_SECRET=your_jwt_secret
```

### 2. 数据库准备

确保数据库已运行并已执行迁移：

```bash
cd frontend
npm run db:migrate
```

### 3. 启动开发服务器

```bash
cd frontend
npm run dev
```

服务器应该运行在 `http://localhost:3000`

---

## 方法一：本地测试（推荐）

使用 ngrok 将本地服务暴露到公网，让 GitHub 可以访问。

### 步骤 1：安装 ngrok

```bash
# macOS
brew install ngrok

# 或下载
# https://ngrok.com/download
```

### 步骤 2：启动 ngrok

```bash
ngrok http 3000
```

输出示例：
```
Forwarding  https://abc123.ngrok.io -> http://localhost:3000
```

**记录这个 URL**：`https://abc123.ngrok.io`

### 步骤 3：配置 GitHub Webhook

1. 打开你的 GitHub 仓库
2. 进入 **Settings** → **Webhooks** → **Add webhook**
3. 配置如下：

```
Payload URL: https://abc123.ngrok.io/api/github/webhook
Content type: application/json
Secret: your_webhook_secret_here (与环境变量一致)
SSL verification: Enable SSL verification
Events: 
  ✅ Just the push event
  ✅ Pull requests
```

4. 点击 **Add webhook**

### 步骤 4：触发 Webhook

在本地修改代码并推送：

```bash
cd your-repo
echo "test" >> test.txt
git add .
git commit -m "test: trigger webhook"
git push origin main
```

### 步骤 5：查看日志

**后端日志**（终端）：
```bash
# 应该看到以下日志：
🔔 Webhook received
📋 Event type: push
🔐 Verifying signature...
✅ Signature verified
⚙️  Processing webhook event...
Processing push event...
Created contribution xxx for commit yyy
✅ Webhook processed successfully
```

**GitHub 日志**：
- 回到 GitHub Webhook 设置页面
- 点击 **Recent Deliveries**
- 查看请求和响应

### 步骤 6：验证数据库

```bash
# 连接数据库
psql $DATABASE_URL

# 查询最新的贡献
SELECT id, type, title, contributor, status, created_at 
FROM contributions 
ORDER BY created_at DESC 
LIMIT 5;
```

应该看到新插入的记录。

### 步骤 7：验证前端

打开浏览器访问：`http://localhost:3000/explore`

应该看到刚才 push 的 commit 显示在页面上。

---

## 方法二：模拟 Webhook 请求

不使用 ngrok，直接发送模拟请求测试后端逻辑。

### 步骤 1：创建测试脚本

创建文件 `test-webhook.js`：

```javascript
const crypto = require('crypto');

// 配置
const WEBHOOK_URL = 'http://localhost:3000/api/github/webhook';
const WEBHOOK_SECRET = 'your_webhook_secret_here'; // 与环境变量一致

// 模拟 push 事件的 payload
const payload = {
  ref: 'refs/heads/main',
  before: '0000000000000000000000000000000000000000',
  after: 'abc123def456',
  repository: {
    id: 123456,
    name: 'test-repo',
    full_name: 'test-user/test-repo',
    private: false,
    html_url: 'https://github.com/test-user/test-repo',
    description: 'Test repository',
  },
  commits: [
    {
      id: 'abc123def456',
      message: 'test: webhook test commit',
      timestamp: new Date().toISOString(),
      url: 'https://github.com/test-user/test-repo/commit/abc123',
      author: {
        name: 'Test User',
        email: 'test@example.com',
        username: 'testuser', // ⚠️ 这个用户必须在数据库中存在
      },
      added: ['test.txt'],
      removed: [],
      modified: [],
    },
  ],
  sender: {
    login: 'testuser',
    id: 12345,
  },
};

// 计算签名
const payloadString = JSON.stringify(payload);
const signature = 'sha256=' + crypto
  .createHmac('sha256', WEBHOOK_SECRET)
  .update(payloadString)
  .digest('hex');

console.log('📤 Sending webhook request...');
console.log('Signature:', signature);

// 发送请求
fetch(WEBHOOK_URL, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Hub-Signature-256': signature,
    'X-GitHub-Event': 'push',
    'X-GitHub-Delivery': crypto.randomUUID(),
  },
  body: payloadString,
})
  .then((res) => res.json())
  .then((data) => {
    console.log('✅ Response:', data);
  })
  .catch((err) => {
    console.error('❌ Error:', err);
  });
```

### 步骤 2：运行测试脚本

```bash
node test-webhook.js
```

### 步骤 3：查看输出

```bash
📤 Sending webhook request...
Signature: sha256=abc123...
✅ Response: { success: true }
```

### 步骤 4：验证数据

同样查看后端日志、数据库和前端页面。

---

## 方法三：生产环境测试

部署到生产环境后测试。

### 步骤 1：部署应用

```bash
# 部署到 Vercel/Railway/Render 等平台
git push origin main
```

### 步骤 2：获取生产 URL

例如：`https://lightcommit.vercel.app`

### 步骤 3：配置 GitHub Webhook

在 GitHub 仓库中配置：

```
Payload URL: https://lightcommit.vercel.app/api/github/webhook
Content type: application/json
Secret: your_webhook_secret_here
```

### 步骤 4：触发并验证

同方法一的步骤 4-7。

---

## 验证数据流

### 1. 验证 Webhook 接收

**检查项**：
- ✅ GitHub 显示 webhook 发送成功（绿色勾）
- ✅ 后端日志显示 `🔔 Webhook received`
- ✅ 签名验证通过 `✅ Signature verified`

**如果失败**：
- 检查 Webhook URL 是否正确
- 检查 Secret 是否一致
- 查看 GitHub 的错误详情

### 2. 验证数据存储

**方法 A：查询数据库**

```sql
-- 查看最新的贡献
SELECT 
  id,
  type,
  title,
  contributor,
  status,
  created_at,
  metadata
FROM contributions 
ORDER BY created_at DESC 
LIMIT 10;
```

**方法 B：使用 API 查询**

```bash
# 需要先登录获取 token
curl -X GET http://localhost:3000/api/contributions/latest \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**检查项**：
- ✅ 记录存在
- ✅ `type` = 'commit'
- ✅ `status` = 'pending'
- ✅ `contributor` 匹配 GitHub 用户名
- ✅ `metadata` 包含 commit 详情

### 3. 验证前端显示

**方法 A：浏览器访问**

1. 打开 `http://localhost:3000/explore`
2. 应该看到最新的 commit 卡片
3. 卡片信息应该匹配数据库记录

**方法 B：使用 React Query DevTools**

1. 在浏览器中按 `F12` 打开开发者工具
2. 切换到 **React Query** 标签（如果已安装）
3. 查看 `latest-contributions` 查询的数据

**检查项**：
- ✅ 数据加载成功（`isLoading: false`）
- ✅ 显示最新的 commit
- ✅ 信息正确（仓库名、commit 消息、作者）

### 4. 端到端测试

创建自动化测试脚本：

```javascript
// test/e2e/webhook-flow.test.js
const { test, expect } = require('@playwright/test');

test('webhook 数据流测试', async ({ page }) => {
  // 1. 触发 webhook（需要先手动 push）
  
  // 2. 等待 2 秒（让后端处理）
  await page.waitForTimeout(2000);
  
  // 3. 访问 Explore 页面
  await page.goto('http://localhost:3000/explore');
  
  // 4. 等待数据加载
  await page.waitForSelector('[data-testid="contribution-card"]');
  
  // 5. 验证第一个卡片
  const firstCard = page.locator('[data-testid="contribution-card"]').first();
  const title = await firstCard.locator('h3').textContent();
  
  // 6. 断言
  expect(title).toContain('test-user/test-repo');
});
```

---

## 常见问题排查

### 问题 1：Webhook 收到 400 错误

**可能原因**：
- ❌ 签名验证失败
- ❌ 缺少必需的请求头
- ❌ 请求体格式错误

**解决方案**：
```bash
# 1. 检查 Secret 是否一致
echo $GITHUB_WEBHOOK_SECRET

# 2. 查看 GitHub 的错误详情
# Settings → Webhooks → Recent Deliveries → 点击具体的请求

# 3. 检查后端日志
# 应该看到具体的错误信息
```

### 问题 2：数据没有存储到数据库

**可能原因**：
- ❌ 用户不存在（`contributor` 在 users 表中没有记录）
- ❌ 仓库不存在（会自动创建，但可能失败）
- ❌ 数据库连接失败

**解决方案**：
```bash
# 1. 检查用户是否存在
psql $DATABASE_URL -c "SELECT * FROM users WHERE username = 'testuser';"

# 2. 如果不存在，创建测试用户
psql $DATABASE_URL -c "
INSERT INTO users (id, github_id, username, email, created_at, updated_at)
VALUES (gen_random_uuid(), '12345', 'testuser', 'test@example.com', NOW(), NOW());
"

# 3. 查看后端错误日志
# 应该看到具体的数据库错误
```

### 问题 3：前端没有显示数据

**可能原因**：
- ❌ API 请求失败
- ❌ 认证 token 无效
- ❌ React Query 缓存问题

**解决方案**：
```javascript
// 1. 打开浏览器控制台
// 2. 查看 Network 标签
// 3. 检查 /api/contributions/latest 请求

// 4. 检查响应
{
  "data": [
    {
      "id": "...",
      "title": "test: webhook test commit",
      // ...
    }
  ]
}

// 5. 如果没有数据，手动刷新
// 在控制台执行：
queryClient.invalidateQueries(['latest-contributions']);
```

### 问题 4：ngrok 连接失败

**可能原因**：
- ❌ ngrok 未启动
- ❌ ngrok URL 过期（免费版 8 小时）
- ❌ 防火墙阻止

**解决方案**：
```bash
# 1. 重启 ngrok
ngrok http 3000

# 2. 更新 GitHub Webhook URL

# 3. 使用备用方案
# 可以使用 localtunnel 代替 ngrok
npx localtunnel --port 3000
```

---

## 调试工具

### 1. 查看实时日志

```bash
# 后端日志
npm run dev

# 数据库日志（如果使用 Docker）
docker logs -f postgres-container
```

### 2. 使用 Postman/Insomnia 测试

导入以下请求：

```json
{
  "method": "POST",
  "url": "http://localhost:3000/api/github/webhook",
  "headers": {
    "Content-Type": "application/json",
    "X-Hub-Signature-256": "sha256=...",
    "X-GitHub-Event": "push"
  },
  "body": {
    // ... payload
  }
}
```

### 3. 使用 GitHub 的 Webhook 测试工具

在 GitHub Webhook 设置页面：
1. 点击 **Recent Deliveries**
2. 选择一个成功的请求
3. 点击 **Redeliver**（重新发送）

---

## 完整测试清单

```
测试前准备：
□ 环境变量已配置
□ 数据库已启动
□ 开发服务器已运行
□ 测试用户已创建

Webhook 接收测试：
□ ngrok 已启动（如果本地测试）
□ GitHub Webhook 已配置
□ 签名验证通过
□ 事件类型正确

数据存储测试：
□ Contribution 已创建
□ Repository 已创建（如果不存在）
□ 数据格式正确
□ metadata 字段完整

前端显示测试：
□ API 返回数据
□ React Query 缓存正确
□ 页面正确渲染
□ 信息完整准确

端到端测试：
□ Push → Webhook → 数据库 → 前端（完整流程）
□ 多次 push 测试
□ 不同事件类型测试（push/PR）
```

---

## 总结

测试 Webhook 数据流的三种方法：

1. **本地测试（ngrok）**：最接近真实场景，推荐用于开发阶段
2. **模拟请求**：快速测试，不需要真实的 GitHub 事件
3. **生产测试**：验证部署后的完整功能

验证要点：
- ✅ Webhook 接收成功
- ✅ 签名验证通过
- ✅ 数据正确存储
- ✅ 前端正确显示

遇到问题时，按照以下顺序排查：
1. GitHub → 查看 webhook 发送状态
2. 后端 → 查看日志和错误信息
3. 数据库 → 验证数据是否存储
4. 前端 → 检查 API 请求和数据显示

---

## 参考资料

- [GitHub Webhooks 文档](https://docs.github.com/en/webhooks)
- [ngrok 使用指南](https://ngrok.com/docs)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)

