import { createServerClient, type CookieOptions } from '@supabase/ssr'
import type { Database } from '@/types'

export function createClient(cookieStore?: any) {
  // 如果没有提供 cookieStore，返回一个基本的客户端
  if (!cookieStore) {
    const { createClient: createBasicClient } = require('@supabase/supabase-js')
    return createBasicClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

// 服务端专用函数，只在服务端环境中使用
export async function createServerOnlyClient() {
  if (typeof window !== 'undefined') {
    throw new Error('This function can only be used on the server side')
  }
  
  const { cookies } = await import('next/headers')
  const cookieStore = cookies()
  
  return createClient(cookieStore)
}
