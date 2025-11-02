import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const ERC8004SystemModule = buildModule("ERC8004System", (m) => {
  const identityRegistry = m.contract("AgentIdentityRegistry");
  
  const reputationRegistry = m.contract("ReputationRegistry");
  
  const commitNFT = m.contract("CommitNFT", [
    "LightCommit",
    "LCNFT",
    "https://api.lightcommit.com/metadata/"
  ]);
  
  const validationRegistry = m.contract("ValidationRegistry", [
    commitNFT,
    reputationRegistry
  ]);
  
  m.call(commitNFT, "transferOwnership", [validationRegistry]);
  
  return { 
    identityRegistry, 
    reputationRegistry, 
    commitNFT, 
    validationRegistry 
  };
});

export default ERC8004SystemModule;

