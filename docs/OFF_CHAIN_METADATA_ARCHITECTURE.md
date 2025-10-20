# Off-Chain Metadata 架构设计

## 🎯 概述

为了大幅降低gas费用，我们采用off-chain metadata架构，将详细的commit数据存储在链下，链上只保留核心数据。

## 🏗️ 架构设计

### 1. 数据分层存储

```
┌─────────────────────────────────────────────────────────────┐
│                    链上存储 (On-Chain)                        │
├─────────────────────────────────────────────────────────────┤
│ • tokenId (uint256)                                        │
│ • commitHash (bytes32) - keccak256(commitHash)             │
│ • timestamp (uint32)                                       │
│ • isMerged (bool)                                          │
│ • owner (address)                                          │
│ • metadataURI (string)                                     │
└─────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────┐
│                  链下存储 (Off-Chain)                         │
├─────────────────────────────────────────────────────────────┤
│ • repo (string)                                            │
│ • commit (string) - 完整commit哈希                          │
│ • linesAdded (uint256)                                     │
│ • linesDeleted (uint256)                                   │
│ • testsPass (bool)                                         │
│ • author (string)                                          │
│ • message (string)                                         │
│ • 其他扩展字段...                                           │
└─────────────────────────────────────────────────────────────┘
```

### 2. Metadata URI 结构

每个NFT的metadata URI指向一个JSON文件，包含完整的commit信息：

```json
{
  "name": "Commit NFT #1",
  "description": "GitHub commit NFT for uniswap/v4-core",
  "image": "https://api.lightcommit.com/images/commit-1.png",
  "external_url": "https://github.com/uniswap/v4-core/commit/a3f2b1c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1",
  "attributes": [
    {
      "trait_type": "Repository",
      "value": "uniswap/v4-core"
    },
    {
      "trait_type": "Commit Hash",
      "value": "a3f2b1c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1"
    },
    {
      "trait_type": "Lines Added",
      "value": 234
    },
    {
      "trait_type": "Lines Deleted",
      "value": 12
    },
    {
      "trait_type": "Tests Pass",
      "value": true
    },
    {
      "trait_type": "Author",
      "value": "developer"
    },
    {
      "trait_type": "Message",
      "value": "Add new feature"
    },
    {
      "trait_type": "Merged",
      "value": true
    },
    {
      "trait_type": "Timestamp",
      "value": 1699123456
    }
  ],
  "commit_data": {
    "repo": "uniswap/v4-core",
    "commit": "a3f2b1c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1",
    "linesAdded": 234,
    "linesDeleted": 12,
    "testsPass": true,
    "timestamp": 1699123456,
    "author": "developer",
    "message": "Add new feature",
    "merged": true,
    "filesChanged": [
      {
        "filename": "src/core/UniswapV4Pool.sol",
        "additions": 150,
        "deletions": 5
      },
      {
        "filename": "src/core/UniswapV4PoolManager.sol",
        "additions": 84,
        "deletions": 7
      }
    ],
    "branch": "main",
    "pullRequest": {
      "number": 123,
      "title": "Add new feature to pool management",
      "url": "https://github.com/uniswap/v4-core/pull/123"
    }
  }
}
```

## 🔧 服务架构

### 1. Metadata服务组件

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   GitHub API    │    │  Metadata API   │    │   IPFS/Arweave  │
│                 │    │                 │    │                 │
│ • 获取commit数据 │───▶│ • 处理数据       │───▶│ • 永久存储       │
│ • 验证commit     │    │ • 生成metadata  │    │ • 返回URI        │
│ • 检查权限       │    │ • 缓存管理       │    │ • 去中心化存储   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 2. API端点设计

#### 2.1 生成Metadata URI

```http
POST /api/metadata/generate
Content-Type: application/json

{
  "commitHash": "a3f2b1c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1",
  "repo": "uniswap/v4-core",
  "author": "developer",
  "timestamp": 1699123456
}
```

响应：
```json
{
  "success": true,
  "metadataURI": "https://ipfs.io/ipfs/QmXxXxXxXxXxXxXxXxXxXxXxXxXxXxXx",
  "metadata": {
    "name": "Commit NFT #1",
    "description": "GitHub commit NFT for uniswap/v4-core",
    // ... 完整的metadata
  }
}
```

