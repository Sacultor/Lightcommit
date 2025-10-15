import { Pool, PoolClient } from 'pg';
import { getDatabaseConfig } from '../config';

// 数据库连接池
let pool: Pool | null = null;

// 获取数据库连接池
export const getPool = (): Pool => {
  if (!pool) {
    const config = getDatabaseConfig();
    
    // 如果有 DATABASE_URL (Supabase)，优先使用
    if (config.url) {
      pool = new Pool({
        connectionString: config.url,
        ssl: { rejectUnauthorized: false },
      });
    } else {
      // 否则使用传统的连接配置
      pool = new Pool({
        host: config.host,
        port: config.port,
        user: config.username,
        password: config.password,
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
export const query = async (text: string, params?: unknown[]): Promise<any> => {
  const pool = getPool();
  const start = Date.now();
  
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Executed query', { text, duration, rows: res.rowCount });
    }
    
    return res;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

// 在事务中执行多个查询
export const transaction = async (callback: (client: PoolClient) => Promise<any>): Promise<any> => {
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
    const result = await query('SELECT 1 as health');
    return result.rows.length > 0;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
};