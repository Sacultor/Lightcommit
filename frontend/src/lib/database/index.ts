/**
 * 数据库抽象层（Database Abstraction Layer）
 * 
 * 功能：
 * - 提供统一的数据库查询接口
 * - 封装 Supabase 客户端
 * - 支持原始 SQL 查询和事务
 * - 提供健康检查功能
 * 
 * 设计模式：
 * - Repository Pattern（数据仓库模式）
 * - 隔离数据库实现细节
 * - 便于未来迁移到其他数据库（PostgreSQL、MySQL 等）
 * 
 * 使用场景：
 * - Repository 类使用此接口查询数据库
 * - API 路由通过 Repository 访问数据
 * - 健康检查接口（/api/health）
 * 
 * 依赖：
 * - Supabase：PostgreSQL 数据库服务
 * - ./supabase：本地 Supabase 客户端封装
 * 
 * 注意：
 * - 现在使用 Supabase 作为数据库
 * - 认证部分已改用 JWT（不依赖 Supabase Auth）
 * - 仅用于数据存储（用户、贡献、仓库）
 */
import { getSupabaseService, getSupabaseClient } from './supabase';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * 数据库查询结果接口
 * 
 * 兼容 pg (node-postgres) 的 QueryResult 格式
 * 便于未来迁移到原生 PostgreSQL
 */
export interface QueryResult<T = any> {
  rows: T[];            // 查询结果行
  rowCount: number;     // 结果行数
  command: string;      // SQL 命令类型（SELECT/INSERT/UPDATE/DELETE）
  oid: number;          // 对象 ID（PostgreSQL 特有）
  fields: any[];        // 字段信息
}

/**
 * 执行数据库查询
 * 
 * 统一的查询接口，使用 Supabase 客户端
 * 
 * @param text - SQL 查询语句
 * @param params - 查询参数（占位符 $1, $2, ...）
 * @returns 查询结果（QueryResult 格式）
 * 
 * 使用示例：
 * ```typescript
 * const result = await query<User>(
 *   'SELECT * FROM users WHERE id = $1',
 *   [userId]
 * );
 * const users = result.rows;
 * ```
 */
export const query = async <T = any>(text: string, params?: unknown[]): Promise<QueryResult<T>> => {
  const start = Date.now();  // 记录开始时间（用于性能监控）

  try {
    // 1. 获取 Supabase 服务实例
    const supabaseService = getSupabaseService();
    
    // 2. 执行查询（内部会转换 $1, $2 为 Supabase 格式）
    const result = await supabaseService.query(text, params);

    // 3. 转换为标准 QueryResult 格式（兼容 pg）
    const res: QueryResult<T> = {
      rows: Array.isArray(result) ? result : (result ? [result] : []),
      rowCount: Array.isArray(result) ? result.length : (result ? 1 : 0),
      command: text.trim().split(' ')[0].toUpperCase(),  // 提取 SQL 命令类型
      oid: 0,
      fields: [],
    };

    // 4. 性能日志（仅开发环境）
    const duration = Date.now() - start;
    if (process.env.NODE_ENV === 'development') {
      console.log('Executed query', {
        text: text.substring(0, 100),  // 只显示前100个字符
        duration,
        rows: res.rowCount,
        connectionType: 'supabase',
      });
    }

    return res;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

/**
 * 在事务中执行多个查询
 * 
 * 注意：Supabase 通过 RPC 函数支持事务
 * 
 * @param callback - 事务回调函数
 * @returns 事务结果
 * 
 * 使用示例：
 * ```typescript
 * await transaction(async (client) => {
 *   await client.from('users').insert({ ... });
 *   await client.from('contributions').insert({ ... });
 * });
 * ```
 */
export const transaction = async <T>(callback: (client: SupabaseClient) => Promise<T>): Promise<T> => {
  const supabaseService = getSupabaseService();
  const client = supabaseService.getClient();

  try {
    // Supabase 事务通过客户端传递给回调函数
    // 实际的事务控制需要在数据库层面通过存储过程或多个操作的原子性来保证
    const result = await callback(client);
    return result;
  } catch (error) {
    console.error('Transaction error:', error);
    throw error;
  }
};

/**
 * 数据库健康检查
 * 
 * 用于 /api/health 接口，检查数据库连接状态
 * 
 * @returns true: 健康, false: 异常
 */
export const healthCheck = async (): Promise<boolean> => {
  try {
    console.log('🔍 开始数据库健康检查...');
    console.log('连接方式: Supabase');

    // 调用 Supabase 服务的健康检查方法
    const supabaseService = getSupabaseService();
    const healthResult = await supabaseService.healthCheck();

    // 检查结果
    if (healthResult.status === 'healthy') {
      console.log('✅ Supabase数据库健康检查成功');
      return true;
    } else {
      console.error('❌ Supabase数据库健康检查失败:', healthResult.error);
      return false;
    }
  } catch (error) {
    console.error('❌ 数据库健康检查失败:', error instanceof Error ? error.message : String(error));
    console.error('错误详情:', error);
    return false;
  }
};

/**
 * 获取 Supabase 数据库客户端
 * 
 * 返回 Supabase 客户端实例（用于读写操作）
 * 
 * @returns SupabaseClient 实例
 */
export const getDatabaseClient = () => {
  // 返回 Supabase 客户端实例
  return getSupabaseClient();
};

/**
 * 获取 Supabase 数据库服务
 * 
 * @returns Supabase 服务实例
 */
export const getDatabaseService = () => {
  return getSupabaseService();
};

/**
 * 获取当前连接类型
 * 
 * @returns 'supabase'
 */
export const getConnectionType = () => 'supabase';
