import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { network } from "hardhat";

describe("CommitNFT", async function () {
  const { viem } = await network.connect();
  const publicClient = await viem.getPublicClient();
  const [deployer, user1, user2] = await viem.getWalletClients();

  it("Should deploy CommitNFT contract successfully", async function () {
    const commitNFT = await viem.deployContract("CommitNFT", [
      "LightCommit NFT",
      "LCNFT", 
      "https://api.lightcommit.com/metadata/"
    ]);

    assert.equal(await commitNFT.read.name(), "LightCommit NFT");
    assert.equal(await commitNFT.read.symbol(), "LCNFT");
    assert.equal(await commitNFT.read.totalSupply(), 0n);
  });

  it("Should mint a single commit NFT", async function () {
    const commitNFT = await viem.deployContract("CommitNFT", [
      "LightCommit NFT",
      "LCNFT",
      "https://api.lightcommit.com/metadata/"
    ]);

    const commitData = {
      repo: "uniswap/v4-core",
      commit: "a3f2b1c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1",
      linesAdded: 234n,
      linesDeleted: 12n,
      testsPass: true,
      timestamp: Math.floor(Date.now() / 1000),
      author: "developer",
      message: "Add new feature",
      merged: true
    };

    const metadataURI = "https://api.lightcommit.com/metadata/1";

    // 铸造NFT（只有owner可以铸造）
    await commitNFT.write.mintCommit([
      user1.account.address,
      commitData,
      metadataURI
    ]);

    // 验证NFT已铸造
    assert.equal(await commitNFT.read.ownerOf([1n]), user1.account.address);
    assert.equal(await commitNFT.read.totalSupply(), 1n);
    assert.equal(await commitNFT.read.getUserTokenCount([user1.account.address]), 1n);

    // 验证commit数据
    const storedData = await commitNFT.read.getCommitData([1n]);
    assert.equal(storedData.repo, commitData.repo);
    assert.equal(storedData.commit, commitData.commit);
    assert.equal(storedData.linesAdded, commitData.linesAdded);
    assert.equal(storedData.testsPass, commitData.testsPass);
    assert.equal(storedData.merged, commitData.merged);
  });

  it("Should prevent duplicate commit minting", async function () {
    const commitNFT = await viem.deployContract("CommitNFT", [
      "LightCommit NFT",
      "LCNFT",
      "https://api.lightcommit.com/metadata/"
    ]);

    const commitData = {
      repo: "uniswap/v4-core",
      commit: "duplicate-commit-hash",
      linesAdded: 100n,
      linesDeleted: 5n,
      testsPass: true,
      timestamp: Math.floor(Date.now() / 1000),
      author: "developer",
      message: "Initial commit",
      merged: false
    };

    const metadataURI = "https://api.lightcommit.com/metadata/1";

    // 第一次铸造应该成功
    await commitNFT.write.mintCommit([
      user1.account.address,
      commitData,
      metadataURI
    ]);

    // 第二次铸造相同commit应该失败
    try {
      await commitNFT.write.mintCommit([
        user2.account.address,
        commitData,
        "https://api.lightcommit.com/metadata/2"
      ]);
      assert.fail("Should have thrown an error for duplicate commit");
    } catch (error) {
      assert.ok(error.message.includes("Commit already minted"));
    }
  });

  it("Should batch mint multiple commits", async function () {
    const commitNFT = await viem.deployContract("CommitNFT", [
      "LightCommit NFT",
      "LCNFT",
      "https://api.lightcommit.com/metadata/"
    ]);

    const commitsData = [
      {
        repo: "uniswap/v4-core",
        commit: "commit-1-hash",
        linesAdded: 100n,
        linesDeleted: 10n,
        testsPass: true,
        timestamp: Math.floor(Date.now() / 1000),
        author: "developer1",
        message: "First commit",
        merged: true
      },
      {
        repo: "uniswap/v4-periphery",
        commit: "commit-2-hash",
        linesAdded: 200n,
        linesDeleted: 20n,
        testsPass: false,
        timestamp: Math.floor(Date.now() / 1000),
        author: "developer2",
        message: "Second commit",
        merged: false
      }
    ];

    const metadataURIs = [
      "https://api.lightcommit.com/metadata/1",
      "https://api.lightcommit.com/metadata/2"
    ];

    // 批量铸造
    await commitNFT.write.batchMintCommits([
      user1.account.address,
      commitsData,
      metadataURIs
    ]);

    // 验证批量铸造结果
    assert.equal(await commitNFT.read.totalSupply(), 2n);
    assert.equal(await commitNFT.read.getUserTokenCount([user1.account.address]), 2n);
    assert.equal(await commitNFT.read.ownerOf([1n]), user1.account.address);
    assert.equal(await commitNFT.read.ownerOf([2n]), user1.account.address);
  });

  it("Should check if commit is already minted", async function () {
    const commitNFT = await viem.deployContract("CommitNFT", [
      "LightCommit NFT",
      "LCNFT",
      "https://api.lightcommit.com/metadata/"
    ]);

    const commitHash = "test-commit-hash";
    
    // 初始状态应该为false
    assert.equal(await commitNFT.read.isCommitMinted([commitHash]), false);

    const commitData = {
      repo: "test/repo",
      commit: commitHash,
      linesAdded: 50n,
      linesDeleted: 5n,
      testsPass: true,
      timestamp: Math.floor(Date.now() / 1000),
      author: "tester",
      message: "Test commit",
      merged: true
    };

    // 铸造后应该为true
    await commitNFT.write.mintCommit([
      user1.account.address,
      commitData,
      "https://api.lightcommit.com/metadata/1"
    ]);

    assert.equal(await commitNFT.read.isCommitMinted([commitHash]), true);
  });

  it("Should emit proper events", async function () {
    const commitNFT = await viem.deployContract("CommitNFT", [
      "LightCommit NFT",
      "LCNFT",
      "https://api.lightcommit.com/metadata/"
    ]);

    const commitData = {
      repo: "uniswap/v4-core",
      commit: "event-test-hash",
      linesAdded: 100n,
      linesDeleted: 10n,
      testsPass: true,
      timestamp: Math.floor(Date.now() / 1000),
      author: "event-tester",
      message: "Event test commit",
      merged: true
    };

    const metadataURI = "https://api.lightcommit.com/metadata/1";

    // 监听事件
    const deploymentBlockNumber = await publicClient.getBlockNumber();

    await commitNFT.write.mintCommit([
      user1.account.address,
      commitData,
      metadataURI
    ]);

    // 检查CommitMinted事件
    const events = await publicClient.getContractEvents({
      address: commitNFT.address,
      abi: commitNFT.abi,
      eventName: "CommitMinted",
      fromBlock: deploymentBlockNumber,
      strict: true,
    });

    assert.equal(events.length, 1);
    assert.equal(events[0].args.tokenId, 1n);
    assert.equal(events[0].args.to, user1.account.address);
    assert.equal(events[0].args.repo, commitData.repo);
    assert.equal(events[0].args.commit, commitData.commit);
    assert.equal(events[0].args.linesAdded, commitData.linesAdded);
    assert.equal(events[0].args.testsPass, commitData.testsPass);
    assert.equal(events[0].args.merged, commitData.merged);
  });
});
