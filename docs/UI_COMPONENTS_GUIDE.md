# ERC-8004 UI 组件使用指南

## ✅ 已创建的组件

### 1. ScoreDisplay - 评分展示组件

**位置**: `components/erc8004/ScoreDisplay.tsx`

**用途**: 可视化展示贡献的评分及各维度明细

**Props**:
```typescript
interface ScoreDisplayProps {
  score: number;              // 总分 0-100
  breakdown: ScoreBreakdown;  // 各维度分数
  threshold?: number;         // 铸造阈值，默认 80
}
```

**使用示例**:
```typescript
import { ScoreDisplay } from '@/components/erc8004';

<ScoreDisplay
  score={85}
  breakdown={{
    convention: 90,
    size: 85,
    filesImpact: 80,
    mergeSignal: 90,
    metadataCompleteness: 85
  }}
  threshold={80}
/>
```

**特性**:
- ✅ 自动计算等级（S/A/B/C/D）
- ✅ 动画进度条
- ✅ 达标/未达标提示
- ✅ 5 个维度可视化

---

### 2. ReputationBadge - 声誉徽章组件

**位置**: `components/erc8004/ReputationBadge.tsx`

**用途**: 展示用户的链上声誉数据

**Props**:
```typescript
interface ReputationBadgeProps {
  totalScore: number;    // 总分
  feedbackCount: number; // 贡献次数
  averageScore: number;  // 平均分
  size?: 'small' | 'large';  // 尺寸
  animated?: boolean;    // 是否动画
}
```

**使用示例**:
```typescript
import { ReputationBadge } from '@/components/erc8004';

// 小徽章（用于 Navbar）
<ReputationBadge
  totalScore={850}
  feedbackCount={10}
  averageScore={85}
  size="small"
/>

// 大卡片（用于 Dashboard）
<ReputationBadge
  totalScore={850}
  feedbackCount={10}
  averageScore={85}
  size="large"
/>
```

**特性**:
- ✅ 自动计算等级（传奇/大师/精英/新星/入门）
- ✅ 等级图标和渐变色
- ✅ 总分/次数/平均分展示
- ✅ 进度条动画

---

### 3. RegisterAgentModal - 代理注册弹窗

**位置**: `components/erc8004/RegisterAgentModal.tsx`

**用途**: 首次使用时引导用户注册代理身份

**Props**:
```typescript
interface RegisterAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}
```

**使用示例**:
```typescript
import { RegisterAgentModal } from '@/components/erc8004';
import { useAgentRegistry } from '@/hooks/use-agent-registry';

function MyComponent() {
  const { isRegistered } = useAgentRegistry();
  const [showModal, setShowModal] = useState(!isRegistered);

  return (
    <RegisterAgentModal
      isOpen={showModal}
      onClose={() => setShowModal(false)}
      onSuccess={() => {
        console.log('注册成功！');
        setShowModal(false);
      }}
    />
  );
}
```

**特性**:
- ✅ 自动读取 GitHub 用户名
- ✅ 自动生成 Agent Card
- ✅ 交易状态显示
- ✅ 错误处理

---

## 📄 已创建的页面

### 1. /erc8004/contributions - 贡献列表页

**位置**: `app/erc8004/contributions/page.tsx`

**功能**:
- 显示当前用户的所有 GitHub 贡献
- 展示评分状态（已评分/可上链/已铸造）
- 点击贡献跳转到验证流程
- 显示用户声誉徽章
- 自动检查并提示注册代理

**特性**:
- ✅ 从数据库获取贡献列表
- ✅ 从链上获取声誉数据（混合模式）
- ✅ 自动触发代理注册弹窗
- ✅ 未登录/未连接钱包友好提示

---

### 2. /erc8004/validate/[id] - 验证流程页

**位置**: `app/erc8004/validate/[id]/page.tsx`

**功能**:
- 3 步流程：查看评分 → 提交链上 → 验证铸造
- 调用 ReputationRegistry.submitFeedback()
- 调用 ValidationRegistry.requestValidation()
- 自动检测是否达到铸造阈值

**流程**:

**Step 1: 查看评分**
- 显示贡献基本信息
- 使用 ScoreDisplay 展示评分
- "下一步" 按钮

**Step 2: 提交链上**
- 显示钱包地址、评分、是否可铸造
- 调用 `/api/contributions/[id]/sign` 获取签名
- 调用 `reputationRegistry.submitFeedback(params, signature)`
- 进度条显示

