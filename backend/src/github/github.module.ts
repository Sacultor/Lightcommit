import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { GithubController } from './github.controller';
import { GithubService } from './github.service';
import { Contribution } from '../contribution/entities/contribution.entity';
import { Repository } from '../contribution/entities/repository.entity';
import { User } from '../contribution/entities/user.entity';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([Contribution, Repository, User]),
    BullModule.registerQueue({
      name: 'minting',
    }),
  ],
  controllers: [GithubController],
  providers: [GithubService],
  exports: [GithubService],
})
export class GithubModule {}

