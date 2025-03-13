'use client';

import { AuthProvider } from "./auth-provider"
import { Web3ProviderWrapper } from "./web3-provider"
import { Web3ContextProvider } from '@/contexts/Web3Context'
import { Web3ReactProvider } from '@web3-react/core'
import { Web3Provider } from '@ethersproject/providers'
import {
  ConnectionProvider,
  WalletProvider
} from '@solana/wallet-adapter-react';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';
import { useEffect, useMemo } from 'react';

require('@solana/wallet-adapter-react-ui/styles.css');

function getLibrary(provider: any): Web3Provider {
  const library = new Web3Provider(provider);
  library.pollingInterval = 12000;
  return library;
}

export function Providers({ children }: { children: React.ReactNode }) {
  // Setup Solana wallet adapter configuration
  const endpoint = useMemo(() => clusterApiUrl('devnet'), []);
  const wallets = useMemo(
    () => [new PhantomWalletAdapter()],
    []
  );

  useEffect(() => {
    // Check if MetaMask is installed
    if (typeof window !== 'undefined' && !window.ethereum) {
      console.warn('Please install MetaMask');
    }
  }, []);

  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>
            <Web3ContextProvider>
              <AuthProvider>
                {children}
              </AuthProvider>
            </Web3ContextProvider>
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </Web3ReactProvider>
  );
} 