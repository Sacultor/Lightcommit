import { ethers } from "hardhat";
import * as dotenv from "dotenv";

/**
 * 测试 RPC 连接
 * 用于诊断连接问题
 * 
 * 使用方法:
 *   npx hardhat run scripts/test-rpc-connection.ts --network sepolia
 */

async function main() {
  console.log("🔍 测试 RPC 连接...\n");

  // 检查环境变量
  dotenv.config();
  const rpcUrl = process.env.SEPOLIA_RPC_URL;

  console.log("📋 配置检查：");
  console.log(`   RPC URL 已配置: ${rpcUrl ? "✅ 是" : "❌ 否"}`);
  
  if (!rpcUrl) {
    console.error("\n❌ 错误: SEPOLIA_RPC_URL 未配置！");
    console.error("   请在 .env 文件中设置 SEPOLIA_RPC_URL");
    process.exit(1);
  }

  // 检查 URL 格式
  if (!rpcUrl.startsWith("http://") && !rpcUrl.startsWith("https://")) {
    console.error("\n❌ 错误: RPC URL 格式不正确！");
    console.error(`   当前值: ${rpcUrl}`);
    console.error("   应该是: https://sepolia.infura.io/v3/YOUR_PROJECT_ID");
    process.exit(1);
  }

  console.log(`   RPC URL: ${rpcUrl.replace(/\/v3\/[^/]+/, "/v3/***")}\n`);

  // 测试连接
  console.log("🌐 测试网络连接...");
  
  try {
    const provider = ethers.getDefaultProvider(rpcUrl);
    
    // 测试 1: 获取链 ID
    console.log("   1. 获取链 ID...");
    const network = await Promise.race([
      provider.getNetwork(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error("超时")), 10000)
      )
    ]) as any;
    console.log(`      ✅ 链 ID: ${network.chainId}`);

    // 测试 2: 获取最新区块
    console.log("   2. 获取最新区块...");
    const blockNumber = await Promise.race([
      provider.getBlockNumber(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error("超时")), 10000)
      )
    ]) as number;
    console.log(`      ✅ 最新区块: ${blockNumber}`);

    // 测试 3: 获取 gas price
    console.log("   3. 获取 gas price...");
    const feeData = await Promise.race([
      provider.getFeeData(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error("超时")), 10000)
      )
    ]) as any;
    console.log(`      ✅ Gas Price: ${ethers.formatUnits(feeData.gasPrice || 0n, "gwei")} Gwei`);

    console.log("\n✅ RPC 连接正常！可以开始部署。\n");

  } catch (error: any) {
    console.error("\n❌ RPC 连接失败：");
    
    if (error.code === "UND_ERR_CONNECT_TIMEOUT" || error.message === "超时") {
      console.error("   错误类型: 连接超时");
      console.error("\n💡 可能的原因：");
      console.error("   1. RPC URL 不正确");
      console.error("   2. 网络连接问题（检查防火墙/代理）");
      console.error("   3. RPC 节点暂时不可用");
      console.error("\n🔧 解决方案：");
      console.error("   1. 检查 .env 文件中的 SEPOLIA_RPC_URL 是否正确");
      console.error("   2. 尝试使用其他 RPC 提供商：");
      console.error("      - Infura: https://infura.io");
      console.error("      - Alchemy: https://alchemy.com");
      console.error("      - 公共 RPC: https://rpc.sepolia.org");
      console.error("   3. 检查网络连接和防火墙设置");
      console.error("   4. 如果使用代理，可能需要配置代理设置");
    } else if (error.code === "ECONNREFUSED") {
      console.error("   错误类型: 连接被拒绝");
      console.error("   可能原因: RPC URL 不正确或服务不可用");
    } else if (error.message?.includes("401") || error.message?.includes("403")) {
      console.error("   错误类型: 认证失败");
      console.error("   可能原因: API Key 无效或已过期");
      console.error("   解决方案: 检查 RPC URL 中的 API Key");
    } else {
      console.error(`   错误信息: ${error.message || error}`);
    }
    
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ 测试失败：");
    console.error(error);
    process.exit(1);
  });

