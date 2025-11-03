import { getDatabaseClient, query } from '@/lib/database/index';
import {
  Contribution,
  CreateContributionData,
  UpdateContributionData,
  QueryContributionParams,
  ContributionType,
  ContributionStatus,
  ContributionStats,
} from '@/types/contribution';



// 数据库查询结果接口
interface DbContributionStats {
  total: string;
  minted: string;
  pending: string;
  minting: string;
  failed: string;
  commits: string;
  pull_requests: string;
  issues: string;
}

export class ContributionRepository {
  // 通用查询（基于 Supabase 客户端）
  static async findMany(params: { status?: string; eligibility?: string; whereScoreNull?: boolean; limit?: number } = {}) {
    const supabase = getDatabaseClient();
    let q = supabase.from('contributions').select('*');

    if (params.status) q = q.eq('status', params.status);
    if (params.eligibility) q = q.eq('eligibility', params.eligibility);
    if (params.whereScoreNull) q = q.is('score', null);
    if (params.limit) q = q.limit(params.limit);

    const { data, error } = await q;
    if (error) throw error;
    return (data || []).map(this.mapRowToContribution);
  }
  // 根据 ID 查找贡献
  static async findById(id: string): Promise<Contribution | null> {
    const result = await query(
      `SELECT c.*, u.username, u.avatar_url, r.name as repo_name, r.full_name as repo_full_name
       FROM contributions c
       LEFT JOIN users u ON c.user_id = u.id
       LEFT JOIN repositories r ON c.repository_id = r.id
       WHERE c.id = $1`,
      [id],
    );

    return result.rows.length > 0 ? this.mapRowToContribution(result.rows[0]) : null;
  }

  // 根据 GitHub ID 查找贡献
  static async findByGithubId(githubId: string): Promise<Contribution | null> {
    const result = await query(
      `SELECT c.*, u.username, u.avatar_url, r.name as repo_name, r.full_name as repo_full_name
       FROM contributions c
       LEFT JOIN users u ON c.user_id = u.id
       LEFT JOIN repositories r ON c.repository_id = r.id
       WHERE c.github_id = $1`,
      [githubId],
    );

    return result.rows.length > 0 ? this.mapRowToContribution(result.rows[0]) : null;
  }

  // 查询贡献列表
  static async findAll(params: QueryContributionParams = {}, limit = 50, offset = 0): Promise<Contribution[]> {
    let whereClause = '';
    const values: unknown[] = [];
    let paramIndex = 1;

    const conditions = [];

    if (params.type) {
      conditions.push(`c.type = $${paramIndex++}`);
      values.push(params.type);
    }

    if (params.status) {
      conditions.push(`c.status = $${paramIndex++}`);
      values.push(params.status);
    }

    if (params.userId) {
      conditions.push(`c.user_id = $${paramIndex++}`);
      values.push(params.userId);
    }

    if (params.repositoryId) {
      conditions.push(`c.repository_id = $${paramIndex++}`);
      values.push(params.repositoryId);
    }

    if (conditions.length > 0) {
      whereClause = `WHERE ${conditions.join(' AND ')}`;
    }

    values.push(limit, offset);

    const result = await query(
      `SELECT c.*, u.username, u.avatar_url, r.name as repo_name, r.full_name as repo_full_name
       FROM contributions c
       LEFT JOIN users u ON c.user_id = u.id
       LEFT JOIN repositories r ON c.repository_id = r.id
       ${whereClause}
       ORDER BY c.created_at DESC
       LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
      values,
    );

    return result.rows.map(this.mapRowToContribution);
  }

  // 根据用户 ID 查找贡献
  static async findByUserId(userId: string, limit = 50, offset = 0): Promise<Contribution[]> {
    const result = await query(
      `SELECT c.*, u.username, u.avatar_url, r.name as repo_name, r.full_name as repo_full_name
       FROM contributions c
       LEFT JOIN users u ON c.user_id = u.id
       LEFT JOIN repositories r ON c.repository_id = r.id
       WHERE c.user_id = $1
       ORDER BY c.created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset],
    );

