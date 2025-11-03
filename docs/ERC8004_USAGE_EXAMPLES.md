# ERC-8004 使用示例

## 前端集成示例

### 1. 注册代理身份

```typescript
import { ethers } from 'ethers';
import { useEthersSigner } from '@/hooks/useEthersSigner';

async function registerAgent() {
  const signer = useEthersSigner();
  
  const identityRegistry = new ethers.Contract(
    process.env.NEXT_PUBLIC_IDENTITY_REGISTRY_ADDRESS!,
    IdentityRegistryABI,
    signer
  );
  
  const githubUsername = 'your-github-username';
  const agentCardURI = 'ipfs://QmYourAgentCard';
  
  const tx = await identityRegistry.registerAgent(
    githubUsername,
    agentCardURI
  );
  
  await tx.wait();
  console.log('✅ 代理注册成功！');
}
```

### 2. 提交评分反馈

```typescript
async function submitFeedback(contributionId: string) {
  const response = await fetch(`/api/contributions/${contributionId}/sign`);
  const data = await response.json();
  
  if (!data.feedback || !data.signature) {
    throw new Error('获取签名失败');
  }
  
  const signer = useEthersSigner();
  const reputationRegistry = new ethers.Contract(
    process.env.NEXT_PUBLIC_REPUTATION_REGISTRY_ADDRESS!,
    ReputationRegistryABI,
    signer
  );
  
  const tx = await reputationRegistry.submitFeedback(
    data.feedback.contributor,
    data.feedback.repo,
    data.feedback.commitSha,
    data.feedback.score,
    data.feedback.feedbackHash,
    data.metadataURI,
    data.signature
  );
  
  const receipt = await tx.wait();
  
  const feedbackEvent = receipt.logs.find((log: any) => 
    log.topics[0] === ethers.id('FeedbackSubmitted(bytes32,address,string,string,uint256,bytes32,string,address,uint256)')
  );
  
  if (feedbackEvent) {
    console.log('✅ 评分已提交！');
    return true;
  }
  
  return false;
}
```

### 3. 请求验证与铸造

```typescript
async function requestValidation(
  repo: string,
  commitSha: string,
  contributor: string,
  metadataURI: string
) {
  const signer = useEthersSigner();
  const validationRegistry = new ethers.Contract(
    process.env.NEXT_PUBLIC_VALIDATION_REGISTRY_ADDRESS!,
    ValidationRegistryABI,
    signer
  );
  
  const tx = await validationRegistry.requestValidation(
    repo,
    commitSha,
    contributor,
    metadataURI
  );
  
  const receipt = await tx.wait();
  
  const validationEvent = receipt.logs.find((log: any) =>
    log.topics[0] === ethers.id('ValidationCompleted(bytes32,bool,uint256,uint256,uint256)')
  );
  
  if (validationEvent) {
    const shouldMint = validationEvent.args[1];
    console.log('验证完成！是否铸造:', shouldMint);
    
    if (shouldMint) {
      const mintEvent = receipt.logs.find((log: any) =>
        log.topics[0] === ethers.id('MintTriggered(bytes32,uint256,address,uint256,string,uint256)')
      );
      
      if (mintEvent) {
        const tokenId = mintEvent.args[1];
        console.log('✅ NFT 铸造成功！Token ID:', tokenId.toString());
        return tokenId;
      }
    }
  }
  
  return null;
}
```

### 4. 查询用户声誉

```typescript
async function getContributorReputation(address: string) {
  const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);
  
  const reputationRegistry = new ethers.Contract(
    process.env.NEXT_PUBLIC_REPUTATION_REGISTRY_ADDRESS!,
    ReputationRegistryABI,
    provider
  );
  
  const reputation = await reputationRegistry.getContributorReputation(address);
  
  return {
    totalScore: Number(reputation.totalScore),
    feedbackCount: Number(reputation.feedbackCount),
    averageScore: Number(reputation.averageScore),
  };
}
```

