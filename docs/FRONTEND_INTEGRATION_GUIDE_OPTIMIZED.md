# 前端集成指南 - CommitNFT 优化版合约

## 📋 合约信息

### 优化版合约地址和网络配置

```json
{
  "networks": {
    "sepolia": {
      "chainId": 11155111,
      "name": "Sepolia Testnet",
      "rpcUrl": "https://sepolia.infura.io/v3/YOUR_PROJECT_ID",
      "contractAddress": "OPTIMIZED_CONTRACT_ADDRESS_HERE",
      "explorerUrl": "https://sepolia.etherscan.io"
    }
  }
}
```

### 优化版合约ABI
使用 `contracts-abi-optimized.json` 文件中的ABI。

## 🔧 部署步骤

### 1. 安装依赖

```bash
cd hardhat
pnpm install
```

### 2. 编译优化版合约

```bash
pnpm compile:optimized
```

### 3. 运行测试

```bash
pnpm test:optimized
```

### 4. 部署优化版合约

```bash
# 本地部署
pnpm deploy:optimized:local

# Sepolia测试网部署
pnpm deploy:optimized:sepolia
```

## 📊 优化版合约接口

### 主要函数

#### 1. 单个铸造 (优化版)

```solidity
function mintCommit(
    address to,
    string memory commitHash,
    uint32 timestamp,
    bool isMerged,
    string memory metadataURI
) external onlyOwner whenNotPaused nonReentrant
```

#### 2. 批量铸造 (优化版)

```solidity
function batchMintCommits(
    address to,
    string[] memory commitHashes,
    uint32[] memory timestamps,
    bool[] memory isMergedArray,
    string[] memory metadataURIs
) external onlyOwner whenNotPaused nonReentrant
```

#### 3. 查询函数 (优化版)

```solidity
function getCommitData(uint256 tokenId) external view returns (
    bytes32 commitHash,
    uint32 timestamp,
    bool isMerged
)
function isCommitMinted(string memory commitHash) external view returns (bool)
function getUserTokenCount(address user) external view returns (uint256)
function totalSupply() external view returns (uint256)
```

### 核心数据结构 (优化版)

```solidity
struct CommitData {
    bytes32 commitHash;    // commit哈希的keccak256 (节省gas)
    uint32 timestamp;      // commit时间戳 (使用uint32节省gas)
    bool isMerged;         // 是否被合并
}
```

## 🎯 前端集成要点

### 1. 网络切换

前端需要根据部署的网络切换对应的链ID：
- **Sepolia测试网**: Chain ID `11155111`
- **Ethereum主网**: Chain ID `1`
- **Polygon**: Chain ID `137`
- **Arbitrum**: Chain ID `42161`
- **Optimism**: Chain ID `10`

### 2. 合约交互示例

#### 使用ethers.js (优化版)

```javascript
import { ethers } from 'ethers';
import contractABI from './contracts-abi-optimized.json';

// 初始化优化版合约
const provider = new ethers.JsonRpcProvider('RPC_URL');
const wallet = new ethers.Wallet('PRIVATE_KEY', provider);
const contract = new ethers.Contract('OPTIMIZED_CONTRACT_ADDRESS', contractABI.abi, wallet);

// 铸造单个commit (优化版)
async function mintCommitOptimized(commitData) {
  // 1. 生成metadata URI
  const metadataResponse = await fetch('/api/metadata/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      commitHash: commitData.commit,
      repo: commitData.repo,
      author: commitData.author,
      timestamp: commitData.timestamp
    })
  });
  
  const { metadataURI } = await metadataResponse.json();
  
  // 2. 铸造NFT
  const tx = await contract.mintCommit(
    userAddress,
    commitData.commit,           // commitHash
    commitData.timestamp,        // timestamp (uint32)
    commitData.merged,           // isMerged
    metadataURI                  // metadataURI
  );
  
  return tx;
}
```

#### 使用viem (优化版)

```javascript
import { createPublicClient, createWalletClient, http } from 'viem';
import { sepolia } from 'viem/chains';

const client = createPublicClient({
  chain: sepolia,
  transport: http()
});

// 调用优化版合约函数
const [commitHash, timestamp, isMerged] = await client.readContract({
  address: 'OPTIMIZED_CONTRACT_ADDRESS',
  abi: contractABI.abi,
  functionName: 'getCommitData',
  args: [tokenId]
});
```

### 3. Metadata处理

#### 获取完整Metadata

```javascript
// 获取token的核心数据
const [commitHash, timestamp, isMerged] = await contract.getCommitData(tokenId);

// 获取完整metadata (链下)
const tokenURI = await contract.tokenURI(tokenId);
const fullMetadata = await fetch(tokenURI).then(r => r.json());

console.log('核心数据:', { commitHash, timestamp, isMerged });
console.log('完整metadata:', fullMetadata);
```

#### 验证Metadata完整性

