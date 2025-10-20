### LightCommit 项目说明

#### 项目概述

- **名称**: LightCommit
- **介绍**: 面向开源协作者的链上贡献证明平台，通过智能合约为每一次 GitHub 贡献铸造可验证的 NFT 资产，形成不可篡改的贡献记录。
- **目标用户**: 开源开发者、项目维护者、招聘方与风投机构。
- **问题与解决方案**:
  - **问题**: 传统开源贡献难以统一证明与长期保存，跨平台验证成本高，易被篡改或丢失。
  - **解决方案**: 使用以太坊兼容网络为贡献铸造 NFT（或 SBT），结合前端 DApp 与后端服务，实现贡献数据拉取、校验与上链的端到端流程。

#### 架构与实现

- **总览**:
  - 前端 `frontend` 使用 Next.js 15 + React 19 + Tailwind CSS，负责钱包连接、贡献展示与铸造流程。
  - 合约与部署在 `hardhat`，使用 Hardhat Ignition 部署 `CommitNFT` 合约。
  - 数据与认证集成 Supabase（前端已集成 `@supabase/supabase-js`，实际密钥需配置）。

- **关键模块**:
  - `frontend/src/lib/contexts/Web3Context.tsx`: 钱包连接与网络状态管理
  - `frontend/src/lib/hooks/useContract.ts`: 合约实例获取
  - `frontend/src/lib/services/contract.service.ts`: 合约读写与事件封装
  - `hardhat/contracts/mint.sol`: CommitNFT 合约实现
  - `hardhat/ignition/modules/CommitNFT.ts`: 部署模块

- **技术栈**:
  - 前端: Next.js 15、React 19、TypeScript、Tailwind CSS、@tanstack/react-query、ethers v6
  - 合约: Solidity、OpenZeppelin、Hardhat、Ignition、ethers v6、viem
  - 其他: Supabase、pnpm

#### 合约与部署信息

- **网络**:
  - 本地 Hardhat: Chain ID 31337，RPC `http://127.0.0.1:8545`
  - 测试网（推荐 Sepolia 11155111）: 需配置 RPC 与私钥

- **地址**:
  - 本地开发 CommitNFT 地址: `0x5FbDB2315678afecb367f032d93F642f64180aa3`
  - 测试网/主网地址: 待部署后补充

- **验证链接**:
  - 本地无区块浏览器
  - 测试网/主网: 部署后补充对应 Etherscan/Snowtrace/Polygonscan 链接

#### 运行与复现说明

- **环境要求**:
  - Node.js 18+
  - pnpm 10+
  - 浏览器安装 MetaMask

- **安装依赖**:
  ```bash
  pnpm install
  pnpm --filter frontend install
  pnpm --filter hardhat install
  ```

- **准备环境变量**:
  在 `frontend` 目录创建 `.env.local`，示例见 `frontend/ENV_SETUP.md`。本地最小配置示例：
  ```bash
  NEXT_PUBLIC_CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
  NEXT_PUBLIC_CHAIN_ID=31337
  NEXT_PUBLIC_RPC_URL=http://127.0.0.1:8545
  NEXT_PUBLIC_API_URL=http://localhost:3000/api
  NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000
  ```

- **启动本地链**:
  ```bash
  cd hardhat
  npx hardhat node
  ```

- **部署合约（本地）**:
  ```bash
  cd hardhat
  npx hardhat run scripts/deploy-commit-nft.ts --network localhost
  ```

- **启动前端**:
  ```bash
  cd frontend
  pnpm dev
  ```

- **测试页面**:
  - 访问: `http://localhost:3000/test-contract`
  - 连接钱包后可执行测试铸造

- **部署到 Sepolia（可选）**:
  1. 在 `hardhat/.env` 配置：
     ```bash
     SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/<YOUR_PROJECT_ID>
     SEPOLIA_PRIVATE_KEY=<YOUR_PRIVATE_KEY>
     ```
  2. 部署：
     ```bash
     cd hardhat
     npx hardhat run scripts/deploy-commit-nft.ts --network sepolia
     ```
  3. 更新前端 `.env.local`：
     ```bash
     NEXT_PUBLIC_CONTRACT_ADDRESS=<新地址>
     NEXT_PUBLIC_CHAIN_ID=11155111
     NEXT_PUBLIC_RPC_URL=https://sepolia.infura.io/v3/<YOUR_PROJECT_ID>
     NEXT_PUBLIC_EXPLORER_URL=https://sepolia.etherscan.io
     ```

#### 架构总览图

```mermaid
flowchart LR
  User((用户)) -- 浏览器/钱包 --> Frontend[Next.js DApp]
  Frontend -- ethers.js --> RPC[(EVM RPC)]
  Frontend -- REST --> API[/Next.js API Routes/]
  API --> Supabase[(Supabase)]
  RPC --> CommitNFT[(CommitNFT 合约)]
  subgraph Onchain
    CommitNFT
  end
```

#### 团队与联系信息

- 团队: LightCommit Team
Frederick，散修Sacultor，燕耳Firenze，冷酷小猫
- 项目仓库: `https://github.com/your-username/lightcommit`

——

若需补充测试网/主网合约地址与验证链接，请提供部署交易哈希或区块浏览器链接。


