import { ReactNode } from 'react'

interface DashboardLayoutProps {
  children: ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,0,0,0.05)_0%,transparent_50%)] pointer-events-none" />
      
      {/* Top Navigation - 改进导航栏布局为三栏式 */}
      <nav className="relative z-10 bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo - 左侧 */}
            <div className="flex items-center space-x-3 flex-1">
              <div className="w-10 h-10 bg-gradient-to-br from-black to-gray-800 rounded-xl flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-lg">L</span>
              </div>
              <span className="text-xl font-bold text-gray-900 tracking-tight">Lightcommit</span>
            </div>
            
            {/* Navigation Links - 中间居中 */}
            <div className="flex items-center justify-center flex-1">
              <div className="hidden md:flex items-center space-x-10">
                <a href="#" className="text-gray-900 font-semibold hover:text-gray-600 transition-colors duration-200 relative group">
                  Discover
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gray-900 transition-all duration-200 group-hover:w-full"></span>
                </a>
                <a href="#" className="text-gray-600 font-medium hover:text-gray-900 transition-colors duration-200 relative group">
                  Profiles
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gray-900 transition-all duration-200 group-hover:w-full"></span>
                </a>
                <a href="#" className="text-gray-600 font-medium hover:text-gray-900 transition-colors duration-200 relative group">
                  Docs
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gray-900 transition-all duration-200 group-hover:w-full"></span>
                </a>
              </div>
            </div>
            
            {/* Profile - 右侧 */}
            <div className="flex items-center justify-end space-x-4 flex-1">
              {/* 通知按钮 */}
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200 rounded-lg hover:bg-gray-100">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6a2 2 0 012 2v8a2 2 0 01-2 2H9a2 2 0 01-2-2V9a2 2 0 012-2z" />
                </svg>
              </button>
              
              {/* 用户头像 */}
              <div className="w-10 h-10 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full border-2 border-white shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer" />
            </div>
          </div>
        </div>
      </nav>
      
      {/* Main Content */}
      <main className="relative z-10">
        {children}
      </main>
    </div>
  )
}