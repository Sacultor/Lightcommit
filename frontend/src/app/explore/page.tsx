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

  const repositories = Array(6).fill(null).map((_, index) => ({
    id: index + 1,
  }));

  const handleCardClick = () => {
    router.push('/mint/new?step=2');
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
                    <div className="absolute inset-0 rounded-[17px] overflow-hidden">
                      <div className="w-full h-full flex items-center justify-center p-8">
                        <div className="text-center opacity-30">
                          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-300 border-2 border-gray-400" />
                          <div className="space-y-2">
                            <div className="h-3 bg-gray-300 rounded-full mx-auto w-3/4" />
                            <div className="h-2 bg-gray-200 rounded-full mx-auto w-1/2" />
                          </div>
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

