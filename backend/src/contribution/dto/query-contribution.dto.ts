import { IsOptional, IsEnum, IsString } from 'class-validator';
import { ContributionType, ContributionStatus } from '../entities/contribution.entity';

export class QueryContributionDto {
  @IsOptional()
  @IsEnum(ContributionType)
  type?: ContributionType;

  @IsOptional()
  @IsEnum(ContributionStatus)
  status?: ContributionStatus;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  repositoryId?: string;
}

