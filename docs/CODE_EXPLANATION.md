# ERC-8004 代码详细说明

## 📄 组件代码说明

### 1. ScoreDisplay.tsx - 评分展示组件

**用途**: 可视化展示贡献评分和各维度明细

**关键代码解释**:

```typescript
const isEligible = score >= threshold;
```

**关键函数**:

`getScoreColor(value)` - 根据分数返回对应的颜色类名
- 90+ 返回绿色（优秀）
- 70+ 返回蓝色（良好）
- 50+ 返回黄色（及格）
- <50 返回红色（不及格）

`getScoreGrade(value)` - 根据分数计算等级
- 90+ → S 级（黄底黄字）
- 80+ → A 级（绿底绿字）
- 70+ → B 级（蓝底蓝字）
- 60+ → C 级（橙底橙字）
- <60 → D 级（红底红字）

**dimensions 数组** - 定义 5 个评分维度
- convention: Commit Message 规范性
- size: 代码变更规模
- filesImpact: 文件影响范围
- mergeSignal: 是否已合并
- metadataCompleteness: 元数据完整性

**渲染逻辑**:
1. 顶部显示总分和等级徽章
2. 右侧显示是否达标（>= threshold）
3. 下方使用进度条展示 5 个维度
4. 如果未达标显示提示信息

---

### 2. ReputationBadge.tsx - 声誉徽章组件

**用途**: 展示用户的链上声誉数据

**两种尺寸**:

**Small** - 用于 Navbar 或卡片角标
- 只显示等级图标 + 平均分
- 圆形黑底白字徽章

**Large** - 用于 Dashboard 或个人页
- 显示等级名称 + 图标
- 显示总分/贡献数/平均分（3列）
- 底部进度条

**getLevel 函数** - 根据平均分计算等级
- 90+ → 传奇（金色👑）
- 80+ → 大师（紫色💎）
- 70+ → 精英（蓝色⭐）
- 60+ → 新星（绿色🌟）
- <60 → 入门（灰色🔰）

---

### 3. RegisterAgentModal.tsx - 注册弹窗组件

**用途**: 引导用户注册代理身份

**触发时机**:
- 用户首次使用 ERC-8004 功能
- `useAgentRegistry` 检测到 `isRegistered === false`

**handleRegister 函数流程**:
1. 设置 `registering` 状态为 true
2. 显示 loading toast
3. 调用 `useAgentRegistry.registerAgent(githubUsername)`
4. 等待交易确认
5. 成功后关闭弹窗并触发 `onSuccess` 回调
6. 失败则显示错误信息

**Agent Card 内容**:
- 自动从当前登录的 GitHub 用户获取用户名
- 生成包含用户名、能力、版本的 JSON
- 转为 base64 URI 存储

---

## 🔧 Hooks 代码说明

### use-agent-registry.ts - 代理注册管理

**用途**: 管理代理注册状态和操作

**核心状态**:
- `isRegistered` - 是否已注册
- `loading` - 加载状态
- `agentProfile` - 代理资料

**关键函数**:

#### `checkRegistration()`
1. 检查钱包是否连接
2. 使用 AgentIdentityRegistryABI 创建合约实例
3. 调用 `contract.isRegistered(account)` 检查注册状态
4. 如果已注册，调用 `contract.getAgentByAddress(account)` 获取详情
5. 更新状态

#### `registerAgent(githubUsername?)`
1. 验证钱包连接和 signer
2. 获取或使用传入的 GitHub 用户名
3. 生成 Agent Card JSON 对象
4. 转为 base64 URI
5. 调用合约的 `registerAgent(username, agentCardURI)`
6. 等待交易确认
7. 重新检查注册状态

**生命周期**:
- `useEffect` 监听 `account` 变化
- 账户改变时自动重新检查注册状态

---

## 📄 页面代码说明

### /erc8004/contributions/page.tsx - 贡献列表页

**数据流**:

#### 加载贡献列表 (`loadContributions`)
1. 从 `/api/auth/user` 获取 session token
2. 调用 `/api/contributions/my` 获取当前用户的所有贡献
3. 设置到 `contributions` 状态

#### 加载链上声誉 (`loadReputation`)
1. 使用 `ethers.BrowserProvider` 连接钱包
2. 创建 ReputationRegistry 合约实例
3. 调用 `contract.getContributorReputation(account)`
4. 解析返回的 `[totalScore, feedbackCount, averageScore]`
5. 更新 `reputation` 状态

#### 自动注册检测
```typescript
useEffect(() => {
  if (isConnected && !agentLoading && !isRegistered) {
    setShowRegisterModal(true);
  }
}, [isConnected, isRegistered, agentLoading]);
```
- 当钱包连接且未注册时自动弹窗

