import { getDatabaseClient } from '@/lib/database/index';
import { User, CreateUserData, UpdateUserData } from '@/types/user';
import { AuthService } from '@/lib/services/auth.service';

/**
 * 用户数据仓库
 * 与 Supabase Auth 集成，用于管理扩展的用户信息
 */
export class UserRepository {
  /**
   * 根据 ID 查找用户
   * @param id Supabase Auth 用户 UUID
   */
  static async findById(id: string): Promise<User | null> {
    const supabase = getDatabaseClient();
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }

    return data ? this.mapRowToUser(data) : null;
  }

  /**
   * 根据 GitHub ID 查找用户
   */
  static async findByGithubId(githubId: string): Promise<User | null> {
    const supabase = getDatabaseClient();
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('githubId', githubId)
      .maybeSingle();

    if (error) throw error;

    return data ? this.mapRowToUser(data) : null;
  }

  /**
   * 根据用户名查找用户
   */
  static async findByUsername(username: string): Promise<User | null> {
    const supabase = getDatabaseClient();
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .maybeSingle();

    if (error) throw error;

    return data ? this.mapRowToUser(data) : null;
  }

  /**
   * 创建用户
   * 注意：使用 Supabase Auth 时，用户 ID 应该来自 auth.users
   */
  static async create(userData: CreateUserData): Promise<User> {
    const supabase = getDatabaseClient();
    
    // 如果没有提供 ID，从当前登录用户获取
    let userId = userData.id;
    if (!userId) {
      const { user } = await AuthService.getCurrentUser();
      if (!user) {
        throw new Error('未登录或无法获取用户信息');
      }
      userId = user.id;
    }

    const { data, error } = await supabase
      .from('users')
      .insert({
        id: userId,
        githubId: userData.githubId,
        username: userData.username,
        email: userData.email,
        avatarUrl: userData.avatarUrl,
        accessToken: userData.accessToken,
        walletAddress: userData.walletAddress,
      })
      .select()
      .single();

    if (error) throw error;

    return this.mapRowToUser(data);
  }

  /**
   * 更新用户信息
   */
  static async update(id: string, userData: UpdateUserData): Promise<User | null> {
    const supabase = getDatabaseClient();
    
    const updateData: any = {};
    if (userData.username !== undefined) updateData.username = userData.username;
    if (userData.email !== undefined) updateData.email = userData.email;
    if (userData.avatarUrl !== undefined) updateData.avatarUrl = userData.avatarUrl;
    if (userData.walletAddress !== undefined) updateData.walletAddress = userData.walletAddress;

    if (Object.keys(updateData).length === 0) {
      return this.findById(id);
    }

    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return data ? this.mapRowToUser(data) : null;
  }

  /**
   * 删除用户
   */
  static async delete(id: string): Promise<boolean> {
    const supabase = getDatabaseClient();
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    return !error;
  }

  /**
   * 获取所有用户
   */
  static async findAll(limit = 50, offset = 0): Promise<User[]> {
    const supabase = getDatabaseClient();
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('createdAt', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return data ? data.map(this.mapRowToUser) : [];
  }

  /**
   * 获取当前登录用户
   * 从 Supabase Auth 获取并同步到数据库
   */
  static async getCurrentUser(): Promise<User | null> {
    try {
      const { user: supabaseUser, error } = await AuthService.getCurrentUser();
      
      if (error || !supabaseUser) {
        return null;
      }

      // 尝试从数据库获取用户信息
      let user = await this.findById(supabaseUser.id);

      // 如果数据库中不存在，同步用户信息
      if (!user) {
        const syncedUser = await AuthService.mapSupabaseUserToAppUser(supabaseUser);
        user = syncedUser;
      }

      return user;
    } catch (error) {
      console.error('获取当前用户失败:', error);
      return null;
    }
  }

  /**
   * 更新当前用户的钱包地址
   */
  static async updateWalletAddress(walletAddress: string): Promise<User | null> {
    const { user: supabaseUser } = await AuthService.getCurrentUser();
    
    if (!supabaseUser) {
      throw new Error('用户未登录');
    }

    return this.update(supabaseUser.id, { walletAddress });
  }

  /**
   * 将数据库行映射为 User 对象
   */
  private static mapRowToUser(row: any): User {
    return {
      id: row.id,
      githubId: row.githubId,
      username: row.username,
      email: row.email,
      avatarUrl: row.avatarUrl,
      accessToken: row.accessToken,
      walletAddress: row.walletAddress,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
