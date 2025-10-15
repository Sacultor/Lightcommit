import { query, transaction } from '../index';
import { 
  Contribution, 
  CreateContributionData, 
  UpdateContributionData, 
  QueryContributionParams,
  ContributionType,
  ContributionStatus 
} from '../../../types/contribution';

export class ContributionRepository {
  // 根据 ID 查找贡献
  static async findById(id: string): Promise<Contribution | null> {
    const result = await query(
      `SELECT c.*, u.username, u.avatar_url, r.name as repo_name, r.full_name as repo_full_name
       FROM contributions c
       LEFT JOIN users u ON c.user_id = u.id
       LEFT JOIN repositories r ON c.repository_id = r.id
       WHERE c.id = $1`,
      [id]
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
      [githubId]
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
      values
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
      [userId, limit, offset]
    );
    
    return result.rows.map(this.mapRowToContribution);
  }

  // 创建贡献
  static async create(contributionData: CreateContributionData): Promise<Contribution> {
    const result = await query(
      `INSERT INTO contributions (
        github_id, type, user_id, repository_id, contributor, title, description, url, metadata, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
      RETURNING *`,
      [
        contributionData.githubId,
        contributionData.type,
        contributionData.userId,
        contributionData.repositoryId,
        contributionData.contributor,
        contributionData.title,
        contributionData.description,
        contributionData.url,
        JSON.stringify(contributionData.metadata || {}),
      ]
    );
    
    return this.mapRowToContribution(result.rows[0]);
  }

  // 更新贡献
  static async update(id: string, contributionData: UpdateContributionData): Promise<Contribution | null> {
    const setClause = [];
    const values = [];
    let paramIndex = 1;

    if (contributionData.status !== undefined) {
      setClause.push(`status = $${paramIndex++}`);
      values.push(contributionData.status);
    }
    if (contributionData.transactionHash !== undefined) {
      setClause.push(`transaction_hash = $${paramIndex++}`);
      values.push(contributionData.transactionHash);
    }
    if (contributionData.tokenId !== undefined) {
      setClause.push(`token_id = $${paramIndex++}`);
      values.push(contributionData.tokenId);
    }
    if (contributionData.metadataUri !== undefined) {
      setClause.push(`metadata_uri = $${paramIndex++}`);
      values.push(contributionData.metadataUri);
    }
    if (contributionData.metadata !== undefined) {
      setClause.push(`metadata = $${paramIndex++}`);
      values.push(JSON.stringify(contributionData.metadata));
    }

    if (setClause.length === 0) {
      return this.findById(id);
    }

    setClause.push(`updated_at = NOW()`);
    values.push(id);

    const result = await query(
      `UPDATE contributions SET ${setClause.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );
    
    return result.rows.length > 0 ? this.mapRowToContribution(result.rows[0]) : null;
  }

  // 获取统计信息
  static async getStats(userId?: string): Promise<any> {
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
      values
    );
    
    return result.rows[0];
  }

  // 将数据库行映射为 Contribution 对象
  private static mapRowToContribution(row: any): Contribution {
    return {
      id: row.id,
      githubId: row.github_id,
      type: row.type as ContributionType,
      user: row.username ? {
        id: row.user_id,
        githubId: row.user_github_id || '',
        username: row.username,
        avatarUrl: row.avatar_url,
      } : undefined,
      userId: row.user_id,
      repository: row.repo_name ? {
        id: row.repository_id,
        githubId: row.repository_github_id || '',
        name: row.repo_name,
        fullName: row.repo_full_name,
      } : undefined,
      repositoryId: row.repository_id,
      contributor: row.contributor,
      title: row.title,
      description: row.description,
      url: row.url,
      status: row.status as ContributionStatus,
      transactionHash: row.transaction_hash,
      tokenId: row.token_id,
      metadataUri: row.metadata_uri,
      metadata: row.metadata ? JSON.parse(row.metadata) : {},
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}