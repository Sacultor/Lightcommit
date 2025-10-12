# LightCommit

一个基于区块链的开源贡献证明平台，让每一次开源贡献都能在链上留下不可篡改的记录。

## 🌟 项目概述

### 核心功能：
- 实现开发者在Github上面参与开源建设提交commit，pr，issue等等的时候能够同时在web3链上账户铸造一个NFT或者SBT。
- 链上会包含元数据，比如仓库名称，时间，贡献类型，合并时间等等 

- 这个NFT或者SBT是一次开源贡献的证明。他的**作用**：
    1. 一个证明，证明做过，在空投分发或者黑客松筛选等等场景可以提供证明与帮助，能够帮助主办方更加快速的筛选，提高工作的效率，同时能够让开源有饭吃

    2. 开发者可把 NFT/SBT 嵌入 Polygon ID / zkPass 可验证凭证，在求职、黑客松报名、KYC 环节零知识证明"我贡献过"，并且无需泄露 GitHub 账号隐私。

    3. 每次铸造收取少量手续费流入 LightCommit Treasury；DAO 投票决定赞助哪些开源 Issue，形成"贡献–铸币–再资助"的正循环。

### 解决的痛点：
- 解决了简历造假，乱吹的现象，空投/Grant 女巫泛滥，灵魂绑定法给地址打"开发者可信度分"，一人一 SBT，让激励更加高效
- 同时让开源star = 饭钱，让开源有激励，推进开源
- 让写代码，提方案，做贡献能够变成信誉积分，获得更多的话语权，多劳多得
- 零知识证明，解决了隐私泄露问题
- 同一开发者在 Eth、OP、Base 都有贡献，声誉数据孤岛，统一 ERC-1155 标准，一条公链铸造，多链可读可组合，实现一次贡献，全链通用

### 做大做强：
- 未来可接入 EigenLayer / Lens Protocol 等声誉协议，把"开源信用"转化为 DeFi 抵押率、治理投票权、甚至招聘信用分

## 🛠 技术栈

### Frontend
- **Next.js 15** - React 全栈框架
- **TypeScript** - 类型安全
- **Tailwind CSS** - 样式框架
- **pnpm** - 包管理器

### Blockchain
- **Hardhat** - 以太坊开发环境
- **Solidity** - 智能合约语言
- **Ethers.js** - 以太坊交互库

## 🚀 快速开始

### 环境要求
- Node.js 18+
- pnpm 8+

### 安装依赖

```bash
# 克隆项目
git clone https://github.com/your-username/lightcommit.git
cd lightcommit

# 安装所有依赖
pnpm install:all
```

### 开发

```bash
# 启动前端开发服务器
pnpm dev

# 编译智能合约
pnpm compile

# 运行测试
pnpm test

# 启动本地区块链节点
pnpm node
```

## 📁 项目结构

```
lightcommit/
├── frontend/          # Next.js 前端应用
│   ├── src/
│   │   ├── app/       # App Router 页面
│   │   ├── components/ # React 组件
│   │   └── lib/       # 工具函数
│   └── package.json
├── hardhat/           # Hardhat 区块链开发环境
│   ├── contracts/     # 智能合约
│   ├── scripts/       # 部署脚本
│   ├── test/         # 合约测试
│   └── package.json
├── docs/             # 项目文档
└── package.json      # 根目录配置
```

## 🤝 贡献指南

我们欢迎所有形式的贡献！请查看 [CONTRIBUTING.md](./CONTRIBUTING.md) 了解详细信息。

### 开发流程
1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🔗 相关链接

- [项目文档](./docs/)
- [API 文档](./docs/api.md)
- [部署指南](./docs/deployment.md)