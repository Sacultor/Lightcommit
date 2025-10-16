// Note: ethers will need to be installed as a dependency
// import { ethers } from 'ethers';
import { getConfig } from '@/lib/config';
import { ContributionRepository } from '@/lib/database/repositories/contribution.repository';
import { Contribution, ContributionStatus } from '@/types/contribution';

export class BlockchainService {
  private static provider: any = null; // ethers.JsonRpcProvider
  private static wallet: any = null; // ethers.Wallet
  private static contract: any = null; // ethers.Contract

  // 初始化区块链连接
  static async initializeBlockchain(): Promise<void> {
    try {
      const config = getConfig();

      if (!config.blockchain.rpcUrl) {
        throw new Error('RPC URL not configured');
      }

      // 初始化提供者
      // this.provider = new ethers.JsonRpcProvider(config.blockchain.rpcUrl);

      // 初始化钱包
      if (config.blockchain.privateKey) {
        // this.wallet = new ethers.Wallet(config.blockchain.privateKey, this.provider);
      }

      // 初始化合约
      if (config.blockchain.contractAddress) {
        // this.contract = new ethers.Contract(
        //   config.blockchain.contractAddress,
        //   contractAbi, // ABI would need to be imported separately
        //   this.wallet || this.provider
        // );
      }

      console.log('Blockchain initialized successfully');
    } catch (error) {
      console.error('Failed to initialize blockchain:', error);
      throw error;
    }
  }

  // 确保区块链已初始化
  private static async ensureInitialized(): Promise<void> {
    if (!this.provider) {
      await this.initializeBlockchain();
    }
  }

  // 铸造贡献 NFT
  static async mintContribution(contributionId: string): Promise<string> {
    await this.ensureInitialized();

    if (!this.contract || !this.wallet) {
      throw new Error('Contract or wallet not initialized');
    }

    try {
      // 获取贡献信息
      const contribution = await ContributionRepository.findById(contributionId);
      if (!contribution) {
        throw new Error('Contribution not found');
      }

      if (contribution.status === ContributionStatus.MINTED) {
        throw new Error('Contribution already minted');
      }

      // 上传元数据到 IPFS
      const metadataUri = await this.uploadMetadataToIPFS(contribution);

      // 调用智能合约铸造 NFT
      const tx = await this.contract.mintContribution(
        contribution.contributor,
        metadataUri,
        {
          gasLimit: 500000,
        },
      );

      console.log('Minting transaction sent:', tx.hash);

      // 等待交易确认
      const receipt = await tx.wait();
      console.log('Minting transaction confirmed:', receipt.hash);

      // 更新贡献状态
      await ContributionRepository.update(contributionId, {
        status: ContributionStatus.MINTED,
        transactionHash: receipt.hash,
        tokenId: receipt.logs[0]?.topics[3], // 假设 tokenId 在第一个 log 的第三个 topic
        metadataUri,
      });

      return receipt.hash;
    } catch (error) {
      console.error('Failed to mint contribution:', error);
      throw error;
    }
  }

