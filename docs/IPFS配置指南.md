# IPFS 配置指南

## 📋 概述

IPFS（InterPlanetary File System）用于存储 NFT 元数据到去中心化存储。

**重要**：IPFS 配置是**可选的**，不配置也能正常运行！

---

## ✅ 三种方案对比

| 方案 | 费用 | 优点 | 缺点 | 推荐度 |
|------|------|------|------|--------|
| **Web3.Storage** | 💚 完全免费 | 免费、无限制、简单 | - | ⭐⭐⭐⭐⭐ |
| **Pinata** | 💛 有免费套餐 | 稳定、专业、功能多 | 免费套餐有限制 | ⭐⭐⭐⭐ |
| **Mock（开发）** | 💚 免费 | 无需配置 | 仅用于测试 | ⭐⭐⭐ |

---

## 🎯 推荐方案：Web3.Storage（完全免费）

### 为什么推荐 Web3.Storage？

- ✅ **完全免费**：无限存储，无限请求
- ✅ **简单易用**：只需一个 API Token
- ✅ **官方支持**：Protocol Labs（IPFS 的创建者）提供
- ✅ **去中心化**：真正的 IPFS 存储
- ✅ **无需信用卡**：注册即可使用

### 配置步骤（5 分钟）

#### 1. 注册账号

访问：https://web3.storage

点击 **Sign Up** 注册（支持 GitHub/Email）

#### 2. 获取 API Token

1. 登录后，点击 **Account** → **Create API Token**
2. 输入 Token 名称（如：`lightcommit-prod`）
3. 点击 **Create**
4. **复制 Token**（只显示一次！）

#### 3. 配置环境变量

编辑 `frontend/.env` 文件：

```bash
# Web3.Storage 配置（完全免费）
WEB3_STORAGE_TOKEN=your_web3_storage_token_here
```

#### 4. 验证配置

```bash
# 重启开发服务器
npm run dev

# 测试上传（可选）
curl -X POST http://localhost:3000/api/ipfs/upload \
  -H "Content-Type: application/json" \
  -d '{"content": "{\"test\": \"data\"}"}'

# 预期输出
{
  "ipfsHash": "bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi"
}
```

---

## 💰 方案 2：Pinata（有免费套餐）

### 免费套餐限制

- 存储：1GB
- 请求：100次/月
- Pin：1000个文件

### 配置步骤

#### 1. 注册账号

访问：https://pinata.cloud

点击 **Sign Up**

#### 2. 获取 API Key

1. 登录后，点击 **API Keys**
2. 点击 **New Key**
3. 勾选权限：
   - ✅ `pinFileToIPFS`
   - ✅ `pinJSONToIPFS`
4. 输入 Key 名称（如：`lightcommit`）
5. 点击 **Create Key**
6. **复制 API Key 和 Secret**（只显示一次！）

#### 3. 配置环境变量

编辑 `frontend/.env` 文件：

```bash
# Pinata 配置
PINATA_API_KEY=your_api_key_here
PINATA_SECRET_API_KEY=your_secret_key_here
```

---

## 🧪 方案 3：不配置（开发测试）

### 使用场景

- 本地开发测试
- 不需要真实的 IPFS 存储
- 快速原型验证

### 如何使用

**不需要任何配置**！系统会自动使用 mock 哈希。

```bash
# 不配置任何 IPFS 服务
# 系统自动使用 mock 哈希

# 测试上传
curl -X POST http://localhost:3000/api/ipfs/upload \
  -H "Content-Type: application/json" \
  -d '{"content": "{\"test\": \"data\"}"}'

# 输出（包含警告）
{
  "ipfsHash": "QmX1Y2Z3...",
  "warning": "Using mock IPFS hash. Configure PINATA_API_KEY or WEB3_STORAGE_TOKEN for real uploads."
}
```

### ⚠️ 注意事项

- ❌ **不能用于生产环境**
- ❌ **mock 哈希无法在 IPFS 网络访问**
- ✅ **仅用于本地测试**

---

## 🔧 系统自动选择逻辑

系统会按以下优先级自动选择 IPFS 服务：

```
1. Pinata     → 如果配置了 PINATA_API_KEY
2. Web3.Storage → 如果配置了 WEB3_STORAGE_TOKEN
3. Mock       → 如果都未配置（开发测试）
```

**源码参考**：`frontend/src/app/api/ipfs/upload/route.ts`

---

## 📊 功能对比

| 功能 | Web3.Storage | Pinata | Mock |
|------|--------------|--------|------|
| 真实 IPFS 存储 | ✅ | ✅ | ❌ |
| 完全免费 | ✅ | ❌（有限制） | ✅ |
| 网关访问 | ✅ | ✅ | ❌ |
| Pin 管理 | ✅ | ✅ | ❌ |
| 删除文件 | ✅ | ✅ | - |
| 生产可用 | ✅ | ✅ | ❌ |

