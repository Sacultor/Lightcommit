import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const CommitNFTModule = buildModule("CommitNFTModule", (m) => {
  // 合约参数
  const name = m.getParameter("name", "LightCommit NFT");
  const symbol = m.getParameter("symbol", "LCNFT");
  const baseTokenURI = m.getParameter("baseTokenURI", "https://api.lightcommit.com/metadata/");

  // 部署合约
  const commitNFT = m.contract("CommitNFT", [name, symbol, baseTokenURI]);

  return { commitNFT };
});

export default CommitNFTModule;
