import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("ERC-8004 System", function () {
  let identityRegistry: any;
  let reputationRegistry: any;
  let commitNFT: any;
  let validationRegistry: any;
  
  let owner: SignerWithAddress;
  let evaluator: SignerWithAddress;
  let contributor: SignerWithAddress;
  
  const EVALUATOR_ROLE = ethers.keccak256(ethers.toUtf8Bytes("EVALUATOR_ROLE"));
  
  beforeEach(async function () {
    [owner, evaluator, contributor] = await ethers.getSigners();
    
    const AgentIdentityRegistry = await ethers.getContractFactory("AgentIdentityRegistry");
    identityRegistry = await AgentIdentityRegistry.deploy();
    
    const ReputationRegistry = await ethers.getContractFactory("ReputationRegistry");
    reputationRegistry = await ReputationRegistry.deploy();
    
    const CommitNFT = await ethers.getContractFactory("CommitNFT");
    commitNFT = await CommitNFT.deploy(
      "LightCommit",
      "LCNFT",
      "https://api.lightcommit.com/metadata/"
    );
    
    const ValidationRegistry = await ethers.getContractFactory("ValidationRegistry");
    validationRegistry = await ValidationRegistry.deploy(
      await commitNFT.getAddress(),
      await reputationRegistry.getAddress()
    );
    
    await commitNFT.transferOwnership(await validationRegistry.getAddress());
    await reputationRegistry.grantRole(EVALUATOR_ROLE, evaluator.address);
  });
  
  describe("AgentIdentityRegistry", function () {
    it("应该允许注册代理", async function () {
      await identityRegistry.connect(contributor).registerAgent(
        "testuser",
        "ipfs://QmTest"
      );
      
      const agent = await identityRegistry.getAgentByAddress(contributor.address);
      expect(agent.githubUsername).to.equal("testuser");
      expect(agent.active).to.be.true;
    });
    
    it("应该防止重复注册", async function () {
      await identityRegistry.connect(contributor).registerAgent(
        "testuser",
        "ipfs://QmTest"
      );
      
      await expect(
        identityRegistry.connect(contributor).registerAgent(
          "testuser2",
          "ipfs://QmTest2"
        )
      ).to.be.revertedWith("Agent already registered");
    });
    
    it("应该允许更新 Agent Card", async function () {
      await identityRegistry.connect(contributor).registerAgent(
        "testuser",
        "ipfs://QmTest"
      );
      
      await identityRegistry.connect(contributor).updateAgentCard("ipfs://QmNewTest");
      
      const agent = await identityRegistry.getAgentByAddress(contributor.address);
      expect(agent.agentCardURI).to.equal("ipfs://QmNewTest");
    });
  });
  
  describe("ReputationRegistry", function () {
    it("应该允许评分者提交反馈", async function () {
      const repo = "Sacultor/Lightcommit";
      const commitSha = "abc123";
      const score = 85;
      const nonce = 0;
      
      const currentBlock = await ethers.provider.getBlock('latest');
      const timestamp = currentBlock!.timestamp;
      
      const feedbackData = {
        repo,
        commitSha,
        score,
        timestamp,
      };
      const feedbackHash = ethers.keccak256(
        ethers.toUtf8Bytes(JSON.stringify(feedbackData))
      );
      
      const domain = {
        name: "LightCommit Reputation",
        version: "1",
        chainId: (await ethers.provider.getNetwork()).chainId,
        verifyingContract: await reputationRegistry.getAddress(),
      };
      
      const types = {
        Feedback: [
          { name: "contributor", type: "address" },
          { name: "repo", type: "string" },
          { name: "commitSha", type: "string" },
          { name: "score", type: "uint256" },
          { name: "feedbackHash", type: "bytes32" },
          { name: "timestamp", type: "uint256" },
          { name: "nonce", type: "uint256" },
        ],
      };
      
      const message = {
        contributor: contributor.address,
        repo,
        commitSha,
        score,
        feedbackHash,
        timestamp,
        nonce,
      };
      
      const signature = await evaluator.signTypedData(domain, types, message);
      
      await reputationRegistry.submitFeedback(
        contributor.address,
        repo,
        commitSha,
        score,
        feedbackHash,
        "ipfs://QmMetadata",
        signature
      );
      
      const feedback = await reputationRegistry.getFeedbackByCommit(repo, commitSha);
      expect(feedback.score).to.equal(score);
      expect(feedback.contributor).to.equal(contributor.address);
    });
    
    it("应该正确计算声誉分数", async function () {
      await identityRegistry.connect(contributor).registerAgent(
        "testuser",
        "ipfs://QmTest"
      );
      
      const reputation = await reputationRegistry.getContributorReputation(contributor.address);
      expect(reputation.totalScore).to.equal(0);
      expect(reputation.averageScore).to.equal(0);
    });
  });
  
  describe("ValidationRegistry", function () {
    it("应该在分数达标时铸造 NFT", async function () {
      const repo = "Sacultor/Lightcommit";
      const commitSha = "abc123";
      const score = 90;
      const nonce = 0;
      
      const currentBlock = await ethers.provider.getBlock('latest');
      const timestamp = currentBlock!.timestamp;
      
      const feedbackData = {
        repo,
        commitSha,
        score,
        timestamp,
      };
      const feedbackHash = ethers.keccak256(
        ethers.toUtf8Bytes(JSON.stringify(feedbackData))
      );
      
      const domain = {
        name: "LightCommit Reputation",
        version: "1",
        chainId: (await ethers.provider.getNetwork()).chainId,
        verifyingContract: await reputationRegistry.getAddress(),
      };
      
      const types = {
        Feedback: [
          { name: "contributor", type: "address" },
          { name: "repo", type: "string" },
          { name: "commitSha", type: "string" },
          { name: "score", type: "uint256" },
          { name: "feedbackHash", type: "bytes32" },
          { name: "timestamp", type: "uint256" },
          { name: "nonce", type: "uint256" },
        ],
      };
      
      const message = {
        contributor: contributor.address,
        repo,
        commitSha,
        score,
        feedbackHash,
        timestamp,
        nonce,
      };
      
      const signature = await evaluator.signTypedData(domain, types, message);
      
      await reputationRegistry.submitFeedback(
        contributor.address,
        repo,
        commitSha,
        score,
        feedbackHash,
        "ipfs://QmMetadata",
        signature
      );
      
      await validationRegistry.requestValidation(
        repo,
        commitSha,
        contributor.address,
        "ipfs://QmMetadata"
      );
      
      const balance = await commitNFT.balanceOf(contributor.address);
      expect(balance).to.equal(1);
    });
    
    it("应该在分数不达标时不铸造 NFT", async function () {
      const repo = "Sacultor/Lightcommit";
      const commitSha = "abc123";
      const score = 70;
      const nonce = 0;
      
      const currentBlock = await ethers.provider.getBlock('latest');
      const timestamp = currentBlock!.timestamp;
      
      const feedbackData = {
        repo,
        commitSha,
        score,
        timestamp,
      };
      const feedbackHash = ethers.keccak256(
        ethers.toUtf8Bytes(JSON.stringify(feedbackData))
      );
      
      const domain = {
        name: "LightCommit Reputation",
        version: "1",
        chainId: (await ethers.provider.getNetwork()).chainId,
        verifyingContract: await reputationRegistry.getAddress(),
      };
      
      const types = {
        Feedback: [
          { name: "contributor", type: "address" },
          { name: "repo", type: "string" },
          { name: "commitSha", type: "string" },
          { name: "score", type: "uint256" },
          { name: "feedbackHash", type: "bytes32" },
          { name: "timestamp", type: "uint256" },
          { name: "nonce", type: "uint256" },
        ],
      };
      
      const message = {
        contributor: contributor.address,
        repo,
        commitSha,
        score,
        feedbackHash,
        timestamp,
        nonce,
      };
      
      const signature = await evaluator.signTypedData(domain, types, message);
      
      await reputationRegistry.submitFeedback(
        contributor.address,
        repo,
        commitSha,
        score,
        feedbackHash,
        "ipfs://QmMetadata",
        signature
      );
      
      await validationRegistry.requestValidation(
        repo,
        commitSha,
        contributor.address,
        "ipfs://QmMetadata"
      );
      
      const balance = await commitNFT.balanceOf(contributor.address);
      expect(balance).to.equal(0);
    });
  });
  
  describe("集成测试", function () {
    it("完整流程：注册 -> 评分 -> 验证 -> 铸造", async function () {
      await identityRegistry.connect(contributor).registerAgent(
        "testuser",
        "ipfs://QmAgent"
      );
      
      const repo = "Sacultor/Lightcommit";
      const commitSha = "xyz789";
      const score = 95;
      const nonce = 0;
      
      const currentBlock = await ethers.provider.getBlock('latest');
      const timestamp = currentBlock!.timestamp;
      
      const feedbackData = {
        repo,
        commitSha,
        score,
        timestamp,
      };
      const feedbackHash = ethers.keccak256(
        ethers.toUtf8Bytes(JSON.stringify(feedbackData))
      );
      
      const domain = {
        name: "LightCommit Reputation",
        version: "1",
        chainId: (await ethers.provider.getNetwork()).chainId,
        verifyingContract: await reputationRegistry.getAddress(),
      };
      
      const types = {
        Feedback: [
          { name: "contributor", type: "address" },
          { name: "repo", type: "string" },
          { name: "commitSha", type: "string" },
          { name: "score", type: "uint256" },
          { name: "feedbackHash", type: "bytes32" },
          { name: "timestamp", type: "uint256" },
          { name: "nonce", type: "uint256" },
        ],
      };
      
      const message = {
        contributor: contributor.address,
        repo,
        commitSha,
        score,
        feedbackHash,
        timestamp,
        nonce,
      };
      
      const signature = await evaluator.signTypedData(domain, types, message);
      
      await reputationRegistry.submitFeedback(
        contributor.address,
        repo,
        commitSha,
        score,
        feedbackHash,
        "ipfs://QmMetadata",
        signature
      );
      
      await validationRegistry.requestValidation(
        repo,
        commitSha,
        contributor.address,
        "ipfs://QmMetadata"
      );
      
      const balance = await commitNFT.balanceOf(contributor.address);
      expect(balance).to.equal(1);
      
      const tokenId = await commitNFT.tokenOfOwnerByIndex(contributor.address, 0);
      const tokenURI = await commitNFT.tokenURI(tokenId);
      expect(tokenURI).to.include("ipfs://QmMetadata");
      
      const reputation = await reputationRegistry.getContributorReputation(contributor.address);
      expect(reputation.totalScore).to.equal(score);
      expect(reputation.averageScore).to.equal(score);
    });
  });
});

