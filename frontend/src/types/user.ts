// 简化的贡献类型，避免循环依赖
export interface UserContribution {
  id: string;
  githubId: string;
  type: string;
  title?: string;
  status: string;
  repositoryId: string;
}

export interface User {
  id: string;
  githubId: string;
  username: string;
  email?: string;
  avatarUrl?: string;
  accessToken?: string;
  walletAddress?: string;
  contributions?: UserContribution[];
  createdAt: Date;
  updatedAt: Date;
}

// 用于创建用户的数据类型
export interface CreateUserData {
  githubId: string;
  username: string;
  email?: string;
  avatarUrl?: string;
  accessToken?: string;
  walletAddress?: string;
}

// 用于更新用户的数据类型
export interface UpdateUserData {
  username?: string;
  email?: string;
  avatarUrl?: string;
  walletAddress?: string;
}