#!/bin/bash

echo "========================================="
echo "🚀 ERC-8004 快速启动脚本"
echo "========================================="

echo ""
echo "Step 1: 检查依赖..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装"
    exit 1
fi

if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm 未安装，请运行: npm install -g pnpm"
    exit 1
fi

echo "✅ 依赖检查通过"

echo ""
echo "Step 2: 安装项目依赖..."
pnpm install

echo ""
echo "Step 3: 编译合约..."
cd hardhat
pnpm compile

echo ""
echo "Step 4: 启动本地区块链..."
echo "请在新终端运行: cd hardhat && npx hardhat node"
echo "按回车键继续..."
read

echo ""
echo "Step 5: 部署合约..."
npx hardhat run scripts/deploy-erc8004.ts --network localhost

echo ""
echo "========================================="
echo "✅ 部署完成！"
echo "========================================="
echo ""
echo "请执行以下步骤："
echo "1. 复制上方显示的合约地址"
echo "2. 编辑 frontend/.env.local，填入合约地址"
echo "3. 运行: cd frontend && pnpm dev"
echo "4. 访问: http://localhost:3000"
echo ""
echo "详细文档: docs/DEPLOYMENT_GUIDE.md"

