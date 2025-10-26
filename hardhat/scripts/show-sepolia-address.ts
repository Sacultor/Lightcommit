import { ethers } from "hardhat";

async function main() {
  const [signer] = await ethers.getSigners();
  console.log("Sepolia signer:", signer.address);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});


