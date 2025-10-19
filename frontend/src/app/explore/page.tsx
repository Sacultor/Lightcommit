'use client';

import { HeaderSimple } from '@/components/header-simple';
import { FooterSimple } from '@/components/footer-simple';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const repositories = [
    {
      id: 1,
      name: 'lightcommit/frontend',
      commit: {
        message: 'feat: implement user authentication',
        hash: '7a8b9c2',
        author: 'Alice Wang',
        time: '2h ago',
        additions: 245,
        deletions: 67,
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

  const handleCardClick = () => {
    router.push('/mint/new?step=1');
  };

  return (
    <div className="min-h-screen bg-[#F5F1E8]">
      <HeaderSimple />
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-6 max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div
              className="relative p-8 md:p-12"
              style={{
                backgroundColor: '#F5F1E8',
              }}
            >
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  border: '8px solid black',
                  borderImage: 'url(/assets/border.png) 100 repeat',
                }}
              />

              <div className="relative mb-12">
                <div className="relative max-w-2xl">
                  <div className="relative">
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
                    <Search className="absolute right-5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-600 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {repositories.map((repo, index) => (
                  <motion.div
                    key={repo.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    whileHover={{ scale: 1.03, rotate: index % 2 === 0 ? 1 : -1 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCardClick}
                    className="aspect-square bg-[#F5F1E8] border-[3px] border-black rounded-[20px] cursor-pointer relative group transition-all"
                    style={{
                      borderStyle: 'solid',
                      boxShadow: '3px 3px 0px 0px rgba(0,0,0,0.8), 0 0 0 1px rgba(0,0,0,0.1) inset',
                    }}
                  >
                    <div className="absolute inset-0 rounded-[17px] overflow-hidden p-4 flex flex-col">
                      <div className="mb-3">
                        <h3 className="text-sm font-bold text-black mb-1 truncate">
                          {repo.name}
                        </h3>
                        <p className="text-xs text-gray-600 line-clamp-2">
                          {repo.commit.message}
                        </p>
                      </div>

                      <div className="flex-1" />

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-[10px] font-bold">
                            {repo.commit.author.split(' ')[0][0]}
                          </div>
                          <span className="font-medium">{repo.commit.author}</span>
                        </div>

                        <div className="flex items-center justify-between text-xs">
                          <span className="font-mono text-gray-500">#{repo.commit.hash}</span>
                          <span className="text-gray-500">{repo.commit.time}</span>
                        </div>

                        <div className="flex gap-3 text-xs font-mono">
                          <span className="text-green-600">+{repo.commit.additions}</span>
                          <span className="text-red-600">-{repo.commit.deletions}</span>
                        </div>
                      </div>
                    </div>

                    <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-[17px] pointer-events-none" />
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </main>
      <FooterSimple />
    </div>
  );
}

