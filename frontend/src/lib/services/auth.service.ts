import { UserRepository } from '../database/repositories/user.repository';
import { User, CreateUserData, UpdateUserData } from '@/types/user';
import { JwtPayload, LoginResponse, GitHubUser } from '@/types/auth';
import { getConfig } from '../config';
import * as crypto from 'crypto';

// 扩展的 GitHub 用户信息，包含访问令牌
export interface GitHubUserWithToken extends GitHubUser {
  accessToken: string;
}

export class AuthService {
  // 验证 GitHub 用户并创建或更新用户记录
  static async validateGithubUser(profile: GitHubUserWithToken): Promise<User> {
    let user = await UserRepository.findByGithubId(profile.id);

    if (!user) {
      const userData: CreateUserData = {
        githubId: profile.id,
        username: profile.login,
        email: profile.email,
        avatarUrl: profile.avatar_url,
      };
      user = await UserRepository.create(userData);
    } else {
      // 更新用户信息
      const updateData: UpdateUserData = {
        email: profile.email || user.email,
        avatarUrl: profile.avatar_url || user.avatarUrl,
      };
      await UserRepository.update(user.id, updateData);
      // 重新获取更新后的用户信息
      user = await UserRepository.findById(user.id);
    }

    return user!;
  }

  // 生成 JWT Token
  static generateJwt(user: User): string {
    const config = getConfig();
    const secret = config.jwt.secret || 'default-secret';
    const payload: JwtPayload = {
      sub: user.id,
      username: user.username,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours
    };

    // 在实际应用中，这里应该使用 JWT 库来签名
    // 这里简化处理，实际应该使用 jsonwebtoken 库
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const payloadStr = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const signature = this.createSignature(`${header}.${payloadStr}`, secret);

    return `${header}.${payloadStr}.${signature}`;
  }

  // 验证 JWT Token
  static verifyJwt(token: string): JwtPayload | null {
    try {
      const config = getConfig();
      const secret = config.jwt.secret || 'default-secret';
      const [header, payload, signature] = token.split('.');

      // 验证签名
      const expectedSignature = this.createSignature(`${header}.${payload}`, secret);
      if (signature !== expectedSignature) {
        return null;
      }

      const decodedPayload = JSON.parse(Buffer.from(payload, 'base64url').toString());

      // 检查过期时间
      if (decodedPayload.exp && decodedPayload.exp < Math.floor(Date.now() / 1000)) {
        return null;
      }

      return decodedPayload as JwtPayload;
    } catch {
      return null;
    }
  }

  // 用户登录
  static async login(user: User): Promise<LoginResponse> {
    const token = this.generateJwt(user);
    return {
      accessToken: token,
      user,
    };
  }

  // 从 token 获取用户信息
  static async getUserFromToken(token: string): Promise<User | null> {
    const payload = this.verifyJwt(token);
    if (!payload) {
      return null;
    }

    return UserRepository.findById(payload.sub);
  }

  // 创建简单的 HMAC 签名（实际应用中应使用专业的 JWT 库）
  private static createSignature(data: string, secret: string): string {
    // 这里简化处理，实际应该使用 crypto 模块的 HMAC
    // 在浏览器环境中可能需要使用 Web Crypto API
    return crypto.createHmac('sha256', secret).update(data).digest('base64url');
  }

  // GitHub OAuth 相关方法
  static getGitHubAuthUrl(): string {
    const config = getConfig();
    const clientId = config.github.clientId || '';
    const callbackUrl = config.github.callbackUrl || '';

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: callbackUrl,
      scope: 'user:email,read:user',
      state: this.generateState(),
    });

    return `https://github.com/login/oauth/authorize?${params.toString()}`;
  }

  // 生成随机状态字符串
  private static generateState(): string {
    return Math.random().toString(36).substring(2, 15) +
           Math.random().toString(36).substring(2, 15);
  }

  // 验证状态参数（防止 CSRF 攻击）
  static verifyState(state: string): boolean {
    // 在实际应用中，应该将状态存储在 session 或 localStorage 中进行验证
    // 这里简化处理
    return Boolean(state && state.length > 10);
  }

  // 使用授权码获取访问令牌
  static async exchangeCodeForToken(code: string): Promise<string> {
    const config = getConfig();
    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: config.github.clientId,
        client_secret: config.github.clientSecret,
        code,
      }),
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(`GitHub OAuth error: ${data.error_description}`);
    }

    return data.access_token;
  }

  // 使用访问令牌获取用户信息
  static async getGitHubUser(accessToken: string): Promise<GitHubUserWithToken> {
    const response = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `token ${accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch GitHub user');
    }

    const userData = await response.json();

    return {
      id: userData.id.toString(),
      login: userData.login,
      email: userData.email,
      avatar_url: userData.avatar_url,
      name: userData.name,
      accessToken,
    };
  }
}