  // 上传元数据到 IPFS
  static async uploadMetadataToIPFS(contribution: Contribution): Promise<string> {
    try {
      const config = getConfig();

      if (!config.ipfs.apiUrl) {
        throw new Error('IPFS API URL not configured');
      }

      const metadata = {
        name: `Contribution #${contribution.id}`,
        description: contribution.description || `Contribution by ${contribution.contributor}`,
        image: '', // Avatar URL would need to be fetched from user data
        attributes: [
          {
            trait_type: 'Type',
            value: contribution.type,
          },
          {
            trait_type: 'Contributor',
            value: contribution.contributor,
          },
          {
            trait_type: 'Repository',
            value: contribution.repositoryId,
          },
          {
            trait_type: 'Created At',
            value: contribution.createdAt.toISOString(),
          },
        ],
        external_url: contribution.url || '',
        contribution_data: {
          id: contribution.id,
          githubId: contribution.githubId,
          type: contribution.type,
          contributor: contribution.contributor,
          repositoryId: contribution.repositoryId,
          createdAt: contribution.createdAt,
          url: contribution.url,
        },
      };

      // 上传到 IPFS
      const response = await fetch(`${config.ipfs.apiUrl}/api/v0/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(metadata),
      });

      if (!response.ok) {
        throw new Error(`IPFS upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      const ipfsHash = result.Hash;

      return `ipfs://${ipfsHash}`;
    } catch (error) {
      console.error('Failed to upload metadata to IPFS:', error);
      throw error;
    }
  }

  // 获取 Gas 价格
  static async getGasPrice(): Promise<bigint> {
    await this.ensureInitialized();

    if (!this.provider) {
      throw new Error('Provider not initialized');
    }

    try {
      const gasPrice = await this.provider.getFeeData();
      return gasPrice.gasPrice || BigInt(0);
    } catch (error) {
      console.error('Failed to get gas price:', error);
      throw error;
    }
  }

  // 获取钱包余额
  static async getWalletBalance(address?: string): Promise<string> {
    await this.ensureInitialized();

    if (!this.provider) {
      throw new Error('Provider not initialized');
    }

    try {
      const targetAddress = address || this.wallet?.address;
      if (!targetAddress) {
        throw new Error('No address provided and wallet not initialized');
      }

      const balance = await this.provider.getBalance(targetAddress);
      // return ethers.formatEther(balance);
      return balance.toString(); // Simplified for now
    } catch (error) {
      console.error('Failed to get wallet balance:', error);
      throw error;
    }
  }

  // 获取网络信息
  static async getNetworkInfo(): Promise<any> {
    await this.ensureInitialized();

    if (!this.provider) {
      throw new Error('Provider not initialized');
    }

    try {
      const network = await this.provider.getNetwork();
      const blockNumber = await this.provider.getBlockNumber();
      const gasPrice = await this.getGasPrice();

      return {
        chainId: network.chainId.toString(),
        name: network.name,
        blockNumber,
        gasPrice: gasPrice.toString(), // Simplified formatting
      };
    } catch (error) {
      console.error('Failed to get network info:', error);
      throw error;
    }
  }

  // 获取交易状态
  static async getTransactionStatus(txHash: string): Promise<any> {
    await this.ensureInitialized();

    if (!this.provider) {
      throw new Error('Provider not initialized');
    }

    try {
      const tx = await this.provider.getTransaction(txHash);
      const receipt = await this.provider.getTransactionReceipt(txHash);

      return {
        transaction: tx,
        receipt,
        status: receipt?.status === 1 ? 'success' : receipt?.status === 0 ? 'failed' : 'pending',
        confirmations: receipt?.confirmations || 0,
      };
    } catch (error) {
      console.error('Failed to get transaction status:', error);
      throw error;
    }
  }

  // 估算 Gas 费用
  static async estimateGas(to: string, data: string, value = '0'): Promise<bigint> {
    await this.ensureInitialized();

    if (!this.provider) {
      throw new Error('Provider not initialized');
    }

    try {
      const gasEstimate = await this.provider.estimateGas({
        to,
        data,
        value: value, // Simplified for now
      });

      return gasEstimate;
    } catch (error) {
      console.error('Failed to estimate gas:', error);
      throw error;
    }
  }

  // 获取合约信息
  static async getContractInfo(): Promise<any> {
    await this.ensureInitialized();

    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const config = getConfig();

      // 这里假设合约有一些标准方法
      const contractInfo = {
        address: config.blockchain.contractAddress,
        // 可以添加更多合约特定的信息
      };

      return contractInfo;
    } catch (error) {
      console.error('Failed to get contract info:', error);
      throw error;
    }
  }

  // 批量铸造贡献
  static async batchMintContributions(contributionIds: string[]): Promise<string[]> {
    const results: string[] = [];

    for (const contributionId of contributionIds) {
      try {
        const txHash = await this.mintContribution(contributionId);
        results.push(txHash);
      } catch (error) {
        console.error(`Failed to mint contribution ${contributionId}:`, error);
        // 继续处理其他贡献，不中断整个批处理
      }
    }

    return results;
  }

  // 验证 NFT 所有权
  static async verifyNFTOwnership(tokenId: string, ownerAddress: string): Promise<boolean> {
    await this.ensureInitialized();

    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const actualOwner = await this.contract.ownerOf(tokenId);
      return actualOwner.toLowerCase() === ownerAddress.toLowerCase();
    } catch (error) {
      console.error('Failed to verify NFT ownership:', error);
      return false;
    }
  }
}
