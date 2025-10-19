'use client';

import { HeaderSimple } from '@/components/header-simple';
import { FooterSimple } from '@/components/footer-simple';
import { motion } from 'framer-motion';

const roadmapFeatures = [
  {
    id: 1,
    number: '1',
    title: '实时铸造',
    description: '每次有效贡献自动上链，无需等待资助轮次',
  },
  {
    id: 2,
    number: '2',
    title: '智能抗女巫',
    description: '多维度链上行为分析，精准识别真实贡献',
  },
  {
    id: 3,
    number: '3',
    title: '零知识隐私',
    description: '选择性披露贡献，保护开发者身份',
  },
  {
    id: 4,
    number: '4',
    title: 'Trustless-Agent',
    description: '客观评价开源贡献提交的质量，促进开源',
  },
  {
    id: 5,
    number: '5',
    title: '自循环经济',
    description: '协议费用直接反哺开源生态，无需外部依赖',
  },
];

export default function RoadmapPage() {
  return (
    <div className="min-h-screen bg-[#F5F1E8]">
      <HeaderSimple />
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-6 max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h1 className="text-6xl md:text-8xl font-black text-black mb-8 tracking-wider">
              ROADMAP
            </h1>
          </motion.div>

          <div className="relative flex justify-center">
            <img
              src="/assets/roadmap.png"
              alt="Roadmap"
              className="w-full max-w-4xl h-auto"
            />

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="absolute left-0 top-[3%] text-right max-w-xs"
            >
              <h3 className="text-xl md:text-2xl font-black text-black mb-2">
                {roadmapFeatures[0].number}. {roadmapFeatures[0].title}
              </h3>
              <p className="text-base md:text-lg text-gray-700 leading-relaxed">
                {roadmapFeatures[0].description}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="absolute left-0 top-[38%] text-right max-w-xs"
            >
              <h3 className="text-xl md:text-2xl font-black text-black mb-2">
                {roadmapFeatures[1].number}. {roadmapFeatures[1].title}
              </h3>
              <p className="text-base md:text-lg text-gray-700 leading-relaxed">
                {roadmapFeatures[1].description}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
              className="absolute left-0 top-[73%] text-right max-w-xs"
            >
              <h3 className="text-xl md:text-2xl font-black text-black mb-2">
                {roadmapFeatures[2].number}. {roadmapFeatures[2].title}
              </h3>
              <p className="text-base md:text-lg text-gray-700 leading-relaxed">
                {roadmapFeatures[2].description}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="absolute right-0 top-[8%] text-left max-w-xs"
            >
              <h3 className="text-xl md:text-2xl font-black text-black mb-2">
                {roadmapFeatures[3].number}. {roadmapFeatures[3].title}
              </h3>
              <p className="text-base md:text-lg text-gray-700 leading-relaxed">
                {roadmapFeatures[3].description}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
              className="absolute right-0 top-[53%] text-left max-w-xs"
            >
              <h3 className="text-xl md:text-2xl font-black text-black mb-2">
                {roadmapFeatures[4].number}. {roadmapFeatures[4].title}
              </h3>
              <p className="text-base md:text-lg text-gray-700 leading-relaxed">
                {roadmapFeatures[4].description}
              </p>
            </motion.div>
          </div>
        </div>
      </main>
      <FooterSimple />
    </div>
  );
}

