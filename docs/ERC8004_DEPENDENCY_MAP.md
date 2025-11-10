# ERC-8004 文件依赖关系图

## 🔗 完整依赖关系

### 层级结构

```
用户界面层 (Pages)
    ↓ 引用
UI 组件层 (Components)
    ↓ 引用
业务逻辑层 (Hooks & Services)
    ↓ 引用
数据访问层 (API & Contracts)
    ↓ 引用
智能合约层 (Blockchain)
```

---

## 📄 页面层依赖关系

### `/erc8004/contributions/page.tsx` - 贡献列表页

**引用的组件**：
```typescript
import { HeaderSimple } from '@/components/header-simple';
import { FooterSimple } from '@/components/footer-simple';
import { RegisterAgentModal } from '@/components/erc8004/RegisterAgentModal';
import { ReputationBadge } from '@/components/erc8004/ReputationBadge';
```

**引用的 Hooks**：
```typescript
import { useAgentRegistry } from '@/hooks/use-agent-registry';
import { useWeb3 } from '@/lib/contexts/Web3Context';
import { useAuth } from '@/hooks/use-auth';
```

**调用的 API**：
```typescript
fetch('/api/auth/user')
fetch('/api/contributions/my')
```

**调用的合约（通过 ABI）**：
```typescript
ReputationRegistry.getContributorReputation(account)
```

**数据流**：
```
1. 检查用户登录状态 (useAuth)
2. 检查钱包连接 (useWeb3)
3. 检查代理注册 (useAgentRegistry)
   ├─ 未注册 → 显示 RegisterAgentModal
   └─ 已注册 → 继续
4. 从数据库加载贡献 (API: /api/contributions/my)
5. 从链上加载声誉 (Contract: ReputationRegistry)
6. 显示列表 + ReputationBadge
```

---

### `/erc8004/validate/[id]/page.tsx` - 验证流程页

**引用的组件**：
```typescript
import { HeaderSimple } from '@/components/header-simple';
import { FooterSimple } from '@/components/footer-simple';
import { ScoreDisplay } from '@/components/erc8004/ScoreDisplay';
import { RegisterAgentModal } from '@/components/erc8004/RegisterAgentModal';
```

**引用的 Hooks**：
```typescript
import { useAgentRegistry } from '@/hooks/use-agent-registry';
import { useWeb3 } from '@/lib/contexts/Web3Context';
```

**引用的 ABI**：
```typescript
import { ReputationRegistryABI, ValidationRegistryABI } from '@/lib/contracts';
```

**调用的 API**：
```typescript
fetch(`/api/contributions/${id}`)
fetch(`/api/contributions/${id}/sign`)
```

**调用的合约**：
```typescript
ReputationRegistry.submitFeedback(params, signature)
ValidationRegistry.requestValidation(repo, sha, contributor, uri)
```

**数据流**：
```
Step 1: 查看评分
1. 从数据库加载贡献数据 (API: /api/contributions/[id])
2. 获取签名数据 (API: /api/contributions/[id]/sign)
3. 显示 ScoreDisplay 组件

Step 2: 提交链上
1. 调用 ReputationRegistry.submitFeedback(params, signature)
2. 等待交易确认
3. 监听 FeedbackSubmitted 事件

Step 3: 验证铸造
1. 调用 ValidationRegistry.requestValidation(...)
2. 合约内部检查 score >= threshold
3. 自动调用 CommitNFT.mintCommit(...)
4. 监听 MintTriggered 事件获取 Token ID
```

---

## 🎨 组件层依赖关系

### `ScoreDisplay.tsx` - 评分展示组件

**外部依赖**：
```typescript
import { motion } from 'framer-motion';
import { Star, TrendingUp } from 'lucide-react';
```

**被引用于**：
```typescript
/erc8004/validate/[id]/page.tsx
```

**Props 数据来源**：
```typescript
score: number                    // 来自 API: /api/contributions/[id]
breakdown: ScoreBreakdown        // 来自 API: /api/contributions/[id]/sign
threshold: number                // 默认 80 或来自合约 ValidationRegistry.mintThreshold()
```

**内部函数**：
```typescript
getScoreColor(value)      // 根据分数返回颜色类名
getScoreGrade(value)      // 根据分数返回等级（S/A/B/C/D）
```

**无调用外部 API 或合约**

---

