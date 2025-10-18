import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';
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
    console.log('DATABASE_URL 存在:', !!process.env.DATABASE_URL);

    const result = await query('SELECT 1 as health');
    console.log('✅ 数据库健康检查成功');
    return result.rows.length > 0;
  } catch (error) {
    console.error('❌ 数据库健康检查失败:', error instanceof Error ? error.message : String(error));
    console.error('错误详情:', error);
    return false;
  }
};