#### 2.2 获取Metadata

```http
GET /api/metadata/{tokenId}
```

响应：
```json
{
  "success": true,
  "tokenId": 1,
  "metadata": {
    // ... 完整的metadata
  }
}
```

#### 2.3 批量生成Metadata

```http
POST /api/metadata/batch-generate
Content-Type: application/json

{
  "commits": [
    {
      "commitHash": "hash1",
      "repo": "repo1",
      "author": "author1",
      "timestamp": 1699123456
    },
    {
      "commitHash": "hash2", 
      "repo": "repo2",
      "author": "author2",
      "timestamp": 1699123457
    }
  ]
}
```

## 🗄️ 数据存储方案

### 1. 主要存储选项

#### Option 1: IPFS (推荐)
- **优点**: 去中心化、永久存储、成本低
- **缺点**: 需要pin服务确保可用性
- **成本**: 免费 + pin服务费用

#### Option 2: Arweave
- **优点**: 永久存储、一次付费
- **缺点**: 成本较高
- **成本**: ~$0.01-0.05 per KB

#### Option 3: 传统云存储 + IPFS
- **优点**: 可靠性高、成本可控
- **缺点**: 中心化风险
- **成本**: 云存储费用 + IPFS pin费用

### 2. 缓存策略

```javascript
// 缓存层级
const cacheStrategy = {
  L1: "内存缓存 (Redis) - 5分钟",
  L2: "数据库缓存 - 1小时", 
  L3: "IPFS/Arweave - 永久"
};
```

## 🔐 数据完整性验证

### 1. 链上验证

```solidity
// 验证commit哈希的完整性
function verifyCommitIntegrity(
    string memory originalCommitHash,
    bytes32 storedCommitHash
) external pure returns (bool) {
    return keccak256(abi.encodePacked(originalCommitHash)) == storedCommitHash;
}
```

### 2. 链下验证

```javascript
// 验证metadata的完整性
async function verifyMetadataIntegrity(tokenId, metadataURI) {
  const metadata = await fetch(metadataURI).then(r => r.json());
  const expectedHash = keccak256(metadata.commit_data.commit);
  const storedHash = await contract.getCommitData(tokenId);
  return expectedHash === storedHash;
}
```

## ⚡ Gas费用对比

### 原始方案 vs 优化方案

| 操作 | 原始方案 | 优化方案 | 节省比例 |
|------|----------|----------|----------|
| 单个铸造 | ~200,000 gas | ~120,000 gas | 40% |
| 批量铸造(10个) | ~600,000 gas | ~350,000 gas | 42% |
| 批量铸造(50个) | ~2,500,000 gas | ~1,400,000 gas | 44% |

### 存储成本对比

| 数据类型 | 原始方案 | 优化方案 |
|----------|----------|----------|
| 链上存储 | 高 (所有数据) | 低 (核心数据) |
| 链下存储 | 无 | 极低 (IPFS/Arweave) |
| 总成本 | 高 | 极低 |

## 🚀 实施步骤

### Phase 1: 合约部署
1. 部署优化版合约
2. 设置metadata服务
3. 配置IPFS/Arweave

### Phase 2: 服务集成
1. 实现metadata生成API
2. 集成GitHub API
3. 实现缓存机制

### Phase 3: 前端迁移
1. 更新前端合约交互
2. 实现metadata显示
3. 优化用户体验

## 📊 监控和维护

### 1. 关键指标
- Metadata可用性 (99.9%+)
- API响应时间 (<500ms)
- 缓存命中率 (>90%)
- Gas费用节省比例

### 2. 告警机制
- IPFS节点离线
- API服务异常
- 缓存失效
- 数据不一致

## 🔄 升级路径

### 从原始合约迁移
1. 部署新合约
2. 数据迁移脚本
3. 前端逐步切换
4. 旧合约退役

### 版本兼容性
- 保持API向后兼容
- 支持多版本metadata格式
- 渐进式功能升级