**Step 3: 验证铸造**
- 显示提交成功状态
- 如果分数 ≥ 80，显示"验证并铸造 NFT"按钮
- 调用 `validationRegistry.requestValidation(...)`
- 显示铸造结果（Token ID）
- 返回列表或查看 NFT 按钮

**特性**:
- ✅ 完整的 ERC-8004 流程
- ✅ 自动检查代理注册
- ✅ 混合模式（数据库 + 链上）
- ✅ 详细的错误处理
- ✅ 交易进度追踪

---

## 🔧 使用的 Hooks

### useAgentRegistry

**位置**: `hooks/use-agent-registry.ts`

**功能**:
- 检查当前用户是否已注册代理
- 注册新代理
- 获取代理信息

**返回值**:
```typescript
{
  isRegistered: boolean;     // 是否已注册
  loading: boolean;          // 加载状态
  agentProfile: any | null;  // 代理资料
  registerAgent: (username?) => Promise<tx>;  // 注册函数
  checkRegistration: () => Promise<void>;     // 重新检查
}
```

**使用示例**:
```typescript
import { useAgentRegistry } from '@/hooks/use-agent-registry';

function MyComponent() {
  const { isRegistered, loading, registerAgent } = useAgentRegistry();

  useEffect(() => {
    if (!loading && !isRegistered) {
      // 显示注册弹窗
    }
  }, [loading, isRegistered]);

  return <div>...</div>;
}
```

---

## 🎯 完整用户流程

### 1. 用户访问 `/erc8004/contributions`
```
→ 检查登录状态（未登录跳转登录）
→ 检查钱包连接（未连接显示提示）
→ 检查代理注册（未注册弹出 RegisterAgentModal）
→ 显示贡献列表（从 /api/contributions/my 获取）
→ 显示声誉徽章（从链上 ReputationRegistry 获取）
```

### 2. 用户点击某个贡献
```
→ 跳转到 `/erc8004/validate/[id]`
→ 加载贡献数据（数据库）
→ 获取签名数据（/api/contributions/[id]/sign）
→ 显示 ScoreDisplay（评分明细）
```

### 3. 用户提交评分（Step 2）
```
→ 调用 reputationRegistry.submitFeedback(params, signature)
→ 等待交易确认
→ 显示成功状态
→ 自动进入 Step 3
```

### 4. 用户验证铸造（Step 3）
```
→ 如果 score >= 80，显示"铸造 NFT"按钮
→ 调用 validationRegistry.requestValidation(repo, sha, contributor, uri)
→ 合约自动判断并铸造
→ 监听 MintTriggered 事件获取 Token ID
→ 显示铸造结果
```

---

## 📦 导出清单

### 组件
```typescript
// components/erc8004/index.ts
export { ScoreDisplay } from './ScoreDisplay';
export { ReputationBadge } from './ReputationBadge';
export { RegisterAgentModal } from './RegisterAgentModal';
```

### Hooks
```typescript
// hooks/use-agent-registry.ts
export function useAgentRegistry() { ... }
```

### 页面
```
app/erc8004/
├── contributions/page.tsx       // 贡献列表页
└── validate/[id]/page.tsx      // 验证流程页
```

### 类型
```typescript
// types/erc8004.ts
export interface SubmitParams { ... }
export interface Feedback { ... }
export interface AgentProfile { ... }
```

---

## 🚀 快速测试

### 1. 启动开发服务器
```bash
cd frontend
pnpm dev
```

### 2. 访问页面
```
http://localhost:3000/erc8004/contributions
```

### 3. 测试流程
1. ✅ 确保已登录 GitHub
2. ✅ 连接钱包
3. ✅ 注册代理（首次）
4. ✅ 查看贡献列表
5. ✅ 点击某个贡献进入验证流程
6. ✅ 完成 3 步流程

---

## 📋 下一步（可选）

### 高优先级
- [ ] 在 Dashboard 增加"我的贡献"入口
- [ ] 在 Navbar 显示声誉徽章
- [ ] 扩展 CollectionCard 显示评分

### 中优先级
- [ ] 创建贡献详情页
- [ ] 添加筛选和搜索功能
- [ ] 事件监听和实时通知

### 低优先级
- [ ] 排行榜页面
- [ ] 统计图表
- [ ] 批量操作

---

**核心 UI 已完成！现在可以测试完整流程了。** 🎉

需要我继续创建其他组件，或者先测试当前的功能？
