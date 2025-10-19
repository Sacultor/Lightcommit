'use client';

import { HeaderSimple } from '@/components/header-simple';
import { FooterSimple } from '@/components/footer-simple';
import { CollectionContainer } from '@/components/collection-container';
import { CollectionCard } from '@/components/collection-card';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CollectionsPage() {
  const router = useRouter();
  const mockCollections = [
    {
      id: '1',
      title: 'FEAT: IMPLEMENT USER AUTHENTICATION AND DARK MODE',
      creator: '0xAbc, EFG',
      collection: 'Astral Arcana',
      time: '5m ago',
      imageUrl: '/assets/images/avatar-1.jpg',
    },
    {
      id: '2',
      title: 'FEAT: IMPLEMENT USER AUTHENTICATION AND DARK MODE',
      creator: '0xAbc, EFG',
      collection: 'Astral Arcana',
      time: '5m ago',
      imageUrl: '/assets/images/avatar-2.jpg',
    },
    {
      id: '3',
      title: 'FEAT: IMPLEMENT USER AUTHENTICATION AND DARK MODE',
      creator: '0xAbc, EFG',
      collection: 'Astral Arcana',
      time: '5m ago',
      imageUrl: '/assets/images/avatar-3.jpg',
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
              It&apos;s kinda lonely here. Why don&apos;t you create your freshly new collections and start your{' '}
              <span className="text-pink-500 font-bold">NFT</span> journey with{' '}
              <span className="text-purple-500 font-bold">Bake &apos;n Stake</span>?
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {mockCollections.map((item, index) => (
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

