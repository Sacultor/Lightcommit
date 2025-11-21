import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

/**
 * 重新部署 ERC-8004 系统合约
 * 
 * 使用方法:
 *   npx hardhat run scripts/redeploy.ts --network sepolia
 *   npx hardhat run scripts/redeploy.ts --network localhost
 */

interface DeploymentResult {
  network: string;
  chainId: number;
  timestamp: string;
  contracts: {
    identityRegistry: string;
    reputationRegistry: string;
    commitNFT: string;
    validationRegistry: string;
  };
  deployer: string;
}

async function main() {
  console.log("🚀 开始重新部署 ERC-8004 系统合约...\n");

  // 获取网络信息
  const network = await ethers.provider.getNetwork();
  const networkName = network.name === "unknown" ? "localhost" : network.name;
  const chainId = Number(network.chainId);

  console.log(`📡 网络: ${networkName} (Chain ID: ${chainId})`);

  // 获取部署账户
  const [deployer] = await ethers.getSigners();
  console.log(`👤 部署账户: ${deployer.address}`);

  // 检查余额
  const balance = await ethers.provider.getBalance(deployer.address);
  const balanceInEth = ethers.formatEther(balance);
  console.log(`💰 账户余额: ${balanceInEth} ETH`);

  if (balance === 0n && networkName !== "localhost") {
    console.warn("⚠️  警告: 账户余额为 0，部署可能会失败！");
    console.warn("   请访问 https://sepoliafaucet.com/ 获取测试 ETH\n");
  }

  console.log("\n" + "=".repeat(50));
  console.log("开始部署合约...\n");

  // 1. 部署 AgentIdentityRegistry
  console.log("1️⃣  部署 AgentIdentityRegistry...");
  const AgentIdentityRegistry = await ethers.getContractFactory("AgentIdentityRegistry");
  const identityRegistry = await AgentIdentityRegistry.deploy();
  await identityRegistry.waitForDeployment();
  const identityAddress = await identityRegistry.getAddress();
  console.log(`   ✅ 部署成功: ${identityAddress}`);

  // 2. 部署 ReputationRegistry
  console.log("\n2️⃣  部署 ReputationRegistry...");
  const ReputationRegistry = await ethers.getContractFactory("ReputationRegistry");
  const reputationRegistry = await ReputationRegistry.deploy();
  await reputationRegistry.waitForDeployment();
  const reputationAddress = await reputationRegistry.getAddress();
  console.log(`   ✅ 部署成功: ${reputationAddress}`);

  // 3. 部署 CommitNFT
  console.log("\n3️⃣  部署 CommitNFT...");
  const CommitNFT = await ethers.getContractFactory("CommitNFT");
  const commitNFT = await CommitNFT.deploy(
    "LightCommit",
    "LCNFT",
    "https://api.lightcommit.com/metadata/"
  );
  await commitNFT.waitForDeployment();
  const nftAddress = await commitNFT.getAddress();
  console.log(`   ✅ 部署成功: ${nftAddress}`);

  // 4. 部署 ValidationRegistry
  console.log("\n4️⃣  部署 ValidationRegistry...");
  const ValidationRegistry = await ethers.getContractFactory("ValidationRegistry");
  const validationRegistry = await ValidationRegistry.deploy(
    nftAddress,
    reputationAddress
  );
  await validationRegistry.waitForDeployment();
  const validationAddress = await validationRegistry.getAddress();
  console.log(`   ✅ 部署成功: ${validationAddress}`);

  // 5. 配置权限
  console.log("\n" + "=".repeat(50));
  console.log("配置合约权限...\n");

  // 5.1 转移 CommitNFT 所有权
  console.log("5️⃣  转移 CommitNFT 所有权到 ValidationRegistry...");
  const tx1 = await commitNFT.transferOwnership(validationAddress);
  await tx1.wait();
  console.log("   ✅ 所有权已转移");

  // 5.2 授予部署者 EVALUATOR_ROLE
  console.log("\n6️⃣  授予部署者为 ReputationRegistry 的 EVALUATOR_ROLE...");
  const EVALUATOR_ROLE = ethers.keccak256(ethers.toUtf8Bytes("EVALUATOR_ROLE"));
  const tx2 = await reputationRegistry.grantRole(EVALUATOR_ROLE, deployer.address);
  await tx2.wait();
  console.log("   ✅ EVALUATOR_ROLE 已授予");

  // 5.3 授予部署者 VALIDATOR_ROLE
  console.log("\n7️⃣  授予部署者为 ValidationRegistry 的 VALIDATOR_ROLE...");
  const VALIDATOR_ROLE = ethers.keccak256(ethers.toUtf8Bytes("VALIDATOR_ROLE"));
  const tx3 = await reputationRegistry.grantRole(VALIDATOR_ROLE, deployer.address);
  await tx3.wait();
  console.log("   ✅ VALIDATOR_ROLE 已授予");

  // 保存部署信息
  const deploymentResult: DeploymentResult = {
    network: networkName,
    chainId: chainId,
    timestamp: new Date().toISOString(),
    contracts: {
      identityRegistry: identityAddress,
      reputationRegistry: reputationAddress,
      commitNFT: nftAddress,
      validationRegistry: validationAddress,
    },
    deployer: deployer.address,
  };

  // 保存到文件
  const deploymentDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentDir)) {
    fs.mkdirSync(deploymentDir, { recursive: true });
  }

  const deploymentFile = path.join(
    deploymentDir,
    `deployment-${networkName}-${Date.now()}.json`
  );
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentResult, null, 2));

  // 输出部署摘要
  console.log("\n" + "=".repeat(50));
  console.log("🎉 部署完成！");
  console.log("=".repeat(50));
  console.log("\n📋 合约地址汇总：");
  console.log(`   AgentIdentityRegistry: ${identityAddress}`);
  console.log(`   ReputationRegistry:     ${reputationAddress}`);
  console.log(`   CommitNFT:              ${nftAddress}`);
  console.log(`   ValidationRegistry:    ${validationAddress}`);
  console.log(`\n💾 部署信息已保存到: ${deploymentFile}`);

  // 生成前端环境变量配置
  console.log("\n" + "=".repeat(50));
  console.log("📝 前端环境变量配置：");
  console.log("=".repeat(50));
  console.log("\n请将以下内容添加到 frontend/.env 文件：\n");
  console.log(`NEXT_PUBLIC_CHAIN_ID=${chainId}`);
  console.log(`NEXT_PUBLIC_IDENTITY_REGISTRY_ADDRESS=${identityAddress}`);
  console.log(`NEXT_PUBLIC_REPUTATION_REGISTRY_ADDRESS=${reputationAddress}`);
  console.log(`NEXT_PUBLIC_VALIDATION_REGISTRY_ADDRESS=${validationAddress}`);
  console.log(`NEXT_PUBLIC_COMMIT_NFT_ADDRESS=${nftAddress}`);

  if (networkName !== "localhost") {
    console.log("\n" + "=".repeat(50));
    console.log("🔍 合约验证命令：");
    console.log("=".repeat(50));
    console.log("\n在区块浏览器上验证合约代码：\n");
    console.log(`npx hardhat verify --network ${networkName} ${identityAddress}`);
    console.log(`npx hardhat verify --network ${networkName} ${reputationAddress}`);
    console.log(
      `npx hardhat verify --network ${networkName} ${nftAddress} "LightCommit" "LCNFT" "https://api.lightcommit.com/metadata/"`
    );
    console.log(
      `npx hardhat verify --network ${networkName} ${validationAddress} ${nftAddress} ${reputationAddress}`
    );
  }

  console.log("\n✨ 部署流程完成！\n");

  return deploymentResult;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ 部署失败：");
    console.error(error);
    process.exit(1);
  });

