export enum ContributionType {
  COMMIT = 'commit',
  PULL_REQUEST = 'pull_request',
  ISSUE = 'issue',
}

export enum ContributionStatus {
  PENDING = 'pending',
  MINTING = 'minting',
  MINTED = 'minted',
  FAILED = 'failed',
}

// 简化的用户类型，避免循环依赖
export interface ContributionUser {
  id: string;
  githubId: string;
  username: string;
  email?: string;
  avatarUrl?: string;
}

// 简化的仓库类型，避免循环依赖
export interface ContributionRepository {
  id: string;
  githubId: string;
  name: string;
  fullName: string;
  description?: string;
  url?: string;
}

export interface Contribution {
  id: string;
  githubId: string;
  type: ContributionType;
  user?: ContributionUser;
  userId: string;
  repository?: ContributionRepository;
  repositoryId: string;
  contributor: string;
  title?: string;
  description?: string;
  url?: string;
  status: ContributionStatus;
  transactionHash?: string;
  tokenId?: string;
  metadataUri?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

// 用于创建贡献的数据类型
export interface CreateContributionData {
  githubId: string;
  type: ContributionType;
  userId: string;
  repositoryId: string;
  contributor: string;
  title?: string;
  description?: string;
  url?: string;
  metadata?: Record<string, unknown>;
}

// 用于查询贡献的参数类型
export interface QueryContributionParams {
  type?: ContributionType;
  status?: ContributionStatus;
  userId?: string;
  repositoryId?: string;
}

// 用于更新贡献的数据类型
export interface UpdateContributionData {
  status?: ContributionStatus;
  transactionHash?: string;
  tokenId?: string;
  metadataUri?: string;
  metadata?: Record<string, unknown>;
}

// 统计相关的类型定义
export interface MonthlyStats {
  month: string;
  count: number;
}

export interface TypeDistribution {
  type: string;
  count: number;
}

export interface StatusDistribution {
  status: string;
  count: number;
}

export interface ContributorDistribution {
  contributor: string;
  count: number;
}

export interface TopContributor {
  contributor: string;
  totalContributions: number;
  mintedContributions: number;
  types: { [key in ContributionType]?: number };
}

export interface ContributionStats {
  totalContributions: number;
  mintedContributions: number;
  pendingContributions: number;
  monthlyStats: MonthlyStats[];
  typeDistribution: TypeDistribution[];
  statusDistribution: StatusDistribution[];
  contributorDistribution?: ContributorDistribution[];
  topContributors?: TopContributor[];
}

export interface ContributionTrends {
  dailyContributions: { date: string; count: number }[];
  totalContributions: number;
  averageDaily: number;
}
