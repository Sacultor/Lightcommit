import { ReactNode } from 'react'

interface DashboardLayoutProps {
  children: ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen relative">
      {/* 背景图片容器 - 最底层 */}
      <div className="fixed inset-0 z-0">
        {/* 可选的覆盖层，增强可读性但保持背景可见 */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1)_0%,transparent_50%)] pointer-events-none" />
      </div>
      
      {/* 内容容器 - 在背景之上 */}
      <div className="relative z-10 min-h-screen">
        {/* Top Navigation - 改进导航栏布局为三栏式 */}
        <nav className="border-b border-gray-200/20 shadow-sm" style={{ backgroundColor: 'rgba(220, 220, 220, 0.3)', backdropFilter: 'blur(27.18px)' }}>
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
        <main className="relative">
          {children}
        </main>
      </div>
    </div>
  )
}