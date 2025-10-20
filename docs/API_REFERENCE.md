# CommitNFT API 参考文档

## 🎯 快速开始

### 1. 合约信息
- **合约名称**: CommitNFT
- **符号**: LCNFT
- **网络**: Sepolia测试网 (Chain ID: 11155111)
- **合约地址**: `[部署后更新]`

### 2. 必要文件
- `contracts-abi.json` - 合约ABI
- `contracts-config.json` - 网络配置

## 📋 核心函数

### 铸造函数

#### `mintCommit(address to, CommitData commitData, string metadataURI)`
单个commit铸造

**参数:**
- `to`: 接收者地址
- `commitData`: commit数据结构
- `metadataURI`: 元数据URI

**返回:** 交易哈希

#### `batchMintCommits(address to, CommitData[] commitsData, string[] metadataURIs)`
批量铸造（推荐，节省gas）

**参数:**
- `to`: 接收者地址
- `commitsData`: commit数据数组
- `metadataURIs`: 元数据URI数组

**返回:** 交易哈希

### 查询函数

#### `getCommitData(uint256 tokenId)`
获取token的commit数据

**参数:**
- `tokenId`: token ID

**返回:** CommitData结构

#### `isCommitMinted(string commitHash)`
检查commit是否已铸造

**参数:**
- `commitHash`: commit哈希

**返回:** boolean

#### `getUserTokenCount(address user)`
获取用户铸造的token数量

**参数:**
- `user`: 用户地址

**返回:** uint256

#### `totalSupply()`
获取总供应量

**返回:** uint256

## 📊 数据结构

### CommitData
```typescript
interface CommitData {
  repo: string;           // 仓库名称
  commit: string;         // commit哈希
  linesAdded: number;     // 添加的代码行数
  linesDeleted: number;   // 删除的代码行数
  testsPass: boolean;     // 测试是否通过
  timestamp: number;      // commit时间戳
  author: string;         // 作者
  message: string;        // commit消息
  merged: boolean;       // 是否被合并
}
```

## 🔧 前端集成示例

### 1. 初始化合约
```javascript
import { ethers } from 'ethers';
import contractABI from './contracts-abi.json';

const provider = new ethers.JsonRpcProvider('RPC_URL');
const wallet = new ethers.Wallet('PRIVATE_KEY', provider);
const contract = new ethers.Contract('CONTRACT_ADDRESS', contractABI.abi, wallet);
```

### 2. 铸造单个commit
```javascript
const commitData = {
  repo: "uniswap/v4-core",
  commit: "a3f2b1c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1",
  linesAdded: 234,
  linesDeleted: 12,
  testsPass: true,
  timestamp: Math.floor(Date.now() / 1000),
  author: "developer",
  message: "Add new feature",
  merged: true
};

const tx = await contract.mintCommit(
  userAddress,
  commitData,
  "https://api.lightcommit.com/metadata/1"
);
```

### 3. 批量铸造
```javascript
const commitsData = [
  {
    repo: "uniswap/v4-core",
    commit: "commit1",
    linesAdded: 100,
    linesDeleted: 10,
    testsPass: true,
    timestamp: Math.floor(Date.now() / 1000),
    author: "dev1",
    message: "First commit",
    merged: true
  },
  {
    repo: "uniswap/v4-periphery",
    commit: "commit2",
    linesAdded: 200,
    linesDeleted: 20,
    testsPass: false,
    timestamp: Math.floor(Date.now() / 1000),
    author: "dev2",
    message: "Second commit",
    merged: false
  }
];

const metadataURIs = [
  "https://api.lightcommit.com/metadata/1",
  "https://api.lightcommit.com/metadata/2"
];

const tx = await contract.batchMintCommits(
  userAddress,
  commitsData,
  metadataURIs
);
```

### 4. 查询数据
```javascript
// 获取commit数据
const commitData = await contract.getCommitData(tokenId);

// 检查是否已铸造
const isMinted = await contract.isCommitMinted(commitHash);

// 获取用户token数量
const userTokenCount = await contract.getUserTokenCount(userAddress);

// 获取总供应量
const totalSupply = await contract.totalSupply();
```

## 🎨 事件监听

### CommitMinted事件
```javascript
contract.on("CommitMinted", (tokenId, to, repo, commit, linesAdded, testsPass, merged) => {
  console.log(`NFT minted: Token ID ${tokenId}`);
  console.log(`Repo: ${repo}, Commit: ${commit}`);
  console.log(`Lines added: ${linesAdded}, Tests pass: ${testsPass}, Merged: ${merged}`);
});
```

### BatchMinted事件
```javascript
contract.on("BatchMinted", (to, tokenIds, totalGasUsed) => {
  console.log(`Batch minted: ${tokenIds.length} tokens for ${to}`);
  console.log(`Total gas used: ${totalGasUsed}`);
});
```

## ⚡ Gas优化

### 1. 使用批量铸造
- 比单个铸造节省30-50%的gas费用
- 建议批量大小：5-20个commits

### 2. Gas费用估算
```javascript
// 估算单个铸造gas
const gasEstimate = await contract.mintCommit.estimateGas(
  userAddress,
  commitData,
  metadataURI
);

// 估算批量铸造gas
const batchGasEstimate = await contract.batchMintCommits.estimateGas(
  userAddress,
  commitsData,
  metadataURIs
);
```

## 🔒 错误处理

### 常见错误
```javascript
try {
  const tx = await contract.mintCommit(to, commitData, metadataURI);
  await tx.wait();
} catch (error) {
  if (error.message.includes("Commit already minted")) {
    // 处理重复铸造
    console.log("This commit has already been minted");
  } else if (error.message.includes("Max supply exceeded")) {
    // 处理供应量超限
    console.log("Maximum supply reached");
  } else if (error.message.includes("Pausable: paused")) {
    // 处理合约暂停
    console.log("Contract is paused");
  }
}
```

## 📱 前端状态管理

### React Hook示例
```javascript
import { useState, useEffect } from 'react';

const useCommitNFT = (contract) => {
  const [userTokens, setUserTokens] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const mintCommit = async (to, commitData, metadataURI) => {
    setIsLoading(true);
    try {
      const tx = await contract.mintCommit(to, commitData, metadataURI);
      await tx.wait();
      // 更新状态
      setUserTokens(prev => [...prev, { ...commitData, tokenId: tx.hash }]);
    } catch (error) {
      console.error('Minting failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return { userTokens, isLoading, mintCommit };
};
```

## 🚀 部署检查

### 部署前检查
- [ ] 合约已编译
- [ ] 测试通过
- [ ] 网络配置正确
- [ ] 私钥安全

### 部署后检查
- [ ] 合约地址已获取
- [ ] 合约地址已更新到配置
- [ ] 前端已切换到正确网络
- [ ] 测试铸造功能

## 📞 支持

如有问题，请联系合约开发者或查看项目文档。
