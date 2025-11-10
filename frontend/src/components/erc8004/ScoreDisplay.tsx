'use client';

import { motion } from 'framer-motion';
import { Star, TrendingUp } from 'lucide-react';

interface ScoreBreakdown {
  convention: number;
  size: number;
  filesImpact: number;
  mergeSignal: number;
  metadataCompleteness: number;
}

interface ScoreDisplayProps {
  score: number;
  breakdown: ScoreBreakdown;
  threshold?: number;
}

export function ScoreDisplay({ score, breakdown, threshold = 80 }: ScoreDisplayProps) {
  const isEligible = score >= threshold;

  const dimensions = [
    { name: 'Commit Message', value: breakdown.convention, icon: '📝' },
    { name: '代码规模', value: breakdown.size, icon: '📊' },
    { name: '文件影响', value: breakdown.filesImpact, icon: '📁' },
    { name: '合并信号', value: breakdown.mergeSignal, icon: '🔀' },
    { name: '元数据完整性', value: breakdown.metadataCompleteness, icon: '📋' },
  ];

  const getScoreColor = (value: number) => {
    if (value >= 90) return 'bg-green-500';
    if (value >= 70) return 'bg-blue-500';
    if (value >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getScoreGrade = (value: number) => {
    if (value >= 90) return { grade: 'S', color: 'text-yellow-600', bg: 'bg-yellow-50' };
    if (value >= 80) return { grade: 'A', color: 'text-green-600', bg: 'bg-green-50' };
    if (value >= 70) return { grade: 'B', color: 'text-blue-600', bg: 'bg-blue-50' };
    if (value >= 60) return { grade: 'C', color: 'text-orange-600', bg: 'bg-orange-50' };
    return { grade: 'D', color: 'text-red-600', bg: 'bg-red-50' };
  };

  const scoreGrade = getScoreGrade(score);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white border-[3px] border-black rounded-2xl p-8"
      style={{ boxShadow: '4px 4px 0px 0px rgba(0,0,0,0.8)' }}
    >
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className={`w-20 h-20 rounded-2xl border-3 border-black flex items-center justify-center ${scoreGrade.bg}`}>
            <span className={`text-4xl font-black ${scoreGrade.color}`}>
              {scoreGrade.grade}
            </span>
          </div>
          <div>
            <h3 className="text-3xl font-black text-black">
              {score}<span className="text-gray-400">/100</span>
            </h3>
            <p className="text-sm text-gray-600">综合质量分</p>
          </div>
        </div>

        {isEligible ? (
          <div className="px-6 py-3 bg-green-500 text-white rounded-full font-bold flex items-center gap-2 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <Star className="w-5 h-5 fill-white" />
            达标可铸造
          </div>
        ) : (
          <div className="px-6 py-3 bg-gray-200 text-gray-600 rounded-full font-bold flex items-center gap-2 border-2 border-black">
            <TrendingUp className="w-5 h-5" />
            未达标 (需 ≥{threshold})
          </div>
        )}
      </div>

      <div className="h-px bg-black mb-6" />

      <h4 className="text-lg font-black text-black mb-4">评分明细</h4>

      <div className="space-y-4">
        {dimensions.map((dim, index) => (
          <motion.div
            key={dim.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 * index }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <span>{dim.icon}</span>
                {dim.name}
              </span>
              <span className="text-sm font-bold text-black">
                {dim.value}/100
              </span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden border-2 border-black">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${dim.value}%` }}
                transition={{ duration: 0.8, delay: 0.2 * index }}
                className={`h-full ${getScoreColor(dim.value)}`}
              />
            </div>
          </motion.div>
        ))}
      </div>

      {!isEligible && (
        <div className="mt-6 p-4 bg-yellow-50 border-2 border-yellow-400 rounded-xl">
          <p className="text-sm text-yellow-800">
            💡 提示：当前分数未达到铸造阈值（{threshold}分），继续优化你的贡献质量以获得链上凭证！
          </p>
        </div>
      )}
    </motion.div>
  );
}
