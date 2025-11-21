/**
 * 仓库数据仓库（Repository Repository）
 * 
 * 功能：
 * - 管理 repositories 表的所有数据操作
 * - 提供仓库 CRUD 接口
 * - 同步 GitHub 仓库信息到数据库
 * 
 * 数据表：repositories
 * 字段：
 * - id: UUID 主键
 * - github_id: GitHub 仓库 ID（唯一）
 * - name: 仓库名称
 * - full_name: 仓库全名（owner/repo）
 * - description: 描述
 * - url: GitHub URL
 * - is_private: 是否私有仓库
 * - created_at: 创建时间
 * - updated_at: 更新时间
 * 
 * 使用场景：
 * - GitHub Webhook 同步仓库信息
 * - 关联查询（贡献列表）
 * - 仓库统计
 * 
 * 设计模式：
 * - Repository Pattern（数据访问层）
 * - 封装 Supabase 客户端操作
 */
import { getDatabaseClient } from '@/lib/database/index';
import { Repository, CreateRepositoryData, UpdateRepositoryData } from '@/types/repository';

/**
 * 仓库数据仓库类
 * 
 * 提供所有与 repositories 表相关的数据操作
 */
export class RepositoryRepository {
  // 根据 ID 查找仓库
  static async findById(id: string): Promise<Repository | null> {
    const supabase = getDatabaseClient();
    const { data, error } = await supabase
      .from('repositories')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;

    return data ? this.mapRowToRepository(data) : null;
  }

  // 根据 GitHub ID 查找仓库
  static async findByGithubId(githubId: string): Promise<Repository | null> {
    const supabase = getDatabaseClient();
    const { data, error } = await supabase
      .from('repositories')
      .select('*')
      .eq('githubId', githubId)
      .maybeSingle();

    if (error) throw error;

    return data ? this.mapRowToRepository(data) : null;
  }

  // 根据全名查找仓库
  static async findByFullName(fullName: string): Promise<Repository | null> {
    const supabase = getDatabaseClient();
    const { data, error } = await supabase
      .from('repositories')
      .select('*')
      .eq('fullName', fullName)
      .maybeSingle();

    if (error) throw error;

    return data ? this.mapRowToRepository(data) : null;
  }

  // 创建仓库
  static async create(repositoryData: CreateRepositoryData): Promise<Repository> {
    const supabase = getDatabaseClient();
    const { data, error } = await supabase
      .from('repositories')
      .insert({
        githubId: repositoryData.githubId,
        name: repositoryData.name,
        fullName: repositoryData.fullName,
        description: repositoryData.description,
        url: repositoryData.url,
        isPrivate: repositoryData.isPrivate,
      })
      .select()
      .single();

    if (error) throw error;

    return this.mapRowToRepository(data);
  }

  // 更新仓库
  static async update(id: string, repositoryData: UpdateRepositoryData): Promise<Repository | null> {
    const supabase = getDatabaseClient();

    const updateData: any = {};
    if (repositoryData.name !== undefined) updateData.name = repositoryData.name;
    if (repositoryData.fullName !== undefined) updateData.fullName = repositoryData.fullName;
    if (repositoryData.description !== undefined) updateData.description = repositoryData.description;
    if (repositoryData.url !== undefined) updateData.url = repositoryData.url;
    if (repositoryData.isPrivate !== undefined) updateData.isPrivate = repositoryData.isPrivate;

    if (Object.keys(updateData).length === 0) {
      return this.findById(id);
    }

    const { data, error } = await supabase
      .from('repositories')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return data ? this.mapRowToRepository(data) : null;
  }

  // 删除仓库
  static async delete(id: string): Promise<boolean> {
    const supabase = getDatabaseClient();
    const { error } = await supabase
      .from('repositories')
      .delete()
      .eq('id', id);

    return !error;
  }

  // 获取所有仓库
  static async findAll(limit = 50, offset = 0): Promise<Repository[]> {
    const supabase = getDatabaseClient();
    const { data, error } = await supabase
      .from('repositories')
      .select('*')
      .order('createdAt', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return data ? data.map(this.mapRowToRepository) : [];
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
