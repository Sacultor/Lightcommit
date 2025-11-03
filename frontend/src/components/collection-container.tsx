'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface CollectionContainerProps {
  children: ReactNode;
  className?: string;
}

export function CollectionContainer({ children, className = '' }: CollectionContainerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className={`relative max-w-7xl mx-auto mt-12 ${className}`}
    >
      <div
        className="relative bg-[#E8DCC8] rounded-[40px] p-8 md:p-12 border-8 border-black"
        style={{
          boxShadow: '12px 12px 0px 0px rgba(0,0,0,0.3)',
        }}
      >
        <div
          className="absolute -top-4 -left-4 w-32 h-32 opacity-50"
          style={{
            background: 'linear-gradient(135deg, #4ECDC4 0%, #44A08D 100%)',
            borderRadius: '50% 40% 60% 50%',
            filter: 'blur(20px)',
          }}
        />
        <div
          className="absolute -top-4 -right-4 w-40 h-40 opacity-40"
          style={{
            background: 'linear-gradient(135deg, #A259FF 0%, #7B2CBF 100%)',
            borderRadius: '60% 40% 50% 60%',
            filter: 'blur(25px)',
          }}
        />

        <div
          className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-1/2 h-8 bg-black/20 rounded-full"
          style={{ filter: 'blur(8px)' }}
        />

        <div className="relative">
          {children}
        </div>
      </div>

      <svg
        className="absolute -top-6 -left-8 w-24 h-24 opacity-80 pointer-events-none"
        viewBox="0 0 100 100"
        style={{ transform: 'rotate(-15deg)' }}
      >
        <path
          d="M10,50 Q30,20 50,40 T90,50"
          fill="none"
          stroke="black"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>

      <svg
        className="absolute -bottom-6 -right-8 w-32 h-32 opacity-80 pointer-events-none"
        viewBox="0 0 100 100"
        style={{ transform: 'rotate(25deg)' }}
      >
        <circle cx="30" cy="30" r="15" fill="none" stroke="black" strokeWidth="3" />
        <circle cx="70" cy="70" r="20" fill="none" stroke="black" strokeWidth="3" />
      </svg>
    </motion.div>
  );
}

