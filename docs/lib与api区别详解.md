# lib/ 与 app/api/ 的区别详解

## 核心区别总结

| 对比维度 | `lib/` | `app/api/` |
|---------|--------|------------|
| **本质** | 可复用的代码库（前后端共享） | HTTP API 端点（纯后端） |
| **运行环境** | 前端（浏览器）+ 后端（服务端） | 仅后端（服务端） |
| **访问方式** | `import` 导入使用 | HTTP 请求（fetch/axios） |
| **URL 路由** | ❌ 无 URL | ✅ 有 URL（如 `/api/auth/user`） |
| **可见性** | 前端代码可见（打包后） | 后端代码不可见 |
| **主要职责** | 业务逻辑、数据访问、工具函数 | 请求处理、权限验证、响应返回 |
| **安全性** | ⚠️ 敏感逻辑需谨慎 | ✅ 安全（不会暴露给客户端） |
| **使用场景** | 组件、Hooks、API Routes | 接收前端请求、调用 `lib/` |

---

## 一、定位差异

### 1.1 `lib/` - 共享代码库

**定位：** 前后端**共享**的业务逻辑和工具函数。

```
lib/
├── services/          # 业务逻辑（前后端都可用）
│   ├── auth.service.ts         ← 前端可调用（如 AuthService.signOut）
│   ├── blockchain.service.ts   ← 后端专用（需要私钥）
│   └── scoring.service.ts      ← 前后端都可用（纯计算）
├── contexts/          # React Context（仅前端）
│   ├── Web3Context.tsx         ← 仅前端使用
│   └── RainbowKitProvider.tsx  ← 仅前端使用
├── database/          # 数据访问层（后端专用）
│   └── repositories/           ← 仅后端使用（API Routes 调用）
└── utils/             # 工具函数（前后端都可用）
```

**特点：**
- ✅ 可以在 React 组件中 `import` 使用
- ✅ 可以在 API Routes 中 `import` 使用
- ⚠️ 前端能访问的代码会被打包到浏览器（注意安全）
- ⚠️ 不要在前端可访问的 `lib/` 代码中硬编码私钥/敏感信息

### 1.2 `app/api/` - HTTP API 端点

**定位：** 纯后端的 **HTTP 服务**，处理前端请求。

```
app/api/
├── auth/
│   ├── github/route.ts         ← GET /api/auth/github（重定向到 GitHub OAuth）
│   ├── callback/route.ts       ← GET /api/auth/callback（OAuth 回调）
│   ├── user/route.ts           ← GET /api/auth/user（获取当前用户）
│   └── logout/route.ts         ← POST /api/auth/logout（登出）
├── contributions/
│   ├── route.ts                ← GET /api/contributions（查询贡献列表）
│   ├── my/route.ts             ← GET /api/contributions/my（我的贡献）
│   └── [id]/route.ts           ← GET /api/contributions/123（单个贡献）
└── github/
    └── webhook/route.ts        ← POST /api/github/webhook（GitHub Webhook）
```

**特点：**
- ✅ 有独立的 URL 路由
- ✅ 处理 HTTP 请求/响应
- ✅ 代码仅在服务端运行，前端看不到
- ✅ 可以安全地使用私钥、数据库连接
- ❌ 不能直接在 React 组件中调用（需通过 `fetch`）

---

## 二、代码对比示例

### 示例 1：获取用户贡献

#### `lib/services/contribution.service.ts` - 业务逻辑层
```typescript
// lib/services/contribution.service.ts
export class ContributionService {
  // 封装业务逻辑，供 API Routes 或前端调用
  static async findByUser(userId: string, limit = 50, offset = 0): Promise<Contribution[]> {
    // 调用 Repository 层获取数据
    return ContributionRepository.findByUserId(userId, limit, offset);
  }
}
```

**特点：**
- 纯业务逻辑，不涉及 HTTP 请求/响应
- 可以在 API Routes 中调用
- 也可以在其他 Service 中复用

#### `app/api/contributions/my/route.ts` - HTTP API 端点
```typescript
// app/api/contributions/my/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ContributionService } from '@/lib/services/contribution.service';  // ← 调用 lib/
import { AuthService } from '@/lib/services/auth.service';

export async function GET(request: NextRequest) {
  try {
    // 1. 验证用户身份（HTTP 层职责）
    const authorization = request.headers.get('authorization');
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. 获取当前用户
    const { user, error } = await AuthService.getServerUser();
    if (error || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // 3. 解析查询参数（HTTP 层职责）
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    // 4. 调用 Service 层获取数据
    const contributions = await ContributionService.findByUser(user.id, limit, offset);

    // 5. 返回 HTTP 响应（HTTP 层职责）
    return NextResponse.json({
      data: contributions,
      pagination: { limit, offset, total: contributions.length },
      user: { id: user.id, username: user.user_metadata?.user_name || 'unknown' },
    });

  } catch (error) {
    // 6. 错误处理（HTTP 层职责）
    console.error('Get my contributions error:', error);
    return NextResponse.json({ error: 'Failed to fetch user contributions' }, { status: 500 });
  }
}
```

