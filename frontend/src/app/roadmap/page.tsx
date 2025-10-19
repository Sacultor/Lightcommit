'use client';

import { HeaderSimple } from '@/components/header-simple';
import { FooterSimple } from '@/components/footer-simple';
import { motion } from 'framer-motion';
import { CheckCircle2, Clock, Shield, Lock, FileText, DollarSign } from 'lucide-react';

const roadmapPhases = [
  {
    id: 1,
    icon: Clock,
    icon2: Shield,
    title: '智能跟踪',
    status: 'completed',
    description: '长往射退：每波政的贡计针自动上线，熟是待熬仔诗努指观况',
    detailedDesc: '自动追踪 GitHub 贡献，实时记录每一次提交和PR，确保所有贡献都被准确记录',
  },
  {
    id: 2,
    icon: Lock,
    icon2: FileText,
    title: '描能拆射款',
    status: 'completed',
    description: '描能拆射款：多级座极其装发分练，特至资积贡针除拉到量政的贡计',
    detailedDesc: '多级权限管理系统，持续积累贡献价值，排除无效的重复提交'
  },
  {
    id: 3,
    icon: DollarSign,
    title: 'Trustless-Agent',
    status: 'in-progress',
    description: 'Trustless-Agent：叫立予质发计针针，',
    subDescription: '绣立到重基：开立募团及置越的质底，点底，熟有郝来载有郝保',
    detailedDesc: '去中心化质量评估系统，建立透明可信的贡献评估机制，点对点验证，确保系统公平公正'
  }
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

          <div 
            className="relative bg-[#E8DCC8] rounded-[30px] md:rounded-[40px] p-6 md:p-12 lg:p-16 border-4 md:border-8 border-black mb-16"
            style={{
              boxShadow: '8px 8px 0px 0px rgba(0,0,0,0.3)',
            }}
          >
            <div className="space-y-12 md:space-y-16">
              {roadmapPhases.map((phase, index) => (
                <motion.div
                  key={phase.id}
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  className="relative"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 items-center">
                    <div className="flex items-center gap-2 md:gap-4 flex-wrap justify-center lg:justify-start">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2 p-3 md:p-4 bg-white rounded-2xl border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                          <phase.icon className="w-6 h-6 md:w-8 md:h-8" strokeWidth={2} />
                          {phase.icon2 && <phase.icon2 className="w-6 h-6 md:w-8 md:h-8" strokeWidth={2} />}
                        </div>
                      </div>

                      <div className="hidden md:flex items-center">
                        <svg className="w-16 md:w-24 h-2" viewBox="0 0 100 8">
                          <line
                            x1="0"
                            y1="4"
                            x2="100"
                            y2="4"
                            stroke="black"
                            strokeWidth="2"
                            strokeDasharray="8,8"
                          />
                        </svg>
                      </div>

                      <div className="relative">
                        {phase.status === 'completed' ? (
                          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white border-3 md:border-4 border-black flex items-center justify-center shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                            <CheckCircle2 className="w-6 h-6 md:w-7 md:h-7 text-green-600" strokeWidth={3} />
                          </div>
                        ) : (
                          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white border-3 md:border-4 border-black flex items-center justify-center shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                            <CheckCircle2 className="w-6 h-6 md:w-7 md:h-7 text-gray-400" strokeWidth={3} />
                          </div>
                        )}
                      </div>

                      {phase.id < 3 && (
                        <>
                          <div className="hidden md:flex items-center">
                            <svg className="w-16 md:w-24 h-2" viewBox="0 0 100 8">
                              <line
                                x1="0"
                                y1="4"
                                x2="100"
                                y2="4"
                                stroke="black"
                                strokeWidth="2"
                                strokeDasharray="8,8"
                              />
                            </svg>
                          </div>

                          <div className="p-3 md:p-4 bg-white rounded-2xl border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                            {phase.id === 1 && (
                              <>
                                <Lock className="w-6 h-6 md:w-8 md:h-8 inline-block mr-2" strokeWidth={2} />
                                <FileText className="w-6 h-6 md:w-8 md:h-8 inline-block" strokeWidth={2} />
                              </>
                            )}
                            {phase.id === 2 && (
                              <DollarSign className="w-6 h-6 md:w-8 md:h-8" strokeWidth={2} />
                            )}
                          </div>
                        </>
                      )}
                    </div>

                    <div className="bg-[#F5F1E8] rounded-2xl p-5 md:p-6 border-3 md:border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                      <h3 className="text-xl md:text-2xl font-black text-black mb-2 md:mb-3">
                        {phase.title}
                      </h3>
                      <p className="text-sm md:text-base text-gray-800 leading-relaxed">
                        {phase.description}
                      </p>
                      {phase.subDescription && (
                        <p className="text-sm md:text-base text-gray-800 leading-relaxed mt-2">
                          {phase.subDescription}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <FooterSimple />
    </div>
  );
}

