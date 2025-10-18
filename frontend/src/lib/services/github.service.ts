import { ContributionRepository } from '@/lib/database/repositories/contribution.repository';
import { UserRepository } from '@/lib/database/repositories/user.repository';
import { RepositoryRepository } from '@/lib/database/repositories/repository.repository';
import {
  CreateContributionData,
  ContributionType,
} from '@/types/contribution';
import { Repository, CreateRepositoryData } from '@/types/repository';
import { User } from '@/types/user';
import { GitHubWebhookEvent } from '@/types/api';
import {
  GitHubPushPayload,
  GitHubPullRequestPayload,
  GitHubApiRepository,
  GitHubApiCommit,
  GitHubApiContributor,
} from '@/types/github';
import { getConfig } from '../config';
import * as crypto from 'crypto';

export class GitHubService {
  // 验证 webhook 签名
  static verifyWebhookSignature(payload: string, signature: string): boolean {
    const config = getConfig();
    const secret = config.github.webhookSecret || '';

    const hmac = crypto.createHmac('sha256', secret);
    const digest = 'sha256=' + hmac.update(payload).digest('hex');

    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
  }

  // 处理 webhook 事件
  static async handleWebhook(event: string, payload: GitHubWebhookEvent): Promise<void> {
    switch (event) {
    case 'push':
      await this.handlePushEvent(payload as unknown as GitHubPushPayload);
      break;
    case 'pull_request':
      await this.handlePullRequestEvent(payload as unknown as GitHubPullRequestPayload);
      break;
    default:
      console.log(`Unhandled event: ${event}`);
    }
  }

  // 处理 push 事件
  private static async handlePushEvent(payload: GitHubPushPayload): Promise<void> {
    const commits = payload.commits || [];
    const repository = payload.repository;

    for (const commit of commits) {
      const repo = await this.findOrCreateRepository(repository);
      const user = await this.findUserByGithubUsername(commit.author.username);

      if (!user) continue;

      const existingContribution = await ContributionRepository.findByGithubId(commit.id);
      if (existingContribution) continue;

      const contributionData: CreateContributionData = {
        githubId: commit.id,
        type: ContributionType.COMMIT,
        userId: user.id,
        repositoryId: repo.id,
        contributor: commit.author.username,
        title: commit.message.split('\n')[0],
        description: commit.message,
        url: commit.url,
        metadata: {
          sha: commit.id,
          timestamp: commit.timestamp,
          additions: commit.added?.length || 0,
          deletions: commit.removed?.length || 0,
          modifications: commit.modified?.length || 0,
        },
      };

      const contribution = await ContributionRepository.create(contributionData);

      // 这里可以添加队列逻辑来处理 NFT 铸造
      console.log(`Created contribution ${contribution.id} for commit ${commit.id}`);
    }
  }

  // 处理 pull request 事件
  private static async handlePullRequestEvent(payload: GitHubPullRequestPayload): Promise<void> {
    if (payload.action !== 'closed' || !payload.pull_request.merged) {
      return;
    }

    const pr = payload.pull_request;
    const repository = payload.repository;
    const repo = await this.findOrCreateRepository(repository);
    const user = await this.findUserByGithubUsername(pr.user.login);

    if (!user) return;

    const existingContribution = await ContributionRepository.findByGithubId(pr.id.toString());
    if (existingContribution) return;

    const contributionData: CreateContributionData = {
      githubId: pr.id.toString(),
      type: ContributionType.PULL_REQUEST,
      userId: user.id,
      repositoryId: repo.id,
      contributor: pr.user.login,
      title: pr.title,
      description: pr.body,
      url: pr.html_url,
      metadata: {
        number: pr.number,
        merged_at: pr.merged_at,
        additions: pr.additions,
        deletions: pr.deletions,
        changed_files: pr.changed_files,
      },
    };

    const contribution = await ContributionRepository.create(contributionData);

    // 这里可以添加队列逻辑来处理 NFT 铸造
    console.log(`Created contribution ${contribution.id} for PR ${pr.number}`);
  }

  // 查找或创建仓库
  private static async findOrCreateRepository(repoData: GitHubApiRepository): Promise<Repository> {
    let repo = await RepositoryRepository.findByGithubId(repoData.id.toString());

    if (!repo) {
      const repositoryData: CreateRepositoryData = {
        githubId: repoData.id.toString(),
        name: repoData.name,
        fullName: repoData.full_name,
        description: repoData.description,
        url: repoData.html_url,
        isPrivate: repoData.private,
      };
      repo = await RepositoryRepository.create(repositoryData);
    }

    return repo;
  }

  // 根据 GitHub 用户名查找用户
  private static async findUserByGithubUsername(username: string): Promise<User | null> {
    return UserRepository.findByUsername(username);
  }

  // 获取提交详情
  static async getCommitDetails(owner: string, repo: string, sha: string): Promise<GitHubApiCommit> {
    const config = getConfig();
    const token = config.github.clientSecret || '';

    const url = `https://api.github.com/repos/${owner}/${repo}/commits/${sha}`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch commit details: ${response.statusText}`);
    }

    return response.json();
  }

  // 获取仓库信息
  static async getRepositoryInfo(owner: string, repo: string): Promise<GitHubApiRepository> {
    const config = getConfig();
    const token = config.github.clientSecret || '';

    const url = `https://api.github.com/repos/${owner}/${repo}`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch repository info: ${response.statusText}`);
    }

    return response.json();
  }

  // 获取用户的仓库列表
  static async getUserRepositories(username: string, accessToken?: string): Promise<GitHubApiRepository[]> {
    const config = getConfig();
    const token = accessToken || config.github.clientSecret || '';

    const url = `https://api.github.com/users/${username}/repos`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch user repositories: ${response.statusText}`);
    }

    return response.json();
  }

  // 获取仓库的贡献者列表
  static async getRepositoryContributors(owner: string, repo: string): Promise<GitHubApiContributor[]> {
    const config = getConfig();
    const token = config.github.clientSecret || '';

    const url = `https://api.github.com/repos/${owner}/${repo}/contributors`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch repository contributors: ${response.statusText}`);
    }

    return response.json();
  }

  // 获取仓库的提交历史
  static async getRepositoryCommits(
    owner: string,
    repo: string,
    options: { since?: string; until?: string; author?: string; page?: number; per_page?: number } = {},
  ): Promise<GitHubApiCommit[]> {
    const config = getConfig();
    const token = config.github.clientSecret || '';

    const params = new URLSearchParams();
    if (options.since) params.append('since', options.since);
    if (options.until) params.append('until', options.until);
    if (options.author) params.append('author', options.author);
    if (options.page) params.append('page', options.page.toString());
    if (options.per_page) params.append('per_page', options.per_page.toString());

    const url = `https://api.github.com/repos/${owner}/${repo}/commits?${params.toString()}`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch repository commits: ${response.statusText}`);
    }

    return response.json();
  }
}
