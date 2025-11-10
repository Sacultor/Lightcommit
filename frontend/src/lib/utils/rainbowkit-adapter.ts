import { ethers, BrowserProvider, JsonRpcSigner } from 'ethers';
import type { Account, Chain, Client, Transport } from 'viem';

export function publicClientToProvider(publicClient: Client<Transport, Chain>) {
  const { chain, transport } = publicClient;
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  };

  if (transport.type === 'fallback') {
    return new ethers.JsonRpcProvider(chain.rpcUrls.default.http[0], network);
  }

  return new ethers.JsonRpcProvider(transport.url || chain.rpcUrls.default.http[0], network);
}

export function walletClientToSigner(walletClient: Client<Transport, Chain, Account>) {
  const { account, chain } = walletClient;
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  };

  const provider = new BrowserProvider(
    {
      request: async ({ method, params }: any) => {
        return await walletClient.request({ method, params } as any);
      },
    },
    network,
  );

  return new JsonRpcSigner(provider, account.address);
}

