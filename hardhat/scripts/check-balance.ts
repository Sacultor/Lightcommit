import { ethers } from "hardhat";

/**
 * 检查部署账户余额
 * 
 * 使用方法:
 *   npx hardhat run scripts/check-balance.ts --network sepolia
 */

async function main() {
  console.log("🔍 检查账户余额...\n");

  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();
  const networkName = network.name === "unknown" ? "localhost" : network.name;
  const chainId = Number(network.chainId);

  console.log(`📡 网络: ${networkName} (Chain ID: ${chainId})`);
  console.log(`👤 账户地址: ${deployer.address}\n`);

  const balance = await ethers.provider.getBalance(deployer.address);
  const balanceInEth = ethers.formatEther(balance);
  const balanceInWei = balance.toString();

  console.log(`💰 余额: ${balanceInEth} ETH`);
  console.log(`   (${balanceInWei} Wei)\n`);

  // 估算部署所需 gas（粗略估算）
  const estimatedGas = 5000000n; // 约 5M gas
  const gasPrice = await ethers.provider.getFeeData();
  const estimatedCost = estimatedGas * (gasPrice.gasPrice || 0n);
  const estimatedCostInEth = ethers.formatEther(estimatedCost);

  console.log(`⛽ 估算部署成本: ~${estimatedCostInEth} ETH`);
  console.log(`   (基于 ${estimatedGas.toString()} gas 和当前 gas price)\n`);

  // 检查余额是否足够
  if (networkName !== "localhost") {
    const minRequired = ethers.parseEther("0.1");
    if (balance < minRequired) {
      console.log("⚠️  警告: 余额可能不足！建议至少 0.1 ETH\n");
      console.log("💡 获取测试币:");
      if (chainId === 11155111) {
        console.log("   - Sepolia Faucet: https://sepoliafaucet.com/");
        console.log("   - Alchemy Faucet: https://sepoliafaucet.com/");
        console.log("   - Infura Faucet: https://www.infura.io/faucet/sepolia");
      }
    } else {
      console.log("✅ 余额充足，可以开始部署！");
    }
  } else {
    console.log("ℹ️  本地网络，余额自动分配");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ 检查失败：");
    console.error(error);
    process.exit(1);
  });

