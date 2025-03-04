"use client";

import { Web3ReactProvider, Web3ReactHooks, initializeConnector } from '@web3-react/core';
import { MetaMask } from '@web3-react/metamask';
import type { Web3ProviderType } from '@/lib/web3/types';
import React, { ReactNode, useEffect, useState } from 'react';
import { SolanaConnector, connectSolana } from '@/lib/web3/connectors';
import { PublicKey } from '@solana/web3.js';

declare global {
  interface Window {
    solana?: {
      isConnected?: boolean;
      connect?: () => Promise<{ publicKey: PublicKey }>;
      disconnect?: () => Promise<void>;
      signTransaction?: (transaction: any) => Promise<any>;
      signAllTransactions?: (transactions: any[]) => Promise<any[]>;
      signMessage?: (message: Uint8Array) => Promise<{ signature: Uint8Array }>;
    };
  }
}

const [metaMask, hooks] = initializeConnector<MetaMask>(
  (actions) => new MetaMask({ actions })
);

interface Web3ContextType {
    solanaConnector: SolanaConnector | null;
    solanaPublicKey: PublicKey | null;
    connectSolana: () => Promise<void>;
    disconnectSolana: () => Promise<void>;
}

export const Web3Context = React.createContext<Web3ContextType>({
  solanaConnector: null,
  solanaPublicKey: null,
  connectSolana: async () => {},
  disconnectSolana: async () => {},
});

export function Web3ProviderWrapper({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [solanaConnector, setSolanaConnector] = useState<SolanaConnector | null>(null);
  const [solanaPublicKey, setSolanaPublicKey] = useState<PublicKey | null>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

  useEffect(() => {
    const handleConnect = async () => {
      if (window.solana?.isConnected) {
        try {
          const connector = await connectSolana();
          setSolanaConnector(connector);
          setSolanaPublicKey(connector.getPublicKey());
        } catch (error) {
          console.error('Failed to reconnect to Solana:', error);
        }
      }
    };

    if (mounted) {
      handleConnect();
    }
  }, [mounted]);


    const handleConnectSolana = async () => {
        try {
            const connector = await connectSolana();
            setSolanaConnector(connector);
            setSolanaPublicKey(connector.getPublicKey());
        } catch (error) {
            console.error('Failed to connect to Solana:', error);
        }
    };

    const handleDisconnectSolana = async () => {
      if (solanaConnector) {
        await solanaConnector.disconnect();
        setSolanaConnector(null);
        setSolanaPublicKey(null);
      }
    };


    if (!mounted) {
        return null;
    }

  return (
    <Web3ReactProvider connectors={[[metaMask, hooks]]}>
      <Web3Context.Provider
        value={{
          solanaConnector,
          solanaPublicKey,
          connectSolana: handleConnectSolana,
          disconnectSolana: handleDisconnectSolana
        }}
      >
        {children}
      </Web3Context.Provider>
    </Web3ReactProvider>
  );
}

// Export MetaMask connector and context
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
