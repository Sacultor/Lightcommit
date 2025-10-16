'use client';

import { useState } from 'react';
import MintProgressSteps from './MintProgressSteps';
import ConfigureNFT, { NFTData } from './ConfigureNFT';
import PreviewNetwork from './PreviewNetwork';
import MintingSuccess from './MintingSuccess';

export default function MintPageContent() {
  const [currentStep, setCurrentStep] = useState(1);
  const [nftData, setNftData] = useState<NFTData>({
    title: '',
    description: '',
    tags: [],
  });

  const getHeaderTitle = () => {
    switch (currentStep) {
    case 1:
      return 'Configure NFT Metadata';
    case 2:
      return 'Preview & Network Selection';
    case 3:
      return 'Minting Complete';
    default:
      return 'Configure Preview Minting';
    }
  };

  const getHeaderDescription = () => {
    switch (currentStep) {
    case 1:
      return 'Set up your NFT title, description, and tags';
    case 2:
      return 'Review your NFT and select the blockchain network';
    case 3:
      return 'Your NFT has been successfully minted!';
    default:
      return 'Create and mint your NFT in a few simple steps';
    }
  };

  const handleConfigureNext = (data: NFTData) => {
    setNftData(data);
    setCurrentStep(2);
  };

  const handlePreviewBack = () => {
    setCurrentStep(1);
  };

  const handleMint = () => {
    // Here you would typically call the minting API
    setCurrentStep(3);
  };

  const handleViewProfile = () => {
    // Navigate to profile or dashboard
    window.location.href = '/dashboard';
  };

  const renderStepContent = () => {
    switch (currentStep) {
    case 1:
      return (
        <ConfigureNFT
          onNext={handleConfigureNext}
          initialData={nftData}
        />
      );
    case 2:
      return (
        <PreviewNetwork
          onBack={handlePreviewBack}
          onMint={handleMint}
          nftData={nftData}
        />
      );
    case 3:
      return (
        <MintingSuccess
          onViewProfile={handleViewProfile}
        />
      );
    default:
      return null;
    }
  };

  return (
    <div className="w-[1152px] mx-auto px-4 py-12" style={{ minHeight: '700px' }}>
      {/* Header */}
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight" style={{ lineHeight: '1.1' }}>
          {getHeaderTitle()}
        </h1>
        <p className="text-gray-600 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
          {getHeaderDescription()}
        </p>

        {/* 底部装饰 */}
        <div className="flex justify-center mt-8">
          <div className="flex space-x-2">
            <div className="w-2 h-2 bg-gray-900 rounded-full"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="mb-12">
        <MintProgressSteps currentStep={currentStep} />
      </div>

      {/* Content Area */}
      <div className="max-w-4xl mx-auto">
        {renderStepContent()}
      </div>
    </div>
  );
}
