# LightCommit

区块链开源贡献证明平台

## 🛠️ 技术栈
- **前端**: Next.js 15 + TypeScript + Tailwind CSS
- **区块链**: Hardhat + Solidity
- **包管理**: pnpm (必须使用)

## ⚡ 快速开始

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

访问: http://localhost:3000

## 📋 常用命令

```bash
# 前端开发
pnpm dev              # 启动前端服务器
pnpm build            # 构建前端应用

# 区块链开发  
pnpm compile          # 编译智能合约
pnpm test             # 运行合约测试
pnpm node             # 启动本地区块链

# 工具命令
pnpm lint             # 代码检查
pnpm clean            # 清理缓存
```

## 📁 项目结构

```
├── frontend/         # Next.js 前端 (端口 3000)
├── hardhat/          # 智能合约开发
└── scripts/          # 数据库脚本
```

## ⚠️ 注意事项

- **必须使用 pnpm**，不要使用 npm 或 yarn
- Node.js 18+ 版本
- 如遇构建问题，运行 `rm -rf frontend/.next && pnpm dev`
