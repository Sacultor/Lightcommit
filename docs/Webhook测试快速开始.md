# Webhook 测试快速开始

5 分钟快速测试 GitHub Webhook 完整数据流。

## 🎯 测试目标

验证：**GitHub Webhook → 后端 API → 数据库 → 前端页面** 的完整数据流。

---

## ⚡ 快速开始（3 个命令）

### 1️⃣ 发送测试 Webhook

```bash
npm run test:webhook
```

✅ 应该看到：`✅ Webhook 发送成功！`

### 2️⃣ 验证数据存储

```bash
npm run test:verify-data
```

✅ 应该看到：最新的贡献记录

### 3️⃣ 测试前端 API

```bash
npm run test:api
```

✅ 应该看到：`✅ 所有测试通过！`

### 4️⃣ 打开浏览器验证

访问：http://localhost:3000/explore

✅ 应该看到：刚才发送的 commit 显示在页面上

---

## 📋 前置准备（首次运行）

### 步骤 1：环境变量配置

```bash
# frontend/.env
DATABASE_URL=postgresql://user:password@localhost:5432/lightcommit
GITHUB_WEBHOOK_SECRET=test_secret_123
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
JWT_SECRET=your_jwt_secret
```

### 步骤 2：启动服务

```bash
# 1. 启动数据库（如果使用 Docker）
docker-compose up -d postgres

# 2. 运行数据库迁移
cd frontend
npm run db:migrate

# 3. 启动开发服务器
npm run dev
```

### 步骤 3：创建测试用户

```bash
psql $DATABASE_URL -c "
INSERT INTO users (id, github_id, username, email, created_at, updated_at)
VALUES (gen_random_uuid(), '12345678', 'testuser', 'testuser@example.com', NOW(), NOW())
ON CONFLICT DO NOTHING;
"
```

**或者**使用任何 SQL 客户端执行：

```sql
INSERT INTO users (id, github_id, username, email, created_at, updated_at)
VALUES (gen_random_uuid(), '12345678', 'testuser', 'testuser@example.com', NOW(), NOW())
ON CONFLICT DO NOTHING;
```

---

## 🧪 测试命令说明

| 命令 | 功能 | 输出 |
|------|------|------|
| `npm run test:webhook` | 发送 push 事件 | ✅ Webhook 发送成功 |
| `npm run test:webhook:pr` | 发送 PR 事件 | ✅ Webhook 发送成功 |
| `npm run test:verify-data` | 查询数据库 | 📊 显示最新贡献记录 |
| `npm run test:api` | 测试前端 API | ✅ API 测试通过 |

---

## 🔍 验证清单

完成测试后，验证以下内容：

### ✅ 后端日志

```bash
# 在 npm run dev 的终端中应该看到：
🔔 Webhook received
📋 Event type: push
✅ Signature verified
✅ Webhook processed successfully
```

### ✅ 数据库记录

```bash
# 运行查询命令后应该看到：
📊 找到 1 条记录:
1. feat: add new feature
   类型: commit
   贡献者: testuser
   状态: pending
```

### ✅ API 响应

```bash
# 运行 API 测试后应该看到：
✅ API 请求成功
📊 返回 1 条贡献:
1. feat: add new feature
```

### ✅ 前端页面

打开 http://localhost:3000/explore 应该看到：
- 显示最新的 commit 卡片
- 卡片包含：仓库名、commit 消息、作者、时间

---

## 🐛 常见问题

### ❌ 签名验证失败

**问题**：`❌ Invalid signature`

**解决**：
```bash
# 检查环境变量
echo $GITHUB_WEBHOOK_SECRET

# 应该与测试脚本中的一致（默认：test_secret_123）
```

### ❌ 用户不存在

**问题**：`⚠️ User not found in database: testuser`

**解决**：重新执行步骤 3 创建测试用户

### ❌ 数据库连接失败

**问题**：`❌ 数据库连接失败`

**解决**：
```bash
# 检查数据库是否运行
docker ps | grep postgres
# 或
pg_isready

# 测试连接
psql $DATABASE_URL -c "SELECT 1;"
```

### ❌ 服务器未启动

**问题**：`❌ 请求失败: fetch failed`

**解决**：
```bash
# 启动开发服务器
npm run dev
```

---

## 📚 进阶测试

### 1. 测试真实的 GitHub Webhook

使用 ngrok 暴露本地服务：

```bash
# 1. 安装 ngrok
brew install ngrok

# 2. 启动 ngrok
ngrok http 3000

# 3. 复制 URL（例如：https://abc123.ngrok.io）

# 4. 在 GitHub 仓库配置 Webhook
# Settings → Webhooks → Add webhook
# Payload URL: https://abc123.ngrok.io/api/github/webhook
# Secret: test_secret_123

# 5. Push 代码触发 Webhook
git commit --allow-empty -m "test webhook"
git push
```

详细说明：[Webhook 测试指南](./Webhook测试指南.md)

### 2. 自定义测试数据

```bash
# 修改测试用户
GITHUB_USERNAME=yourname npm run test:webhook

# 修改 Webhook URL
WEBHOOK_URL=https://your-domain.com/api/github/webhook npm run test:webhook

# 查看更多记录
node scripts/verify-webhook-data.js 10
```

### 3. 测试生产环境

```bash
# 测试生产 API
API_URL=https://your-domain.com npm run test:api
```

---

## 📖 相关文档

- **完整测试指南**：[Webhook测试指南.md](./Webhook测试指南.md)
- **测试工具说明**：[frontend/scripts/README.md](../frontend/scripts/README.md)
- **API 文档**：[api.md](./api.md)
- **前端架构**：[前端技术架构.md](./前端技术架构.md)

---

## 🎉 成功标志

如果所有测试通过，你应该看到：

1. ✅ 测试脚本输出成功信息
2. ✅ 后端日志显示 Webhook 处理成功
3. ✅ 数据库中有新的贡献记录
4. ✅ API 返回正确的数据
5. ✅ 前端页面正确显示数据

**恭喜！Webhook 数据流已经打通！** 🎊

---

## 🔄 清理测试数据

测试完成后，可以清理测试数据：

```sql
-- 删除测试贡献
DELETE FROM contributions WHERE contributor = 'testuser';

-- 删除测试仓库（如果不需要）
DELETE FROM repositories WHERE full_name LIKE '%test-repo%';

-- 保留测试用户（可选）
-- DELETE FROM users WHERE username = 'testuser';
```

或使用命令：

```bash
psql $DATABASE_URL -c "DELETE FROM contributions WHERE contributor = 'testuser';"
```

---

## 💡 下一步

测试通过后，你可以：

1. **配置真实的 GitHub Webhook**：接收真实的 push/PR 事件
2. **修改前端页面**：使用真实数据替换 mock 数据（参考 [替换Mock数据指南](./替换Mock数据指南.md)）
3. **部署到生产环境**：测试完整的线上流程
4. **添加自动化测试**：编写 E2E 测试确保数据流稳定

---

## 🆘 需要帮助？

如果遇到问题：

1. 查看 [常见问题](#-常见问题) 部分
2. 阅读 [完整测试指南](./Webhook测试指南.md)
3. 查看后端日志和错误信息
4. 检查数据库连接和数据

