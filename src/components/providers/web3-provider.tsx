"use client";

import { Web3ReactProvider, Web3ReactHooks, initializeConnector } from '@web3-react/core';
import { MetaMask } from '@web3-react/metamask';
import type { Web3ProviderType } from '@/lib/web3/types';
import { ReactNode, useEffect, useState } from 'react';

const [metaMask, hooks] = initializeConnector<MetaMask>(
  (actions) => new MetaMask({ actions })
);

export function Web3ProviderWrapper({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  // Check for MetaMask availability
  const isMetaMaskAvailable = typeof window !== 'undefined' && window.ethereum;

  if (!isMetaMaskAvailable) {
    return (
      <div className="p-4 text-center">
        <p className="mb-4">MetaMask is required to use Web3 features</p>
        <a
          href="https://metamask.io/download/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline"
        >
          Install MetaMask
        </a>
      </div>
    );
  }

  return (
    <Web3ReactProvider connectors={[[metaMask, hooks]]}>
      {children}
    </Web3ReactProvider>
  );
}

// Export the MetaMask connector
export { metaMask };

// Export typed hooks
export const web3Hooks = {
  useProvider: hooks.useProvider as () => Web3ProviderType | undefined,
  useAccounts: hooks.useAccounts,
  useIsActivating: hooks.useIsActivating,
  useIsActive: hooks.useIsActive,
  useChainId: hooks.useChainId,
  useENSNames: hooks.useENSNames,
};
