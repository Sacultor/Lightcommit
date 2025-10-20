import { supabase } from '../supabase/client';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Supabase数据库服务类
 * 提供统一的数据库操作接口
 */
export class SupabaseService {
  private client: SupabaseClient;

  constructor() {
    this.client = supabase;
  }

  /**
   * 获取Supabase客户端
   */
  getClient(): SupabaseClient {
    return this.client;
  }

  /**
   * 执行原始SQL查询
   * @param query SQL查询语句
   * @param params 查询参数
   *
   * 注意：这需要在 Supabase 中创建 execute_sql RPC 函数
   * 创建方法：
   * CREATE OR REPLACE FUNCTION execute_sql(query text, params jsonb DEFAULT '[]'::jsonb)
   * RETURNS jsonb
   * LANGUAGE plpgsql
   * SECURITY DEFINER
   * AS $$
   * DECLARE
   *   result jsonb;
   * BEGIN
   *   EXECUTE query INTO result USING params;
   *   RETURN result;
   * END;
   * $$;
   */
  async query(query: string, params?: any[]): Promise<any> {
    try {
      // 使用 Supabase RPC 执行原始 SQL
      const { data, error } = await this.client.rpc('execute_sql', {
        query,
        params: params || [],
      });

      if (error) {
        console.error('SQL查询错误:', error);
        throw new Error(`SQL查询失败: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('执行SQL查询时出错:', error);
      throw error;
    }
  }

  /**
   * 从表中选择数据
   * @param table 表名
   * @param columns 要选择的列
   * @param conditions 查询条件
   */
  async select(table: string, columns = '*', conditions?: Record<string, any>) {
    try {
      let query = this.client.from(table).select(columns);

      if (conditions) {
        Object.entries(conditions).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`查询失败: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('执行SELECT查询时出错:', error);
      throw error;
    }
  }

  /**
   * 插入数据
   * @param table 表名
   * @param data 要插入的数据
   */
  async insert(table: string, data: Record<string, any> | Record<string, any>[]) {
    try {
      const { data: result, error } = await this.client
        .from(table)
        .insert(data)
        .select();

      if (error) {
        throw new Error(`插入失败: ${error.message}`);
      }

      return result;
    } catch (error) {
      console.error('执行INSERT操作时出错:', error);
      throw error;
    }
  }

  /**
   * 更新数据
   * @param table 表名
   * @param data 要更新的数据
   * @param conditions 更新条件
   */
  async update(table: string, data: Record<string, any>, conditions: Record<string, any>) {
    try {
      let query = this.client.from(table).update(data);

      Object.entries(conditions).forEach(([key, value]) => {
        query = query.eq(key, value);
      });

      const { data: result, error } = await query.select();

      if (error) {
        throw new Error(`更新失败: ${error.message}`);
      }

      return result;
    } catch (error) {
      console.error('执行UPDATE操作时出错:', error);
      throw error;
    }
  }

  /**
   * 删除数据
   * @param table 表名
   * @param conditions 删除条件
   */
  async delete(table: string, conditions: Record<string, any>) {
    try {
      let query = this.client.from(table).delete();

      Object.entries(conditions).forEach(([key, value]) => {
        query = query.eq(key, value);
      });

      const { data, error } = await query.select();

      if (error) {
        throw new Error(`删除失败: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('执行DELETE操作时出错:', error);
      throw error;
    }
  }

  /**
   * 测试数据库连接
   */
  async testConnection(): Promise<boolean> {
    try {
      const { error } = await this.client.auth.getSession();
      return !error;
    } catch {
      return false;
    }
  }

  /**
   * 健康检查
   */
  async healthCheck() {
    try {
      const { error } = await this.client.auth.getSession();
      return {
        status: error ? 'unhealthy' : 'healthy',
        error: error?.message,
      };
    } catch (err) {
      return {
        status: 'unhealthy',
        error: err instanceof Error ? err.message : 'Unknown error',
      };
    }
  }

  /**
   * 开始事务（Supabase不直接支持事务，但可以使用RPC函数）
   */
  async transaction(callback: (client: SupabaseClient) => Promise<any>) {
    try {
      // Supabase不直接支持事务，这里提供客户端给回调函数
      // 实际的事务逻辑需要在数据库层面通过存储过程实现
      return await callback(this.client);
    } catch (error) {
      console.error('事务执行失败:', error);
      throw error;
    }
  }
}

// 创建单例实例
let supabaseServiceInstance: SupabaseService | null = null;

/**
 * 获取Supabase服务实例
 */
export const getSupabaseService = (): SupabaseService => {
  if (!supabaseServiceInstance) {
    supabaseServiceInstance = new SupabaseService();
  }
  return supabaseServiceInstance;
};

/**
 * 获取Supabase客户端（快捷方式）
 */
export const getSupabaseDB = () => {
  return getSupabaseService().getClient();
};

export default SupabaseService;
