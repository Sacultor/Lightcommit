/**
 * Supabase 服务封装
 * 
 * 功能：
 * - 提供 Supabase 客户端实例
 * - 封装查询和健康检查方法
 * - 支持原始 SQL 查询
 * 
 * 使用场景：
 * - database/index.ts 使用此服务执行查询
 * - 提供统一的数据库访问接口
 */

import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Supabase 服务类
 */
class SupabaseService {
  private client: SupabaseClient;

  constructor() {
    // 获取 Supabase 配置
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

    if (!url || !anonKey) {
      console.warn('⚠️ Supabase 配置缺失，某些功能可能无法使用');
    }

    // 创建 Supabase 客户端
    this.client = createClient(url, anonKey);
  }

  /**
   * 获取 Supabase 客户端
   */
  getClient(): SupabaseClient {
    return this.client;
  }

  /**
   * 执行原始 SQL 查询
   * 
   * 注意：Supabase 使用 rpc 函数执行原始 SQL
   * 需要在数据库中创建相应的 RPC 函数
   * 
   * @param text - SQL 查询语句
   * @param params - 查询参数
   */
  async query(text: string, params?: unknown[]): Promise<any> {
    // 提取 SQL 命令类型
    const command = text.trim().split(' ')[0].toUpperCase();

    try {
      // 根据命令类型执行不同的操作
      if (command === 'SELECT') {
        // SELECT 查询：解析表名和条件
        return await this.executeSelect(text, params);
      } else if (command === 'INSERT') {
        return await this.executeInsert(text, params);
      } else if (command === 'UPDATE') {
        return await this.executeUpdate(text, params);
      } else if (command === 'DELETE') {
        return await this.executeDelete(text, params);
      } else {
        // 其他 SQL 命令使用 RPC（需要数据库支持）
        return await this.executeRpc(text, params);
      }
    } catch (error) {
      console.error('Supabase query error:', error);
      throw error;
    }
  }

  /**
   * 执行 SELECT 查询
   */
  private async executeSelect(text: string, _params?: unknown[]): Promise<any> {
    // 简单实现：使用 Supabase 查询构建器
    // 实际项目中可能需要更复杂的 SQL 解析
    
    // 提取表名（简化版本）
    const match = text.match(/FROM\s+(\w+)/i);
    const tableName = match ? match[1] : '';

    if (!tableName) {
      throw new Error('无法解析表名');
    }

    // 执行查询
    const { data, error } = await this.client
      .from(tableName)
      .select('*');

    if (error) throw error;
    return data;
  }

  /**
   * 执行 INSERT 查询
   */
  private async executeInsert(_text: string, _params?: unknown[]): Promise<any> {
    // 简化实现
    throw new Error('请使用 Supabase 客户端的 insert() 方法');
  }

  /**
   * 执行 UPDATE 查询
   */
  private async executeUpdate(_text: string, _params?: unknown[]): Promise<any> {
    // 简化实现
    throw new Error('请使用 Supabase 客户端的 update() 方法');
  }

  /**
   * 执行 DELETE 查询
   */
  private async executeDelete(_text: string, _params?: unknown[]): Promise<any> {
    // 简化实现
    throw new Error('请使用 Supabase 客户端的 delete() 方法');
  }

  /**
   * 通过 RPC 执行原始 SQL
   * 
   * 需要在数据库中创建 execute_sql 函数
   */
  private async executeRpc(text: string, params?: unknown[]): Promise<any> {
    const { data, error } = await this.client
      .rpc('execute_sql', {
        query: text,
        params: params || [],
      });

    if (error) throw error;
    return data;
  }

  /**
   * 健康检查
   */
  async healthCheck(): Promise<{ status: 'healthy' | 'unhealthy'; error?: string }> {
    try {
      // 尝试执行一个简单的查询
      const { error } = await this.client
        .from('users')
        .select('id')
        .limit(1);

      if (error) {
        return {
          status: 'unhealthy',
          error: error.message,
        };
      }

      return { status: 'healthy' };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
}

// 单例实例
let supabaseServiceInstance: SupabaseService | null = null;

/**
 * 获取 Supabase 服务实例（单例模式）
 */
export function getSupabaseService(): SupabaseService {
  if (!supabaseServiceInstance) {
    supabaseServiceInstance = new SupabaseService();
  }
  return supabaseServiceInstance;
}

/**
 * 获取 Supabase 客户端（直接访问）
 */
export function getSupabaseClient(): SupabaseClient {
  return getSupabaseService().getClient();
}


