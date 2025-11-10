'use client';

import { Star, Award, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

interface ReputationBadgeProps {
  totalScore: number;
  feedbackCount: number;
  averageScore: number;
  size?: 'small' | 'large';
  animated?: boolean;
}

export function ReputationBadge({
  totalScore,
  feedbackCount,
  averageScore,
  size = 'small',
  animated = true,
}: ReputationBadgeProps) {
  const getLevel = (avg: number) => {
    if (avg >= 90) return { level: '传奇', color: '#FFD700', icon: '👑', bg: 'from-yellow-400 to-yellow-600' };
    if (avg >= 80) return { level: '大师', color: '#C0C0C0', icon: '💎', bg: 'from-purple-400 to-purple-600' };
    if (avg >= 70) return { level: '精英', color: '#CD7F32', icon: '⭐', bg: 'from-blue-400 to-blue-600' };
    if (avg >= 60) return { level: '新星', color: '#4A5568', icon: '🌟', bg: 'from-green-400 to-green-600' };
    return { level: '入门', color: '#A0AEC0', icon: '🔰', bg: 'from-gray-400 to-gray-600' };
  };

  const levelInfo = getLevel(averageScore);

  if (size === 'small') {
    return (
      <motion.div
        initial={animated ? { scale: 0 } : undefined}
        animate={animated ? { scale: 1 } : undefined}
        transition={{ duration: 0.3, type: 'spring' }}
        className="inline-flex items-center gap-2 px-3 py-1.5 bg-black text-white rounded-full text-sm font-bold border-2 border-black"
        style={{ boxShadow: '2px 2px 0px 0px rgba(0,0,0,0.5)' }}
      >
        <span>{levelInfo.icon}</span>
        <span>{averageScore}</span>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={animated ? { opacity: 0, y: 20 } : undefined}
      animate={animated ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.6 }}
      className="bg-white border-[3px] border-black rounded-2xl p-6"
      style={{ boxShadow: '4px 4px 0px 0px rgba(0,0,0,0.8)' }}
    >
      <div className="flex items-center gap-4 mb-6">
        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${levelInfo.bg} flex items-center justify-center text-3xl border-2 border-black`}>
          {levelInfo.icon}
        </div>
        <div>
          <div className="text-2xl font-black text-black">{levelInfo.level}</div>
          <div className="text-sm text-gray-600">声誉等级</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="text-center p-4 bg-gray-50 rounded-xl border-2 border-gray-200">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Award className="w-4 h-4 text-gray-600" />
          </div>
          <div className="text-2xl font-black text-black">{totalScore}</div>
          <div className="text-xs text-gray-600">总分</div>
        </div>

        <div className="text-center p-4 bg-gray-50 rounded-xl border-2 border-gray-200">
          <div className="flex items-center justify-center gap-1 mb-1">
            <TrendingUp className="w-4 h-4 text-gray-600" />
          </div>
          <div className="text-2xl font-black text-black">{feedbackCount}</div>
          <div className="text-xs text-gray-600">贡献数</div>
        </div>

        <div className="text-center p-4 bg-gray-50 rounded-xl border-2 border-gray-200">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
          </div>
          <div className="text-2xl font-black text-black">{averageScore}</div>
          <div className="text-xs text-gray-600">平均分</div>
        </div>
      </div>

      <div className="mt-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-gray-600">当前进度</span>
          <span className="text-xs font-bold text-black">{averageScore}/100</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden border-2 border-black">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${averageScore}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className={`h-full bg-gradient-to-r ${levelInfo.bg}`}
          />
        </div>
      </div>
    </motion.div>
  );
}
