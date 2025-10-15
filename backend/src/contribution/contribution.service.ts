import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contribution } from './entities/contribution.entity';
import { QueryContributionDto } from './dto/query-contribution.dto';

@Injectable()
export class ContributionService {
  constructor(
    @InjectRepository(Contribution)
    private contributionRepository: Repository<Contribution>,
  ) {}

  async findAll(query: QueryContributionDto): Promise<Contribution[]> {
    const queryBuilder = this.contributionRepository
      .createQueryBuilder('contribution')
      .leftJoinAndSelect('contribution.user', 'user')
      .leftJoinAndSelect('contribution.repository', 'repository');

    if (query.type) {
      queryBuilder.andWhere('contribution.type = :type', { type: query.type });
    }

    if (query.status) {
      queryBuilder.andWhere('contribution.status = :status', { status: query.status });
    }

    if (query.userId) {
      queryBuilder.andWhere('contribution.userId = :userId', { userId: query.userId });
    }

    if (query.repositoryId) {
      queryBuilder.andWhere('contribution.repositoryId = :repositoryId', { 
        repositoryId: query.repositoryId 
      });
    }

    queryBuilder.orderBy('contribution.createdAt', 'DESC');

    return queryBuilder.getMany();
  }

  async findOne(id: string): Promise<Contribution> {
    return this.contributionRepository.findOne({
      where: { id },
      relations: ['user', 'repository'],
    });
  }

  async findByUser(userId: string): Promise<Contribution[]> {
    return this.contributionRepository.find({
      where: { userId },
      relations: ['repository'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByRepository(repositoryId: string): Promise<Contribution[]> {
    return this.contributionRepository.find({
      where: { repositoryId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async getStats(userId?: string) {
    const queryBuilder = this.contributionRepository.createQueryBuilder('contribution');

    if (userId) {
      queryBuilder.where('contribution.userId = :userId', { userId });
    }

    const total = await queryBuilder.getCount();

    const byType = await queryBuilder
      .select('contribution.type', 'type')
      .addSelect('COUNT(*)', 'count')
      .groupBy('contribution.type')
      .getRawMany();

    const byStatus = await queryBuilder
      .select('contribution.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('contribution.status')
      .getRawMany();

    return {
      total,
      byType,
      byStatus,
    };
  }
}

