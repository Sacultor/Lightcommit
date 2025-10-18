import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';
import { getConfig } from '../config';
import { getSupabaseService, getSupabaseDB } from './supabase';

// 数据库连接池
let pool: Pool | null = null;

// 数据库连接方式：'pg' 或 'supabase'
const DB_CONNECTION_TYPE = process.env.DB_CONNECTION_TYPE || 'supabase';

// 获取数据库连接池
export const getPool = (): Pool => {
  if (!pool) {
    const config = getConfig().database;

    // 如果有 DATABASE_URL (Supabase)，优先使用
    if (config.url) {
      pool = new Pool({
        connectionString: config.url,
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 10000,
        idleTimeoutMillis: 30000,
      });
    } else {
      // 否则使用传统的连接配置
      pool = new Pool({
        host: config.host,
        port: config.port,
        user: config.username ? String(config.username) : undefined,
        password: config.password ? String(config.password) : undefined,
        database: config.database,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      });
    }
  }
  return pool;
};

// 获取数据库客户端连接
export const getClient = async (): Promise<PoolClient> => {
  const pool = getPool();
  return await pool.connect();
};

// 执行查询
export const query = async <T extends QueryResultRow = QueryResultRow>(text: string, params?: unknown[]): Promise<QueryResult<T>> => {
  const start = Date.now();

  try {
    let res: QueryResult<T>;

    if (DB_CONNECTION_TYPE === 'supabase') {
      // 使用Supabase连接
      const supabaseService = getSupabaseService();
      const result = await supabaseService.query(text, params);
      
      // 转换为pg QueryResult格式
      res = {
        rows: Array.isArray(result) ? result : [result],
        rowCount: Array.isArray(result) ? result.length : (result ? 1 : 0),
        command: text.trim().split(' ')[0].toUpperCase(),
        oid: 0,
        fields: []
      } as QueryResult<T>;
    } else {
      // 使用传统pg连接
      const pool = getPool();
      res = await pool.query(text, params);
    }

    const duration = Date.now() - start;

    if (process.env.NODE_ENV === 'development') {
      console.log('Executed query', { 
        text, 
        duration, 
        rows: res.rowCount, 
        connectionType: DB_CONNECTION_TYPE 
      });
    }

    return res;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

// 在事务中执行多个查询
export const transaction = async <T>(callback: (client: PoolClient) => Promise<T>): Promise<T> => {
  const client = await getClient();

  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

// 关闭数据库连接池
export const closePool = async (): Promise<void> => {
  if (pool) {
    await pool.end();
    pool = null;
  }
};

// 数据库健康检查
export const healthCheck = async (): Promise<boolean> => {
  try {
    console.log('🔍 开始数据库健康检查...');
    console.log('连接方式:', DB_CONNECTION_TYPE);
    console.log('DATABASE_URL 存在:', !!process.env.DATABASE_URL);

    if (DB_CONNECTION_TYPE === 'supabase') {
      // 使用Supabase健康检查
      const supabaseService = getSupabaseService();
      const healthResult = await supabaseService.healthCheck();
      
      if (healthResult.status === 'healthy') {
        console.log('✅ Supabase数据库健康检查成功');
        return true;
      } else {
        console.error('❌ Supabase数据库健康检查失败:', healthResult.error);
        return false;
      }
    } else {
      // 使用传统pg健康检查
      const result = await query('SELECT 1 as health');
      console.log('✅ PostgreSQL数据库健康检查成功');
      return result.rows.length > 0;
    }
  } catch (error) {
    console.error('❌ 数据库健康检查失败:', error instanceof Error ? error.message : String(error));
    console.error('错误详情:', error);
    return false;
  }
};

// 导出Supabase相关函数（当使用Supabase时）
export const getDatabaseClient = () => {
  if (DB_CONNECTION_TYPE === 'supabase') {
    return getSupabaseDB();
  }
  throw new Error('当前未使用Supabase连接方式');
};

export const getDatabaseService = () => {
  if (DB_CONNECTION_TYPE === 'supabase') {
    return getSupabaseService();
  }
  throw new Error('当前未使用Supabase连接方式');
};

// 获取当前连接类型
export const getConnectionType = () => DB_CONNECTION_TYPE;
