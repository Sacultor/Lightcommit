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
        // Get current user information
        const { user, error } = await AuthService.getUser()
        
        if (error) {
          console.error('Authentication callback error:', error)
          setStatus('error')
          setMessage('Authentication failed, please try again')
          setTimeout(() => router.push('/'), 3000)
          return
        }

        if (user) {
          // Sync user info to database (does not block login flow)
          AuthService.syncUserToDatabase(user).catch(syncError => {
            console.warn('⚠️ User info sync failed, but login successful:', syncError);
            // Can add retry logic or notify user here
          });

          setStatus('success');
          setMessage('Login successful! Redirecting...');
          
          // Redirect to dashboard
          setTimeout(() => router.push('/dashboard'), 1500);
        } else {
          setStatus('error')
          setMessage('User information not found')
          setTimeout(() => router.push('/'), 3000)
        }
      } catch (error) {
        console.error('Error processing authentication:', error)
        setStatus('error')
        setMessage('Error processing authentication')
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
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Processing login</h2>
              <p className="text-gray-500 text-sm">Please wait...</p>
            </>
          )}
          
          {status === 'success' && (
            <>
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4 animate-bounce">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">🎉 Login successful!</h2>
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
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Login failed</h2>
              <p className="text-red-600 font-medium mb-4">{message}</p>
              <p className="text-gray-500 text-sm">Returning to homepage...</p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
