# Webhook 测试资源总结

本文档汇总了所有 Webhook 测试相关的资源和工具。

---

## 📚 文档资源

### 1. [Webhook测试快速开始.md](./Webhook测试快速开始.md)
**适合**：想快速验证 Webhook 功能的开发者

**内容**：
- ⚡ 3 个命令快速测试
- 📋 前置准备步骤
- ✅ 验证清单
- 🐛 常见问题解决

**使用场景**：首次测试，快速验证

---

### 2. [Webhook测试指南.md](./Webhook测试指南.md)
**适合**：需要深入了解测试细节的开发者

**内容**：
- 📊 完整数据流程图
- 🛠️ 三种测试方法（本地/模拟/生产）
- 🔍 详细的验证步骤
- 🐛 完整的故障排查指南
- 🧪 调试工具使用说明

**使用场景**：深入测试，问题排查

---

### 3. [frontend/scripts/README.md](../frontend/scripts/README.md)
**适合**：需要了解测试工具的开发者

**内容**：
- 🛠️ 三个测试工具的详细说明
- 📖 使用方法和示例
- ⚙️ 环境变量配置
- 📋 完整测试流程
- 💡 实用提示

**使用场景**：工具使用参考

---

## 🛠️ 测试工具

### 1. test-webhook.js - Webhook 模拟器

**位置**：`frontend/scripts/test-webhook.js`

**功能**：
- 发送模拟的 GitHub Webhook 请求
- 自动计算 HMAC SHA256 签名
- 支持 push 和 pull_request 事件

**快速使用**：
```bash
npm run test:webhook        # push 事件
npm run test:webhook:pr     # PR 事件
```

**自定义配置**：
```bash
WEBHOOK_URL=https://example.com/api/github/webhook \
WEBHOOK_SECRET=your_secret \
GITHUB_USERNAME=yourname \
npm run test:webhook
```

---

### 2. verify-webhook-data.js - 数据验证器

**位置**：`frontend/scripts/verify-webhook-data.js`

**功能**：
- 查询数据库中的贡献记录
- 验证数据是否正确存储
- 显示统计信息

**快速使用**：
```bash
npm run test:verify-data
```

**查看更多**：
```bash
node scripts/verify-webhook-data.js 10
```

**筛选用户**：
```bash
GITHUB_USERNAME=testuser npm run test:verify-data
```

---

### 3. test-frontend-api.js - 前端 API 测试器

**位置**：`frontend/scripts/test-frontend-api.js`

**功能**：
- 测试 /api/contributions/latest 接口
- 验证 API 响应格式
- 测试 NFT 相关接口

**快速使用**：
```bash
npm run test:api
```

**测试生产**：
```bash
API_URL=https://your-domain.com npm run test:api
```

**测试认证**：
```bash
AUTH_TOKEN=your_token npm run test:api
```

---

## 📦 NPM 脚本

在 `frontend/package.json` 中添加的快捷命令：

```json
{
  "scripts": {
    "test:webhook": "node scripts/test-webhook.js",
    "test:webhook:pr": "node scripts/test-webhook.js pull_request",
    "test:verify-data": "node scripts/verify-webhook-data.js",
    "test:api": "node scripts/test-frontend-api.js"
  }
}
```

---

## 🎯 测试流程图

```
┌─────────────────────────────────────────────────────────────┐
│                      开始测试                                │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
         ┌───────────────────────┐
         │  1. 准备环境           │
         │  - 配置环境变量        │
         │  - 启动数据库          │
         │  - 启动开发服务器      │
         │  - 创建测试用户        │
         └───────────┬───────────┘
                     │
                     ▼
         ┌───────────────────────┐
         │  2. 发送 Webhook       │
         │  npm run test:webhook  │
         └───────────┬───────────┘
                     │
                     ▼
         ┌───────────────────────┐
         │  3. 验证数据存储       │
         │  npm run test:verify-  │
         │  data                  │
         └───────────┬───────────┘
                     │
                     ▼
         ┌───────────────────────┐
         │  4. 测试 API           │
         │  npm run test:api      │
         └───────────┬───────────┘
                     │
                     ▼
         ┌───────────────────────┐
         │  5. 验证前端页面       │
         │  访问 /explore         │
         └───────────┬───────────┘
                     │
                     ▼
         ┌───────────────────────┐
         │  测试完成 ✅           │
         └───────────────────────┘
```

---

## ✅ 测试清单

### 环境准备
- [ ] 配置 `.env` 文件
- [ ] 启动数据库服务
- [ ] 运行数据库迁移
- [ ] 启动开发服务器（`npm run dev`）
- [ ] 创建测试用户

### Webhook 测试
- [ ] 发送 push 事件 Webhook
- [ ] 后端日志显示处理成功
- [ ] 签名验证通过

### 数据验证
- [ ] 数据库中有新记录
- [ ] 记录字段完整（type, contributor, title 等）
- [ ] metadata 包含 commit 详情
- [ ] 关联了正确的 user 和 repository

