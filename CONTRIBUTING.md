# 贡献指南

感谢您对 LightCommit 项目的关注！我们欢迎所有形式的贡献。

## 🚀 快速开始

### 环境准备
- Node.js 18+
- pnpm 8+

### 本地开发设置
```bash
# 1. Fork 并克隆仓库
git clone https://github.com/your-username/lightcommit.git
cd lightcommit

# 2. 安装依赖
pnpm install:all

# 3. 复制环境变量文件
cp .env.example .env
cp frontend/.env.example frontend/.env.local
cp hardhat/.env.example hardhat/.env

# 4. 启动开发环境
pnpm dev
```

## 📋 开发流程

### 提交规范
我们使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```bash
feat: 添加新功能
fix: 修复bug
docs: 更新文档
style: 代码格式修改
refactor: 代码重构
test: 添加测试
build: 构建相关更改
```

### 代码规范
- 使用 TypeScript
- 遵循 ESLint 配置
- 使用 Prettier 格式化代码

## 📞 联系我们

如有问题，请在 GitHub Issues 中提问。