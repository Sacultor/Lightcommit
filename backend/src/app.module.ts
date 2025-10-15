import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { GithubModule } from './github/github.module';
import { BlockchainModule } from './blockchain/blockchain.module';
import { ContributionModule } from './contribution/contribution.module';
import { QueueModule } from './queue/queue.module';
import { HealthModule } from './health/health.module';
import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    DatabaseModule,
    AuthModule,
    GithubModule,
    BlockchainModule,
    ContributionModule,
    QueueModule,
    HealthModule,
  ],
})
export class AppModule {}