    return result.rows.map(this.mapRowToContribution);
  }

  // 创建贡献
  static async create(contributionData: CreateContributionData): Promise<Contribution> {
    const supabase = getDatabaseClient();
    const { data, error } = await supabase
      .from('contributions')
      .insert({
        githubId: contributionData.githubId,
        type: contributionData.type,
        userId: contributionData.userId,
        repositoryId: contributionData.repositoryId,
        contributor: contributionData.contributor,
        title: contributionData.title,
        description: contributionData.description,
        url: contributionData.url,
        metadata: contributionData.metadata || {},
      })
      .select()
      .single();

    if (error) throw error;

    return this.mapRowToContribution(data);
  }

  // 更新贡献
  static async update(id: string, contributionData: UpdateContributionData): Promise<Contribution | null> {
    const supabase = getDatabaseClient();

    const updateData: any = {};
    if (contributionData.status !== undefined) updateData.status = contributionData.status;
    if (contributionData.transactionHash !== undefined) updateData.transactionHash = contributionData.transactionHash;
    if (contributionData.tokenId !== undefined) updateData.tokenId = contributionData.tokenId;
    if (contributionData.metadataUri !== undefined) updateData.metadataUri = contributionData.metadataUri;
    if (contributionData.metadata !== undefined) updateData.metadata = contributionData.metadata;
    if ((contributionData as any).score !== undefined) (updateData as any).score = (contributionData as any).score;
    if ((contributionData as any).scoreBreakdown !== undefined) (updateData as any).scoreBreakdown = (contributionData as any).scoreBreakdown;
    if ((contributionData as any).eligibility !== undefined) (updateData as any).eligibility = (contributionData as any).eligibility;
    if ((contributionData as any).aiVersion !== undefined) (updateData as any).aiVersion = (contributionData as any).aiVersion;

    if (Object.keys(updateData).length === 0) {
      return this.findById(id);
    }

    const { data, error } = await supabase
      .from('contributions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return data ? this.mapRowToContribution(data) : null;
  }

  // 获取统计信息
  static async getStats(userId?: string): Promise<ContributionStats> {
    let whereClause = '';
    const values: unknown[] = [];

    if (userId) {
      whereClause = 'WHERE user_id = $1';
      values.push(userId);
    }

    const result = await query(
      `SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'minted' THEN 1 END) as minted,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
        COUNT(CASE WHEN status = 'minting' THEN 1 END) as minting,
        COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed,
        COUNT(CASE WHEN type = 'commit' THEN 1 END) as commits,
        COUNT(CASE WHEN type = 'pull_request' THEN 1 END) as pull_requests,
        COUNT(CASE WHEN type = 'issue' THEN 1 END) as issues
       FROM contributions ${whereClause}`,
      values,
    );

    const dbStats = result.rows[0] as DbContributionStats;

    // 转换为正确的ContributionStats格式
    return {
      totalContributions: parseInt(dbStats.total),
      mintedContributions: parseInt(dbStats.minted),
      pendingContributions: parseInt(dbStats.pending),
      monthlyStats: [], // 这里需要额外的查询来获取月度统计
      typeDistribution: [
        { type: 'commit', count: parseInt(dbStats.commits) },
        { type: 'pull_request', count: parseInt(dbStats.pull_requests) },
        { type: 'issue', count: parseInt(dbStats.issues) },
      ],
      statusDistribution: [
        { status: 'minted', count: parseInt(dbStats.minted) },
        { status: 'pending', count: parseInt(dbStats.pending) },
        { status: 'minting', count: parseInt(dbStats.minting) },
        { status: 'failed', count: parseInt(dbStats.failed) },
      ],
    };
  }

  // 将数据库行映射为 Contribution 对象
  private static mapRowToContribution(row: any): Contribution {
    // 兼容 snake_case 与 camelCase 两种风格
    const get = (a: any, ...keys: string[]) => keys.reduce((v, k) => (v !== undefined ? v : (row as any)[k]), undefined);

    const metadataRaw = get(row, 'metadata', 'metadata');
    const metadata = typeof metadataRaw === 'string' ? JSON.parse(metadataRaw) : (metadataRaw || {});

    return {
      id: get(row, 'id') as string,
      githubId: (get(row, 'github_id', 'githubId') as string) || '',
      type: get(row, 'type') as ContributionType,
      user: get(row, 'username') ? {
        id: (get(row, 'user_id', 'userId') as string) || '',
        githubId: (get(row, 'user_github_id', 'userGithubId') as string) || '',
        username: get(row, 'username') as string,
        avatarUrl: (get(row, 'avatar_url', 'avatarUrl') as string) || undefined,
      } : undefined,
      userId: (get(row, 'user_id', 'userId') as string) || '',
      repository: get(row, 'repo_name') ? {
        id: (get(row, 'repository_id', 'repositoryId') as string) || '',
        githubId: (get(row, 'repository_github_id', 'repositoryGithubId') as string) || '',
        name: get(row, 'repo_name') as string,
        fullName: (get(row, 'repo_full_name', 'repoFullName') as string) || '',
        description: (get(row, 'repo_description') as string) || undefined,
        url: (get(row, 'repo_url') as string) || undefined,
      } : undefined,
      repositoryId: (get(row, 'repository_id', 'repositoryId') as string) || '',
      contributor: (get(row, 'contributor') as string) || '',
      title: (get(row, 'title') as string) || undefined,
      description: (get(row, 'description') as string) || undefined,
      url: (get(row, 'url') as string) || undefined,
      status: get(row, 'status') as ContributionStatus,
      transactionHash: (get(row, 'transaction_hash', 'transactionHash') as string) || undefined,
      tokenId: (get(row, 'token_id', 'tokenId') as string) || undefined,
      metadataUri: (get(row, 'metadata_uri', 'metadataUri') as string) || undefined,
      metadata,
      // scoring fields
      score: (get(row, 'score') as number) || undefined,
      scoreBreakdown: (get(row, 'scoreBreakdown') as any) || undefined,
      eligibility: (get(row, 'eligibility') as string) || undefined,
      aiVersion: (get(row, 'aiVersion') as string) || undefined,
      createdAt: (get(row, 'created_at', 'createdAt') as Date) as any,
      updatedAt: (get(row, 'updated_at', 'updatedAt') as Date) as any,
    };
  }
}