### `ReputationBadge.tsx` - 声誉徽章组件

**外部依赖**：
```typescript
import { Star, Award, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
```

**被引用于**：
```typescript
/erc8004/contributions/page.tsx
未来：Dashboard, Navbar, Profile 页面
```

**Props 数据来源**：
```typescript
totalScore: number         // 来自 ReputationRegistry.getContributorReputation()
feedbackCount: number      // 来自 ReputationRegistry.getContributorReputation()
averageScore: number       // 来自 ReputationRegistry.getContributorReputation()
```

**内部函数**：
```typescript
getLevel(avg)             // 根据平均分返回等级信息
```

**无调用外部 API 或合约**

---

### `RegisterAgentModal.tsx` - 注册弹窗组件

**外部依赖**：
```typescript
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
```

**引用的 Hooks**：
```typescript
import { useAgentRegistry } from '@/hooks/use-agent-registry';
import { useAuth } from '@/hooks/use-auth';
```

**被引用于**：
```typescript
/erc8004/contributions/page.tsx
/erc8004/validate/[id]/page.tsx
```

**调用的合约（通过 useAgentRegistry）**：
```typescript
AgentIdentityRegistry.registerAgent(username, agentCardURI)
```

**数据流**：
```
1. 从 useAuth 获取 GitHub 用户名
2. 调用 useAgentRegistry.registerAgent()
   └─ 内部调用 AgentIdentityRegistry.registerAgent(username, agentCardURI)
3. 等待交易确认
4. 触发 onSuccess 回调
```

---

## 🔧 Hooks 层依赖关系

### `use-agent-registry.ts` - 代理注册管理

**引用的依赖**：
```typescript
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWeb3 } from '@/lib/contexts/Web3Context';
import { useAuth } from './use-auth';
import { AgentIdentityRegistryABI } from '@/lib/contracts';
```

**被引用于**：
```typescript
/erc8004/contributions/page.tsx
/erc8004/validate/[id]/page.tsx
RegisterAgentModal.tsx
```

**调用的合约方法**：
```typescript
contract.isRegistered(account)                    // 检查是否注册
contract.getAgentByAddress(account)               // 获取代理信息
contract.registerAgent(username, agentCardURI)    // 注册新代理
```

**提供的方法**：
```typescript
isRegistered: boolean              // 注册状态
loading: boolean                   // 加载状态
agentProfile: any | null          // 代理资料
registerAgent(username)            // 注册函数
checkRegistration()                // 重新检查
```

**内部逻辑**：
```
1. useEffect 监听 account 变化
2. 自动调用 checkRegistration()
3. 从链上读取注册状态（AgentIdentityRegistry）
4. 如已注册，读取详细信息
5. 更新本地状态
```

---

## 🔌 API 层依赖关系

### `/api/contributions/[id]/sign/route.ts` - 签名 API

**引用的依赖**：
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';
import { ContributionRepository } from '@/lib/database/repositories/contribution.repository';
import { ScoringService } from '@/lib/services/scoring.service';
import { ERC8004Service } from '@/lib/services/erc8004.service';
import { getConfig } from '@/lib/config';
import { ReputationRegistryABI } from '@/lib/contracts';
```

**被调用于**：
```typescript
/erc8004/validate/[id]/page.tsx
```

**调用的服务**：
```typescript
ContributionRepository.findById(id)                    // 数据库查询
ERC8004Service.generateFeedbackHash(...)              // 生成哈希
ERC8004Service.generateMetadataJSON(...)              // 生成元数据
ERC8004Service.uploadToIPFS(metadataJSON)             // IPFS 上传
ERC8004Service.signFeedback(...)                      // EIP-712 签名
ERC8004Service.verifySignature(...)                   // 签名验证
```

**调用的合约（只读）**：
```typescript
ReputationRegistry.nonces(evaluatorAddress)           // 获取当前 nonce
```

**返回数据**：
```typescript
{
  params: SubmitParams,    // 结构体参数
  signature: string,       // EIP-712 签名
  metadataJSON: string,    // 元数据 JSON
  breakdown: ScoreBreakdown,  // 评分明细
  evaluator: string,       // 评分者地址
  shouldMint: boolean      // 是否可铸造
}
```

**数据流**：
```
1. 从数据库读取贡献数据 (ContributionRepository)
2. 检查是否已评分
3. 获取用户钱包地址
4. 生成 feedbackHash
5. 从链上获取 evaluator 的 nonce
6. 构造 SubmitParams 结构体
7. 生成元数据 JSON
8. 上传到 IPFS
9. 使用 evaluator 私钥签名
10. 验证签名
11. 返回 params + signature
```

---

### `/api/ipfs/upload/route.ts` - IPFS 上传 API

**引用的依赖**：
```typescript
import { NextRequest, NextResponse } from 'next/server';
```

**被调用于**：
```typescript
ERC8004Service.uploadToIPFS(content)
  └─ /api/contributions/[id]/sign/route.ts
