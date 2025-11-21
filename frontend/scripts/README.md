# Webhook 测试工具

本目录包含用于测试 GitHub Webhook 数据流的工具脚本。

## 🛠️ 工具列表

### 1. test-webhook.js - Webhook 模拟器

**功能**：发送模拟的 GitHub Webhook 请求到后端

**使用方法**：

```bash
# 方法 1: 使用 npm 脚本（推荐）
npm run test:webhook          # 测试 push 事件
npm run test:webhook:pr       # 测试 pull_request 事件

# 方法 2: 直接运行
node scripts/test-webhook.js push
node scripts/test-webhook.js pull_request

# 自定义配置
WEBHOOK_URL=https://your-domain.com/api/github/webhook \
WEBHOOK_SECRET=your_secret \
GITHUB_USERNAME=yourname \
node scripts/test-webhook.js push
```

**环境变量**：
- `WEBHOOK_URL`: Webhook 接收地址（默认：`http://localhost:3000/api/github/webhook`）
- `WEBHOOK_SECRET`: Webhook 签名密钥（默认：`test_secret_123`）
- `GITHUB_USERNAME`: 测试用户名（默认：`testuser`）

---

### 2. verify-webhook-data.js - 数据验证器

**功能**：查询数据库验证 Webhook 数据是否正确存储

**使用方法**：

```bash
# 方法 1: 使用 npm 脚本（推荐）
npm run test:verify-data

# 方法 2: 直接运行
node scripts/verify-webhook-data.js

# 查看更多记录
node scripts/verify-webhook-data.js 10

# 查看特定用户的贡献
GITHUB_USERNAME=testuser node scripts/verify-webhook-data.js
```

**环境变量**：
- `DATABASE_URL`: 数据库连接字符串（必需）
- `GITHUB_USERNAME`: 筛选的用户名（可选）

**前置条件**：
- 数据库已启动
- 环境变量 `DATABASE_URL` 已配置
- 已安装 `pg` 包：`npm install pg`

---

### 3. test-frontend-api.js - 前端 API 测试器

**功能**：测试前端 API 接口能否正确返回数据

**使用方法**：

```bash
# 方法 1: 使用 npm 脚本（推荐）
npm run test:api

# 方法 2: 直接运行
node scripts/test-frontend-api.js

# 测试生产环境
API_URL=https://your-domain.com node scripts/test-frontend-api.js

# 测试需要认证的接口
AUTH_TOKEN=your_jwt_token node scripts/test-frontend-api.js

# 测试 NFT 接口
WALLET_ADDRESS=0x123... node scripts/test-frontend-api.js
```

**环境变量**：
- `API_URL`: API 基础 URL（默认：`http://localhost:3000`）
- `AUTH_TOKEN`: 认证 token（可选）
- `WALLET_ADDRESS`: 钱包地址（可选，用于测试 NFT 接口）

---

## 📋 完整测试流程

### 步骤 1：准备环境

```bash
# 1. 配置环境变量
cp env.example .env
# 编辑 .env，设置必要的变量

# 2. 启动数据库
# （如果使用 Docker）
docker-compose up -d postgres

# 3. 运行数据库迁移
npm run db:migrate

# 4. 启动开发服务器
npm run dev
```

### 步骤 2：创建测试用户

在数据库中创建一个测试用户（与 `GITHUB_USERNAME` 匹配）：

```sql
INSERT INTO users (id, github_id, username, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  '12345678',
  'testuser',
  'testuser@example.com',
  NOW(),
  NOW()
);
```

或者使用 psql：

```bash
psql $DATABASE_URL -c "
INSERT INTO users (id, github_id, username, email, created_at, updated_at)
VALUES (gen_random_uuid(), '12345678', 'testuser', 'testuser@example.com', NOW(), NOW())
ON CONFLICT DO NOTHING;
"
```

### 步骤 3：发送测试 Webhook

```bash
npm run test:webhook
```

**预期输出**：
```
🚀 GitHub Webhook 测试工具
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 URL: http://localhost:3000/api/github/webhook
🔑 Secret: test_secre...
👤 User: testuser
📋 Event: push
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
...
✅ Webhook 发送成功！
```

### 步骤 4：验证数据存储

```bash
npm run test:verify-data
```

**预期输出**：
```
🔍 查询最新的贡献记录...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 找到 1 条记录:

1. feat: add new feature
   ID: xxx-xxx-xxx
   类型: commit
   贡献者: testuser
   状态: pending
   ...

✅ 数据查询完成
```

### 步骤 5：测试前端 API

```bash
npm run test:api
```

**预期输出**：
```
🧪 前端 API 测试工具
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ 健康检查通过
✅ API 请求成功
📊 返回 1 条贡献:
...
✅ 所有测试通过！
```

### 步骤 6：验证前端页面

打开浏览器访问：`http://localhost:3000/explore`

应该看到刚才发送的测试 commit 显示在页面上。

---

## 🐛 故障排查

### 问题：签名验证失败

**错误信息**：
```
❌ Invalid signature
```

**解决方案**：
1. 检查 `WEBHOOK_SECRET` 环境变量是否一致
2. 确保后端和测试脚本使用相同的密钥
3. 检查签名计算逻辑是否正确

### 问题：用户不存在

**错误信息**：
```
⚠️ User not found in database: testuser
```

**解决方案**：
```bash
# 创建测试用户
psql $DATABASE_URL -c "
INSERT INTO users (id, github_id, username, email, created_at, updated_at)
VALUES (gen_random_uuid(), '12345678', 'testuser', 'testuser@example.com', NOW(), NOW())
ON CONFLICT DO NOTHING;
"
```

### 问题：数据库连接失败

**错误信息**：
```
❌ 数据库连接失败
```

**解决方案**：
1. 检查数据库是否运行：`docker ps` 或 `pg_isready`
2. 检查 `DATABASE_URL` 环境变量
3. 测试连接：`psql $DATABASE_URL -c "SELECT 1;"`

### 问题：API 返回 401 错误

**错误信息**：
```
❌ API 请求失败
状态码: 401
```

**解决方案**：
1. 某些接口需要认证，设置 `AUTH_TOKEN`
2. 或修改后端接口为公开访问（仅用于测试）

---

## 📚 参考文档

- [Webhook 测试指南](../docs/Webhook测试指南.md) - 完整的测试流程说明
- [GitHub Webhooks 文档](https://docs.github.com/en/webhooks) - GitHub 官方文档
- [API 文档](../docs/api.md) - 后端 API 接口说明

---

## 🔗 相关命令

```bash
# 数据库操作
npm run db:migrate          # 运行数据库迁移
npm run db:seed             # 填充测试数据
npm run db:reset            # 重置数据库

# 开发服务器
npm run dev                 # 启动开发服务器
npm run build               # 构建生产版本
npm run start               # 启动生产服务器

# 测试
npm run test                # 运行所有测试
npm run test:e2e            # 端到端测试
npm run test:webhook        # Webhook 测试
```

---

## 💡 提示

1. **测试前先创建用户**：确保数据库中有与 `GITHUB_USERNAME` 匹配的用户
2. **查看后端日志**：运行测试时保持 `npm run dev` 运行，查看详细日志
3. **使用 ngrok 测试真实 Webhook**：参考 [Webhook 测试指南](../docs/Webhook测试指南.md)
4. **清理测试数据**：测试后可以删除测试数据，避免污染数据库

```sql
-- 删除测试贡献
DELETE FROM contributions WHERE contributor = 'testuser';

-- 删除测试用户
DELETE FROM users WHERE username = 'testuser';
```

