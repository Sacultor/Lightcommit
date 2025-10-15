import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository as TypeOrmRepository } from 'typeorm';
import { firstValueFrom } from 'rxjs';
import * as crypto from 'crypto';
import { Contribution, ContributionType } from '../contribution/entities/contribution.entity';
import { Repository } from '../contribution/entities/repository.entity';
import { User } from '../contribution/entities/user.entity';

@Injectable()
export class GithubService {
  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
    @InjectQueue('minting') private mintingQueue: Queue,
    @InjectRepository(Contribution)
    private contributionRepository: TypeOrmRepository<Contribution>,
    @InjectRepository(Repository)
    private repositoryRepository: TypeOrmRepository<Repository>,
    @InjectRepository(User)
    private userRepository: TypeOrmRepository<User>,
  ) {}

  verifyWebhookSignature(payload: string, signature: string): boolean {
    const secret = this.configService.get('github.webhookSecret');
    const hmac = crypto.createHmac('sha256', secret);
    const digest = 'sha256=' + hmac.update(payload).digest('hex');
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
  }

  async handleWebhook(event: string, payload: any) {
    switch (event) {
      case 'push':
        await this.handlePushEvent(payload);
        break;
      case 'pull_request':
        await this.handlePullRequestEvent(payload);
        break;
      default:
        console.log(`Unhandled event: ${event}`);
    }
  }

  private async handlePushEvent(payload: any) {
    const commits = payload.commits || [];
    const repository = payload.repository;

    for (const commit of commits) {
      const repo = await this.findOrCreateRepository(repository);
      const user = await this.findUserByGithubUsername(commit.author.username);

      if (!user) continue;

      const existingContribution = await this.contributionRepository.findOne({
        where: { githubId: commit.id },
      });

      if (existingContribution) continue;

      const contribution = this.contributionRepository.create({
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
      });

      await this.contributionRepository.save(contribution);
      await this.mintingQueue.add('mint-contribution', { contributionId: contribution.id });
    }
  }

  private async handlePullRequestEvent(payload: any) {
    if (payload.action !== 'closed' || !payload.pull_request.merged) {
      return;
    }

    const pr = payload.pull_request;
    const repository = payload.repository;
    const repo = await this.findOrCreateRepository(repository);
    const user = await this.findUserByGithubUsername(pr.user.login);

    if (!user) return;

    const existingContribution = await this.contributionRepository.findOne({
      where: { githubId: pr.id.toString() },
    });

    if (existingContribution) return;

    const contribution = this.contributionRepository.create({
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
    });

    await this.contributionRepository.save(contribution);
    await this.mintingQueue.add('mint-contribution', { contributionId: contribution.id });
  }

  private async findOrCreateRepository(repoData: any): Promise<Repository> {
    let repo = await this.repositoryRepository.findOne({
      where: { githubId: repoData.id.toString() },
    });

    if (!repo) {
      repo = this.repositoryRepository.create({
        githubId: repoData.id.toString(),
        name: repoData.name,
        fullName: repoData.full_name,
        description: repoData.description,
        url: repoData.html_url,
        isPrivate: repoData.private,
      });
      await this.repositoryRepository.save(repo);
    }

    return repo;
  }

  private async findUserByGithubUsername(username: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { username },
    });
  }

  async getCommitDetails(owner: string, repo: string, sha: string) {
    const url = `https://api.github.com/repos/${owner}/${repo}/commits/${sha}`;
    const response = await firstValueFrom(
      this.httpService.get(url, {
        headers: {
          Authorization: `token ${this.configService.get('github.clientSecret')}`,
          Accept: 'application/vnd.github.v3+json',
        },
      }),
    );
    return response.data;
  }
}