```

**外部服务**：
```typescript
Pinata API: https://api.pinata.cloud/pinning/pinJSONToIPFS
或
Web3.Storage API: https://api.web3.storage/upload
```

**返回数据**：
```typescript
{
  ipfsHash: string,    // IPFS 内容哈希
  warning?: string     // Mock 模式警告（开发环境）
}
```

---

## 🛠️ Services 层依赖关系

### `erc8004.service.ts` - ERC8004 核心服务

**引用的依赖**：
```typescript
import { ethers } from 'ethers';
import { ScoreBreakdown } from './scoring.service';
```

**被引用于**：
```typescript
/api/contributions/[id]/sign/route.ts
```

**提供的方法**：
```typescript
generateFeedbackHash(repo, sha, score, timestamp)         // 生成反馈哈希
generateMetadataJSON(feedback, breakdown, evidence)       // 生成元数据
getEIP712Domain(chainId, verifyingContract)              // EIP-712 域
getEIP712Types()                                          // EIP-712 类型
signFeedback(feedback, signer, chainId, contract)        // 签名
verifySignature(feedback, signature, chainId, contract)   // 验证签名
uploadToIPFS(content)                                     // IPFS 上传
parseIPFSUri(uri)                                         // IPFS URI 解析
fetchMetadataFromIPFS(uri)                               // 从 IPFS 获取
```

**调用的 API**：
```typescript
fetch('/api/ipfs/upload', { method: 'POST', body: content })
```

**EIP-712 签名流程**：
```
1. 构造 domain (name, version, chainId, verifyingContract)
2. 构造 types (Feedback 结构)
3. 构造 message (实际数据)
4. 调用 signer.signTypedData(domain, types, message)
5. 返回签名字符串
```

---

## 🎯 完整调用链路图

### 用户提交评分到链上的完整流程

```
用户点击"提交到链上"
    ↓
/erc8004/validate/[id]/page.tsx
    ↓
handleSubmitFeedback()
    ↓
1. 初始化合约实例
   new ethers.Contract(REPUTATION_ADDR, ReputationRegistryABI, signer)
    ↓
2. 调用合约方法
   reputationRegistry.submitFeedback(signData.params, signData.signature)
    ↓
3. 等待交易确认
   tx.wait()
    ↓
4. 监听事件
   FeedbackSubmitted event
    ↓
5. 更新 UI 状态
   setCurrentStep(3)
```

### 签名数据的获取流程

```
前端调用
    ↓
fetch('/api/contributions/[id]/sign')
    ↓
/api/contributions/[id]/sign/route.ts
    ↓
1. 从数据库查询贡献
   ContributionRepository.findById(id)
    ↓
2. 从链上获取 nonce
   ReputationRegistry.nonces(evaluatorAddress)
    ↓
3. 构造 SubmitParams
   { contributor, repo, commitSha, score, feedbackHash, metadataURI, timestamp, nonce }
    ↓
4. 生成元数据
   ERC8004Service.generateMetadataJSON(...)
    ↓
5. 上传 IPFS
   ERC8004Service.uploadToIPFS(metadataJSON)
   └─ fetch('/api/ipfs/upload')
    ↓
6. 签名
   ERC8004Service.signFeedback(...)
   └─ signer.signTypedData(domain, types, message)
    ↓
7. 返回给前端
   { params, signature, ... }
```

---

## 🔄 循环依赖关系

### useAgentRegistry Hook

```
useAgentRegistry.ts
    ↓ 引用
useWeb3 (获取 account, signer)
useAuth (获取 user.githubUsername)
AgentIdentityRegistryABI
    ↓ 调用合约
AgentIdentityRegistry.isRegistered(account)
AgentIdentityRegistry.getAgentByAddress(account)
AgentIdentityRegistry.registerAgent(username, uri)
    ↓ 被引用于
