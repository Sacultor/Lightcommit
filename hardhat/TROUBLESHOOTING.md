# 故障排除指南

## 🔴 连接超时错误 (ConnectTimeoutError)

### 错误信息
```
ConnectTimeoutError: Connect Timeout Error
code: 'UND_ERR_CONNECT_TIMEOUT'
```

### 可能的原因

1. **RPC URL 配置错误或为空**
   - `.env` 文件中的 `SEPOLIA_RPC_URL` 未设置
   - RPC URL 格式不正确
   - API Key 无效或已过期

2. **网络连接问题**
   - 防火墙阻止连接
   - 代理服务器配置问题
   - 网络不稳定

3. **RPC 节点不可用**
   - RPC 服务暂时不可用
   - 请求频率过高被限制

### 解决步骤

#### 步骤 1: 检查 RPC 配置

运行诊断脚本：
```bash
cd hardhat
npm run test-rpc:sepolia
```

这个脚本会：
- 检查 `.env` 文件配置
- 验证 RPC URL 格式
- 测试网络连接
- 提供详细的错误信息

#### 步骤 2: 验证 .env 文件

确保 `hardhat/.env` 文件存在且包含：

```env
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
SEPOLIA_PRIVATE_KEY=your_private_key_here
```

**检查要点：**
- ✅ RPC URL 以 `https://` 开头
- ✅ 包含有效的 API Key/Project ID
- ✅ 没有多余的空格或引号
- ✅ 私钥格式正确（64 位十六进制）

#### 步骤 3: 尝试不同的 RPC 提供商

如果当前 RPC 不可用，尝试切换：

**选项 1: Infura**
```env
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID
```

**选项 2: Alchemy**
```env
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_API_KEY
```

**选项 3: 公共 RPC（不推荐，可能不稳定）**
```env
SEPOLIA_RPC_URL=https://rpc.sepolia.org
```

#### 步骤 4: 检查网络连接

1. **测试基本连接**
   ```bash
   # 在浏览器中访问 RPC URL（会返回 JSON 错误，但说明连接正常）
   curl https://sepolia.infura.io/v3/YOUR_PROJECT_ID
   ```

2. **检查防火墙/代理**
   - 确保防火墙允许 HTTPS 连接
   - 如果使用代理，可能需要配置代理设置

3. **使用 VPN（如果在受限网络）**
   - 某些网络可能阻止访问 RPC 节点
   - 尝试使用 VPN

#### 步骤 5: 增加超时时间

如果网络较慢，可以在 `hardhat.config.ts` 中增加超时：

```typescript
sepolia: {
  url: process.env.SEPOLIA_RPC_URL || "",
  accounts: process.env.SEPOLIA_PRIVATE_KEY
    ? [process.env.SEPOLIA_PRIVATE_KEY]
    : [],
  timeout: 120000, // 已设置为 120 秒
},
```

---

## 🔴 其他常见错误

### 错误: "insufficient funds"

**原因：** 账户余额不足

**解决：**
1. 访问 https://sepoliafaucet.com/ 获取测试 ETH
2. 确保账户至少有 0.1 ETH

### 错误: "invalid private key"

**原因：** 私钥格式不正确

**解决：**
1. 确保私钥是 64 位十六进制字符串
2. 可以带或不带 `0x` 前缀
3. 检查是否有额外的空格或换行

### 错误: "network error" 或 "ECONNREFUSED"

**原因：** RPC 节点不可用或 URL 错误

**解决：**
1. 检查 RPC URL 是否正确
2. 尝试使用其他 RPC 提供商
3. 检查网络连接

### 错误: "401 Unauthorized" 或 "403 Forbidden"

**原因：** API Key 无效或已过期

**解决：**
1. 检查 RPC URL 中的 API Key 是否正确
2. 在 Infura/Alchemy 控制台验证 API Key 状态
3. 如果过期，创建新的 API Key

---

## 🛠️ 诊断工具

### 1. 测试 RPC 连接

```bash
npm run test-rpc:sepolia
```

### 2. 检查账户余额

```bash
npm run check-balance:sepolia
```

### 3. 使用 Hardhat Console 手动测试

```bash
npx hardhat console --network sepolia
```

在控制台执行：
```javascript
// 检查网络
const network = await ethers.provider.getNetwork()
console.log("Network:", network)

// 检查账户
const [signer] = await ethers.getSigners()
console.log("Address:", signer.address)

// 检查余额
const balance = await ethers.provider.getBalance(signer.address)
console.log("Balance:", ethers.formatEther(balance), "ETH")
```

---

## 📋 检查清单

在部署前，请确认：

- [ ] `.env` 文件存在且配置正确
- [ ] `SEPOLIA_RPC_URL` 格式正确且包含有效 API Key
- [ ] `SEPOLIA_PRIVATE_KEY` 格式正确
- [ ] 账户有足够的测试 ETH（至少 0.1 ETH）
- [ ] 网络连接正常
- [ ] 防火墙/代理设置允许连接
- [ ] RPC 节点可用（使用 `test-rpc` 脚本验证）

---

## 💡 最佳实践

1. **使用可靠的 RPC 提供商**
   - 优先使用 Infura 或 Alchemy
   - 避免使用公共 RPC（可能不稳定）

2. **保护敏感信息**
   - 永远不要将 `.env` 文件提交到 Git
   - 确保 `.env` 在 `.gitignore` 中

3. **定期检查配置**
   - API Key 可能过期
   - RPC 服务可能更新

4. **使用诊断工具**
   - 部署前先运行 `test-rpc` 脚本
   - 检查余额确保足够

---

## 🆘 仍然无法解决？

如果以上方法都无法解决问题：

1. **检查 Hardhat 版本**
   ```bash
   npx hardhat --version
   ```

2. **更新依赖**
   ```bash
   npm install
   ```

3. **查看详细错误信息**
   ```bash
   npx hardhat run scripts/test-rpc-connection.ts --network sepolia --show-stack-traces
   ```

4. **检查 Hardhat 日志**
   - 查看完整的错误堆栈
   - 搜索相关错误信息

5. **联系支持**
   - Infura: https://infura.io/contact
   - Alchemy: https://docs.alchemy.com/help
   - Hardhat: https://hardhat.org/support

---

祝你部署顺利！🚀