#### 状态徽章 (`getStatusBadge`)
- `minted` → 绿色"已铸造"
- `eligible` + 有 score → 蓝色"可上链"
- 有 score → 黄色"已评分"
- 默认 → 灰色"待评分"

---

### /erc8004/validate/[id]/page.tsx - 验证流程页

**3 步流程**:

#### Step 1: 查看评分
- 显示贡献基本信息（标题、仓库、commit、时间）
- 使用 `ScoreDisplay` 组件展示评分明细
- "下一步"按钮进入 Step 2

#### Step 2: 提交评分到链上

**handleSubmitFeedback 函数流程**:
1. 检查钱包连接和代理注册
2. 创建 ReputationRegistry 合约实例
3. 调用 `contract.submitFeedback(signData.params, signData.signature)`
   - `signData.params` 是 SubmitParams 结构体
   - `signData.signature` 是 EIP-712 签名
4. 等待交易确认 (`tx.wait()`)
5. 保存交易哈希
6. 自动进入 Step 3

**进度追踪**:
- 0-20%: 准备交易
- 20-40%: 创建合约实例
- 40-60%: 等待用户确认
- 60-80%: 等待区块确认
- 80-100%: 完成

#### Step 3: 验证并铸造

**handleRequestValidation 函数流程**:
1. 创建 ValidationRegistry 合约实例
2. 调用 `contract.requestValidation(repo, sha, contributor, metadataURI)`
3. 等待交易确认
4. 从 receipt.logs 中查找 `MintTriggered` 事件
5. 解析事件获取 Token ID
6. 显示铸造结果

**事件解析**:
```typescript
const mintEvent = receipt.logs.find((log: any) => {
  try {
    const parsed = validationRegistry.interface.parseLog(log);
    return parsed?.name === 'MintTriggered';
  } catch {
    return false;
  }
});
```
- 遍历所有日志找到 MintTriggered 事件
- 使用 `interface.parseLog` 解析事件
- 从 `args[1]` 获取 tokenId

**条件铸造**:
- 只有当 `signData.shouldMint === true` 时才显示铸造按钮
- 铸造后显示 Token ID
- 提供"查看我的 NFT"按钮跳转

---

## 🔌 API 代码说明

### /api/contributions/[id]/sign/route.ts

**改造重点**:

#### 获取 Nonce
```typescript
const { ReputationRegistryABI } = await import('@/lib/contracts');
const reputationContract = new ethers.Contract(
  reputationRegistryAddress,
  ReputationRegistryABI,
  provider
);

const currentNonce = await reputationContract.nonces(evaluatorAddress);
```
- 从链上读取当前评分服务的 nonce
- 防止签名重放攻击

#### 构造 SubmitParams
```typescript
const params = {
  contributor: userWallet,
  repo,
  commitSha,
  score: contribution.score,
  feedbackHash,
  metadataURI,
  timestamp,
  nonce: Number(currentNonce),
};
```
- 完整的结构体参数
- 与合约的 SubmitParams 结构一致

#### 返回格式
```json
{
  "params": {
    "contributor": "0x...",
    "repo": "owner/repo",
    "commitSha": "abc123",
    "score": 85,
    "feedbackHash": "0x...",
    "metadataURI": "ipfs://...",
    "timestamp": 1699999999,
    "nonce": 0
  },
  "signature": "0x...",
  "breakdown": {...},
  "evaluator": "0x...",
  "shouldMint": true
}
```

---

## 📦 依赖关系总结

### 数据流向

```
用户操作
  ↓
页面组件 (contributions/page.tsx, validate/[id]/page.tsx)
  ↓
├─ UI 组件 (ScoreDisplay, ReputationBadge, RegisterAgentModal)
├─ Hooks (use-agent-registry)
│   └─ ABI (AgentIdentityRegistryABI)
│       └─ 调用链上合约 (AgentIdentityRegistry)
├─ API (/api/contributions/[id]/sign)
│   └─ Service (erc8004.service)
│       └─ ABI (ReputationRegistryABI)
│           └─ 调用链上合约 (ReputationRegistry)
└─ 直接调用合约
    ├─ ReputationRegistry.submitFeedback(params, sig)
    └─ ValidationRegistry.requestValidation(...)
        └─ 自动调用 CommitNFT.mintCommit(...)
```

### 组件依赖

```
RegisterAgentModal
└─ useAgentRegistry
   └─ AgentIdentityRegistryABI
      └─ contract.registerAgent()
      └─ contract.isRegistered()
      └─ contract.getAgentByAddress()

ReputationBadge
└─ 直接使用 props（数据由父组件从链上获取）

ScoreDisplay
└─ 纯展示组件（数据来自 API）

contributions/page.tsx
├─ useAgentRegistry（检查注册）
├─ ReputationBadge（显示声誉）
├─ RegisterAgentModal（注册弹窗）
├─ ReputationRegistryABI（获取链上声誉）
└─ /api/contributions/my（获取贡献列表）

validate/[id]/page.tsx
├─ useAgentRegistry（检查注册）
├─ ScoreDisplay（显示评分）
├─ RegisterAgentModal（注册弹窗）
├─ ReputationRegistryABI（提交评分）
├─ ValidationRegistryABI（验证铸造）
├─ /api/contributions/[id]（获取贡献）
└─ /api/contributions/[id]/sign（获取签名）
```

