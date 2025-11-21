# 🌐 浏览器使用指南

## ✅ 服务状态检查

当前状态：
- ✅ 前端服务：http://localhost:3000（运行中）
- ✅ 本地区块链：http://127.0.0.1:8545（运行中）
- ✅ 合约已部署：
  - AgentIdentityRegistry: 0x5FbDB2315678afecb367f032d93F642f64180aa3
  - ReputationRegistry: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
  - CommitNFT: 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
  - ValidationRegistry: 0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9

---

## 🚀 浏览器访问步骤

### 步骤 1: 打开浏览器访问

在浏览器中打开：
```
http://localhost:3000
```

你会看到 LightCommit 首页。

---

### 步骤 2: 配置 MetaMask 连接本地链

#### 2.1 打开 MetaMask
- 点击浏览器右上角的 MetaMask 图标
- 点击顶部的网络下拉菜单

#### 2.2 添加 Hardhat 本地网络
1. 点击"添加网络"
2. 点击"手动添加网络"
3. 填入以下信息：

```
网络名称: Hardhat Local
RPC URL: http://127.0.0.1:8545
链 ID: 31337
货币符号: ETH
```

4. 点击"保存"

#### 2.3 导入测试账户（可选）
使用 Hardhat 提供的测试账户之一：

```
私钥: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
地址: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
余额: 10000 ETH
```

导入方法：
1. MetaMask → 点击账户图标
2. 点击"导入账户"
3. 粘贴私钥
4. 点击"导入"

---

### 步骤 3: 连接钱包

#### 方式 A: 在首页连接
1. 访问 http://localhost:3000
2. 找到页面右上角或任何"连接钱包"按钮
3. 点击连接
4. 选择 MetaMask
5. 在 MetaMask 弹窗中点击"连接"
6. 确认连接

#### 方式 B: 访问 ERC8004 页面
1. 直接访问：http://localhost:3000/erc8004/contributions
2. 页面会提示"需要连接钱包"
3. 点击"连接钱包"按钮
4. 重复上述步骤

---

### 步骤 4: GitHub 登录（可选）

如果需要查看贡献列表，需要先 GitHub 登录：

1. 点击右上角的"Start with GitHub"按钮
2. 或直接访问：http://localhost:3000/api/auth/github
3. 授权 GitHub 应用
4. 登录成功后会自动跳转回应用

⚠️ **注意**：GitHub 登录需要配置 Supabase。如果未配置，可以跳过这步，直接测试钱包连接。

---

### 步骤 5: 测试 ERC8004 功能

#### 5.1 访问贡献页面
```
http://localhost:3000/erc8004/contributions
```

#### 5.2 首次使用自动弹出注册弹窗
- 会自动检测你是否已注册代理
- 如果未注册，弹出 RegisterAgentModal
- 点击"立即注册"
- 在 MetaMask 中确认交易
- 等待交易确认（本地链很快）

#### 5.3 查看声誉
- 注册成功后，页面会显示你的声誉徽章
- 显示总分/贡献数/平均分

---

## 🎯 完整测试流程

### 测试 1: 钱包连接
```
1. 打开 http://localhost:3000
2. 确保 MetaMask 已安装并切换到 Hardhat Local 网络
3. 点击任何"连接钱包"按钮
4. 在 RainbowKit 弹窗中选择 MetaMask
5. 在 MetaMask 中点击"连接"
6. 看到地址显示 0xf39F...2266（或你导入的地址）
```

### 测试 2: 注册代理
```
1. 访问 http://localhost:3000/erc8004/contributions
2. 如果钱包已连接且未注册，自动弹出注册弹窗
3. 查看 GitHub 用户名（自动填充）
4. 点击"立即注册"
5. 在 MetaMask 中确认交易
6. 等待确认（约1秒）
7. 看到"注册成功"提示
```

### 测试 3: 查看贡献（需要 GitHub 登录）
```
1. 点击"Start with GitHub"登录
2. 授权 GitHub
3. 回到 /erc8004/contributions
4. 看到贡献列表（如果有的话）
5. 看到声誉徽章
```

### 测试 4: 提交评分（如果有已评分的贡献）
```
1. 在贡献列表点击某个已评分的贡献
2. 进入验证流程页面
3. Step 1: 查看评分明细
4. 点击"下一步"
5. Step 2: 点击"提交到链上"
6. MetaMask 确认交易
7. 等待确认
8. Step 3: 如果分数 >= 80，点击"验证并铸造 NFT"
9. MetaMask 再次确认
10. 看到铸造成功和 Token ID
```

---

## 🔧 常见问题

### Q1: 页面加载但看不到连接钱包按钮
**A**: 刷新页面（Ctrl+R 或 Cmd+R）

### Q2: MetaMask 没有弹出
**A**: 
- 检查 MetaMask 是否已安装
- 检查是否已切换到 Hardhat Local 网络
- 检查浏览器是否允许弹窗

### Q3: 连接后显示"错误网络"
**A**: 
- 点击"错误网络"按钮
- 选择 Hardhat Local
- 或在 MetaMask 中手动切换

### Q4: 交易失败
**A**:
- 检查账户是否有 ETH（测试账户有 10000 ETH）
- 检查合约地址是否正确配置
- 查看 MetaMask 错误信息

### Q5: GitHub 登录失败
**A**:
- 检查 .env 中的 Supabase 配置
- 或跳过 GitHub 登录，直接测试钱包功能

---

## 📱 推荐浏览器

- ✅ Chrome（推荐）
- ✅ Brave
- ✅ Edge
- ✅ Firefox（需要安装 MetaMask 扩展）

---

## 🎮 立即开始

1. **打开浏览器**
2. **访问**: http://localhost:3000
3. **连接 MetaMask**
4. **开始使用 ERC8004！**

---

**所有服务已就绪，现在可以在浏览器中测试了！** 🎉

