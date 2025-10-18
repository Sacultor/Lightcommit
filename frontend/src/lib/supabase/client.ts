import { createClient } from '@supabase/supabase-js';
import { getSupabaseConfig } from '../config';

// Supabase客户端实例
let supabaseClient: ReturnType<typeof createClient> | null = null;

/**
 * 获取Supabase客户端实例
 * 使用单例模式确保整个应用只有一个客户端实例
 */
export const getSupabaseClient = () => {
  if (!supabaseClient) {
    const config = getSupabaseConfig();
    
    const supabaseUrl = config.url || process.env.SUPABASE_URL;
    const supabaseAnonKey = config.anonKey || process.env.SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase URL 和 ANON KEY 必须在环境变量中配置');
    }
    
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      },
      db: {
        schema: 'public'
      },
      global: {
        headers: {
          'X-Client-Info': 'lightcommit-frontend'
        }
      }
    });
  }
  
  return supabaseClient;
};

/**
 * 获取Supabase数据库客户端
 * 用于直接数据库操作
 */
export const getSupabaseDB = () => {
  const client = getSupabaseClient();
  return client;
};

/**
 * 测试Supabase连接
 */
export const testSupabaseConnection = async () => {
  try {
    const client = getSupabaseClient();
    
    // 测试基本连接
    const { data, error } = await client
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .limit(1);
    
    if (error) {
      console.error('Supabase连接测试失败:', error);
      return false;
    }
    
    console.log('✅ Supabase连接测试成功');
    return true;
  } catch (error) {
    console.error('❌ Supabase连接测试异常:', error);
    return false;
  }
};

/**
 * 健康检查
 */
export const supabaseHealthCheck = async () => {
  try {
    const client = getSupabaseClient();
    
    // 使用简单的查询测试连接 - 查询当前时间
    const { data, error } = await client
      .from('pg_stat_activity')
      .select('now()')
      .limit(1);
    
    if (error) {
      // 如果pg_stat_activity不可用，尝试一个更基本的测试
      const { error: basicError } = await client.auth.getSession();
      
      if (basicError && basicError.message.includes('Invalid API key')) {
        return {
          status: 'unhealthy',
          error: 'Invalid Supabase API key'
        };
      }
      
      return {
        status: 'healthy',
        message: 'Supabase client connected (auth check passed)'
      };
    }
    
    return {
      status: 'healthy',
      message: 'Supabase database connection successful'
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

export default getSupabaseClient;