RegisterAgentModal.tsx
/erc8004/contributions/page.tsx
/erc8004/validate/[id]/page.tsx
```

### RegisterAgentModal 组件

```
RegisterAgentModal.tsx
    ↓ 引用
useAgentRegistry
useAuth
toast (react-hot-toast)
motion (framer-motion)
    ↓ 调用
useAgentRegistry.registerAgent(githubUsername)
    ↓ 内部调用
AgentIdentityRegistry.registerAgent(username, agentCardURI)
    ↓ 被引用于
/erc8004/contributions/page.tsx
/erc8004/validate/[id]/page.tsx
```

---

## 📊 数据流向图

### 混合数据模式（数据库 + 链上）

```
                    用户界面
                       ↓
        ┌──────────────┴──────────────┐
        ↓                             ↓
   数据库 API                    链上合约
        ↓                             ↓
/api/contributions/my          ReputationRegistry
        ↓                             ↓
贡献基本信息                    声誉统计数据
(title, repo, score)          (totalScore, average)
        ↓                             ↓
        └──────────────┬──────────────┘
                       ↓
                  合并展示
              (列表 + 徽章)
```

### 评分上链流程

```
用户触发
    ↓
前端页面
    ↓
┌─────────────────────┐
│ 1. 获取签名数据      │
│ API: /api/.../sign  │
└─────────┬───────────┘
          ↓
┌─────────────────────────────┐
│ 后端处理                     │
│ - 查数据库                   │
│ - 读链上 nonce              │
│ - 生成元数据                 │
│ - 上传 IPFS                 │
│ - EIP-712 签名              │
└─────────┬───────────────────┘
          ↓
┌─────────────────────┐
│ 2. 调用合约         │
│ submitFeedback()    │
└─────────┬───────────┘
          ↓
┌─────────────────────┐
│ 链上合约执行         │
│ - 验证签名           │
│ - 存储评分哈希       │
│ - 更新声誉           │
│ - 发射事件           │
└─────────┬───────────┘
          ↓
前端监听事件
    ↓
更新 UI 状态
```

---

## 🗺️ 文件引用矩阵

### 谁引用了谁

| 文件 | 引用 | 被引用 |
|------|------|--------|
| **ScoreDisplay.tsx** | motion, icons | validate/[id]/page.tsx |
| **ReputationBadge.tsx** | motion, icons | contributions/page.tsx |
| **RegisterAgentModal.tsx** | useAgentRegistry, useAuth, motion | contributions/page.tsx, validate/[id]/page.tsx |
| **use-agent-registry.ts** | useWeb3, useAuth, AgentIdentityRegistryABI | RegisterAgentModal, contributions/page, validate/[id]/page |
| **contributions/page.tsx** | 3个组件, 3个Hooks, ReputationRegistryABI | 无（顶层页面） |
| **validate/[id]/page.tsx** | 2个组件, 2个Hooks, 2个ABI | 无（顶层页面） |
| **[id]/sign/route.ts** | ERC8004Service, ReputationRegistryABI | validate/[id]/page.tsx |

---

## 🎯 关键调用路径

### 路径 1: 注册代理

```
用户界面
  ↓
RegisterAgentModal.handleRegister()
  ↓
useAgentRegistry.registerAgent(username)
  ↓
new ethers.Contract(addr, AgentIdentityRegistryABI, signer)
  ↓
contract.registerAgent(username, agentCardURI)
  ↓
AgentIdentityRegistry.sol (链上合约)
  ↓
emit AgentRegistered event
  ↓
useAgentRegistry.checkRegistration()
  ↓
更新 isRegistered = true
```

### 路径 2: 提交评分

```
用户界面
  ↓
validate/[id]/page.tsx
  ↓
fetch('/api/contributions/[id]/sign')
  ↓
/api/contributions/[id]/sign/route.ts
  ├─ 查询数据库 (ContributionRepository)
  ├─ 读取链上 nonce (ReputationRegistry.nonces)
  ├─ 生成元数据 (ERC8004Service)
  ├─ 上传 IPFS (/api/ipfs/upload)
  └─ EIP-712 签名
  ↓
返回 { params, signature }
  ↓
前端调用合约
reputationRegistry.submitFeedback(params, signature)
  ↓
