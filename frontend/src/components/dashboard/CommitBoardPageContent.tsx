'use client'

import { Search, Github } from 'lucide-react'

export default function CommitBoardPageContent() {
  // Empty commit cards to match Figma design layout
  const emptyCommits = Array(6).fill({});

  return (
    <div className="max-w-6xl mx-auto px-8 py-8 w-full">
      {/* Project Information Card - 与下方卡片网格保持相同边界 */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 mb-8 border border-gray-200/50 shadow-lg">
        {/* Breadcrumb - 居中对齐 */}
        <div className="text-sm text-gray-600 mb-4 text-center">
          Dashboard / your-awesome-project
        </div>
        
        {/* Project Title - 居中对齐 */}
        <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">
          your-awesome-project
        </h1>
        
        {/* Project Description - 居中对齐 */}
        <p className="text-gray-600 mb-8 text-center max-w-2xl mx-auto">
          some amazing ideas.....
        </p>
        
        {/* Search and Actions - 改进对称性和间距 */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-3xl mx-auto">
          <div className="relative flex-1 w-full max-w-md">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search your commits..."
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent shadow-sm transition-all duration-200"
            />
          </div>
          <button className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center space-x-2 shadow-sm whitespace-nowrap">
            <Github className="w-5 h-5" />
            <span>view on Github</span>
          </button>
        </div>
      </div>
      
      {/* Commit Cards Grid - 确保与上方卡片左右边界完全对齐 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {emptyCommits.map((commit, index) => (
          <div
            key={index}
            className="bg-white/70 backdrop-blur-sm rounded-xl p-8 border border-gray-200/50 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02] min-h-[140px] flex items-center justify-center"
          >
            {/* Empty card content to match Figma design layout */}
            <div className="text-gray-400 text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full mx-auto mb-3 flex items-center justify-center">
                <div className="w-6 h-6 bg-gray-300 rounded"></div>
              </div>
              <p className="text-sm">Commit placeholder</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}