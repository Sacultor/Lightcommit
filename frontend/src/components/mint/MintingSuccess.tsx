'use client'

import { Button } from './ui/button'

interface MintingSuccessProps {
  onViewProfile: () => void
}

export default function MintingSuccess({ onViewProfile }: MintingSuccessProps) {
  return (
    <div className="w-full max-w-2xl mx-auto text-center space-y-8">
      {/* Success Icon */}
      <div className="w-32 h-32 mx-auto bg-white border-2 border-black rounded-full flex items-center justify-center">
        <svg 
          className="w-16 h-16 text-black" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={3} 
            d="M5 13l4 4L19 7" 
          />
        </svg>
      </div>

      {/* Success Message */}
      <div className="space-y-4">
        <h1 className="text-4xl font-bold text-black">
          NFT Minted Successfully!
        </h1>
        <p className="text-lg text-gray-600 max-w-md mx-auto">
          Your digital collectible is now secured on the blockchain.
        </p>
      </div>

      {/* Action Button */}
      <div className="pt-4">
        <Button
          onClick={onViewProfile}
          className="px-12 py-4 bg-white border-2 border-black text-black font-bold text-lg rounded-lg hover:bg-gray-100 transition-colors"
          variant="outline"
        >
          View My Profile
        </Button>
      </div>
    </div>
  )
}