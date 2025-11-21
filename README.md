## LightCommit

面向开源开发者的链上贡献证明与激励平台。参考 `ERC-8004 Trustless Agent` 设计，通过 GitHub Webhook + AI 评分 + 链上代理自动为高质量贡献铸造可验证的凭证（ERC‑1155 SBT/NFT），并可接入 DAO 激励池。

### 项目概述（名称、介绍、目标用户、问题与解决方案）

- **名称**: LightCommit
- **介绍**: 将 GitHub 的单次贡献转换为链上不可篡改的证明与声誉资产，支持实时铸造、检索与审计。
- **目标用户**: 开源开发者、项目维护者、资助方/黑客松组织者、招聘方。
- **问题**:
  - 简历与贡献造假、人工审核成本高
  - 激励分配不均、女巫攻击
  - 隐私暴露、声誉数据孤岛
- **解决方案**:
  - GitHub Webhook 拉取提交 → 链下 AI 评分 → Trustless Agent 去信任化执行
  - 以 ERC‑1155 管理多类型声誉凭证；元数据上链/上 IPFS 便于审计
  - 可配置阈值策略与 DAO 激励，兼容多链与后续 zk 隐私扩展

### 架构与实现（总览图、关键模块、技术栈）

- **总体数据流**
  1. GitHub Webhook 接收 push 事件与 commit 元数据
  2. AI 评分服务计算质量分与摘要，生成元数据并上 IPFS（得到 `metadataURI`）
  3. Oracle/后端组装 `Evaluation`，可走 EIP‑712 签名或受控钱包直调
  4. `TrustlessAgent` 验签/校验/防重放，根据阈值调用 `ReputationToken` 铸造/记分
  5. 前端展示交易进度与结果

- **关键模块**
  - 数据层: `frontend/src/app/api/github/webhook` 处理 GitHub 事件
  - 分析层: 本地或外部 `AI_ENDPOINT` 评分服务
  - 执行层: `TrustlessAgent` 合约 + `ReputationToken(ERC‑1155)` 合约
  - 前端: Next.js 应用（Explore → Mint Step1/2/3 流程）

- **技术栈**
  - 前端: Next.js 15、TypeScript、Tailwind CSS
  - 区块链: Hardhat、Solidity、Ethers v6
  - 包管理: pnpm（必须使用）

### 合约与部署信息（网络、地址、验证链接）

- **网络**
  - 本地: Hardhat 内置网络
  - 测试网: Sepolia（可选）

- **核心合约**
  - `ReputationToken` (ERC‑1155)
  - `TrustlessAgent`（支持 `submitEvaluation(e,sig)` 与 `submitEvaluationByRole(e)`）

- **地址占位（部署后补充）**
  - ReputationToken: `TBD`
  - TrustlessAgent: `TBD`
  - 验证链接: `TBD`（Etherscan/Blockscout）

- **部署命令**
```bash
cd hardhat
pnpm compile
# 本地部署（示例，基于 ignition 模块或脚本）
pnpm deploy
# 测试网部署（示例）
pnpm deploy:sepolia
```

### 运行与复现说明（环境要求、启动命令）

- **环境要求**
  - Node.js 18+
  - pnpm
  - 可选: 本地 IPFS 或 web3.storage/Pinata 账号

- **根目录安装与启动**
```bash
pnpm install
pnpm dev              # 启动前端（默认 http://localhost:3000）
```

- **区块链开发常用命令**
```bash
pnpm -C hardhat compile
pnpm -C hardhat test
pnpm -C hardhat node
```

- **必要环境变量（示例，按本地/测试网选择）**
  - 前端 `.env`
    - `RPC_URL`：本地或测试网节点
    - `AGENT_ADDRESS`：已部署 `TrustlessAgent` 地址
    - `AI_ENDPOINT`：评分服务地址（本地可为 `/api/score`）
  - 后端/部署 `.env`
    - `SEPOLIA_RPC_URL` / `RPC_URL`
    - `SEPOLIA_PRIVATE_KEY` / 部署私钥
    - `BACKEND_PRIVATE_KEY` 或 `ORACLE_PRIVATE_KEY`（二选一，直调/签名）
    - `WEB3_STORAGE_TOKEN` 或 `PINATA_JWT`（可选）
    - `GITHUB_WEBHOOK_SECRET`（使用真实 Webhook 时）

- **本地演示流程（建议）**
  1. 启动本地链并部署合约，记录地址
  2. 在前端 `.env` 写入 `RPC_URL` 与 `AGENT_ADDRESS`
  3. 启动前端 `pnpm dev`
  4. 通过 `api/github/webhook` 的本地脚本模拟一次 push 事件
  5. 在 Mint 流程的 Step2 观察交易进度并进入 Step3 完成

### 项目结构（简要）

```
├── frontend/         # Next.js 前端
├── hardhat/          # 智能合约与部署
└── docs/             # 设计文档与素材
```

### 注意事项

- 必须使用 pnpm，不要使用 npm 或 yarn
- 若构建异常，尝试删除前端缓存: `rm -rf frontend/.next && pnpm dev`

### 团队

- Frederick
- 散修Sacultor
- 燕耳Firenze
- 冷酷小猫

- 推特: [@DuyenNghie91661](https://x.com/DuyenNghie91661)

### 联系方式

- 邮箱: 2313072@mail.nankai.edu.cn