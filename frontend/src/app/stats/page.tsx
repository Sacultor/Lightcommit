'use client';

import { HeaderSimple } from '@/components/header-simple';
import { FooterSimple } from '@/components/footer-simple';
import { motion } from 'framer-motion';
import { GitCommit, GitPullRequest, Users, Award } from 'lucide-react';

const mockStats = {
  totalContributions: 15234,
  totalCommits: 12589,
  totalPRs: 2645,
  mintedNFTs: 10128,
  activeUsers: 5234,
};

export default function StatsPage() {
  return (
    <div className="min-h-screen bg-[#F5F1E8]">
      <HeaderSimple />
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-center mb-16">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                平台统计
              </h1>
              <p className="text-xl text-gray-400">
                LightCommit 的实时数据概览
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
              {[
                {
                  icon: GitCommit,
                  label: '总 Commits',
                  value: mockStats.totalCommits.toLocaleString(),
                  color: 'purple',
                },
                {
                  icon: GitPullRequest,
                  label: '总 PRs',
                  value: mockStats.totalPRs.toLocaleString(),
                  color: 'pink',
                },
                {
                  icon: Award,
                  label: '已铸造 NFT',
                  value: mockStats.mintedNFTs.toLocaleString(),
                  color: 'yellow',
                },
                {
                  icon: Users,
                  label: '活跃用户',
                  value: mockStats.activeUsers.toLocaleString(),
                  color: 'green',
                },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 border border-gray-700 hover:border-purple-500/50 transition-all"
                >
                  <stat.icon className={`w-12 h-12 text-${stat.color}-400 mb-4`} />
                  <h3 className="text-gray-400 mb-2">{stat.label}</h3>
                  <p className="text-4xl font-bold text-white">{stat.value}</p>
                </motion.div>
              ))}
            </div>

            <div className="text-center text-gray-500">
              <p>统计数据每小时更新一次</p>
            </div>
          </motion.div>
        </div>
      </main>
      <FooterSimple />
    </div>
  );
}

