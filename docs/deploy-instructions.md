# 部署说明

## 🚀 快速部署

### 1. 安装依赖
```bash
cd hardhat
pnpm install
```

### 2. 编译合约
```bash
pnpm compile
```

### 3. 运行测试
```bash
pnpm test:commit
```

### 4. 部署到Sepolia测试网

#### 设置环境变量
创建 `.env` 文件：
```env
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
SEPOLIA_PRIVATE_KEY=your_private_key_here
```

#### 部署合约
```bash
pnpm deploy:sepolia
```

### 5. 获取部署信息
部署成功后，您会看到：
- 合约地址
- 交易哈希
- Gas使用量

### 6. 更新配置文件
将合约地址更新到 `contracts-config.json`：
```json
{
  "networks": {
    "sepolia": {
      "chainId": 11155111,
      "contractAddress": "0x...", // 更新为实际地址
      "rpcUrl": "https://sepolia.infura.io/v3/YOUR_PROJECT_ID"
    }
  }
}
```

## 📋 部署检查清单

- [ ] 依赖已安装
- [ ] 合约编译成功
- [ ] 测试全部通过
- [ ] 环境变量已设置
- [ ] 合约已部署
- [ ] 合约地址已更新
- [ ] 前端配置已更新

## 🔧 故障排除

### 常见问题

1. **编译错误**
   - 检查Solidity版本
   - 检查import路径

2. **部署失败**
   - 检查RPC URL
   - 检查私钥
   - 检查网络连接

3. **Gas费用过高**
   - 选择合适的时间部署
   - 考虑使用其他网络

## 📞 支持

如有问题，请检查：
1. 网络连接
2. 环境变量
3. 依赖版本
4. 配置文件
