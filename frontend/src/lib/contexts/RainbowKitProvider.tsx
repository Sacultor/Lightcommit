'use client';

import '@rainbow-me/rainbowkit/styles.css';
import { RainbowKitProvider as RKProvider } from '@rainbow-me/rainbowkit';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { defineChain } from 'viem';

const hardhatLocal = defineChain({
  id: 31337,
  name: 'Hardhat Local',
  nativeCurrency: {
    decimals: 18,
    name: 'Ethereum',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: { http: ['http://127.0.0.1:8545'] },
  },
  testnet: true,
});

const config = createConfig({
  chains: [hardhatLocal],
  transports: {
    [hardhatLocal.id]: http('http://127.0.0.1:8545'),
  },
  connectors: [
    injected({
      shimDisconnect: true,
    }),
  ],
});

const queryClient = new QueryClient();

export function RainbowKitProvider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RKProvider modalSize="compact">
          {children}
        </RKProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

