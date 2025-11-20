# IPFS配置和使用指南

## 概述

本项目集成了IPFS（InterPlanetary File System）功能，允许用户将文件上传到去中心化存储网络。我们支持多个IPFS服务提供商，包括Web3.Storage和Pinata。

## 配置步骤

### 1. 设置环境变量

1. 复制 `.env.ipfs.example` 文件内容到 `.env` 文件中：
   ```bash
   # 将示例文件中的内容复制到现有的.env文件中
   ```

2. 编辑 `.env` 文件，填入你的API密钥：
   - **Web3.Storage**: 在 [web3.storage](https://web3.storage/) 注册账户并获取API令牌
   - **Pinata**: 在 [pinata.cloud](https://pinata.cloud/) 注册账户并获取API密钥

3. 至少需要设置以下变量之一：
   - `WEB3_STORAGE_TOKEN` (Web3.Storage)
   - `IPFS_API_KEY` 和 `IPFS_SECRET_KEY` (Pinata)

### 2. 测试配置

运行以下命令测试IPFS配置是否正确：
```bash
npm run test:ipfs
```

这个脚本会检查：
- 环境变量是否正确设置
- 必要的IPFS相关文件是否存在
- IPFS上传功能是否正常工作

## 使用方法

### 上传文件到IPFS

1. 使用API端点上传文件：
   ```javascript
   const response = await fetch('/api/ipfs/upload', {
     method: 'POST',
     headers: {
       'Content-Type': 'application/json',
     },
     body: JSON.stringify({
       fileName: 'example.txt',
       fileBuffer: base64EncodedFileContent
     })
   });
   
   const result = await response.json();
   console.log('文件CID:', result.cid);
   ```

2. 通过CID访问文件：
   ```
   https://gateway.pinata.cloud/ipfs/你的文件CID
   ```

### 固定文件

使用API端点固定文件（防止被垃圾回收）：
```javascript
const response = await fetch('/api/ipfs/pin', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    cid: '你的文件CID'
  })
});

const result = await response.json();
console.log('固定结果:', result);
```

## 故障排除

### 常见问题

1. **上传失败**
   - 检查API密钥是否正确
   - 确认网络连接正常
   - 验证文件大小是否超出限制

2. **无法访问文件**
   - 确认IPFS网关地址正确
   - 检查CID是否有效
   - 尝试不同的IPFS网关

3. **环境变量问题**
   - 确保 `.env.local` 文件位于项目根目录
   - 检查变量名称是否正确
   - 重启开发服务器使变量生效

### 获取帮助

如果遇到问题，可以：
1. 运行 `npm run test:ipfs` 获取详细诊断信息
2. 查看浏览器控制台错误信息
3. 检查项目日志文件

## 高级配置

### 自定义IPFS网关

你可以使用自己的IPFS网关或公共网关：
- 公共网关列表：https://ipfs.github.io/public-gateway-checker/
- 自建网关指南：https://docs.ipfs.tech/how-to/host-ipfs-on-your-server/

### 使用多个服务提供商

项目支持同时配置多个IPFS服务提供商，以提高可靠性：
- 主要提供商用于上传
- 备用提供商用于固定和访问

## 安全注意事项

1. **保护API密钥**
   - 不要将 `.env.local` 文件提交到版本控制系统
   - 在生产环境中使用安全的方式存储密钥

2. **内容验证**
   - 上传后验证文件内容的完整性
   - 使用内容哈希确保文件未被篡改

3. **访问控制**
   - 考虑对敏感内容实施访问控制
   - 了解IPFS的公开性质，默认所有内容都是公开的

## 相关资源

- [IPFS官方文档](https://docs.ipfs.tech/)
- [Web3.Storage文档](https://web3.storage/docs/)
- [Pinata文档](https://docs.pinata.cloud/)
- [IPFS网关列表](https://ipfs.github.io/public-gateway-checker/)