### API 测试
- [ ] 健康检查接口返回正常
- [ ] /api/contributions/latest 返回数据
- [ ] 数据格式正确（符合 Contribution 类型）
- [ ] 包含关联的 user 和 repository 信息

### 前端验证
- [ ] 打开 /explore 页面无报错
- [ ] 显示最新的 commit 卡片
- [ ] 卡片信息完整（仓库名、标题、作者、时间）
- [ ] 数据与 API 返回一致

---

## 🔧 环境变量配置

### 必需变量

```bash
# frontend/.env

# 数据库连接
DATABASE_URL=postgresql://user:password@localhost:5432/lightcommit

# GitHub 配置
GITHUB_WEBHOOK_SECRET=test_secret_123
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# JWT 密钥
JWT_SECRET=your_jwt_secret_here
```

### 可选变量（用于测试）

```bash
# Webhook 测试配置
WEBHOOK_URL=http://localhost:3000/api/github/webhook
GITHUB_USERNAME=testuser

# API 测试配置
API_URL=http://localhost:3000
AUTH_TOKEN=your_jwt_token
WALLET_ADDRESS=0x123...
```

---

## 📊 数据库表结构

测试涉及的数据库表：

### users 表
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  github_id VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255),
  wallet_address VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### repositories 表
```sql
CREATE TABLE repositories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  github_id VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  description TEXT,
  url VARCHAR(500),
  is_private BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### contributions 表
```sql
CREATE TABLE contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  github_id VARCHAR(255) UNIQUE NOT NULL,
  type VARCHAR(50) NOT NULL,
  user_id UUID REFERENCES users(id),
  repository_id UUID REFERENCES repositories(id),
  contributor VARCHAR(255) NOT NULL,
  title TEXT,
  description TEXT,
  url VARCHAR(500),
  status VARCHAR(50) DEFAULT 'pending',
  transaction_hash VARCHAR(255),
  token_id VARCHAR(255),
  metadata_uri TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🎓 学习路径

### 新手开发者
1. 阅读 [Webhook测试快速开始.md](./Webhook测试快速开始.md)
2. 跟随步骤完成首次测试
3. 遇到问题查看常见问题部分

### 经验开发者
1. 快速浏览 [Webhook测试快速开始.md](./Webhook测试快速开始.md)
2. 参考 [Webhook测试指南.md](./Webhook测试指南.md) 进行深入测试
3. 自定义测试工具满足特定需求

### 运维人员
1. 重点阅读环境配置部分
2. 学习使用 ngrok 进行本地测试
3. 掌握生产环境的测试和监控方法

---

## 🚀 下一步

完成 Webhook 测试后，你可以：

### 1. 替换前端 Mock 数据
参考：[替换Mock数据指南.md](./替换Mock数据指南.md)

**步骤**：
- 修改 Explore 页面使用 `useLatestContributions`
- 修改 Collections 页面使用 `useUserNFTs`
- 测试前端数据加载

### 2. 配置生产环境 Webhook
**步骤**：
- 部署应用到生产环境
- 在 GitHub 仓库配置 Webhook
- 验证真实的 push/PR 事件

### 3. 添加自动化测试
**步骤**：
- 编写 E2E 测试脚本
- 集成到 CI/CD 流程
- 定期运行测试确保稳定性

### 4. 监控和优化
**步骤**：
- 添加日志和监控
- 分析 Webhook 处理性能
- 优化数据库查询

---

## 📞 获取帮助

### 文档资源
- **快速开始**：[Webhook测试快速开始.md](./Webhook测试快速开始.md)
- **完整指南**：[Webhook测试指南.md](./Webhook测试指南.md)
- **工具说明**：[frontend/scripts/README.md](../frontend/scripts/README.md)

### 常见问题
- 签名验证失败 → 检查 WEBHOOK_SECRET
- 用户不存在 → 创建测试用户
- 数据库连接失败 → 检查 DATABASE_URL
- API 返回 401 → 添加认证 token

### 调试建议
1. 查看后端日志（`npm run dev` 输出）
2. 查询数据库验证数据
3. 使用浏览器开发工具查看网络请求
4. 运行测试脚本获取详细输出

---

## 🎉 测试成功标志

当你看到以下内容时，说明测试成功：

### ✅ 测试脚本输出
```
✅ Webhook 发送成功！
✅ 数据查询完成
✅ 所有测试通过！
```

### ✅ 后端日志
```
🔔 Webhook received
✅ Signature verified
✅ Webhook processed successfully
```

### ✅ 数据库记录
```sql
SELECT * FROM contributions ORDER BY created_at DESC LIMIT 1;
-- 返回最新的贡献记录
```

### ✅ 前端页面
- 访问 http://localhost:3000/explore
- 看到最新的 commit 卡片
- 信息完整准确

**恭喜！你已经成功打通了 Webhook 数据流！** 🎊

---

## 📝 更新日志

- **2024-11-20**：创建初始版本
  - 添加三个测试工具
  - 创建测试文档
  - 更新 package.json 脚本

---

## 🤝 贡献

如果你发现任何问题或有改进建议，欢迎：
1. 提交 Issue
2. 创建 Pull Request
3. 更新文档

