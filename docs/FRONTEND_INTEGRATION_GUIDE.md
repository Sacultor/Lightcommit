# 前端集成指南 - CommitNFT 合约

## 📋 合约信息

### 合约地址和网络配置
```json
{
  "networks": {
    "sepolia": {
      "chainId": 11155111,
      "name": "Sepolia Testnet",
      "rpcUrl": "https://sepolia.infura.io/v3/YOUR_PROJECT_ID",
      "contractAddress": "DEPLOYED_CONTRACT_ADDRESS_HERE",
      "explorerUrl": "https://sepolia.etherscan.io"
    }
  }
}
```

### 合约ABI
使用 `contracts-abi.json` 文件中的ABI。

## 🔧 部署步骤

### 1. 安装依赖
```bash
cd hardhat
pnpm install
```

### 2. 编译合约
```bash
pnpm compile
```

### 3. 运行测试
```bash
pnpm test:commit
```

### 4. 部署合约
```bash
# 本地部署
pnpm deploy:commit

# Sepolia测试网部署
pnpm deploy:sepolia
```

## 📊 合约接口

### 主要函数

#### 1. 单个铸造
```solidity
function mintCommit(
    address to,
    CommitData memory commitData,
    string memory metadataURI
) external onlyOwner whenNotPaused nonReentrant
```

#### 2. 批量铸造
```solidity
function batchMintCommits(
    address to,
    CommitData[] memory commitsData,
    string[] memory metadataURIs
) external onlyOwner whenNotPaused nonReentrant
```

#### 3. 查询函数
```solidity
function getCommitData(uint256 tokenId) external view returns (CommitData memory)
function isCommitMinted(string memory commitHash) external view returns (bool)
function getUserTokenCount(address user) external view returns (uint256)
function totalSupply() external view returns (uint256)
```

### CommitData 结构
```solidity
struct CommitData {
    string repo;           // 仓库名称 (如: "uniswap/v4-core")
    string commit;         // commit哈希 (如: "a3f2b")
    uint256 linesAdded;    // 添加的代码行数 (如: 234)
    uint256 linesDeleted;   // 删除的代码行数
    bool testsPass;        // 测试是否通过 (如: true)
    uint256 timestamp;     // commit时间戳
    string author;         // 作者
    string message;        // commit消息
    bool merged;           // 是否被合并
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

#### 使用ethers.js
```javascript
import { ethers } from 'ethers';
import contractABI from './contracts-abi.json';

// 初始化合约
const provider = new ethers.JsonRpcProvider('RPC_URL');
const wallet = new ethers.Wallet('PRIVATE_KEY', provider);
const contract = new ethers.Contract('CONTRACT_ADDRESS', contractABI.abi, wallet);

// 铸造单个commit
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

#### 使用viem
```javascript
import { createPublicClient, createWalletClient, http } from 'viem';
import { sepolia } from 'viem/chains';

const client = createPublicClient({
  chain: sepolia,
  transport: http()
});

// 调用合约函数
const result = await client.readContract({
  address: 'CONTRACT_ADDRESS',
  abi: contractABI.abi,
  functionName: 'getCommitData',
  args: [tokenId]
});
```

### 3. 事件监听
```javascript
// 监听CommitMinted事件
contract.on("CommitMinted", (tokenId, to, repo, commit, linesAdded, testsPass, merged) => {
  console.log(`NFT minted: Token ID ${tokenId} for ${to}`);
  console.log(`Repo: ${repo}, Commit: ${commit}`);
  console.log(`Lines added: ${linesAdded}, Tests pass: ${testsPass}, Merged: ${merged}`);
});
```

## ⚡ Gas优化建议

### 1. 批量铸造
- 批量铸造比单个铸造节省30-50%的gas费用
- 建议批量大小：5-20个commits
- 最大批量大小：50个commits

### 2. Gas费用估算
- **单个铸造**: ~200,000 gas
- **批量铸造** (10个commits): ~600,000 gas (平均每个commit ~60,000 gas)

### 3. 网络选择
- 推荐使用Sepolia测试网进行开发
- 生产环境可选择Polygon或Arbitrum以降低gas费用

## 🔒 安全注意事项

### 1. 访问控制
- 只有合约owner可以铸造NFT
- 前端需要确保只有授权用户才能调用铸造函数

### 2. 防重复铸造
- 合约会自动检查commit哈希是否已存在
- 前端可以预先调用`isCommitMinted`检查

### 3. 输入验证
- 确保所有输入数据都经过验证
- 特别是commit哈希和仓库名称

## 📝 前端实现建议

### 1. 状态管理
```javascript
// 使用React Context或Redux管理合约状态
const ContractContext = createContext({
  contract: null,
  isConnected: false,
  userTokens: [],
  mintCommit: async () => {},
  batchMintCommits: async () => {}
});
```

### 2. 错误处理
```javascript
try {
  const tx = await contract.mintCommit(to, commitData, metadataURI);
  await tx.wait();
  // 成功处理
} catch (error) {
  if (error.message.includes("Commit already minted")) {
    // 处理重复铸造错误
  } else if (error.message.includes("Max supply exceeded")) {
    // 处理供应量超限错误
  }
}
```

### 3. 用户体验
- 显示铸造进度
- 实时gas费用估算
- 交易状态跟踪
- 错误信息友好提示

## 🚀 部署检查清单

- [ ] 合约已编译无错误
- [ ] 测试全部通过
- [ ] 合约已部署到目标网络
- [ ] 合约地址已更新到配置文件
- [ ] ABI文件已提供给前端
- [ ] 网络配置已更新
- [ ] 前端已切换到正确的链ID

## 📞 联系信息

如有问题，请联系：
- 合约开发者：[您的联系方式]
- 项目仓库：https://github.com/lightcommit
- 文档：https://docs.lightcommit.com

## 🔄 更新日志

- v1.0.0: 初始版本，支持单个和批量铸造
- 支持GitHub commit元数据存储
- 优化gas费用
- 添加安全保护机制
