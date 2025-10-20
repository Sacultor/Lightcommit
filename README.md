LightCommit: 区块链开源贡献证明平台
1. 项目概述
1.1 项目名称
LightCommit

1.2 项目介绍
LightCommit 是一个区块链开源贡献证明平台，致力于让每一次有价值的开源贡献都能在链上留下不可篡改的记录。 我们通过将开发者的贡献（如 Commit、Pull Request）铸造为链上凭证（NFT/SBT），为开源贡献者提供一个可验证、可展示、可信的贡献证明。

1.3 目标用户
开源贡献者：希望自己的贡献得到正式、可追溯的承认，并建立可信的个人贡献档案。

开源项目维护者：寻求一种创新的方式来激励和表彰社区贡献者。

技术社区与企业：需要一个可靠的工具来评估开发者在开源领域的真实贡献和影响力。

1.4 问题与解决方案
问题：传统的开源贡献（如 GitHub Star 或贡献图）虽然直观，但缺乏正式的、可独立验证的证明。贡献的价值难以量化，贡献记录也可能随着平台政策或项目状态的改变而消失。

解决方案：LightCommit 通过以下方式解决这些问题：

链上存证：利用区块链的不可篡改性，将每一次审核通过的开源贡献铸造成 NFT 或 SBT，永久记录在链上。

价值证明：为无形的贡献赋予一个可拥有、可验证的数字实体，使其更具公信力和价值。

自动化流程：通过 GitHub Webhook 自动捕获贡献事件，并将其放入任务队列，实现贡献凭证的自动化和异步铸造。

2. 架构与实现
2.1 总览图
（此处为架构总览图，描述了从 GitHub 贡献到链上凭证的完整流程）

流程简述：

开发者通过 GitHub OAuth 登录平台。

GitHub Webhook 监听到新的贡献事件（如 Push, Pull Request）。

后端 API 接收并验证 Webhook 事件，将合法的贡献信息存入数据库，并将铸造任务添加到 Redis 任务队列。

队列处理器从队列中取出任务，调用区块链服务。

区块链服务将贡献元数据上传至 IPFS，然后调用智能合约的 mint 方法。

交易成功后，更新数据库中的贡献状态，记录交易哈希和 Token ID。

前端轮询或通过 WebSocket 获取最新状态，向用户展示已铸造的贡献凭证。

2.2 关键模块
项目采用前后端分离的 Monorepo 结构。

frontend (Next.js 应用)

用户认证：处理 GitHub OAuth 登录、回调及 JWT 管理。

贡献展示：查询并展示用户的贡献列表及其铸造状态。

API 服务：通过 Next.js API Routes 提供后端服务，包括 Webhook 接收、数据库操作等。

hardhat (区块链环境)

智能合约 (contracts/)：实现了贡献凭证（NFT/SBT）的核心逻辑。

部署脚本 (ignition/)：使用 Hardhat Ignition 进行模块化部署。

测试 (test/)：包含合约的单元测试和集成测试。

2.3 技术栈
前端: Next.js (App Router), React, TypeScript, Tailwind CSS

后端: Next.js API Routes, PostgreSQL, Redis

区块链: Hardhat, Solidity, Ethers.js, Viem

数据库: PostgreSQL (通过 pg 库连接)

包管理器: pnpm Workspaces

3. 合约与部署信息
网络: Sepolia 测试网、本地 Hardhat 网络

合约地址: [部署后填入]

Etherscan 验证链接: [部署后填入]

4. 运行与复现说明
4.1 环境要求
Node.js: 18+

pnpm: 8+ (本项目使用 pnpm 10.15.1)

4.2 启动命令
克隆项目

Bash

git clone https://github.com/your-username/lightcommit.git
cd lightcommit
安装依赖

Bash

pnpm install
配置环境变量 复制 .env.example 文件为 .env，并填入你的配置，如数据库链接、GitHub OAuth 凭证和私钥。

启动前端开发服务器

Bash

pnpm dev
应用将在 http://localhost:3000 上运行。

编译智能合约

Bash

pnpm compile
运行测试

Bash

pnpm test
5. 团队与联系信息
Frederick

散修Sacultor

燕耳Firenze

<<<<<<< Updated upstream
## ⚠️ 注意事项

- **必须使用 pnpm**，不要使用 npm 或 yarn
- Node.js 18+ 版本
- 如遇构建问题，运行 `rm -rf frontend/.next && pnpm dev`
=======
冷酷小猫
>>>>>>> Stashed changes
