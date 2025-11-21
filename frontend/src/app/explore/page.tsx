/**
 * 探索页面
 * 
 * 路由：/explore
 * 功能：浏览和搜索 GitHub 仓库的最新 commits
 * 
 * 页面布局：
 * - Header：导航栏
 * - 搜索框：搜索仓库
 * - 仓库卡片网格：展示最新的 commit
 * - Footer：页脚
 * 
 * 状态：
 * - ⚠️ 当前使用 Mock 数据
 * - TODO: 集成真实的 GitHub API 数据
 * - TODO: 实现搜索功能
 * 
 * 使用场景：
 * - 浏览热门仓库的最新贡献
 * - 搜索特定仓库
 * - 点击卡片查看 commit 详情（跳转到 /mint/new）
 * 
 * 改进建议：
 * - 替换为真实的 GitHub API 数据
 * - 实现搜索过滤功能
 * - 添加分页或无限滚动
 * - 集成 /erc8004/contributions 功能（显示评分和上链状态）
 */
'use client';

import { HeaderSimple } from '@/components/layout/header';
import { FooterSimple } from '@/components/layout/footer';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ExplorePage() {
  // 搜索关键词状态
  const [searchQuery, setSearchQuery] = useState('');
  // Next.js 路由实例
  const router = useRouter();

  // Mock 仓库数据（TODO: 替换为真实的 GitHub API 数据）
  // 真实数据应该从 GitHub API 获取热门仓库的最新 commits
  const repositories = [
    {
      id: 1,
      name: 'lightcommit/frontend',
      commit: {
        message: 'feat: implement user authentication',
        hash: '7a8b9c2',
        author: 'Alice Wang',
        time: '2h ago',
        additions: 245,  // 新增行数
        deletions: 67,   // 删除行数
      },
    },
    {
      id: 2,
      name: 'lightcommit/backend',
      commit: {
        message: 'fix: resolve memory leak in queue',
        hash: '3f4e5d6',
        author: 'Bob Chen',
        time: '5h ago',
        additions: 89,
        deletions: 123,
      },
    },
    {
      id: 3,
      name: 'lightcommit/contracts',
      commit: {
        message: 'refactor: optimize gas usage',
        hash: '9e8d7c6',
        author: 'Charlie Li',
        time: '1d ago',
        additions: 156,
        deletions: 45,
      },
    },
    {
      id: 4,
      name: 'lightcommit/docs',
      commit: {
        message: 'docs: update API documentation',
        hash: '2b3c4d5',
        author: 'Diana Liu',
        time: '2d ago',
        additions: 378,
        deletions: 12,
      },
    },
    {
      id: 5,
      name: 'lightcommit/mobile',
      commit: {
        message: 'feat: add dark mode support',
        hash: '5a6b7c8',
        author: 'Eve Zhang',
        time: '3d ago',
        additions: 512,
        deletions: 234,
      },
    },
    {
      id: 6,
      name: 'lightcommit/analytics',
      commit: {
        message: 'perf: improve query performance',
        hash: '8d9e0f1',
        author: 'Frank Wu',
        time: '4d ago',
        additions: 67,
        deletions: 89,
      },
    },
  ];

  // 点击卡片的处理函数
  // TODO: 改为跳转到贡献详情页或 ERC-8004 验证页面
  const handleCardClick = () => {
    router.push('/mint/new?step=1');
  };

  return (
    <div className="min-h-screen bg-[#F5F1E8]">
      {/* 页面头部导航栏 */}
      <HeaderSimple />
      
      {/* 主内容区域 */}
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-6 max-w-7xl">
          {/* 整体容器动画（淡入 + 上移） */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            {/* 内容区域（带装饰边框） */}
            <div
              className="relative p-8 md:p-12"
              style={{
                backgroundColor: '#F5F1E8',
              }}
            >
              {/* 装饰边框（使用图片边框） */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  border: '8px solid black',
                  borderImage: 'url(/assets/border.png) 100 repeat',
                }}
              />

              {/* 搜索框区域 */}
              <div className="relative mb-12">
                <div className="relative max-w-2xl">
                  <div className="relative">
                    {/* 搜索输入框 */}
                    <input
                      type="text"
                      placeholder="Search your repositories..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-6 py-4 pr-14 text-lg bg-white border-[3px] border-black rounded-2xl focus:outline-none focus:ring-0 placeholder:text-gray-500 font-normal transition-all"
                      style={{
                        borderStyle: 'solid',
                        boxShadow: '3px 3px 0px 0px rgba(0,0,0,0.8)',
                      }}
                    />
                    {/* 搜索图标（装饰） */}
                    <Search className="absolute right-5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-600 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* 仓库卡片网格（响应式布局：1/2/3 列） */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {/* 遍历仓库数据，渲染卡片 */}
                {repositories.map((repo, index) => (
                  <motion.div
                    key={repo.id}
                    // 进入动画：淡入 + 缩放
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}  // 延迟动画（瀑布流效果）
                    // 悬停动画：放大 + 轻微旋转
                    whileHover={{ scale: 1.03, rotate: index % 2 === 0 ? 1 : -1 }}
                    // 点击动画：缩小
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCardClick}  // 点击跳转到 mint 页面
                    className="aspect-square bg-[#F5F1E8] border-[3px] border-black rounded-[20px] cursor-pointer relative group transition-all"
                    style={{
                      borderStyle: 'solid',
                      boxShadow: '3px 3px 0px 0px rgba(0,0,0,0.8), 0 0 0 1px rgba(0,0,0,0.1) inset',
                    }}
                  >
                    {/* 卡片内容区域 */}
                    <div className="absolute inset-0 rounded-[17px] overflow-hidden p-4 flex flex-col">
                      {/* 卡片顶部：仓库名和 commit 消息 */}
                      <div className="mb-3">
                        <h3 className="text-sm font-bold text-black mb-1 truncate">
                          {repo.name}
                        </h3>
                        <p className="text-xs text-gray-600 line-clamp-2">
                          {repo.commit.message}
                        </p>
                      </div>

                      {/* 占位符：将底部信息推到底部 */}
                      <div className="flex-1" />

                      {/* 卡片底部：作者、哈希、时间、代码变更 */}
                      <div className="space-y-2">
                        {/* 作者信息 */}
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          {/* 作者头像（首字母） */}
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-[10px] font-bold">
                            {repo.commit.author.split(' ')[0][0]}
                          </div>
                          <span className="font-medium">{repo.commit.author}</span>
                        </div>

                        {/* Commit 哈希和时间 */}
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-mono text-gray-500">#{repo.commit.hash}</span>
                          <span className="text-gray-500">{repo.commit.time}</span>
                        </div>

                        {/* 代码变更统计（+新增 / -删除） */}
                        <div className="flex gap-3 text-xs font-mono">
                          <span className="text-green-600">+{repo.commit.additions}</span>
                          <span className="text-red-600">-{repo.commit.deletions}</span>
                        </div>
                      </div>
                    </div>

                    {/* 悬停渐变遮罩（视觉效果） */}
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-[17px] pointer-events-none" />
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </main>
      
      {/* 页面底部 */}
      <FooterSimple />
    </div>
  );
}

