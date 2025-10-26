// Note: ethers will need to be installed as a dependency
// import { ethers } from 'ethers';
import { getConfig } from '@/lib/config';
import { ethers } from 'ethers';
import CommitNFT from '@/lib/contracts/CommitNFT.json';
import { ContributionRepository } from '@/lib/database/repositories/contribution.repository';
import { Contribution, ContributionStatus } from '@/types/contribution';
import {
  NetworkInfo,
  TransactionStatus,
  ContractInfo,
  EthersProvider,
  EthersWallet,
  EthersContract,
} from '@/types/blockchain';

export class BlockchainService {
  private static provider: EthersProvider | null = null;
  private static wallet: EthersWallet | null = null;
  private static contract: EthersContract | null = null;

  // 初始化区块链连接
  static async initializeBlockchain(): Promise<void> {
    try {
      const config = getConfig();

      if (!config.blockchain.rpcUrl) {
        throw new Error('RPC URL not configured');
      }

      // 初始化提供者
      this.provider = new ethers.JsonRpcProvider(config.blockchain.rpcUrl);

      // 初始化钱包
      if (config.blockchain.privateKey) {
        this.wallet = new ethers.Wallet(config.blockchain.privateKey, this.provider);
      }

      // 初始化合约
      if (config.blockchain.contractAddress) {
        this.contract = new ethers.Contract(
          config.blockchain.contractAddress,
          (CommitNFT as any).abi,
          this.wallet || this.provider,
        );
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
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }

      // 组装 CommitData（合约需求）
      const repoFullName = contribution.repository?.fullName || (contribution.metadata as any)?.repo || '';
      const commitHash = (contribution.metadata as any)?.sha || contribution.githubId;
      const linesAdded = (contribution.metadata as any)?.additions || 0;
      const linesDeleted = (contribution.metadata as any)?.deletions || 0;
      const merged = contribution.type === 'pull_request' ? true : !!(contribution.metadata as any)?.merged;
      const testsPass = !!(contribution.metadata as any)?.testsPass;
      const timestampSec = Math.floor(new Date(contribution.createdAt as any).getTime() / 1000);
      const author = contribution.contributor;
      const message = contribution.title || contribution.description || '';

      const commitData = {
        repo: repoFullName,
        commit: commitHash,
        linesAdded,
        linesDeleted,
        testsPass,
        timestamp: timestampSec,
        author,
        message,
        merged,
      };

      const toAddress = this.wallet?.address || author;

      const tx = await (this.contract as any).mintCommit(
        toAddress,
        commitData,
        metadataUri,
      );

      console.log('Minting transaction sent:', tx.hash);

      // 等待交易确认
      const receipt = await tx.wait();
      console.log('Minting transaction confirmed:', receipt.hash);

      // 从事件中解析 tokenId
      let tokenId: string | undefined;
      try {
        const event = receipt.logs.find((log: any) => {
          try {
            const parsed = (this.contract as any).interface.parseLog(log);
            return parsed?.name === 'CommitMinted';
          } catch {
            return false;
          }
        });
        if (event) {
          const parsed = (this.contract as any).interface.parseLog(event);
          tokenId = parsed?.args?.tokenId?.toString();
        }
      } catch {}

      // 更新贡献状态
      await ContributionRepository.update(contributionId, {
        status: ContributionStatus.MINTED,
        transactionHash: receipt.hash,
        tokenId,
        metadataUri,
      } as any);

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

      const metadata = {
        name: `Contribution #${contribution.id}`,
        description: contribution.description || `Contribution by ${contribution.contributor}`,
        image: '',
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

      // 使用 Web3.Storage（推荐）或 Pinata
      if (process.env.WEB3_STORAGE_TOKEN) {
        const body = JSON.stringify(metadata);
        const res = await fetch('https://api.web3.storage/upload', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.WEB3_STORAGE_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body,
        });
        if (!res.ok) throw new Error(`Web3.Storage upload failed: ${res.statusText}`);
        const json = await res.json();
        const cid = json.cid || json['cid'];
        return `ipfs://${cid}`;
      }

      // 退化为 Pinata JSON pin（需配置）
      if (config.ipfs.apiUrl && config.ipfs.apiKey) {
        const res = await fetch(`${config.ipfs.apiUrl}/pinJSONToIPFS`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            pinata_api_key: config.ipfs.apiKey,
            pinata_secret_api_key: config.ipfs.secretKey || '',
          } as any,
          body: JSON.stringify({ pinataContent: metadata }),
        });
        if (!res.ok) throw new Error(`Pinata upload failed: ${res.statusText}`);
        const json = await res.json();
        const ipfsHash = json.IpfsHash;
        return `ipfs://${ipfsHash}`;
      }

      throw new Error('No IPFS/Web3.Storage configuration provided');
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
  static async getNetworkInfo(): Promise<NetworkInfo> {
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
  static async getTransactionStatus(txHash: string): Promise<TransactionStatus> {
    await this.ensureInitialized();

    if (!this.provider) {
      throw new Error('Provider not initialized');
    }

    try {
      const tx = await this.provider.getTransaction(txHash);
      const receipt = await this.provider.getTransactionReceipt(txHash);

      if (!tx) {
        throw new Error('Transaction not found');
      }

      return {
        transaction: {
          hash: tx.hash,
          from: tx.from,
          to: tx.to || '',
          value: tx.value,
          gasLimit: tx.gasLimit,
          gasPrice: tx.gasPrice,
          nonce: tx.nonce,
          data: tx.data,
          blockNumber: tx.blockNumber,
          blockHash: tx.blockHash,
          transactionIndex: tx.transactionIndex,
        },
        receipt: receipt ? {
          transactionHash: receipt.transactionHash,
          transactionIndex: receipt.transactionIndex,
          blockHash: receipt.blockHash,
          blockNumber: receipt.blockNumber,
          from: receipt.from,
          to: receipt.to || '',
          gasUsed: receipt.gasUsed,
          cumulativeGasUsed: receipt.cumulativeGasUsed,
          status: receipt.status || 0,
          logs: receipt.logs,
        } : null,
        status: receipt?.status === 1 ? 'success' : receipt?.status === 0 ? 'failed' : 'pending',
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
  static async getContractInfo(): Promise<ContractInfo> {
    await this.ensureInitialized();

    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const config = getConfig();

      if (!config.blockchain.contractAddress) {
        throw new Error('Contract address not configured');
      }

      // 这里假设合约有一些标准方法
      const contractInfo: ContractInfo = {
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
      const actualOwner = await (this.contract.ownerOf as any)(tokenId);
      return actualOwner.toLowerCase() === ownerAddress.toLowerCase();
    } catch (error) {
      console.error('Failed to verify NFT ownership:', error);
      return false;
    }
  }
}
