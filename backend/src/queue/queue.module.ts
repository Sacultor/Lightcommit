import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigService } from '@nestjs/config';
import { QueueProcessor } from './queue.processor';
import { BlockchainModule } from '../blockchain/blockchain.module';

@Module({
  imports: [
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: configService.get('redis.host'),
          port: configService.get('redis.port'),
        },
      }),
    }),
    BullModule.registerQueue({
      name: 'minting',
    }),
    BlockchainModule,
  ],
  providers: [QueueProcessor],
  exports: [BullModule],
})
export class QueueModule {}

