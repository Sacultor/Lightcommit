import { getSupabaseService, getSupabaseDB } from './supabase';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * 数据库查询结果接口
 * 兼容 pg 的 QueryResult 格式，便于迁移
 */
export interface QueryResult<T = any> {
  rows: T[];
  rowCount: number;
  command: string;
  oid: number;
  fields: any[];
}

/**
 * 执行数据库查询
 * 统一的查询接口，使用 Supabase 客户端
 */
export const query = async <T = any>(text: string, params?: unknown[]): Promise<QueryResult<T>> => {
  const start = Date.now();

  try {
    const supabaseService = getSupabaseService();
    const result = await supabaseService.query(text, params);

    // 转换为标准 QueryResult 格式
    const res: QueryResult<T> = {
      rows: Array.isArray(result) ? result : (result ? [result] : []),
      rowCount: Array.isArray(result) ? result.length : (result ? 1 : 0),
      command: text.trim().split(' ')[0].toUpperCase(),
      oid: 0,
      fields: [],
    };

    const duration = Date.now() - start;

    if (process.env.NODE_ENV === 'development') {
      console.log('Executed query', {
        text: text.substring(0, 100), // 只显示前100个字符
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
 * 注意：Supabase 通过 RPC 函数支持事务
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
 */
export const healthCheck = async (): Promise<boolean> => {
  try {
    console.log('🔍 开始数据库健康检查...');
    console.log('连接方式: Supabase');

    const supabaseService = getSupabaseService();
    const healthResult = await supabaseService.healthCheck();

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
 */
export const getDatabaseClient = () => {
  return getSupabaseDB();
};

/**
 * 获取 Supabase 数据库服务
 */
export const getDatabaseService = () => {
  return getSupabaseService();
};

/**
 * 获取当前连接类型
 */
export const getConnectionType = () => 'supabase';
