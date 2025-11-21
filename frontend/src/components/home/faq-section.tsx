'use client';

import { motion } from 'framer-motion';

export function FAQSection() {
  return (
    <section className="py-32 bg-[#F5F1E8]" id="faq">
      <div className="container mx-auto px-6 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-5xl md:text-6xl font-black text-black mb-16">FAQ</h2>

          {/* Q1 */}
          <h3 className="text-2xl md:text-3xl font-black text-black mb-4">
            WHAT IS THIS PROJECT ABOUT?
          </h3>
          <p className="text-gray-700 leading-relaxed mb-12 pl-6">
            It is about building something cool and community-driven.
          </p>

          {/* Q2 */}
          <h3 className="text-2xl md:text-3xl font-black text-black mb-4">
            HOW DO I JOIN?
          </h3>
          <p className="text-gray-700 leading-relaxed pl-6">
            Connect your wallet and mint an NFT.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

