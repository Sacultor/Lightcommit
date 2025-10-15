import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlockchainService } from './blockchain.service';
import { Contribution } from '../contribution/entities/contribution.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Contribution])],
  providers: [BlockchainService],
  exports: [BlockchainService],
})
export class BlockchainModule {}

