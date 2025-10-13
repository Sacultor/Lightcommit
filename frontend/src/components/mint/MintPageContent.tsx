'use client'

import { useState } from 'react'
import MintProgressSteps from './MintProgressSteps'
import ConfigureNFT, { NFTData } from './ConfigureNFT'
import PreviewNetwork from './PreviewNetwork'
import MintingSuccess from './MintingSuccess'

export default function MintPageContent() {
  const [currentStep, setCurrentStep] = useState(1)
  const [nftData, setNftData] = useState<NFTData>({
    title: '',
    description: '',
    tags: []
  })

  const getHeaderTitle = () => {
    switch (currentStep) {
      case 1:
        return 'Configure NFT Metadata'
      case 2:
        return 'Preview & Network Selection'
      case 3:
        return 'Minting Complete'
      default:
        return 'Configure Preview Minting'
    }
  }

  const getHeaderDescription = () => {
    switch (currentStep) {
      case 1:
        return 'Set up your NFT title, description, and tags'
      case 2:
        return 'Review your NFT and select the blockchain network'
      case 3:
        return 'Your NFT has been successfully minted!'
      default:
        return 'Create and mint your NFT in a few simple steps'
    }
  }

  const handleConfigureNext = (data: NFTData) => {
    setNftData(data)
    setCurrentStep(2)
  }

  const handlePreviewBack = () => {
    setCurrentStep(1)
  }

  const handleMint = () => {
    // Here you would typically call the minting API
    setCurrentStep(3)
  }

  const handleViewProfile = () => {
    // Navigate to profile or dashboard
    window.location.href = '/dashboard'
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <ConfigureNFT
            onNext={handleConfigureNext}
            initialData={nftData}
          />
        )
      case 2:
        return (
          <PreviewNetwork
            onBack={handlePreviewBack}
            onMint={handleMint}
            nftData={nftData}
          />
        )
      case 3:
        return (
          <MintingSuccess
            onViewProfile={handleViewProfile}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="w-[1152px] mx-auto px-4 py-8" style={{ minHeight: '700px' }}>
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-[20px] font-bold text-black mb-2" style={{ fontFamily: 'Inter', lineHeight: '1.21' }}>
          {getHeaderTitle()}
        </h1>
        <p className="text-gray-600 text-sm">
          {getHeaderDescription()}
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <MintProgressSteps currentStep={currentStep} />
      </div>

      {/* Content Area */}
      <div className="max-w-4xl mx-auto">
        {renderStepContent()}
      </div>
    </div>
  )
}