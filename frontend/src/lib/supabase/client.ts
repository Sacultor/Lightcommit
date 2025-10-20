import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// 检查 Supabase 是否正确配置
const isSupabaseConfigured =
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes('placeholder') &&
  !supabaseAnonKey.includes('placeholder') &&
  supabaseUrl.startsWith('https://');

if (!isSupabaseConfigured) {
  console.warn('⚠️ Supabase 未正确配置，GitHub OAuth 功能将不可用');
  console.warn('请在 .env.local 中配置真实的 Supabase 环境变量：');
  console.warn('  NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co');
  console.warn('  NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key');
}

// 创建 Supabase 客户端实例（即使配置无效也创建，避免模块加载错误）
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  },
);

// 导出配置状态
export { isSupabaseConfigured };

// 导出默认客户端
export default supabase;
