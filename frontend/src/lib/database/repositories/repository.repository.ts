import { query } from '@/lib/database/index';
import { Repository, CreateRepositoryData, UpdateRepositoryData } from '@/types/repository';

export class RepositoryRepository {
  // 根据 ID 查找仓库
  static async findById(id: string): Promise<Repository | null> {
    const result = await query(
      'SELECT * FROM repositories WHERE id = $1',
      [id],
    );

    return result.rows.length > 0 ? this.mapRowToRepository(result.rows[0]) : null;
  }

  // 根据 GitHub ID 查找仓库
  static async findByGithubId(githubId: string): Promise<Repository | null> {
    const result = await query(
      'SELECT * FROM repositories WHERE github_id = $1',
      [githubId],
    );

    return result.rows.length > 0 ? this.mapRowToRepository(result.rows[0]) : null;
  }

  // 根据全名查找仓库
  static async findByFullName(fullName: string): Promise<Repository | null> {
    const result = await query(
      'SELECT * FROM repositories WHERE full_name = $1',
      [fullName],
    );

    return result.rows.length > 0 ? this.mapRowToRepository(result.rows[0]) : null;
  }

  // 创建仓库
  static async create(repositoryData: CreateRepositoryData): Promise<Repository> {
    const result = await query(
      `INSERT INTO repositories (github_id, name, full_name, description, url, is_private, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
       RETURNING *`,
      [
        repositoryData.githubId,
        repositoryData.name,
        repositoryData.fullName,
        repositoryData.description,
        repositoryData.url,
        repositoryData.isPrivate,
      ],
    );

    return this.mapRowToRepository(result.rows[0]);
  }

  // 更新仓库
  static async update(id: string, repositoryData: UpdateRepositoryData): Promise<Repository | null> {
    const setClause = [];
    const values = [];
    let paramIndex = 1;

    if (repositoryData.name !== undefined) {
      setClause.push(`name = $${paramIndex++}`);
      values.push(repositoryData.name);
    }
    if (repositoryData.fullName !== undefined) {
      setClause.push(`full_name = $${paramIndex++}`);
      values.push(repositoryData.fullName);
    }
    if (repositoryData.description !== undefined) {
      setClause.push(`description = $${paramIndex++}`);
      values.push(repositoryData.description);
    }
    if (repositoryData.url !== undefined) {
      setClause.push(`url = $${paramIndex++}`);
      values.push(repositoryData.url);
    }
    if (repositoryData.isPrivate !== undefined) {
      setClause.push(`is_private = $${paramIndex++}`);
      values.push(repositoryData.isPrivate);
    }

    if (setClause.length === 0) {
      return this.findById(id);
    }

    setClause.push('updated_at = NOW()');
    values.push(id);

    const result = await query(
      `UPDATE repositories SET ${setClause.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values,
    );

    return result.rows.length > 0 ? this.mapRowToRepository(result.rows[0]) : null;
  }

  // 删除仓库
  static async delete(id: string): Promise<boolean> {
    const result = await query(
      'DELETE FROM repositories WHERE id = $1',
      [id],
    );

    return result.rowCount > 0;
  }

  // 获取所有仓库
  static async findAll(limit = 50, offset = 0): Promise<Repository[]> {
    const result = await query(
      'SELECT * FROM repositories ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [limit, offset],
    );

    return result.rows.map(this.mapRowToRepository);
  }

  // 查找或创建仓库
  static async findOrCreate(repositoryData: CreateRepositoryData): Promise<Repository> {
    const existing = await this.findByGithubId(repositoryData.githubId);
    if (existing) {
      return existing;
    }
    return this.create(repositoryData);
  }

  // 将数据库行映射为 Repository 对象
  private static mapRowToRepository(row: any): Repository {
    return {
      id: row.id,
      githubId: row.github_id,
      name: row.name,
      fullName: row.full_name,
      description: row.description,
      url: row.url,
      isPrivate: row.is_private,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
