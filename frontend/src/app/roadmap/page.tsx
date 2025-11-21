'use client';

import { HeaderSimple } from '@/components/layout/header';
import { FooterSimple } from '@/components/layout/footer';
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

const featureConfigs = [
  {
    position: 'left-[16%] top-[3%]',
    textAlign: 'text-right',
    animation: { x: -20 },
    delay: 0.2,
    maxWidth: '',
  },
  {
    position: 'right-0 top-[22%]',
    textAlign: 'text-left',
    animation: { x: -20 },
    delay: 0.3,
    maxWidth: '',
  },
  {
    position: 'left-0 top-[44%]',
    textAlign: 'text-right',
    animation: { x: -20 },
    delay: 0.4,
    maxWidth: 'max-w-xs',
  },
  {
    position: 'right-[12%] top-[52%]',
    textAlign: 'text-left',
    animation: { x: 20 },
    delay: 0.3,
    maxWidth: '',
  },
  {
    position: 'right-[13%] top-[85%]',
    textAlign: 'text-left',
    animation: { x: 20 },
    delay: 0.4,
    maxWidth: '',
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

            {roadmapFeatures.map((feature, index) => {
              const config = featureConfigs[index];
              return (
                <motion.div
                  key={feature.id}
                  initial={{ opacity: 0, ...config.animation }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: config.delay }}
                  className={`absolute ${config.position} ${config.textAlign} ${config.maxWidth}`}
                >
                  <h3 className="text-xl md:text-2xl font-black text-black mb-2">
                    {feature.number}. {feature.title}
                  </h3>
                  <p className="text-base md:text-lg text-gray-700 leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </main>
      <FooterSimple />
    </div>
  );
}

