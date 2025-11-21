# 替换 Mock 数据指南

本文档说明如何将前端所有的 mock 数据替换成后端传过来的真实数据。

## 📋 目录

1. [需要替换的页面](#需要替换的页面)
2. [已创建的 API 接口](#已创建的-api-接口)
3. [已创建的 Hooks](#已创建的-hooks)
4. [具体实现步骤](#具体实现步骤)
5. [数据流程图](#数据流程图)
6. [注意事项](#注意事项)

---

## 需要替换的页面

### 1. Explore 页面 (`/app/explore/page.tsx`)

**当前状态**：使用 mock 的仓库和 commit 数据

**需要替换的数据**：
```typescript
const repositories = [
  {
    id: 1,
    name: 'lightcommit/frontend',
    commit: {
      message: 'feat: implement user authentication',
      hash: '7a8b9c2',
      author: 'Alice Wang',
      time: '2h ago',
      additions: 245,
      deletions: 67,
    },
  },
  // ...更多 mock 数据
];
```

**替换方案**：使用 `useLatestContributions` Hook

### 2. Collections 页面 (`/app/collections/page.tsx`)

**当前状态**：使用 mock 的 NFT 收藏数据

**需要替换的数据**：
```typescript
const mockCollections = [
  {
    id: '1',
    title: 'FEAT: IMPLEMENT USER AUTHENTICATION AND DARK MODE',
    creator: '0xAbc, EFG',
    collection: 'Astral Arcana',
    time: '5m ago',
    imageUrl: '/assets/images/avatar-5.jpg',
  },
  // ...更多 mock 数据
];
```

**替换方案**：使用 `useUserNFTs` Hook

### 3. Mint New 页面 (`/app/mint/new/page.tsx`)

**当前状态**：使用 mock 的 commit 数据进行铸造

**需要替换的数据**：
```typescript
const commitData = {
  repo: 'lightcommit/demo',              // Mock 仓库名
  commit: `commit-${Date.now()}`,        // Mock commit hash
  linesAdded: 100,                       // Mock 新增行数
  linesDeleted: 50,                      // Mock 删除行数
  // ...更多 mock 数据
};
```

**替换方案**：从 URL 参数或用户选择获取真实的 contribution ID，然后使用 `useContributions` Hook 获取真实数据

---

## 已创建的 API 接口

### 1. 最新贡献接口

**路由**：`GET /api/contributions/latest`

**功能**：获取最新的贡献记录，用于 Explore 页面

**查询参数**：
- `limit`: 返回数量（默认 20）
- `type`: 贡献类型（可选：commit, pull_request, issue）

**返回数据**：
```typescript
{
  data: Contribution[]  // 包含 user 和 repository 信息的贡献列表
}
```

**文件位置**：`frontend/src/app/api/contributions/latest/route.ts`

---

### 2. 用户 NFT 列表接口

**路由**：`GET /api/nft/user/:address`

**功能**：获取指定地址拥有的所有 CommitNFT

**路径参数**：
- `address`: 用户钱包地址

**返回数据**：
```typescript
{
  data: {
    tokenId: string,
    owner: string,
    metadataUri: string,
    metadata: NFTMetadata,
    commitData: CommitData,
    contribution: Contribution
  }[]
}
```

**文件位置**：`frontend/src/app/api/nft/user/[address]/route.ts`

---

### 3. NFT 元数据接口

**路由**：`GET /api/nft/metadata/:tokenId`

**功能**：获取指定 Token ID 的 NFT 元数据（符合 ERC-721 标准）

**路径参数**：
- `tokenId`: Token ID

**返回数据**：
```typescript
{
  name: string,
  description: string,
  image: string,
  attributes: Array<{
    trait_type: string,
    value: string | number
  }>,
  external_url?: string,
  background_color?: string
}
```

**文件位置**：`frontend/src/app/api/nft/metadata/[tokenId]/route.ts`

---

### 4. GitHub 仓库列表接口

**路由**：`GET /api/github/repos`

**功能**：获取用户的 GitHub 仓库列表

**查询参数**：
- `username`: GitHub 用户名（可选，不传则获取当前用户）

**返回数据**：
```typescript
{
  data: GitHubApiRepository[]
}
```

**文件位置**：`frontend/src/app/api/github/repos/route.ts`

---

## 已创建的 Hooks

### 1. useLatestContributions

**功能**：获取最新贡献列表

**参数**：
```typescript
{
  limit?: number;    // 返回数量（默认 20）
  type?: string;     // 贡献类型（可选）
}
```

**使用示例**：
```tsx
import { useLatestContributions } from '@/hooks/use-latest-contributions';

function ExplorePage() {
  const { data, isLoading, error } = useLatestContributions({
    limit: 20,
    type: 'commit',
  });

  if (isLoading) return <div>加载中...</div>;
  if (error) return <div>加载失败</div>;

  return (
    <div>
      {data?.map(contribution => (
        <ContributionCard key={contribution.id} {...contribution} />
      ))}
    </div>
  );
}
```

**文件位置**：`frontend/src/hooks/use-latest-contributions.ts`

---

### 2. useUserNFTs

**功能**：获取用户拥有的 NFT 列表

**参数**：
- `address`: 用户钱包地址

**使用示例**：
```tsx
import { useUserNFTs } from '@/hooks/use-nft';
import { useWeb3 } from '@/lib/contexts/Web3Context';

function CollectionsPage() {
  const { account } = useWeb3();
  const { data, isLoading, error } = useUserNFTs(account);

  if (isLoading) return <div>加载中...</div>;
  if (error) return <div>加载失败</div>;

  return (
    <div>
      {data?.map(nft => (
        <NFTCard key={nft.tokenId} {...nft} />
      ))}
    </div>
  );
}
```

**文件位置**：`frontend/src/hooks/use-nft.ts`

---

### 3. useNFTMetadata

**功能**：获取 NFT 元数据

**参数**：
- `tokenId`: Token ID

**使用示例**：
```tsx
import { useNFTMetadata } from '@/hooks/use-nft';

function NFTDetailPage({ tokenId }: { tokenId: string }) {
  const { data, isLoading } = useNFTMetadata(tokenId);

  if (isLoading) return <div>加载中...</div>;

  return (
    <div>
      <h1>{data.name}</h1>
      <img src={data.image} alt={data.name} />
      <p>{data.description}</p>
    </div>
  );
}
```

**文件位置**：`frontend/src/hooks/use-nft.ts`

---

## 具体实现步骤

### 步骤 1：替换 Explore 页面

**文件**：`frontend/src/app/explore/page.tsx`

**修改前**：
```tsx
const repositories = [
  // mock 数据
];
```

**修改后**：
```tsx
import { useLatestContributions } from '@/hooks/use-latest-contributions';

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  // 使用 Hook 获取真实数据
  const { data: contributions, isLoading, error } = useLatestContributions({
    limit: 20,
    type: 'commit',
  });

  // 搜索过滤（本地过滤）
  const filteredContributions = contributions?.filter(contribution =>
    contribution.repository?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contribution.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return <div className="min-h-screen bg-[#F5F1E8] flex items-center justify-center">
      <div className="text-2xl font-bold">加载中...</div>
    </div>;
  }

  if (error) {
    return <div className="min-h-screen bg-[#F5F1E8] flex items-center justify-center">
      <div className="text-2xl font-bold text-red-600">加载失败，请重试</div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-[#F5F1E8]">
      <HeaderSimple />
      
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-6 max-w-7xl">
          {/* 搜索框 */}
          <div className="relative mb-12">
            <input
              type="text"
              placeholder="Search your repositories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-6 py-4 pr-14 text-lg bg-white border-[3px] border-black rounded-2xl focus:outline-none"
            />
          </div>

          {/* 贡献卡片网格 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {filteredContributions?.map((contribution, index) => (
              <motion.div
                key={contribution.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                onClick={() => router.push(`/erc8004/validate/${contribution.id}`)}
                className="aspect-square bg-[#F5F1E8] border-[3px] border-black rounded-[20px] cursor-pointer relative group"
              >
                <div className="absolute inset-0 rounded-[17px] overflow-hidden p-4 flex flex-col">
                  {/* 仓库名和 commit 消息 */}
                  <div className="mb-3">
                    <h3 className="text-sm font-bold text-black mb-1 truncate">
                      {contribution.repository?.fullName || 'Unknown Repo'}
                    </h3>
                    <p className="text-xs text-gray-600 line-clamp-2">
                      {contribution.title || 'No title'}
                    </p>
                  </div>

                  <div className="flex-1" />

                  {/* 作者、时间、代码变更 */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-[10px] font-bold">
                        {contribution.contributor[0].toUpperCase()}
                      </div>
                      <span className="font-medium">{contribution.contributor}</span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono text-gray-500">
                        #{contribution.githubId.slice(0, 7)}
                      </span>
                      <span className="text-gray-500">
                        {new Date(contribution.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    {contribution.metadata?.additions && (
                      <div className="flex gap-3 text-xs font-mono">
                        <span className="text-green-600">+{contribution.metadata.additions}</span>
                        <span className="text-red-600">-{contribution.metadata.deletions || 0}</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
      
      <FooterSimple />
    </div>
  );
}
```

---

### 步骤 2：替换 Collections 页面

**文件**：`frontend/src/app/collections/page.tsx`

**修改前**：
```tsx
const mockCollections = [
  // mock 数据
];
```

**修改后**：
```tsx
import { useUserNFTs } from '@/hooks/use-nft';
import { useWeb3 } from '@/lib/contexts/Web3Context';

export default function CollectionsPage() {
  const router = useRouter();
  const { account, isConnected } = useWeb3();
  
  // 使用 Hook 获取用户的 NFT
  const { data: nftList, isLoading, error } = useUserNFTs(account);

  // 如果未连接钱包
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-[#F5F1E8]">
        <HeaderSimple />
        <main className="pt-24 pb-20">
          <div className="container mx-auto px-6 text-center">
            <h1 className="text-6xl font-black text-black mb-4">
              My collections.
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              Please connect your wallet to view your NFT collections.
            </p>
          </div>
        </main>
        <FooterSimple />
      </div>
    );
  }

  // 加载中
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F5F1E8]">
        <HeaderSimple />
        <main className="pt-24 pb-20">
          <div className="container mx-auto px-6 text-center">
            <div className="text-2xl font-bold">Loading your collections...</div>
          </div>
        </main>
        <FooterSimple />
      </div>
    );
  }

  // 错误处理
  if (error) {
    return (
      <div className="min-h-screen bg-[#F5F1E8]">
        <HeaderSimple />
        <main className="pt-24 pb-20">
          <div className="container mx-auto px-6 text-center">
            <div className="text-2xl font-bold text-red-600">
              Failed to load collections. Please try again.
            </div>
          </div>
        </main>
        <FooterSimple />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F1E8]">
      <HeaderSimple />
      
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <h1 className="text-6xl md:text-7xl font-black text-black mb-4">
              My collections.
            </h1>
            
            {nftList && nftList.length === 0 ? (
              <>
                <p className="text-lg text-gray-600 mb-6">
                  It&apos;s kinda lonely here. Why don&apos;t you create your freshly new collections?
                </p>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push('/explore')}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-[#E63946] text-white font-bold rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all border-2 border-black"
                >
                  <Plus className="w-5 h-5" />
                  Create new collection
                </motion.button>
              </>
            ) : (
              <p className="text-lg text-gray-600 mb-6">
                You have {nftList?.length || 0} NFT{(nftList?.length || 0) > 1 ? 's' : ''} in your collection.
              </p>
            )}
          </motion.div>

          {nftList && nftList.length > 0 && (
            <CollectionContainer>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {nftList.map((nft, index) => (
                  <CollectionCard
                    key={nft.tokenId}
                    id={nft.tokenId}
                    title={nft.metadata.name}
                    creator={nft.owner}
                    collection="LightCommit"
                    time={new Date(nft.contribution.createdAt).toLocaleDateString()}
                    imageUrl={nft.metadata.image || '/assets/images/avatar-5.jpg'}
                    index={index}
                  />
                ))}
              </div>
            </CollectionContainer>
          )}
        </div>
      </main>
      
      <FooterSimple />
    </div>
  );
}
```

---

### 步骤 3：更新 API 客户端

确保 `frontend/src/lib/api.ts` 已更新为最新版本（包含 `nftApi` 和 `githubApi`）。

✅ 已完成（前面已更新）

---

### 步骤 4：添加数据库方法

确保 `ContributionRepository` 有 `findByTokenId` 方法。

✅ 已完成（前面已添加）

---

## 数据流程图

```
┌─────────────────┐
│   前端页面      │
│  (React组件)    │
└────────┬────────┘
         │
         │ 使用 Hook
         ▼
┌─────────────────┐
│  Custom Hook    │
│  (React Query)  │
└────────┬────────┘
         │
         │ 调用 API
         ▼
┌─────────────────┐
│   API Client    │
│   (axios)       │
└────────┬────────┘
         │
         │ HTTP 请求
         ▼
┌─────────────────┐
│  API Route      │
│  (Next.js API)  │
└────────┬────────┘
         │
         │ 调用 Service
         ▼
┌─────────────────┐
│  Service Layer  │
│  (业务逻辑)     │
└────────┬────────┘
         │
         │ 调用 Repository
         ▼
┌─────────────────┐
│  Repository     │
│  (数据访问层)   │
└────────┬────────┘
         │
         │ SQL 查询
         ▼
┌─────────────────┐
│   Database      │
│  (PostgreSQL)   │
└─────────────────┘
```

---

## 注意事项

### 1. 环境变量配置

确保以下环境变量已配置：

```env
# 前端 (.env)
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_COMMIT_NFT_ADDRESS=0x...（合约地址）
NEXT_PUBLIC_EXPLORER_URL=https://sepolia.etherscan.io

# 后端
DATABASE_URL=postgresql://...
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
JWT_SECRET=...
```

### 2. React Query 配置

确保应用已包装在 `QueryClientProvider` 中：

```tsx
// app/providers.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 3,
      staleTime: 5 * 60 * 1000, // 5 分钟
    },
  },
});

export function Providers({ children }: { children: React.Node }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

### 3. 错误处理

所有 API 调用都应该包含错误处理：

```tsx
const { data, isLoading, error } = useLatestContributions();

if (error) {
  // 显示友好的错误消息
  return <ErrorMessage message="加载失败，请重试" />;
}
```

### 4. 数据库迁移

确保数据库表结构包含所有必要的字段：

- `contributions.token_id`
- `contributions.metadata_uri`
- `contributions.transaction_hash`
- `users.wallet_address`

如果缺少这些字段，需要运行数据库迁移。

### 5. 性能优化

- 使用 React Query 的缓存机制
- 设置合理的 `staleTime` 和 `cacheTime`
- 对于不常变化的数据（如 NFT 元数据），可以设置更长的缓存时间
- 使用分页或无限滚动来处理大量数据

### 6. 链上数据同步

NFT 数据需要从链上读取和数据库同步：

- 定期运行同步任务
- 监听合约事件（Transfer、Mint）
- 提供手动同步按钮

---

## 总结

完成以上步骤后，前端所有 mock 数据将被替换为后端真实数据：

✅ **Explore 页面**：显示真实的最新贡献
✅ **Collections 页面**：显示用户真实拥有的 NFT
✅ **API 接口**：提供完整的数据访问接口
✅ **自定义 Hooks**：封装数据获取逻辑
✅ **数据库方法**：支持所有必要的查询

如有问题，请参考各个文件中的详细注释。

