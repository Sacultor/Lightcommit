import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContributionController } from './contribution.controller';
import { ContributionService } from './contribution.service';
import { Contribution } from './entities/contribution.entity';
import { User } from './entities/user.entity';
import { Repository } from './entities/repository.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Contribution, User, Repository])],
  controllers: [ContributionController],
  providers: [ContributionService],
  exports: [ContributionService],
})
export class ContributionModule {}

