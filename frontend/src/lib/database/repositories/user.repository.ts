import { query } from '@/lib/database/index';
import { User, CreateUserData, UpdateUserData } from '@/types/user';

export class UserRepository {
  // 根据 ID 查找用户
  static async findById(id: string): Promise<User | null> {
    const result = await query(
      'SELECT * FROM users WHERE id = $1',
      [id],
    );

    return result.rows.length > 0 ? this.mapRowToUser(result.rows[0]) : null;
  }

  // 根据 GitHub ID 查找用户
  static async findByGithubId(githubId: string): Promise<User | null> {
    const result = await query(
      'SELECT * FROM users WHERE "githubId" = $1',
      [githubId],
    );

    return result.rows.length > 0 ? this.mapRowToUser(result.rows[0]) : null;
  }

  // 根据用户名查找用户
  static async findByUsername(username: string): Promise<User | null> {
    const result = await query(
      'SELECT * FROM users WHERE username = $1',
      [username],
    );

    return result.rows.length > 0 ? this.mapRowToUser(result.rows[0]) : null;
  }

  // 创建用户
  static async create(userData: CreateUserData): Promise<User> {
    const result = await query(
      `INSERT INTO users ("githubId", username, email, "avatarUrl", "accessToken", "walletAddress", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
       RETURNING *`,
      [
        userData.githubId,
        userData.username,
        userData.email,
        userData.avatarUrl,
        userData.accessToken,
        userData.walletAddress,
      ],
    );

    return this.mapRowToUser(result.rows[0]);
  }

  // 更新用户
  static async update(id: string, userData: UpdateUserData): Promise<User | null> {
    const setClause = [];
    const values = [];
    let paramIndex = 1;

    if (userData.username !== undefined) {
      setClause.push(`username = $${paramIndex++}`);
      values.push(userData.username);
    }
    if (userData.email !== undefined) {
      setClause.push(`email = $${paramIndex++}`);
      values.push(userData.email);
    }
    if (userData.avatarUrl !== undefined) {
      setClause.push(`"avatarUrl" = $${paramIndex++}`);
      values.push(userData.avatarUrl);
    }
    if (userData.walletAddress !== undefined) {
      setClause.push(`"walletAddress" = $${paramIndex++}`);
      values.push(userData.walletAddress);
    }

    if (setClause.length === 0) {
      return this.findById(id);
    }

    setClause.push('"updatedAt" = NOW()');
    values.push(id);

    const result = await query(
      `UPDATE users SET ${setClause.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values,
    );

    return result.rows.length > 0 ? this.mapRowToUser(result.rows[0]) : null;
  }

  // 删除用户
  static async delete(id: string): Promise<boolean> {
    const result = await query(
      'DELETE FROM users WHERE id = $1',
      [id],
    );

    return (result.rowCount ?? 0) > 0;
  }

  // 获取所有用户
  static async findAll(limit = 50, offset = 0): Promise<User[]> {
    const result = await query(
      'SELECT * FROM users ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [limit, offset],
    );

    return result.rows.map(this.mapRowToUser);
  }

  // 将数据库行映射为 User 对象
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
