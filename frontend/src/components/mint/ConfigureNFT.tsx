'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface ConfigureNFTProps {
  onNext: (data: NFTData) => void
  initialData?: NFTData
}

export interface NFTData {
  title: string
  description: string
  tags: string[]
}

export default function ConfigureNFT({ onNext, initialData }: ConfigureNFTProps) {
  const [title, setTitle] = useState(initialData?.title || 'feat: Implement user authentication and dark mode');
  const [description, setDescription] = useState(initialData?.description || 'Detailed description of your contribution.');
  const [tags, setTags] = useState<string[]>(initialData?.tags || ['Typescript', 'feature']);
  const [newTag, setNewTag] = useState('');

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleNext = () => {
    onNext({
      title,
      description,
      tags,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid) {
      handleNext();
    }
  };

  const isFormValid = title.trim() && description.trim() && tags.length > 0;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="bg-white border-2 border-black rounded-[10px] p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-[20px] font-bold text-black mb-2" style={{ lineHeight: '1.21' }}>
              NFT Title
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-[632px] h-[50px] border-2 border-black rounded-[10px] px-4 text-[15px] font-bold uppercase"
              style={{ lineHeight: '1.21' }}
              placeholder="feat: Implement user authentication and dark mode"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-[20px] font-bold text-black mb-2" style={{ lineHeight: '1.21' }}>
              Description
            </label>
            <textarea
              value={description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
              className="w-[632px] min-h-[100px] border-2 border-black rounded-[10px] px-4 py-3 text-[10px] font-bold uppercase resize-none focus:outline-none focus:ring-2 focus:ring-black"
              style={{ lineHeight: '1.21', color: 'rgba(0, 0, 0, 0.25)' }}
              placeholder="Detailed description of your contribution."
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-[20px] font-bold text-black mb-2" style={{ lineHeight: '1.21' }}>
              Tags
            </label>

            {/* Existing Tags */}
            <div className="flex flex-wrap gap-2 mb-3">
              {tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 bg-white border-2 border-black rounded text-xs font-bold uppercase cursor-pointer hover:bg-gray-100"
                  onClick={() => removeTag(tag)}
                >
                  {tag}
                  <span className="ml-2 text-gray-500">×</span>
                </span>
              ))}
            </div>

            {/* Add New Tag */}
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTag()}
                className="flex-1 h-10 border-2 border-black rounded-lg px-3 text-xs font-bold uppercase"
                placeholder="Add a tag"
              />
              <Button
                onClick={addTag}
                className="w-10 h-10 bg-white border-2 border-black rounded-lg text-black font-extrabold text-2xl hover:bg-gray-100"
                variant="outline"
              >
                +
              </Button>
            </div>
          </div>
        </form>

        {/* Next Button */}
        <div className="mt-8 flex justify-end">
          <Button
            onClick={handleNext}
            disabled={!isFormValid}
            className="px-8 py-3 bg-black text-white font-bold rounded-lg hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Next: Preview & Network
          </Button>
        </div>
      </div>
    </div>
  );
}