**特点：**
- 处理 HTTP 请求（验证、解析参数）
- 调用 `lib/` 中的业务逻辑
- 返回 HTTP 响应（JSON 格式）
- 错误处理和状态码

---

### 示例 2：评分系统

#### `lib/services/scoring.service.ts` - 纯业务逻辑
```typescript
// lib/services/scoring.service.ts
export class ScoringService {
  // 规范性评分（纯计算逻辑，前后端都可用）
  static conventionalScore(message: string): number {
    const prefixOk = /^(feat|fix|docs|refactor|test|chore)(\(.+\))?:\s+/.test(message);
    const lengthOk = message.split('\n')[0].trim().length >= 8;
    return Math.round((prefixOk ? 70 : 30) + (lengthOk ? 30 : 0));
  }

  // 代码变更量评分
  static sizeScore(additions: number, deletions: number): number {
    const total = additions + deletions;
    if (total === 0) return 40;
    if (total <= 50) return 95;
    if (total <= 200) return 85;
    return 70;
  }

  // 聚合评分
  static aggregate(weights: any, breakdown: ScoreBreakdown): number {
    const w = { convention: 0.25, size: 0.2, filesImpact: 0.2, ...weights };
    return Math.round(
      w.convention * breakdown.convention + 
      w.size * breakdown.size + 
      w.filesImpact * breakdown.filesImpact
    );
  }
}
```

**可以在前端使用：**
```typescript
// 前端组件中直接使用
import { ScoringService } from '@/lib/services/scoring.service';

function MyComponent() {
  const score = ScoringService.conventionalScore('feat: add new feature');
  return <div>评分: {score}</div>;
}
```

**也可以在后端使用：**
```typescript
// API Routes 中使用
import { ScoringService } from '@/lib/services/scoring.service';

export async function POST(request: NextRequest) {
  const { message, additions, deletions } = await request.json();
  
  const breakdown = {
    convention: ScoringService.conventionalScore(message),
    size: ScoringService.sizeScore(additions, deletions),
    filesImpact: 80,  // ...
  };
  
  const finalScore = ScoringService.aggregate({}, breakdown);
  
  return NextResponse.json({ score: finalScore, breakdown });
}
```

---

## 三、职责划分

### 3.1 `lib/` 的职责

#### ✅ 应该放在 `lib/` 的代码

1. **业务逻辑**（前后端共享）
   ```typescript
   // lib/services/scoring.service.ts
   static conventionalScore(message: string): number { ... }
   ```

2. **数据访问层**（后端专用）
   ```typescript
   // lib/database/repositories/contribution.repository.ts
   static async findById(id: string): Promise<Contribution | null> { ... }
   ```

3. **工具函数**（前后端共享）
   ```typescript
   // lib/utils/format.ts
   export function formatDate(date: Date): string { ... }
   ```

4. **React Context/Hooks**（前端专用）
   ```typescript
   // lib/contexts/Web3Context.tsx
   export function useWeb3() { ... }
   ```

5. **类型定义**（前后端共享）
   ```typescript
   // lib/types/contribution.ts
   export interface Contribution { ... }
   ```

#### ❌ 不应该放在 `lib/` 的代码

1. **HTTP 请求处理**
   ```typescript
   // ❌ 错误：不要在 lib/ 中写 HTTP 处理逻辑
   export async function GET(request: NextRequest) { ... }
   ```

2. **直接的数据库连接**（可以封装到 `lib/database/`）
   ```typescript
   // ⚠️ 谨慎：数据库连接应封装到 lib/database/
   const client = new Pool({ connectionString: process.env.DATABASE_URL });
   ```

### 3.2 `app/api/` 的职责

#### ✅ 应该放在 `app/api/` 的代码

1. **HTTP 请求验证**
   ```typescript
   const authorization = request.headers.get('authorization');
   if (!authorization) {
     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
   }
   ```

2. **参数解析与校验**
   ```typescript
   const { searchParams } = new URL(request.url);
   const limit = parseInt(searchParams.get('limit') || '50', 10);
   ```

3. **调用 Service 层**
   ```typescript
   const contributions = await ContributionService.findByUser(user.id, limit, offset);
   ```

4. **返回 HTTP 响应**
   ```typescript
   return NextResponse.json({ data: contributions });
   ```

5. **错误处理与日志**
   ```typescript
   catch (error) {
     console.error('API Error:', error);
     return NextResponse.json({ error: 'Internal error' }, { status: 500 });
   }
   ```

