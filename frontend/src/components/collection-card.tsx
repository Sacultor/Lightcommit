'use client';

import { motion } from 'framer-motion';

interface CollectionCardProps {
  id: string;
  title: string;
  creator: string;
  collection: string;
  time: string;
  imageUrl?: string;
  index?: number;
}

export function CollectionCard({
  title,
  creator,
  collection,
  time,
  imageUrl,
  index = 0,
}: CollectionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
      whileHover={{ y: -8, rotate: index % 2 === 0 ? -1 : 1 }}
      className="group bg-[#F5F1E8] rounded-3xl p-4 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer"
    >
      <div className="aspect-[3/4] bg-white/50 rounded-2xl border-3 border-gray-300 mb-4 overflow-hidden backdrop-blur-sm relative">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={title} 
            className="w-full h-full object-cover"
          />
        ) : (
          <>
            <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(0,0,0,0.03)_10px,rgba(0,0,0,0.03)_20px)]" />
            <div className="absolute inset-0 flex items-center justify-center text-gray-400 font-bold text-sm">
              NFT Preview
            </div>
          </>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-start gap-2">
          <div className="w-10 h-10 rounded-full bg-gray-300 flex-shrink-0 border-2 border-black" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-600 font-medium leading-tight break-words">
              {title}
            </p>
          </div>
          <span className="text-xs text-gray-500 flex-shrink-0">{time}</span>
        </div>

        <p className="text-xs text-gray-500 pl-12">
          Creator {creator}
        </p>

        <p className="text-sm font-bold text-black pl-12">
          Collection : {collection}
        </p>
      </div>
    </motion.div>
  );
}

