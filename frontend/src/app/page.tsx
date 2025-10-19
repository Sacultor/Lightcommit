import { HeaderSimple } from '@/components/header-simple';
import { FooterSimple } from '@/components/footer-simple';
import { HeroSectionGVC } from '@/components/hero-section-gvc';
import { AboutSection } from '@/components/about-section';
import { FAQSection } from '@/components/faq-section';
import { WhatSection } from '@/components/what-section';
import { JoinUs } from '@/components/join-us';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F5F1E8]">
      <HeaderSimple />
      <main>
        <HeroSectionGVC />
        <WhatSection />
        <div id="about">
          <AboutSection />
        </div>
        <div id="faq">
          <FAQSection />
        </div>
        <section className="py-16 bg-[#F5F1E8]">
          <div className="container mx-auto px-6">
            <JoinUs titleSize="medium" />
          </div>
        </section>
      </main>
      <FooterSimple />
    </div>
  );
}
