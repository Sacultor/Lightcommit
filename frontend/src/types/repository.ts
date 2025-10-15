// 简化的贡献类型，避免循环依赖
export interface RepositoryContribution {
  id: string;
  githubId: string;
  type: string;
  contributor: string;
  title?: string;
  status: string;
}

export interface Repository {
  id: string;
  githubId: string;
  name: string;
  fullName: string;
  description?: string;
  url?: string;
  isPrivate: boolean;
  contributions?: RepositoryContribution[];
  createdAt: Date;
  updatedAt: Date;
}

// 用于创建仓库的数据类型
export interface CreateRepositoryData {
  githubId: string;
  name: string;
  fullName: string;
  description?: string;
  url?: string;
  isPrivate: boolean;
}

// 用于更新仓库的数据类型
export interface UpdateRepositoryData {
  name?: string;
  fullName?: string;
  description?: string;
  url?: string;
  isPrivate?: boolean;
}