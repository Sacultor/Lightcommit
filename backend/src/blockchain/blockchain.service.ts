import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ethers } from 'ethers';
import { Contribution, ContributionStatus } from '../contribution/entities/contribution.entity';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class BlockchainService {
  private readonly logger = new Logger(BlockchainService.name);
  private provider: ethers.JsonRpcProvider;
  private wallet: ethers.Wallet;
  private contract: ethers.Contract;

  constructor(
    private configService: ConfigService,
    @InjectRepository(Contribution)
    private contributionRepository: Repository<Contribution>,
  ) {
    this.initializeBlockchain();
  }

  private initializeBlockchain() {
    const rpcUrl = this.configService.get('blockchain.rpcUrl');
    const privateKey = this.configService.get('blockchain.privateKey');
    const contractAddress = this.configService.get('blockchain.contractAddress');

    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.wallet = new ethers.Wallet(privateKey, this.provider);

    const contractArtifactPath = path.join(
      process.cwd(),
      '../hardhat/artifacts/contracts/Counter.sol/Counter.json',
    );

    if (fs.existsSync(contractArtifactPath)) {
      const contractArtifact = JSON.parse(fs.readFileSync(contractArtifactPath, 'utf8'));
      this.contract = new ethers.Contract(contractAddress, contractArtifact.abi, this.wallet);
      this.logger.log('Blockchain initialized successfully');
    } else {
      this.logger.warn('Contract artifact not found. Please compile the contract first.');
    }
  }

  async mintContribution(contributionId: string): Promise<void> {
    try {
      const contribution = await this.contributionRepository.findOne({
        where: { id: contributionId },
        relations: ['user', 'repository'],
      });

      if (!contribution) {
        throw new Error(`Contribution ${contributionId} not found`);
      }

      if (contribution.status === ContributionStatus.MINTED) {
        this.logger.warn(`Contribution ${contributionId} already minted`);
        return;
      }

      contribution.status = ContributionStatus.MINTING;
      await this.contributionRepository.save(contribution);

      const metadataUri = await this.uploadMetadataToIPFS(contribution);

      const recipientAddress = contribution.user.walletAddress || this.wallet.address;
      const tokenId = Date.now();

      this.logger.log(`Minting NFT for contribution ${contributionId}`);
      
      const tx = await this.contract.mint(recipientAddress, tokenId, metadataUri);
      
      this.logger.log(`Transaction sent: ${tx.hash}`);
      const receipt = await tx.wait();
      this.logger.log(`Transaction confirmed: ${receipt.hash}`);

      contribution.status = ContributionStatus.MINTED;
      contribution.transactionHash = receipt.hash;
      contribution.tokenId = tokenId.toString();
      contribution.metadataUri = metadataUri;
      await this.contributionRepository.save(contribution);

      this.logger.log(`Successfully minted NFT for contribution ${contributionId}`);
    } catch (error) {
      this.logger.error(`Failed to mint contribution ${contributionId}:`, error);
      
      const contribution = await this.contributionRepository.findOne({
        where: { id: contributionId },
      });
      
      if (contribution) {
        contribution.status = ContributionStatus.FAILED;
        await this.contributionRepository.save(contribution);
      }
      
      throw error;
    }
  }

  private async uploadMetadataToIPFS(contribution: Contribution): Promise<string> {
    const metadata = {
      name: `${contribution.type} - ${contribution.title}`,
      description: contribution.description || `A ${contribution.type} contribution`,
      image: 'https://placeholder.com/contribution.png',
      attributes: [
        {
          trait_type: 'Type',
          value: contribution.type,
        },
        {
          trait_type: 'Repository',
          value: contribution.repository?.fullName || 'Unknown',
        },
        {
          trait_type: 'Contributor',
          value: contribution.contributor,
        },
        {
          trait_type: 'GitHub URL',
          value: contribution.url,
        },
      ],
      external_url: contribution.url,
    };

    const ipfsApiUrl = this.configService.get('ipfs.apiUrl');
    const apiKey = this.configService.get('ipfs.apiKey');

    if (!ipfsApiUrl || !apiKey) {
      this.logger.warn('IPFS not configured, using mock URI');
      return `ipfs://mock/${contribution.id}`;
    }

    return `ipfs://mock/${contribution.id}`;
  }

  async getGasPrice(): Promise<bigint> {
    const feeData = await this.provider.getFeeData();
    return feeData.gasPrice;
  }

  async getWalletBalance(): Promise<string> {
    const balance = await this.provider.getBalance(this.wallet.address);
    return ethers.formatEther(balance);
  }
}