---

## 🎯 核心交互说明

### 交互 1: 注册代理

```
用户点击"立即注册"
  ↓
RegisterAgentModal.handleRegister()
  ↓
useAgentRegistry.registerAgent(username)
  ↓
生成 Agent Card JSON → base64 URI
  ↓
contract.registerAgent(username, agentCardURI)
  ↓
交易确认
  ↓
重新检查注册状态
  ↓
更新 UI
```

### 交互 2: 提交评分

```
用户点击"提交到链上"
  ↓
validate/[id]/page.tsx.handleSubmitFeedback()
  ↓
加载签名数据（已从 /api 获取）
  ↓
创建 ReputationRegistry 合约实例
  ↓
调用 submitFeedback(params, signature)
  其中 params = {
    contributor, repo, commitSha, score,
    feedbackHash, metadataURI, timestamp, nonce
  }
  ↓
合约验证签名（EIP-712）
  ↓
存储评分哈希到链上
  ↓
发射 FeedbackSubmitted 事件
  ↓
交易确认
  ↓
进入 Step 3
```

### 交互 3: 验证铸造

```
用户点击"验证并铸造 NFT"
  ↓
validate/[id]/page.tsx.handleRequestValidation()
  ↓
创建 ValidationRegistry 合约实例
  ↓
调用 requestValidation(repo, sha, contributor, uri)
  ↓
合约内部流程:
  1. 从 ReputationRegistry 读取评分
  2. 检查 score >= mintThreshold (80)
  3. 如果达标 → 调用 CommitNFT.mintCommit()
  4. 发射 MintTriggered 事件
  ↓
前端监听事件
  ↓
解析 Token ID
  ↓
显示铸造结果
```

---

## 🔐 数据安全说明

### EIP-712 签名流程

**后端生成签名** (`/api/contributions/[id]/sign`):
1. 从链上读取当前 nonce
2. 构造 SubmitParams 结构体
3. 使用 EVALUATOR_PRIVATE_KEY 签名
4. 返回 params + signature

**合约验证签名** (`ReputationRegistry.submitFeedback`):
1. 接收 params 和 signature
2. 重建 EIP-712 digest
3. 从 signature 恢复 signer 地址
4. 检查 signer 是否有 EVALUATOR_ROLE
5. 检查 nonce 是否正确
6. 检查签名时间是否在 5 分钟内
7. 通过后处理数据

**安全保障**:
- ✅ 只有授权的评分服务才能签名
- ✅ nonce 防止重放攻击
- ✅ timestamp 防止过期签名
- ✅ 域绑定防止跨链/跨合约复用

---

## 💾 数据获取说明

### 混合模式实现

**从数据库获取** (快速显示):
```typescript
const response = await fetch('/api/contributions/my');
const contributions = await response.json();
```
用于：贡献列表、评分详情、元数据

**从链上获取** (验证真实性):
```typescript
const contract = new ethers.Contract(addr, ABI, provider);
const reputation = await contract.getContributorReputation(account);
```
用于：声誉数据、验证状态、NFT 信息

**为什么混合**:
- 数据库快（毫秒级）- 用于展示
- 链上慢（秒级）- 用于验证
- 结合使用既快又安全

---

## 🎨 样式系统说明

### 统一样式规范

**卡片样式**:
```typescript
className="bg-white border-[3px] border-black rounded-2xl p-8"
style={{ boxShadow: '4px 4px 0px 0px rgba(0,0,0,0.8)' }}
```

**按钮样式**:
```typescript
className="bg-black text-white rounded-2xl font-bold border-[3px] border-black"
style={{ boxShadow: '3px 3px 0px 0px rgba(0,0,0,0.5)' }}
```

**动画**:
- 使用 `framer-motion`
- 入场动画: `opacity: 0 → 1`, `y: 20 → 0`
- Hover 动画: `translate` 和 `shadow` 变化

---

## 📝 总结

所有新文件都遵循：
1. ✅ 清晰的命名
2. ✅ 统一的样式
3. ✅ 完整的错误处理
4. ✅ 符合 TypeScript 规范
5. ✅ 使用合约 ABI
6. ✅ 混合数据模式

代码本身已经足够清晰，关键点都有适当的变量命名和函数分离。

**如果你需要在代码中添加更多行内注释，请告诉我具体哪些部分需要详细解释！**