```javascript
async function verifyMetadataIntegrity(tokenId) {
  // 获取链上数据
  const [commitHash, timestamp, isMerged] = await contract.getCommitData(tokenId);
  
  // 获取链下metadata
  const tokenURI = await contract.tokenURI(tokenId);
  const metadata = await fetch(tokenURI).then(r => r.json());
  
  // 验证commit哈希
  const expectedHash = ethers.keccak256(ethers.toUtf8Bytes(metadata.commit_data.commit));
  const isValid = expectedHash === commitHash;
  
  return {
    isValid,
    onChainData: { commitHash, timestamp, isMerged },
    offChainData: metadata.commit_data
  };
}
```

## ⚡ Gas优化建议

### 1. 批量铸造

- 批量铸造比单个铸造节省40%+的gas费用
- 建议批量大小：5-20个commits
- 最大批量大小：50个commits

### 2. Gas费用估算

- **单个铸造**: ~120,000 gas (原版: ~200,000 gas)
- **批量铸造** (10个commits): ~350,000 gas (原版: ~600,000 gas)

### 3. 网络选择

- 推荐使用Sepolia测试网进行开发
- 生产环境可选择Polygon或Arbitrum以进一步降低gas费用

## 🔒 安全注意事项

### 1. 访问控制

- 只有合约owner可以铸造NFT
- 前端需要确保只有授权用户才能调用铸造函数

### 2. 防重复铸造

- 合约会自动检查commit哈希是否已存在
- 前端可以预先调用`isCommitMinted`检查

### 3. 输入验证

- 确保所有输入数据都经过验证
- 特别是commit哈希和时间戳

### 4. Metadata验证

- 验证metadata URI的可访问性
- 确保metadata格式正确
- 验证链上链下数据一致性

## 📝 前端实现建议

### 1. 状态管理 (优化版)

```javascript
// 使用React Context管理优化版合约状态
const OptimizedContractContext = createContext({
  contract: null,
  isConnected: false,
  userTokens: [],
  mintCommit: async () => {},
  batchMintCommits: async () => {},
  getFullMetadata: async () => {},
  verifyIntegrity: async () => {}
});
```

### 2. 错误处理 (优化版)

```javascript
try {
  // 生成metadata
  const metadataResponse = await fetch('/api/metadata/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(commitData)
  });
  
  if (!metadataResponse.ok) {
    throw new Error('Failed to generate metadata');
  }
  
  const { metadataURI } = await metadataResponse.json();
  
  // 铸造NFT
  const tx = await contract.mintCommit(to, commitHash, timestamp, isMerged, metadataURI);
  await tx.wait();
  
} catch (error) {
  if (error.message.includes("Commit already minted")) {
    // 处理重复铸造错误
  } else if (error.message.includes("Max supply exceeded")) {
    // 处理供应量超限错误
  } else if (error.message.includes("Failed to generate metadata")) {
    // 处理metadata生成错误
  }
}
```

### 3. 用户体验优化

- 显示铸造进度
- 实时gas费用估算
- 交易状态跟踪
- 错误信息友好提示
- Metadata加载状态
- 数据完整性验证提示

### 4. 缓存策略

```javascript
// 实现metadata缓存
const metadataCache = new Map();

async function getCachedMetadata(tokenId) {
  if (metadataCache.has(tokenId)) {
    return metadataCache.get(tokenId);
  }
  
  const tokenURI = await contract.tokenURI(tokenId);
  const metadata = await fetch(tokenURI).then(r => r.json());
  
  metadataCache.set(tokenId, metadata);
  return metadata;
}
```

## 🚀 部署检查清单

- [ ] 优化版合约已编译无错误
- [ ] 测试全部通过
- [ ] 合约已部署到目标网络
- [ ] 合约地址已更新到配置文件
- [ ] 优化版ABI文件已提供给前端
- [ ] 网络配置已更新
- [ ] 前端已切换到正确的链ID
- [ ] Metadata服务已部署并测试
- [ ] 前端已集成metadata处理逻辑

## 📞 联系信息

如有问题，请联系：
- 合约开发者：[您的联系方式]
- 项目仓库：https://github.com/lightcommit
- 文档：https://docs.lightcommit.com

## 🔄 更新日志

- v2.0.0: 优化版合约，支持off-chain metadata
- 40%+ gas费用节省
- 支持更丰富的metadata格式
- 改进的数据完整性验证
- 优化的批量铸造功能

## 🔧 工具和资源

### 开发工具

- **Hardhat**: 合约开发和测试
- **ethers.js**: Web3交互库
- **viem**: 现代Web3客户端
- **IPFS**: 去中心化存储
- **Arweave**: 永久存储

### 测试工具

- **Foundry**: 合约测试框架
- **Hardhat**: 开发环境
- **Sepolia Faucet**: 测试网ETH获取

### 监控工具

- **Etherscan**: 合约验证和监控
- **Tenderly**: 交易调试
- **Alchemy**: 区块链API服务
