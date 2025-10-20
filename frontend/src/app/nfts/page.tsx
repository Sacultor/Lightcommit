'use client';

import { HeaderSimple } from '@/components/header-simple';
import { FooterSimple } from '@/components/footer-simple';
import { CollectionContainer } from '@/components/collection-container';
import { CollectionCard } from '@/components/collection-card';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function NFTsPage() {
  const router = useRouter();
  const mockNFTs = [
    {
      id: '1',
      title: 'FEAT: IMPLEMENT USER AUTHENTICATION AND DARK MODE',
      creator: '0xAbc, EFG',
      collection: 'Astral Arcana',
      time: '5m ago',
    },
    {
      id: '2',
      title: 'FIX: MEMORY LEAK IN QUEUE PROCESSOR',
      creator: '0xDef, HIJ',
      collection: 'Cosmic Codex',
      time: '12m ago',
    },
    {
      id: '3',
      title: 'REFACTOR: OPTIMIZE DATABASE QUERIES',
      creator: '0xGhi, KLM',
      collection: 'Digital Dreams',
      time: '1h ago',
    },
    {
      id: '4',
      title: 'FEAT: ADD BLOCKCHAIN INTEGRATION',
      creator: '0xNop, QRS',
      collection: 'Astral Arcana',
      time: '2h ago',
    },
    {
      id: '5',
      title: 'DOCS: UPDATE API DOCUMENTATION',
      creator: '0xTuv, WXY',
      collection: 'Tech Titans',
      time: '3h ago',
    },
    {
      id: '6',
      title: 'STYLE: IMPLEMENT DARK MODE THEME',
      creator: '0xZab, CDE',
      collection: 'Design District',
      time: '5h ago',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F5F1E8]">
      <HeaderSimple />
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <h1 className="text-6xl md:text-7xl font-black text-black mb-4">
              My collections.
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              探索你的贡献 NFT 收藏，每一个都是独一无二的数字资产
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/explore')}
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#E63946] text-white font-bold rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all border-2 border-black"
            >
              <Plus className="w-5 h-5" />
              Create new collection
            </motion.button>
          </motion.div>

          <CollectionContainer>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockNFTs.map((item, index) => (
                <CollectionCard
                  key={item.id}
                  {...item}
                  index={index}
                />
              ))}
            </div>
          </CollectionContainer>
        </div>
      </main>
      <FooterSimple />
    </div>
  );
}

