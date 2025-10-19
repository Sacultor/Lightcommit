import { ethers } from "hardhat";

async function main() {
  console.log("开始部署 CommitNFT 合约...");

  // 获取部署账户
  const [deployer] = await ethers.getSigners();
  console.log("部署账户:", deployer.address);
  console.log("账户余额:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");

  // 合约参数
  const name = "LightCommit NFT";
  const symbol = "LCNFT";
  const baseTokenURI = "https://api.lightcommit.com/metadata/";

  console.log("\n合约参数:");
  console.log("  名称:", name);
  console.log("  符号:", symbol);
  console.log("  基础URI:", baseTokenURI);

  // 部署合约
  console.log("\n正在部署合约...");
  const CommitNFT = await ethers.getContractFactory("CommitNFT");
  const commitNFT = await CommitNFT.deploy(name, symbol, baseTokenURI);
  
  await commitNFT.waitForDeployment();
  const address = await commitNFT.getAddress();

  console.log("\n✅ 合约部署成功!");
  console.log("合约地址:", address);

  // 验证部署
  console.log("\n验证合约...");
  const deployedName = await commitNFT.name();
  const deployedSymbol = await commitNFT.symbol();
  const totalSupply = await commitNFT.totalSupply();
  const maxSupply = await commitNFT.MAX_SUPPLY();

  console.log("  名称:", deployedName);
  console.log("  符号:", deployedSymbol);
  console.log("  当前供应量:", totalSupply.toString());
  console.log("  最大供应量:", maxSupply.toString());

  // 保存部署信息
  const deploymentInfo = {
    network: (await ethers.provider.getNetwork()).name,
    chainId: Number((await ethers.provider.getNetwork()).chainId),
    contractAddress: address,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contractName: "CommitNFT",
    name: deployedName,
    symbol: deployedSymbol,
  };

  console.log("\n📋 部署信息:");
  console.log(JSON.stringify(deploymentInfo, null, 2));

  // 将地址写入环境变量提示
  console.log("\n🔧 请将以下内容添加到前端的 .env.local 文件:");
  console.log(`NEXT_PUBLIC_CONTRACT_ADDRESS=${address}`);
  console.log(`NEXT_PUBLIC_CHAIN_ID=${deploymentInfo.chainId}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