---

## 🌐 IPFS 网关访问

### Web3.Storage

```
https://w3s.link/ipfs/{hash}
https://{hash}.ipfs.w3s.link
```

### Pinata

```
https://gateway.pinata.cloud/ipfs/{hash}
https://{hash}.ipfs.pinata.cloud
```

### 公共网关

```
https://ipfs.io/ipfs/{hash}
https://cloudflare-ipfs.com/ipfs/{hash}
https://dweb.link/ipfs/{hash}
```

---

## 🚀 快速开始（推荐配置）

### 开发环境

**不需要配置**，直接使用 mock 即可：

```bash
# 不配置任何 IPFS 服务
# 系统自动使用 mock
npm run dev
```

### 测试/预生产环境

**使用 Web3.Storage**（免费）：

```bash
# frontend/.env
WEB3_STORAGE_TOKEN=your_token_here
```

### 生产环境

**推荐使用 Web3.Storage**（免费）或 **Pinata**（付费，更稳定）：

```bash
# 方案 1：Web3.Storage（推荐）
WEB3_STORAGE_TOKEN=your_production_token

# 方案 2：Pinata（专业版）
PINATA_API_KEY=your_api_key
PINATA_SECRET_API_KEY=your_secret_key
```

---

## 🔍 验证配置

### 检查 IPFS 上传

```bash
# 1. 发送测试请求
curl -X POST http://localhost:3000/api/ipfs/upload \
  -H "Content-Type: application/json" \
  -d '{"content": "{\"name\": \"Test NFT\", \"description\": \"Test\"}"}'

# 2. 预期响应（Web3.Storage）
{
  "ipfsHash": "bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi"
}

# 3. 访问网关验证
curl https://w3s.link/ipfs/bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi
```

### 查看日志

```bash
# 后端日志会显示使用的 IPFS 服务
✅ Using Web3.Storage for IPFS upload
✅ Using Pinata for IPFS upload
⚠️  Using mock IPFS hash (development mode)
```

---

## 💡 最佳实践

### 1. 开发阶段

- ✅ 不配置 IPFS，使用 mock
- ✅ 专注于功能开发
- ✅ 节省配置时间

### 2. 测试阶段

- ✅ 使用 Web3.Storage（免费）
- ✅ 验证 IPFS 功能
- ✅ 测试网关访问

### 3. 生产环境

- ✅ 使用 Web3.Storage 或 Pinata
- ✅ 配置备份策略
- ✅ 监控上传失败

### 4. 成本优化

```
开发：Mock（免费）
  ↓
测试：Web3.Storage（免费）
  ↓
生产（小项目）：Web3.Storage（免费）
  ↓
生产（大项目）：Pinata 专业版（付费，更稳定）
```

---

## ❓ 常见问题

### Q1：不配置 IPFS 会影响功能吗？

**A**：开发测试阶段不影响。生产环境建议配置真实的 IPFS 服务。

### Q2：Web3.Storage 真的完全免费吗？

**A**：是的！由 Protocol Labs 提供，无限存储和请求。

### Q3：Mock 哈希能在 IPFS 网络访问吗？

**A**：不能。Mock 哈希只是假的，无法在 IPFS 网关访问。

### Q4：如何选择 Pinata 还是 Web3.Storage？

**A**：
- 个人/小项目：**Web3.Storage**（免费）
- 商业/大项目：**Pinata**（付费，更专业）
- 开发测试：**Mock**（最简单）

### Q5：上传失败怎么办？

**A**：
1. 检查 API Token 是否正确
2. 检查网络连接
3. 查看后端日志
4. 临时使用另一个服务

---

## 🆘 故障排查

### 错误：Upload failed

```bash
Error: Web3.Storage upload failed
```

**解决**：
1. 检查 `WEB3_STORAGE_TOKEN` 是否配置
2. Token 是否有效（可能过期）
3. 网络是否正常

### 错误：Invalid token

```bash
Error: Invalid API key
```

**解决**：
1. 重新生成 API Token
2. 检查环境变量拼写
3. 重启开发服务器

---

## 📚 相关资源

### 官方文档

- [Web3.Storage 文档](https://web3.storage/docs/)
- [Pinata 文档](https://docs.pinata.cloud/)
- [IPFS 文档](https://docs.ipfs.tech/)

### 相关代码

- `frontend/src/app/api/ipfs/upload/route.ts` - IPFS 上传接口
- `frontend/src/app/api/contributions/[id]/sign/route.ts` - 使用 IPFS 的地方

---

## 📝 更新日志

- **2024-11-20**：
  - 添加 Web3.Storage 支持（完全免费）
  - 更新推荐方案
  - 完善配置说明
  - 添加故障排查指南


