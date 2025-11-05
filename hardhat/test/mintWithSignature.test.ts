import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { network } from 'hardhat';

describe('CommitNFT mintWithSignature', async function () {
  const { viem } = await network.connect();
  const publicClient = await viem.getPublicClient();
  const [deployer, recipient, signerWallet] = await viem.getWalletClients();

  it('should allow minting with valid signature from authorized signer', async function () {
    const commitNFT = await viem.deployContract('CommitNFT', [
      'LightCommit NFT',
      'LCNFT',
      'https://api.lightcommit.com/metadata/'
    ]);

    // set authorized signer to signerWallet address (owner action)
    await commitNFT.write.setAuthorizedSigner([signerWallet.account.address]);

    const commitData = {
      repo: 'test-repo',
      commit: 'abc123',
      linesAdded: 10n,
      linesDeleted: 0n,
      testsPass: true,
      timestamp: BigInt(Math.floor(Date.now() / 1000)),
      author: 'tester',
      message: 'test',
      merged: false
    };

    const metadataURI = 'https://example.com/metadata/1.json';

    // Build EIP-712 typed data
    const chainId = (await publicClient.getChainId()).value;
    const name = await commitNFT.read.name();
    const domain = {
      name: name,
      version: '1',
      chainId: chainId,
      verifyingContract: commitNFT.address
    };

    const types = {
      Mint: [
        { name: 'to', type: 'address' },
        { name: 'commit', type: 'bytes32' },
        { name: 'timestamp', type: 'uint256' },
        { name: 'metadataURI', type: 'string' },
        { name: 'nonce', type: 'uint256' }
      ]
    };

    const commitHashBytes32 = viem.formaters.hexlify(viem.hash.keccak256(viem.formaters.toUtf8Bytes(commitData.commit)));
    const nonce = 1n;

    const value = {
      to: recipient.account.address,
      commit: commitHashBytes32,
      timestamp: commitData.timestamp,
      metadataURI: metadataURI,
      nonce: nonce
    };

    // signerWallet signs the typed data
    const signature = await signerWallet.signTypedData({ domain, types, primaryType: 'Mint', message: value });

    // recipient calls mintWithSignature (no owner privilege required)
    await commitNFT.write.mintWithSignature([
      recipient.account.address,
      commitData,
      metadataURI,
      commitData.timestamp,
      nonce,
      signature
    ]);

    // verify minted
    assert.equal(await commitNFT.read.totalSupply(), 1n);
    const minted = await commitNFT.read.getUserTokenCount([recipient.account.address]);
    assert.equal(minted, 1n);
  });
});
import { ethers } from 'hardhat';
import { assert } from 'chai';

describe('CommitNFT mintWithSignature', function () {
  it('should allow minting with valid signature from authorized signer', async function () {
    const [deployer, recipient, signerAccount] = await ethers.getSigners();

    const CommitNFT = await ethers.getContractFactory('CommitNFT', deployer);
    const commitNFT = await CommitNFT.deploy('Test', 'TST', 'https://example.com/');
    await commitNFT.waitForDeployment();

    // set authorized signer
    await commitNFT.connect(deployer).setAuthorizedSigner(signerAccount.address);

    const commitData = {
      repo: 'test-repo',
      commit: 'abc123',
      linesAdded: 10,
      linesDeleted: 0,
      testsPass: true,
      timestamp: Math.floor(Date.now() / 1000),
      author: 'tester',
      message: 'test',
      merged: false,
    };

    const metadataURI = 'https://example.com/metadata/1.json';

    // construct digest as contract expects
    const chainId = (await ethers.provider.getNetwork()).chainId;
    const name = await commitNFT.name();
    const domain = {
      name: name,
      version: '1',
      chainId: chainId,
      verifyingContract: commitNFT.address,
    };

    const types = {
      Mint: [
        { name: 'to', type: 'address' },
        { name: 'commit', type: 'bytes32' },
        { name: 'timestamp', type: 'uint256' },
        { name: 'metadataURI', type: 'string' },
        { name: 'nonce', type: 'uint256' },
      ],
    };

    const commitHashBytes32 = ethers.utils.id(commitData.commit);
    const nonce = 1;

    const value = {
      to: recipient.address,
      commit: commitHashBytes32,
      timestamp: commitData.timestamp,
      metadataURI: metadataURI,
      nonce: nonce,
    };

    // signer signs
    const signature = await signerAccount._signTypedData(domain, types, value);

    // call mintWithSignature
    await commitNFT.connect(recipient).mintWithSignature(
      recipient.address,
      commitData,
      metadataURI,
      commitData.timestamp,
      nonce,
      signature
    );

    // verify minted
    assert.equal(await commitNFT.totalSupply(), 1);
    const minted = await commitNFT.getUserTokenCount(recipient.address);
    assert.equal(minted.toString(), '1');
  });
});
