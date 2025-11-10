'use client';

import { Toaster } from 'react-hot-toast';
import { RainbowKitProvider } from '@/lib/contexts/RainbowKitProvider';
import { Web3Provider } from '@/lib/contexts/Web3Context';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <RainbowKitProvider>
      <Web3Provider>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1f2937',
              color: '#fff',
              border: '1px solid #374151',
            },
          }}
        />
      </Web3Provider>
    </RainbowKitProvider>
  );
}

