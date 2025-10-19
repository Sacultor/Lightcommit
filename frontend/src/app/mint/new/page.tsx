'use client';

import { HeaderSimple } from '@/components/header-simple';
import { FooterSimple } from '@/components/footer-simple';
import { motion } from 'framer-motion';
import { Plus, X, ChevronDown, Check } from 'lucide-react';
import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function NewMintPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialStep = parseInt(searchParams.get('step') || '1');
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>(['TYPESCRIPT', 'FEATURE']);
  const [newTag, setNewTag] = useState('');
  const [selectedNetwork, setSelectedNetwork] = useState('Ethereum Network');
  const [showNetworkDropdown, setShowNetworkDropdown] = useState(false);

  const steps = [
    { number: 1, title: 'Configure NFT', active: true },
    { number: 2, title: 'Preview & Network', active: false },
    { number: 3, title: 'Minting......', active: false },
  ];

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim().toUpperCase())) {
      setTags([...tags, newTag.trim().toUpperCase()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className="min-h-screen bg-[#F5F1E8]">
      <HeaderSimple />
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-6 max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex gap-4 mb-12 justify-center flex-wrap">
              {steps.map((step) => (
                <button
                  key={step.number}
                  onClick={() => setCurrentStep(step.number)}
                  className={`px-6 py-3 rounded-2xl font-bold text-base border-3 transition-all ${
                    currentStep === step.number
                      ? 'bg-black text-white border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
                      : 'bg-white text-black border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,0.5)]'
                  }`}
                >
                  {step.number}.{step.title}
                </button>
              ))}
            </div>

            {currentStep === 1 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h2 className="text-4xl font-black text-black mb-8">
                    Configure NFT Metadata
                  </h2>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-xl font-black text-black mb-3">
                        NFT Title
                      </label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="FEAT: IMPLEMENT USER AUTHENTICATION AND DARK MODE"
                        className="w-full px-6 py-4 text-base bg-white border-3 border-black rounded-2xl focus:outline-none focus:ring-0 placeholder:text-gray-400 font-normal"
                        style={{
                          boxShadow: '3px 3px 0px 0px rgba(0,0,0,0.8)',
                        }}
                      />
                    </div>

                    <div>
                      <label className="block text-xl font-black text-black mb-3">
                        Description
                      </label>
                      <div className="relative">
                        <div className="absolute left-4 top-4 w-12 h-12 bg-gray-200 rounded-lg border-2 border-gray-300" />
                        <textarea
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="DETAILED DESCRIPTION OF YOUR CONTRIBUTION."
                          rows={6}
                          className="w-full pl-20 pr-6 py-4 text-base bg-white border-3 border-black rounded-2xl focus:outline-none focus:ring-0 placeholder:text-gray-400 font-normal resize-none"
                          style={{
                            boxShadow: '3px 3px 0px 0px rgba(0,0,0,0.8)',
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xl font-black text-black mb-3 flex items-center gap-2">
                        Tags
                        <Plus className="w-5 h-5" />
                      </label>
                      <div className="flex flex-wrap gap-3 mb-3">
                        {tags.map((tag) => (
                          <div
                            key={tag}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-white border-2 border-black rounded-full text-sm font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)]"
                          >
                            {tag}
                            <button
                              onClick={() => removeTag(tag)}
                              className="hover:text-red-600"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && addTag()}
                          placeholder="Add a tag..."
                          className="flex-1 px-4 py-2 text-sm bg-white border-2 border-black rounded-full focus:outline-none focus:ring-0 placeholder:text-gray-400"
                        />
                        <button
                          onClick={addTag}
                          className="px-4 py-2 bg-black text-white rounded-full font-bold text-sm hover:bg-gray-800 transition-colors"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div
                    className="aspect-square bg-white border-[3px] border-black rounded-[30px] p-8 flex items-center justify-center"
                    style={{
                      boxShadow: '5px 5px 0px 0px rgba(0,0,0,0.8)',
                    }}
                  >
                    <div className="text-center text-gray-400">
                      <div className="text-lg font-bold mb-2">NFT Preview</div>
                      <div className="text-sm">Preview will appear here</div>
                    </div>
                  </div>

                  <div
                    className="aspect-video bg-white border-[3px] border-black rounded-[30px] p-6 flex items-center justify-center"
                    style={{
                      boxShadow: '5px 5px 0px 0px rgba(0,0,0,0.8)',
                    }}
                  >
                    <div className="text-center text-gray-400">
                      <div className="text-base font-bold mb-2">Additional Preview</div>
                      <div className="text-sm">Content preview</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="relative">
                    <button
                      onClick={() => setShowNetworkDropdown(!showNetworkDropdown)}
                      className="w-full px-6 py-4 text-left bg-white border-[3px] border-black rounded-2xl font-medium flex items-center justify-between"
                      style={{
                        boxShadow: '3px 3px 0px 0px rgba(0,0,0,0.8)',
                      }}
                    >
                      <span className="text-gray-600">Choose Network</span>
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    </button>

                    {showNetworkDropdown && (
                      <div
                        className="absolute top-full left-0 right-0 mt-2 bg-white border-[3px] border-black rounded-2xl overflow-hidden z-10"
                        style={{
                          boxShadow: '3px 3px 0px 0px rgba(0,0,0,0.8)',
                        }}
                      >
                        <button
                          onClick={() => {
                            setSelectedNetwork('Ethereum Network');
                            setShowNetworkDropdown(false);
                          }}
                          className="w-full px-6 py-4 hover:bg-gray-50 transition-colors text-left"
                        >
                          Ethereum Network
                        </button>
                      </div>
                    )}
                  </div>

                  <div
                    className="px-6 py-4 bg-blue-500 text-white border-[3px] border-black rounded-2xl font-bold flex items-center gap-3"
                    style={{
                      boxShadow: '3px 3px 0px 0px rgba(0,0,0,0.8)',
                    }}
                  >
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M11.944 17.97L4.58 13.62 11.943 24l7.37-10.38-7.372 4.35h.003zM12.056 0L4.69 12.223l7.365 4.354 7.365-4.35L12.056 0z"/>
                      </svg>
                    </div>
                    <span>{selectedNetwork}</span>
                  </div>
                </div>

                <div>
                  <div
                    className="relative bg-white border-[5px] border-black rounded-[30px] p-6 min-h-[600px]"
                    style={{
                      boxShadow: '8px 8px 0px 0px rgba(0,0,0,1)',
                    }}
                  >
                    <div className="aspect-[3/4] bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(0,0,0,0.03)_10px,rgba(0,0,0,0.03)_20px)] rounded-2xl mb-6 flex items-center justify-center">
                      <div className="text-center text-gray-400">
                        <div className="text-lg font-bold">NFT Preview</div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-black text-xl flex-shrink-0">
                          LC
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-gray-800 line-clamp-2 mb-1">
                            {title || 'FEAT: IMPLEMENT USER AUTHENTICATION AND DARK MODE'}
                          </h3>
                          <p className="text-xs text-gray-500">Creator: 0xAbc, EFG</p>
                        </div>
                        <span className="text-xs text-gray-500 flex-shrink-0">5m ago</span>
                      </div>

                      <div className="text-sm text-gray-600">
                        Collection: <span className="font-bold">Astral Arcana</span>
                      </div>
                    </div>

                    <button
                      onClick={() => setCurrentStep(3)}
                      className="absolute bottom-6 right-6 px-8 py-3 bg-black text-white rounded-full font-bold text-base shadow-[3px_3px_0px_0px_rgba(0,0,0,0.5)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all"
                    >
                      Mint
                    </button>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="flex flex-col items-center justify-center py-20 max-w-2xl mx-auto">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, type: 'spring' }}
                  className="w-48 h-48 rounded-full border-[6px] border-black bg-white flex items-center justify-center mb-12"
                  style={{
                    boxShadow: '8px 8px 0px 0px rgba(0,0,0,0.8)',
                  }}
                >
                  <Check className="w-24 h-24 text-black" strokeWidth={4} />
                </motion.div>

                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-4xl md:text-5xl font-black text-black mb-6 text-center"
                >
                  NFT Minted Successfully!
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-lg text-gray-600 mb-12 text-center max-w-lg"
                >
                  Your digital collectible is now secured on the blockchain.
                </motion.p>

                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  onClick={() => router.push('/collections')}
                  className="px-12 py-4 bg-white border-[3px] border-black rounded-2xl font-bold text-lg hover:bg-gray-50 transition-colors"
                  style={{
                    boxShadow: '4px 4px 0px 0px rgba(0,0,0,0.8)',
                  }}
                >
                  View My Profile
                </motion.button>
              </div>
            )}
          </motion.div>
        </div>
      </main>
      <FooterSimple />
    </div>
  );
}

