'use client'

import { useState } from 'react'
import { Button } from './ui/button'
import { ChevronDown } from 'lucide-react'
import { NFTData } from './ConfigureNFT'

interface PreviewNetworkProps {
  onBack: () => void
  onMint: () => void
  nftData: NFTData
}

interface Network {
  id: string
  name: string
  icon: string
  description: string
}

const networks: Network[] = [
  {
    id: 'ethereum',
    name: 'Ethereum Network',
    icon: '🔷',
    description: 'Main Ethereum blockchain'
  },
  {
    id: 'polygon',
    name: 'Polygon Network',
    icon: '🟣',
    description: 'Layer 2 scaling solution'
  },
  {
    id: 'arbitrum',
    name: 'Arbitrum Network',
    icon: '🔵',
    description: 'Optimistic rollup'
  }
]

export default function PreviewNetwork({ onBack, onMint, nftData }: PreviewNetworkProps) {
  const [selectedNetwork, setSelectedNetwork] = useState('ethereum')
  const [showNetworkDropdown, setShowNetworkDropdown] = useState(false)

  const selectedNetworkData = networks.find(n => n.id === selectedNetwork) || networks[0]

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="grid grid-cols-2 gap-8">
        {/* Left Side - Network Selection */}
        <div className="bg-white border-2 border-black rounded-[10px] p-8">
          <div className="space-y-6">
            <div>
              <label className="block text-[20px] font-bold text-black mb-4" style={{ fontFamily: 'Inter', lineHeight: '1.21' }}>
                Choose Network
              </label>
              
              <div className="relative">
                <button
                  onClick={() => setShowNetworkDropdown(!showNetworkDropdown)}
                  className="w-full h-[50px] flex items-center justify-between px-4 border-2 border-black rounded-[10px] bg-white hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{selectedNetworkData.icon}</span>
                    <div className="text-left">
                      <div className="text-[15px] font-bold text-black" style={{ fontFamily: 'Inter', lineHeight: '1.21' }}>
                        {selectedNetworkData.name}
                      </div>
                    </div>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-black transition-transform ${showNetworkDropdown ? 'rotate-180' : ''}`} />
                </button>

              {showNetworkDropdown && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-black rounded-lg shadow-lg z-10">
                  {networks.map((network) => (
                    <button
                      key={network.id}
                      onClick={() => {
                        setSelectedNetwork(network.id)
                        setShowNetworkDropdown(false)
                      }}
                      className={`w-full flex items-center gap-3 p-4 text-left hover:bg-gray-50 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                        selectedNetwork === network.id ? 'bg-gray-100' : ''
                      }`}
                    >
                      <span className="text-2xl">{network.icon}</span>
                      <div>
                        <div className="text-lg font-bold text-black">
                          {network.name}
                        </div>
                        <div className="text-sm text-gray-600">
                          {network.description}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button
                onClick={onBack}
                variant="outline"
                className="flex-1 py-3 border-2 border-black text-black font-bold rounded-lg hover:bg-gray-100"
              >
                Back
              </Button>
              <Button
                onClick={onMint}
                className="flex-1 py-3 bg-black text-white font-bold rounded-lg hover:bg-gray-800"
              >
                Mint NFT
              </Button>
            </div>
          </div>
        </div>

        {/* Right Side - NFT Preview Card */}
        <div className="bg-white border-2 border-black rounded-[10px] p-6 space-y-4" style={{ width: '446px', height: '500px' }}>
          {/* NFT Preview Image Placeholder */}
          <div className="w-full h-[280px] bg-gray-100 border-2 border-gray-300 rounded-[10px] flex items-center justify-center relative">
            {/* Checkered pattern background */}
            <div className="absolute inset-0 opacity-20" style={{
              backgroundImage: `url("data:image/svg+xml,%3csvg width='20' height='20' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='10' height='10' fill='%23000'/%3e%3crect x='10' y='10' width='10' height='10' fill='%23000'/%3e%3c/svg%3e")`,
              backgroundSize: '20px 20px'
            }}></div>
          </div>

          {/* NFT Metadata */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">LC</span>
              </span>
              <div className="text-sm">
                <div className="font-bold text-black uppercase text-[10px]" style={{ fontFamily: 'Inter', lineHeight: '1.21' }}>
                  {nftData.title.toUpperCase()}
                </div>
                <div className="text-[8px] text-gray-500 mt-1" style={{ fontFamily: 'Inter' }}>
                  5m ago
                </div>
              </div>
            </div>

            <div className="text-[10px]" style={{ fontFamily: 'Inter', lineHeight: '1.21' }}>
              <div className="font-bold text-black mb-1">Collection: Astral Arcana</div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1">
              {nftData.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-[8px] font-bold text-black uppercase"
                  style={{ fontFamily: 'Inter' }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Mint Button in Card */}
          <div className="pt-4">
            <Button
              onClick={onMint}
              className="w-full h-[40px] bg-black text-white font-bold rounded-[10px] hover:bg-gray-800 text-[12px]"
              style={{ fontFamily: 'Inter' }}
            >
              Mint
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}