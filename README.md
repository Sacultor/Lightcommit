# LightCommit

区块链开源贡献证明平台

## 🚀 快速开始

### 环境要求
- Node.js 18+
- pnpm 8+

### 安装依赖

```bash
# 克隆项目
git clone https://github.com/your-username/lightcommit.git
cd lightcommit

# 安装根目录依赖
pnpm install
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