#### ❌ 不应该放在 `app/api/` 的代码

1. **复杂的业务逻辑**
   ```typescript
   // ❌ 错误：应该放在 lib/services/ 中
   export async function POST(request: NextRequest) {
     // 100 行评分逻辑...
     const score = /* 复杂计算 */;
     return NextResponse.json({ score });
   }
   
   // ✅ 正确：调用 Service 层
   export async function POST(request: NextRequest) {
     const score = await ScoringService.calculateScore(data);
     return NextResponse.json({ score });
   }
   ```

2. **直接的数据库查询**
   ```typescript
   // ❌ 错误：应该通过 Repository 层
   const result = await pool.query('SELECT * FROM contributions WHERE id = $1', [id]);
   
   // ✅ 正确：调用 Repository 层
   const contribution = await ContributionRepository.findById(id);
   ```

---

## 四、完整的调用链

### 场景：获取当前用户的贡献列表

#### 前端 → API → Service → Repository → Database

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. 前端组件 (React Component)                                    │
│    frontend/src/app/erc8004/contributions/page.tsx              │
│                                                                  │
│    const response = await fetch('/api/contributions/my', {     │
│      headers: { 'Authorization': `Bearer ${token}` }           │
│    });                                                          │
│    const data = await response.json();                         │
└─────────────────────────────────────────────────────────────────┘
                               ↓ HTTP 请求
┌─────────────────────────────────────────────────────────────────┐
│ 2. API Routes (HTTP 端点)                                        │
│    app/api/contributions/my/route.ts                            │
│                                                                  │
│    export async function GET(request: NextRequest) {           │
│      // ① 验证身份                                               │
│      const { user } = await AuthService.getServerUser();       │
│                                                                  │
│      // ② 解析参数                                               │
│      const limit = parseInt(searchParams.get('limit'));        │
│                                                                  │
│      // ③ 调用 Service 层                                        │
│      const contributions = await ContributionService           │
│        .findByUser(user.id, limit, offset);                    │
│                                                                  │
│      // ④ 返回 HTTP 响应                                         │
│      return NextResponse.json({ data: contributions });        │
│    }                                                            │
└─────────────────────────────────────────────────────────────────┘
                               ↓ 调用
┌─────────────────────────────────────────────────────────────────┐
│ 3. Service 层 (业务逻辑)                                          │
│    lib/services/contribution.service.ts                         │
│                                                                  │
│    export class ContributionService {                          │
│      static async findByUser(userId, limit, offset) {         │
│        // 调用 Repository 层                                     │
│        return ContributionRepository.findByUserId(             │
│          userId, limit, offset                                 │
│        );                                                      │
│      }                                                         │
│    }                                                           │
└─────────────────────────────────────────────────────────────────┘
                               ↓ 调用
┌─────────────────────────────────────────────────────────────────┐
│ 4. Repository 层 (数据访问)                                       │
│    lib/database/repositories/contribution.repository.ts         │
│                                                                  │
│    export class ContributionRepository {                       │
│      static async findByUserId(userId, limit, offset) {       │
│        // 执行 SQL 查询                                          │
│        const result = await query(`                            │
│          SELECT * FROM contributions                           │
│          WHERE user_id = $1                                    │
│          ORDER BY created_at DESC                              │
│          LIMIT $2 OFFSET $3                                    │
│        `, [userId, limit, offset]);                            │
│                                                                  │
│        // 映射数据                                               │
│        return result.rows.map(this.mapRowToContribution);     │
│      }                                                         │
│    }                                                           │
└─────────────────────────────────────────────────────────────────┘
                               ↓ 调用
┌─────────────────────────────────────────────────────────────────┐
│ 5. Database 层 (数据库查询)                                       │
│    lib/database/index.ts                                        │
│                                                                  │
│    export const query = async (text, params) => {             │
│      const supabase = getSupabaseService();                   │
│      const result = await supabase.query(text, params);       │
│      return { rows: result, rowCount: result.length };        │
│    }                                                           │
└─────────────────────────────────────────────────────────────────┘
                               ↓ 查询
┌─────────────────────────────────────────────────────────────────┐
│ 6. PostgreSQL 数据库                                             │
│    Supabase / PostgreSQL                                        │
└─────────────────────────────────────────────────────────────────┘
```

---

## 五、安全性考量

### 5.1 前端可见 vs 后端私密

| 代码位置 | 前端可见性 | 安全建议 |
|---------|----------|---------|
| `lib/contexts/` | ✅ 完全可见 | 不要放敏感信息 |
| `lib/services/` (前端调用) | ✅ 完全可见 | 不要放私钥/密钥 |
| `lib/services/` (仅后端调用) | ⚠️ 代码可见，但不会执行 | 谨慎处理 |
| `lib/database/` | ⚠️ 代码可见，但不会执行 | 不要硬编码密码 |
| `app/api/` | ❌ 完全不可见 | 可以安全使用私钥 |

### 5.2 示例：敏感信息处理

#### ❌ 错误示例（泄露私钥）
```typescript
// ❌ lib/services/blockchain.service.ts（前端可见！）
export class BlockchainService {
  private static privateKey = '0x1234567890abcdef...';  // ← 危险！会打包到前端
  