### 5. 查询 NFT 信息

```typescript
async function getUserNFTs(address: string) {
  const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);
  
  const commitNFT = new ethers.Contract(
    process.env.NEXT_PUBLIC_COMMIT_NFT_ADDRESS!,
    CommitNFTABI,
    provider
  );
  
  const balance = await commitNFT.balanceOf(address);
  const nfts = [];
  
  for (let i = 0; i < balance; i++) {
    const tokenId = await commitNFT.tokenOfOwnerByIndex(address, i);
    const tokenURI = await commitNFT.tokenURI(tokenId);
    const commitData = await commitNFT.getCommitData(tokenId);
    
    nfts.push({
      tokenId: Number(tokenId),
      tokenURI,
      repo: commitData.repo,
      commit: commitData.commit,
      author: commitData.author,
      timestamp: Number(commitData.timestamp),
    });
  }
  
  return nfts;
}
```

### 6. 监听事件

```typescript
function listenToEvents() {
  const provider = new ethers.WebSocketProvider(
    process.env.NEXT_PUBLIC_WS_RPC_URL || 'ws://localhost:8545'
  );
  
  const reputationRegistry = new ethers.Contract(
    process.env.NEXT_PUBLIC_REPUTATION_REGISTRY_ADDRESS!,
    ReputationRegistryABI,
    provider
  );
  
  reputationRegistry.on('FeedbackSubmitted', (
    commitHash,
    contributor,
    repo,
    commitSha,
    score,
    feedbackHash,
    metadataURI,
    evaluator,
    timestamp
  ) => {
    console.log('📝 新评分提交:', {
      contributor,
      repo,
      commitSha,
      score: Number(score),
      metadataURI,
    });
    
    toast.success(`新评分: ${Number(score)} 分`);
  });
  
  const validationRegistry = new ethers.Contract(
    process.env.NEXT_PUBLIC_VALIDATION_REGISTRY_ADDRESS!,
    ValidationRegistryABI,
    provider
  );
  
  validationRegistry.on('MintTriggered', (
    commitHash,
    tokenId,
    contributor,
    score,
    metadataURI,
    timestamp
  ) => {
    console.log('🎉 NFT 铸造:', {
      tokenId: Number(tokenId),
      contributor,
      score: Number(score),
    });
    
    toast.success(`NFT 铸造成功！Token ID: ${Number(tokenId)}`);
  });
  
  return () => {
    reputationRegistry.removeAllListeners();
    validationRegistry.removeAllListeners();
  };
}
```

## 后端 API 示例

### 1. 批量评分

```typescript
// /api/contributions/batch-score/route.ts
export async function POST(request: NextRequest) {
  const { contributionIds } = await request.json();
  
  const results = [];
  
  for (const id of contributionIds) {
    const contribution = await ContributionRepository.findById(id);
    if (!contribution || contribution.score) continue;
    
    const score = await calculateScore(contribution);
    
    await ContributionRepository.update(id, {
      score,
      scoreBreakdown: score.breakdown,
      eligibility: score.value >= 80 ? 'eligible' : 'ineligible',
    });
    
    results.push({ id, score: score.value });
  }
  
  return NextResponse.json({ results });
}
```

### 2. 自动上链队列

```typescript
// /api/contributions/auto-submit/route.ts
export async function POST(request: NextRequest) {
  const eligibleContributions = await ContributionRepository.findMany({
    eligibility: 'eligible',
    onChainStatus: 'pending',
    limit: 10,
  });
  
  const signer = new ethers.Wallet(
    process.env.EVALUATOR_PRIVATE_KEY!,
    new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL)
  );
  
  for (const contribution of eligibleContributions) {
    try {
      const signature = await generateSignature(contribution, signer);
      
      await submitToChain(contribution, signature);
      
      await ContributionRepository.update(contribution.id, {
        onChainStatus: 'submitted',
      });
    } catch (error) {
      console.error(`提交失败: ${contribution.id}`, error);
    }
  }
  
  return NextResponse.json({ processed: eligibleContributions.length });
}
```

