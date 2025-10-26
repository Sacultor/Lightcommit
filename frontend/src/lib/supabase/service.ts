import { createClient } from '@supabase/supabase-js';

// Server-side Supabase client using service role when available
const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!url || !key) {
  console.warn('Supabase service client missing URL or KEY. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env');
}

export const serviceSupabase = createClient(url || 'https://placeholder.supabase.co', key || 'placeholder-key', {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

export default serviceSupabase;

