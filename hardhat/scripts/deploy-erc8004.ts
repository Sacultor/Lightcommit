import { ethers } from "hardhat";

async function main() {
  console.log("开始部署 ERC-8004 系统...");
  
  const [deployer] = await ethers.getSigners();
  console.log("部署账户:", deployer.address);
  console.log("账户余额:", (await ethers.provider.getBalance(deployer.address)).toString());
  
  console.log("\n1. 部署 AgentIdentityRegistry...");
  const AgentIdentityRegistry = await ethers.getContractFactory("AgentIdentityRegistry");
  const identityRegistry = await AgentIdentityRegistry.deploy();
  await identityRegistry.waitForDeployment();
  const identityAddress = await identityRegistry.getAddress();
  console.log("✅ AgentIdentityRegistry 部署到:", identityAddress);
  
  console.log("\n2. 部署 ReputationRegistry...");
  const ReputationRegistry = await ethers.getContractFactory("ReputationRegistry");
  const reputationRegistry = await ReputationRegistry.deploy();
  await reputationRegistry.waitForDeployment();
  const reputationAddress = await reputationRegistry.getAddress();
  console.log("✅ ReputationRegistry 部署到:", reputationAddress);
  
  console.log("\n3. 部署 CommitNFT...");
  const CommitNFT = await ethers.getContractFactory("CommitNFT");
  const commitNFT = await CommitNFT.deploy(
    "LightCommit",
    "LCNFT",
    "https://api.lightcommit.com/metadata/"
  );
  await commitNFT.waitForDeployment();
  const nftAddress = await commitNFT.getAddress();
  console.log("✅ CommitNFT 部署到:", nftAddress);
  
  console.log("\n4. 部署 ValidationRegistry...");
  const ValidationRegistry = await ethers.getContractFactory("ValidationRegistry");
  const validationRegistry = await ValidationRegistry.deploy(
    nftAddress,
    reputationAddress
  );
  await validationRegistry.waitForDeployment();
  const validationAddress = await validationRegistry.getAddress();
  console.log("✅ ValidationRegistry 部署到:", validationAddress);
  
  console.log("\n5. 配置权限...");
  console.log("授予 ValidationRegistry 为 CommitNFT 的 owner...");
  const tx1 = await commitNFT.transferOwnership(validationAddress);
  await tx1.wait();
  console.log("✅ Ownership 已转移");
  
  console.log("\n授予部署者为 ReputationRegistry 的 EVALUATOR_ROLE...");
  const EVALUATOR_ROLE = ethers.keccak256(ethers.toUtf8Bytes("EVALUATOR_ROLE"));
  const tx2 = await reputationRegistry.grantRole(EVALUATOR_ROLE, deployer.address);
  await tx2.wait();
  console.log("✅ EVALUATOR_ROLE 已授予");
  
  console.log("\n授予 ValidationRegistry 为 VALIDATOR_ROLE...");
  const VALIDATOR_ROLE = ethers.keccak256(ethers.toUtf8Bytes("VALIDATOR_ROLE"));
  const tx3 = await validationRegistry.grantRole(VALIDATOR_ROLE, deployer.address);
  await tx3.wait();
  console.log("✅ VALIDATOR_ROLE 已授予");
  
  console.log("\n========================================");
  console.log("🎉 ERC-8004 系统部署完成！");
  console.log("========================================");
  console.log("\n合约地址汇总：");
  console.log("- AgentIdentityRegistry:", identityAddress);
  console.log("- ReputationRegistry:", reputationAddress);
  console.log("- CommitNFT:", nftAddress);
  console.log("- ValidationRegistry:", validationAddress);
  console.log("\n请将以上地址更新到配置文件中");
  
  return {
    identityRegistry: identityAddress,
    reputationRegistry: reputationAddress,
    commitNFT: nftAddress,
    validationRegistry: validationAddress
  };
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

