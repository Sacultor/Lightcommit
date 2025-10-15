import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { BlockchainService } from '../blockchain/blockchain.service';

@Processor('minting')
export class QueueProcessor {
  private readonly logger = new Logger(QueueProcessor.name);

  constructor(private blockchainService: BlockchainService) {}

  @Process('mint-contribution')
  async handleMintContribution(job: Job) {
    const { contributionId } = job.data;
    this.logger.log(`Processing minting job for contribution: ${contributionId}`);

    try {
      await this.blockchainService.mintContribution(contributionId);
      this.logger.log(`Successfully processed minting job for contribution: ${contributionId}`);
    } catch (error) {
      this.logger.error(`Failed to process minting job for contribution: ${contributionId}`, error);
      throw error;
    }
  }
}