  static async mintNFT() {
    const wallet = new ethers.Wallet(this.privateKey);  // ← 私钥泄露
    // ...
  }
}
```

#### ✅ 正确示例（私钥在服务端）
```typescript
// ✅ lib/services/blockchain.service.ts
export class BlockchainService {
  // 从环境变量读取（服务端）
  private static getPrivateKey(): string {
    if (typeof window !== 'undefined') {
      throw new Error('私钥不能在前端使用');
    }
    return process.env.SEPOLIA_PRIVATE_KEY!;
  }
  
  static async mintNFT() {
    const privateKey = this.getPrivateKey();  // ← 仅在服务端可用
    const wallet = new ethers.Wallet(privateKey);
    // ...
  }
}
```

```typescript
// ✅ app/api/contributions/mint/route.ts
export async function POST(request: NextRequest) {
  // 调用 Service（在服务端执行，私钥安全）
  const txHash = await BlockchainService.mintNFT(contributionId);
  return NextResponse.json({ txHash });
}
```

---

## 六、何时使用哪个？

### 决策树

```
需要通过 HTTP 访问吗？
├─ 是 → 放在 app/api/
│         - 定义 GET/POST/PUT/DELETE 方法
│         - 处理请求验证、参数解析
│         - 调用 lib/ 中的业务逻辑
│
└─ 否 → 放在 lib/
          ├─ 前端会用到吗？
          │  ├─ 是 → lib/contexts/, lib/hooks/, lib/utils/
          │  │       - React Context/Hooks
          │  │       - 纯工具函数
          │  │       - 不包含敏感信息
          │  │
          │  └─ 否 → 仅后端使用
          │          ├─ 数据访问 → lib/database/repositories/
          │          ├─ 业务逻辑 → lib/services/
          │          └─ 配置管理 → lib/config/
```

### 示例决策

| 功能 | 放在哪里？ | 原因 |
|-----|----------|------|
| 连接钱包的 UI 逻辑 | `lib/contexts/Web3Context.tsx` | 前端专用，需要 React Context |
| 计算贡献评分 | `lib/services/scoring.service.ts` | 前后端共享，纯计算逻辑 |
| 查询数据库 | `lib/database/repositories/` | 后端专用，但不是 HTTP 端点 |
| 接收 GitHub Webhook | `app/api/github/webhook/route.ts` | HTTP 端点，需要 URL 路由 |
| 铸造 NFT | `lib/services/blockchain.service.ts` | 业务逻辑，由 API Routes 调用 |
| 处理用户登录请求 | `app/api/auth/github/route.ts` | HTTP 端点，处理 OAuth 流程 |

---

## 七、总结

### `lib/` - 共享代码库

**本质：** 前后端共享的业务逻辑和工具函数库

**特点：**
- ✅ 可被 React 组件和 API Routes 导入
- ✅ 封装业务逻辑、数据访问、工具函数
- ⚠️ 前端可访问的代码会打包到浏览器（注意安全）

**常见模块：**
- `lib/contexts/` - React Context（前端专用）
- `lib/services/` - 业务逻辑（前后端共享或后端专用）
- `lib/database/` - 数据访问层（后端专用）
- `lib/utils/` - 工具函数（前后端共享）

### `app/api/` - HTTP API 端点

**本质：** 后端 HTTP 服务，处理前端请求

**特点：**
- ✅ 有独立的 URL 路由
- ✅ 仅在服务端运行，代码不暴露
- ✅ 可安全使用私钥、数据库连接
- ✅ 调用 `lib/` 中的业务逻辑

**职责：**
1. 验证请求（身份认证、参数校验）
2. 调用 Service 层业务逻辑
3. 返回 HTTP 响应
4. 错误处理与日志

### 协作关系

```
前端组件
  ↓ (fetch/axios)
API Routes (app/api/)
  ↓ (import)
Service 层 (lib/services/)
  ↓ (import)
Repository 层 (lib/database/repositories/)
  ↓
Database (PostgreSQL)
```

**核心原则：**
- `app/api/` 是 HTTP 层，负责请求处理
- `lib/` 是逻辑层，负责业务和数据
- `app/api/` 调用 `lib/`，而不是直接操作数据库
- 前端组件通过 HTTP 调用 `app/api/`，不直接调用 `lib/database/`




