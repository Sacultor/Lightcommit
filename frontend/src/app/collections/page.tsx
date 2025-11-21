/**
 * NFT 收藏页面
 * 
 * 路由：/collections
 * 功能：展示用户的 NFT 收藏集合
 * 
 * 页面布局：
 * - Header：导航栏
 * - 标题区域：My collections
 * - 创建按钮：Create new collection
 * - NFT 卡片网格：展示已铸造的 NFT
 * - Footer：页脚
 * 
 * 使用场景：
 * - 用户查看自己拥有的 Commit NFT
 * - 展示 NFT 收藏（Gallery）
 * - 点击 NFT 查看详情
 * 
 * 状态：
 * - 当前使用 mock 数据
 * - TODO: 集成真实的 NFT 数据（从链上读取）
 */
'use client';

import { HeaderSimple } from '@/components/layout/header';
import { FooterSimple } from '@/components/layout/footer';
import { CollectionContainer } from '@/components/nft/collection-container';
import { CollectionCard } from '@/components/nft/collection-card';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CollectionsPage() {
  // Next.js 路由实例（用于页面跳转）
  const router = useRouter();
  
  // Mock 收藏数据（TODO: 替换为真实的 NFT 数据）
  // 真实数据应该从链上读取用户拥有的 CommitNFT
  const mockCollections = [
    {
      id: '1',
      title: 'FEAT: IMPLEMENT USER AUTHENTICATION AND DARK MODE',  // Commit 消息
      creator: '0xAbc, EFG',                                        // 创建者地址（缩写）
      collection: 'Astral Arcana',                                  // 收藏集名称
      time: '5m ago',                                               // 铸造时间
      imageUrl: '/assets/images/avatar-5.jpg',                     // NFT 图片
    },
    {
      id: '2',
      title: 'FEAT: IMPLEMENT USER AUTHENTICATION AND DARK MODE',
      creator: '0xAbc, EFG',
      collection: 'Astral Arcana',
      time: '5m ago',
      imageUrl: '/assets/images/avatar-6.jpg',
    },
    {
      id: '3',
      title: 'FEAT: IMPLEMENT USER AUTHENTICATION AND DARK MODE',
      creator: '0xAbc, EFG',
      collection: 'Astral Arcana',
      time: '5m ago',
      imageUrl: '/assets/images/avatar-7.jpg',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F5F1E8]">
      {/* 页面头部导航栏 */}
      <HeaderSimple />
      
      {/* 主内容区域 */}
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-6">
          {/* 标题和创建按钮区域（带进入动画） */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}      // 初始状态：不可见、向下偏移
            animate={{ opacity: 1, y: 0 }}       // 动画到：可见、正常位置
            transition={{ duration: 0.6 }}       // 动画时长 0.6 秒
            className="text-center mb-8"
          >
            {/* 页面标题 */}
            <h1 className="text-6xl md:text-7xl font-black text-black mb-4">
              My collections.
            </h1>
            
            {/* 引导文案 */}
            <p className="text-lg text-gray-600 mb-6">
              It&apos;s kinda lonely here. Why don&apos;t you create your freshly new collections and start your{' '}
              <span className="text-pink-500 font-bold">NFT</span> journey with{' '}
              <span className="text-purple-500 font-bold">Bake &apos;n Stake</span>?
            </p>
            
            {/* 创建新收藏按钮（带悬停和点击动画） */}
            <motion.button
              whileHover={{ scale: 1.05 }}       // 悬停时放大到 105%
              whileTap={{ scale: 0.95 }}         // 点击时缩小到 95%
              onClick={() => router.push('/explore')}  // 点击跳转到 explore 页面
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#E63946] text-white font-bold rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all border-2 border-black"
            >
              <Plus className="w-5 h-5" />
              Create new collection
            </motion.button>
          </motion.div>

          {/* NFT 收藏网格容器 */}
          <CollectionContainer>
            {/* 3 列响应式网格布局 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* 遍历收藏数据，渲染 NFT 卡片 */}
              {mockCollections.map((item, index) => (
                <CollectionCard
                  key={item.id}           // 唯一标识
                  {...item}               // 展开所有属性（title, creator, imageUrl 等）
                  index={index}           // 传入索引（用于动画延迟）
                />
              ))}
            </div>
          </CollectionContainer>
        </div>
      </main>
      
      {/* 页面底部 */}
      <FooterSimple />
    </div>
  );
}