## Hardhat 脚本示例

### 1. 批量授权评分者

```typescript
// scripts/grant-evaluator-roles.ts
import { ethers } from "hardhat";

async function main() {
  const reputationRegistryAddress = process.env.REPUTATION_REGISTRY_ADDRESS!;
  const evaluators = [
    "0x...",
    "0x...",
  ];
  
  const ReputationRegistry = await ethers.getContractFactory("ReputationRegistry");
  const registry = await ReputationRegistry.attach(reputationRegistryAddress);
  
  const EVALUATOR_ROLE = ethers.keccak256(ethers.toUtf8Bytes("EVALUATOR_ROLE"));
  
  for (const evaluator of evaluators) {
    const tx = await registry.grantRole(EVALUATOR_ROLE, evaluator);
    await tx.wait();
    console.log(`✅ 已授权: ${evaluator}`);
  }
}

main().catch(console.error);
```

### 2. 调整铸造阈值

```typescript
// scripts/update-threshold.ts
import { ethers } from "hardhat";

async function main() {
  const validationRegistryAddress = process.env.VALIDATION_REGISTRY_ADDRESS!;
  const newThreshold = 85;
  
  const ValidationRegistry = await ethers.getContractFactory("ValidationRegistry");
  const registry = await ValidationRegistry.attach(validationRegistryAddress);
  
  const tx = await registry.setMintThreshold(newThreshold);
  await tx.wait();
  
  console.log(`✅ 阈值已更新为: ${newThreshold}`);
}

main().catch(console.error);
```

### 3. 查询系统统计

```typescript
// scripts/get-stats.ts
import { ethers } from "hardhat";

async function main() {
  const reputationRegistry = await ethers.getContractAt(
    "ReputationRegistry",
    process.env.REPUTATION_REGISTRY_ADDRESS!
  );
  
  const validationRegistry = await ethers.getContractAt(
    "ValidationRegistry",
    process.env.VALIDATION_REGISTRY_ADDRESS!
  );
  
  const commitNFT = await ethers.getContractAt(
    "CommitNFT",
    process.env.COMMIT_NFT_ADDRESS!
  );
  
  console.log("========================================");
  console.log("📊 ERC-8004 系统统计");
  console.log("========================================");
  
  const totalFeedbacks = await reputationRegistry.totalFeedbacks();
  console.log(`评分总数: ${totalFeedbacks}`);
  
  const totalValidations = await validationRegistry.totalValidations();
  console.log(`验证总数: ${totalValidations}`);
  
  const totalMints = await validationRegistry.totalMints();
  console.log(`铸造总数: ${totalMints}`);
  
  const totalSupply = await commitNFT.totalSupply();
  console.log(`NFT 总供应: ${totalSupply}`);
  
  const mintThreshold = await validationRegistry.mintThreshold();
  console.log(`铸造阈值: ${mintThreshold}`);
}

main().catch(console.error);
```

## React Hook 示例

```typescript
// hooks/useERC8004.ts
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useEthersSigner } from './useEthersSigner';

export function useERC8004() {
  const signer = useEthersSigner();
  const [reputation, setReputation] = useState<any>(null);
  const [nfts, setNfts] = useState<any[]>([]);
  
  useEffect(() => {
    if (signer) {
      loadData();
    }
  }, [signer]);
  
  async function loadData() {
    const address = await signer.getAddress();
    
    const rep = await getContributorReputation(address);
    setReputation(rep);
    
    const userNFTs = await getUserNFTs(address);
    setNfts(userNFTs);
  }
  
  return {
    reputation,
    nfts,
    registerAgent,
    submitFeedback,
    requestValidation,
    refresh: loadData,
  };
}
```

## 相关文档

- [部署指南](./DEPLOYMENT_GUIDE.md)
- [实现文档](./ERC8004_IMPLEMENTATION.md)
- [API 参考](./API_REFERENCE.md)

