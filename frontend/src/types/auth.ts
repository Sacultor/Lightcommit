import { User } from './user';

// JWT 载荷类型
export interface JwtPayload {
  sub: string; // 用户 ID
  username: string;
  iat?: number;
  exp?: number;
}

// 登录响应类型
export interface LoginResponse {
  accessToken: string;
  user: User;
}

// GitHub 用户信息类型
export interface GitHubUser {
  id: string;
  login: string;
  email?: string;
  avatar_url?: string;
  name?: string;
}

// 认证状态类型
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
}

// 认证错误类型
export interface AuthError {
  message: string;
  code?: string;
}