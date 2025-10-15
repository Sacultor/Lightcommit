import { IsEnum, IsString, IsOptional, IsObject } from 'class-validator';
import { ContributionType } from '../entities/contribution.entity';

export class CreateContributionDto {
  @IsString()
  githubId: string;

  @IsEnum(ContributionType)
  type: ContributionType;

  @IsString()
  userId: string;

  @IsString()
  repositoryId: string;

  @IsString()
  contributor: string;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  url?: string;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}

