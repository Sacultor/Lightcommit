### 智能合约与链上交互

### 合约概览

- 合约: `hardhat/contracts/mint.sol`，实现 `CommitNFT` (ERC721 + URIStorage + Ownable + Pausable + ReentrancyGuard)
- 关键功能:
  - `mintCommit(to, commitData, metadataURI)`
  - `batchMintCommits(to, commitsData, metadataURIs)`
  - `getCommitData(tokenId)`
  - `isCommitMinted(commitHash)`
  - `getUserTokenCount(user)`、`totalSupply()`、`setBaseURI()`、`pause()/unpause()`
- 事件:
  - `CommitMinted(tokenId, to, repo, commit, linesAdded, testsPass, merged)`
  - `BatchMinted(to, tokenIds, totalGasUsed)`

### 部署

- Ignition 模块: `hardhat/ignition/modules/CommitNFT.ts`
- 脚本: `hardhat/scripts/deploy-commit-nft.ts`

本地部署:
```bash
cd hardhat
npx hardhat node
npx hardhat run scripts/deploy-commit-nft.ts --network localhost
```

测试: `hardhat/test/CommitNFT.ts`

### 前端交互

- Hook: `frontend/src/lib/hooks/useContract.ts`
- 服务: `frontend/src/lib/services/contract.service.ts`

用法示例:
```ts
const contract = useContract();
// new ContractService(contract).mintCommit(to, commitData, metadataURI)
```

### 合约参数与环境

- 合约地址: `NEXT_PUBLIC_CONTRACT_ADDRESS`
- 链 ID: `NEXT_PUBLIC_CHAIN_ID`
- RPC: `NEXT_PUBLIC_RPC_URL`

### 注意事项

- `commit` 哈希不可重复铸造
- `batchMintCommits` 限制批量大小 ≤ 50
- `MAX_SUPPLY` 固定为 1,000,000
- 仅 owner 可调用铸造函数（按当前实现）

