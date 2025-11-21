/**
 * LightCommit 首页
 * 
 * 路由：/
 * 功能：展示 LightCommit 产品介绍和核心功能
 * 
 * 页面结构：
 * - Header：导航栏（GitHub 登录、钱包连接）
 * - HeroSection：主视觉区域（标题、Slogan、CTA）
 * - WhatSection：功能介绍
 * - AboutSection：关于我们（锚点 #about）
 * - FAQSection：常见问题（锚点 #faq）
 * - JoinUs：加入我们（CTA）
 * - Footer：页脚
 * 
 * 特点：
 * - 服务端渲染（SSR）- 无 'use client'
 * - SEO 友好（meta 标签在 layout.tsx）
 * - 单页滚动式布局
 */
import { HeaderSimple } from '@/components/layout/header';
import { FooterSimple } from '@/components/layout/footer';
import { HeroSectionGVC } from '@/components/home/hero-section';
import { AboutSection } from '@/components/home/about-section';
import { FAQSection } from '@/components/home/faq-section';
import { WhatSection } from '@/components/home/what-section';
import { JoinUs } from '@/components/home/join-us';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F5F1E8]">
      {/* 页面头部导航栏 */}
      <HeaderSimple />
      
      {/* 主内容区域 */}
      <main>
        {/* 主视觉区域：Hero Banner */}
        <HeroSectionGVC />
        
        {/* 功能介绍区域 */}
        <WhatSection />
        
        {/* 关于我们区域（锚点 #about，从导航栏点击 ABOUT 可跳转到这里） */}
        <div id="about">
          <AboutSection />
        </div>
        
        {/* FAQ 区域（锚点 #faq） */}
        <div id="faq">
          <FAQSection />
        </div>
        
        {/* 加入我们 CTA 区域 */}
        <section className="py-16 bg-[#F5F1E8]">
          <div className="container mx-auto px-6">
            <JoinUs titleSize="medium" />
          </div>
        </section>
      </main>
      
      {/* 页面底部 */}
      <FooterSimple />
    </div>
  );
}