ReputationRegistry.sol (链上合约)
  ├─ 验证签名
  ├─ 存储反馈
  ├─ 更新声誉
  └─ 发射事件
```

### 路径 3: 验证铸造

```
用户界面
  ↓
validate/[id]/page.tsx.handleRequestValidation()
  ↓
validationRegistry.requestValidation(repo, sha, contributor, uri)
  ↓
ValidationRegistry.sol
  ├─ 查询 ReputationRegistry.getFeedbackByCommit(repo, sha)
  ├─ 检查 feedback.exists
  ├─ 比较 score >= mintThreshold
  └─ 如果达标
      ├─ 调用 CommitNFT.mintCommit(...)
      ├─ emit MintTriggered event
      └─ 返回 true
  ↓
前端监听 MintTriggered 事件
  ↓
获取 Token ID
  ↓
显示铸造成功
```

---

## 🔍 合约间调用关系

### ValidationRegistry → ReputationRegistry

```solidity
// ValidationRegistry.requestValidation() 内部调用
IReputationRegistry.Feedback memory feedback = 
  reputationRegistry.getFeedbackByCommit(repo, commitSha);

// 读取评分数据
if (!feedback.exists) revert FeedbackNotFound();
bool shouldMint = feedback.score >= mintThreshold;
```

### ValidationRegistry → CommitNFT

```solidity
// ValidationRegistry._triggerMint() 内部调用
CommitNFT.CommitData memory commitData = CommitNFT.CommitData({
  repo: string(repo),
  commit: string(commitSha),
  // ... 其他字段
});

nftContract.mintCommit(to, commitData, metadataURI);

uint256 tokenId = nftContract.getCurrentTokenId() - 1;
```

### 合约权限关系

```
CommitNFT
  ↑ owner
ValidationRegistry (部署时自动转移 ownership)

ReputationRegistry
  ↑ EVALUATOR_ROLE
Evaluator Account (后端服务账户)

ValidationRegistry
  ↑ DEFAULT_ADMIN_ROLE
Deployer Account
```

---

## 📦 导入导出关系

### ABI 导出链

```
hardhat/artifacts/contracts/[Name].sol/[Name].json
    ↓ (编译生成)
hardhat/artifacts/contracts/[Name].sol/[Name].json
    ↓ (jq 提取 .abi)
frontend/src/lib/contracts/[Name].json
    ↓ (导入)
frontend/src/lib/contracts/index.ts
    ↓ (re-export)
export { [Name]ABI }
export const ABIS = { [Name]: [Name]ABI }
    ↓ (使用)
页面/组件/Hooks 引用
```

### 类型定义链

```
Solidity 合约结构体
    ↓ (手动映射)
frontend/src/types/erc8004.ts
    ↓ (导出)
export interface SubmitParams { ... }
export interface Feedback { ... }
    ↓ (使用)
页面/组件/服务引用
```

---

## 🎯 核心依赖总结

### 最底层（无依赖）
- ✅ 智能合约（.sol 文件）
- ✅ ABI JSON 文件
- ✅ TypeScript 类型定义

### 中间层（依赖底层）
- ✅ ERC8004Service（依赖 ethers, ABI）
- ✅ ScoringService（独立）
- ✅ API 路由（依赖 Service, ABI）

### 上层（依赖中间层）
- ✅ useAgentRegistry Hook（依赖 useWeb3, useAuth, ABI）
- ✅ UI 组件（依赖 Hooks）
- ✅ 页面（依赖组件, Hooks, API）

### 顶层（用户入口）
- ✅ /erc8004/contributions
- ✅ /erc8004/validate/[id]

---

## 📝 总结

**核心依赖链**：
```
用户 
→ 页面 
→ 组件 
→ Hooks 
→ Services/API 
→ ABI 
→ 智能合约
```

**数据流向**：
```
数据库 ←→ API ←→ 前端页面 ←→ 链上合约
   ↑                            ↑
   └────── IPFS 元数据 ─────────┘
```

**关键交互点**：
1. **useAgentRegistry** - 连接前端与 AgentIdentityRegistry 合约
2. **/api/[id]/sign** - 连接数据库、IPFS 与 ReputationRegistry
3. **页面组件** - 连接用户操作与合约调用

---

所有文件都通过清晰的接口相互协作，形成完整的 ERC-8004 系统！

最后更新: 2025-11-10

