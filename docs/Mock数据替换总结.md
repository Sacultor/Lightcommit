# Mock 数据替换总结

## 🎯 需要完成的工作

为了把前端所有的 mock 数据换成后端传过来的真实数据，还需要以下内容：

---

## ✅ 已创建的内容

### 1. 后端 API 接口（4个）

| API 路由 | 功能 | 文件位置 |
|---------|------|---------|
| `GET /api/contributions/latest` | 获取最新贡献列表 | `frontend/src/app/api/contributions/latest/route.ts` |
| `GET /api/nft/user/:address` | 获取用户拥有的 NFT | `frontend/src/app/api/nft/user/[address]/route.ts` |
| `GET /api/nft/metadata/:tokenId` | 获取 NFT 元数据 | `frontend/src/app/api/nft/metadata/[tokenId]/route.ts` |
| `GET /api/github/repos` | 获取 GitHub 仓库列表 | `frontend/src/app/api/github/repos/route.ts` |

### 2. 前端 Hooks（2个）

| Hook | 功能 | 文件位置 |
|------|------|---------|
| `useLatestContributions` | 获取最新贡献（用于 Explore 页面） | `frontend/src/hooks/use-latest-contributions.ts` |
| `useUserNFTs` | 获取用户 NFT（用于 Collections 页面） | `frontend/src/hooks/use-nft.ts` |
| `useNFTMetadata` | 获取 NFT 元数据 | `frontend/src/hooks/use-nft.ts` |

### 3. 数据库方法（1个）

| 方法 | 功能 | 文件位置 |
|------|------|---------|
| `ContributionRepository.findByTokenId` | 根据 Token ID 查找贡献 | `frontend/src/lib/database/repositories/contribution.repository.ts` |

### 4. API 客户端更新（1个）

| 文件 | 新增内容 | 位置 |
|------|---------|------|
| `api.ts` | 添加 `nftApi` 和 `githubApi` | `frontend/src/lib/api.ts` |

---

## 📝 需要修改的页面

### 1. Explore 页面

**文件**：`frontend/src/app/explore/page.tsx`

**需要做的修改**：

```tsx
// 替换 mock 数据
import { useLatestContributions } from '@/hooks/use-latest-contributions';

const { data: contributions, isLoading, error } = useLatestContributions({
  limit: 20,
  type: 'commit',
});

// 使用真实数据渲染卡片
{contributions?.map((contribution, index) => (
  <motion.div key={contribution.id} ...>
    {/* 显示真实的贡献数据 */}
    <h3>{contribution.repository?.fullName}</h3>
    <p>{contribution.title}</p>
    <span>{contribution.contributor}</span>
  </motion.div>
))}
```

### 2. Collections 页面

**文件**：`frontend/src/app/collections/page.tsx`

**需要做的修改**：

```tsx
// 替换 mock 数据
import { useUserNFTs } from '@/hooks/use-nft';
import { useWeb3 } from '@/lib/contexts/Web3Context';

const { account } = useWeb3();
const { data: nftList, isLoading, error } = useUserNFTs(account);

// 使用真实数据渲染 NFT 卡片
{nftList?.map((nft, index) => (
  <CollectionCard
    key={nft.tokenId}
    id={nft.tokenId}
    title={nft.metadata.name}
    creator={nft.owner}
    imageUrl={nft.metadata.image}
    ...
  />
))}
```

### 3. Mint New 页面（可选）

**文件**：`frontend/src/app/mint/new/page.tsx`

**建议**：
- 这个页面应该改为从 URL 参数获取 contribution ID
- 使用 `useContributions` Hook 获取真实的贡献数据
- 或者直接废弃此页面，使用 ERC-8004 流程

---

## 🔧 前置条件

### 1. 数据库表结构

确保以下字段存在：

```sql
-- contributions 表
ALTER TABLE contributions ADD COLUMN IF NOT EXISTS token_id VARCHAR(255);
ALTER TABLE contributions ADD COLUMN IF NOT EXISTS metadata_uri TEXT;
ALTER TABLE contributions ADD COLUMN IF NOT EXISTS transaction_hash VARCHAR(255);

-- users 表
ALTER TABLE users ADD COLUMN IF NOT EXISTS wallet_address VARCHAR(255);
```

### 2. 环境变量

```env
# 前端 .env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_COMMIT_NFT_ADDRESS=0x...

# 后端
DATABASE_URL=postgresql://...
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
```

### 3. React Query 配置

确保 `app/providers.tsx` 包含 `QueryClientProvider`：

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

export function Providers({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

---

## 📊 数据流程

```
前端页面
  ↓ (使用 Hook)
Custom Hook (React Query)
  ↓ (调用 API)
API Client (axios)
  ↓ (HTTP 请求)
API Route (Next.js)
  ↓ (调用 Service)
Service Layer
  ↓ (调用 Repository)
Repository
  ↓ (SQL 查询)
Database (PostgreSQL)
```

---

## 🚀 实施步骤

1. ✅ **创建后端 API 接口**（已完成）
2. ✅ **创建前端 Hooks**（已完成）
3. ✅ **更新 API 客户端**（已完成）
4. ✅ **添加数据库方法**（已完成）
5. ⏳ **修改 Explore 页面**（待完成）
6. ⏳ **修改 Collections 页面**（待完成）
7. ⏳ **测试和调试**（待完成）

---

## 📖 参考文档

详细实现说明请参考：`docs/替换Mock数据指南.md`

---

## ⚠️ 注意事项

1. **链上数据同步**：NFT 数据需要从链上读取并同步到数据库
2. **错误处理**：所有 API 调用都需要包含错误处理
3. **加载状态**：显示友好的加载和错误提示
4. **数据缓存**：使用 React Query 的缓存机制优化性能
5. **权限控制**：某些 API 需要用户登录

---

## 📞 联系方式

如有问题，请查看：
- 详细指南：`docs/替换Mock数据指南.md`
- API 文档：`docs/api.md`
- 前端架构：`docs/前端技术架构.md`

