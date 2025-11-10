# 🔧 ERC-8004 故障排查指南

## ✅ 已解决的问题

### 1. MetaMask 链 ID 不匹配
**错误**: "该网络名称可能与此链 ID 不匹配"

**原因**: wagmi 的 `localhost` 链 ID 是 1337，但 Hardhat 是 31337

**解决**: ✅ 已修复
- 使用 `defineChain` 自定义链配置
- 明确指定 chainId: 31337

### 2. "请先登录" 错误
**错误**: 已连接钱包和 GitHub 但仍提示"请先登录"

**原因**: 页面强制要求 GitHub 登录才能访问

**解决**: ✅ 已修复
- 移除强制登录检查
- 改为友好提示
- 允许只连接钱包也能访问

### 3. ESLint 错误
**错误**: 编译时大量 lint 错误

**解决**: ✅ 已修复
- 修复所有格式问题
- 当前状态：0 errors, 104 warnings

---

## 🎯 当前状态检查

### 检查服务运行状态

```bash
# 检查前端
lsof -ti:3000 && echo "✅ 前端运行中" || echo "❌ 前端未运行"

# 检查本地链
lsof -ti:8545 && echo "✅ 本地链运行中" || echo "❌ 本地链未运行"
```

### 检查环境变量

```bash
cd frontend
cat .env.local
```

应该看到：
```
NEXT_PUBLIC_CHAIN_ID=31337
NEXT_PUBLIC_RPC_URL=http://127.0.0.1:8545
...（合约地址）
```

---

## 🌐 浏览器使用流程

### 步骤 1: 配置 MetaMask

#### 添加 Hardhat Local 网络
1. 打开 MetaMask
2. 点击网络下拉菜单
3. 点击"添加网络" → "手动添加网络"
4. 填写：
   ```
   网络名称: Hardhat Local
   RPC URL: http://127.0.0.1:8545
   链 ID: 31337
   货币符号: ETH
   ```
5. 保存

#### 导入测试账户（可选）
1. MetaMask → 导入账户
2. 粘贴私钥：
   ```
   0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
   ```
3. 这个账户有 10000 ETH

### 步骤 2: 连接钱包

#### 方式 A: 测试页面（推荐）
```
http://localhost:3000/test-rainbowkit
```
1. 点击 "Connect Wallet"
2. 选择 MetaMask
3. 在 MetaMask 中点击"连接"
4. 看到地址显示 = 成功

#### 方式 B: ERC8004 页面
```
http://localhost:3000/erc8004/contributions
```
1. 如果提示"需要连接钱包"
2. 点击"连接钱包"按钮
3. 重复上述步骤

### 步骤 3: GitHub 登录（可选）

**如果需要查看贡献列表**：
1. 点击"使用 GitHub 登录"
2. 授权应用
3. 登录成功

**如果只测试钱包和注册代理**：
- 可以跳过 GitHub 登录
- 直接测试代理注册功能

---

## 🐛 常见问题

### Q1: 点击 Connect Wallet 没反应
**检查**:
1. MetaMask 是否已安装？
2. 浏览器控制台（F12）有错误吗？
3. 刷新页面试试

**解决**:
```bash
# 清理缓存重启
cd frontend
rm -rf .next
pkill -f "next dev"
pnpm dev
```

### Q2: MetaMask 弹出但无法连接
**检查**:
1. MetaMask 是否在 Hardhat Local 网络？
2. 链 ID 是否是 31337？

**解决**:
- 在 MetaMask 中手动切换到 Hardhat Local
- 或删除网络重新添加

### Q3: 连接成功但显示"错误网络"
**原因**: 当前网络不是 Hardhat Local

**解决**:
- 点击"错误网络"按钮
- 选择 Hardhat Local
- 或在 MetaMask 中切换

### Q4: 注册代理时报错"请先登录"
**原因**: 代码中检查了登录状态

**解决**: ✅ 已修复
- 现在不再强制要求 GitHub 登录
- 只连接钱包即可注册代理

### Q5: 看不到贡献列表
**原因**: 
- 未 GitHub 登录
- 或者数据库中没有贡献数据

**解决**:
- 方案 A: GitHub 登录查看真实贡献
- 方案 B: 直接测试代理注册和链上功能

---

## 📊 推荐测试流程

### 最简测试（无需 GitHub 登录）

1. **访问测试页面**
   ```
   http://localhost:3000/test-rainbowkit
   ```

2. **连接钱包**
   - 点击 Connect Wallet
   - 选择 MetaMask
   - 确认连接

3. **验证连接**
   - 看到地址显示
   - 看到"已连接"状态

4. **测试注册代理**
   - 访问任意 ERC8004 页面
   - 会自动弹出注册弹窗
   - 点击"立即注册"
   - MetaMask 确认交易
   - 注册成功

### 完整测试（需要 GitHub 登录）

1. **GitHub 登录**
   - 点击"Start with GitHub"
   - 授权应用

2. **访问贡献页面**
   ```
   http://localhost:3000/erc8004/contributions
   ```

3. **查看贡献列表**
   - 看到你的 GitHub 贡献
   - 看到评分状态

4. **完成评分上链流程**
   - 点击某个贡献
   - 3 步流程
   - 铸造 NFT

---

## 🎯 当前修复总结

✅ **链 ID 匹配** - 已配置为 31337  
✅ **移除强制登录** - 可以只连接钱包  
✅ **环境变量** - 已创建 .env.local  
✅ **前端重启** - 环境变量已生效  

**现在刷新浏览器，应该可以正常使用了！** 🚀

