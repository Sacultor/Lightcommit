'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AuthService } from '@/lib/services/auth.service'

export default function AuthCallback() {
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // 获取当前用户信息
        const { user, error } = await AuthService.getUser()
        
        if (error) {
          console.error('认证回调错误:', error)
          setStatus('error')
          setMessage('认证失败，请重试')
          setTimeout(() => router.push('/'), 3000)
          return
        }

        if (user) {
          // 同步用户信息到数据库（不阻止登录流程）
          AuthService.syncUserToDatabase(user).catch(syncError => {
            console.warn('⚠️ 用户信息同步失败，但登录成功:', syncError);
            // 可以在这里添加后续重试逻辑或通知用户
          });

          setStatus('success');
          setMessage('登录成功！正在跳转...');
          
          // 跳转到 dashboard
          setTimeout(() => router.push('/dashboard'), 1500);
        } else {
          setStatus('error')
          setMessage('未找到用户信息')
          setTimeout(() => router.push('/'), 3000)
        }
      } catch (error) {
        console.error('处理认证回调时出错:', error)
        setStatus('error')
        setMessage('处理认证时出错')
        setTimeout(() => router.push('/'), 3000)
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center max-w-md mx-auto px-6">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {status === 'loading' && (
            <>
              <div className="w-16 h-16 mx-auto mb-4">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600"></div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">处理登录中</h2>
              <p className="text-gray-500 text-sm">请稍候...</p>
            </>
          )}
          
          {status === 'success' && (
            <>
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4 animate-bounce">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">🎉 登录成功！</h2>
              <p className="text-green-600 font-medium mb-4">{message}</p>
            </>
          )}
          
          {status === 'error' && (
            <>
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">登录失败</h2>
              <p className="text-red-600 font-medium mb-4">{message}</p>
              <p className="text-gray-500 text-sm">正在返回首页...</p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
