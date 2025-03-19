"use client";

import type { Web3ProviderProps } from "@/lib/web3/types";
import React, {
  ReactNode,
  useEffect,
  useState,
  createContext,
  useContext,
  useMemo,
} from "react";
import { SolanaConnector, connectSolana } from "@/lib/web3/connectors";
import { PublicKey } from "@solana/web3.js";
import { Web3ReactProvider } from '@web3-react/core';
import { providers } from 'ethers';
import {
  ConnectionProvider,
  WalletProvider
} from '@solana/wallet-adapter-react';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';
import { Web3ContextProvider } from '@/contexts/Web3Context';
import { useCallback } from 'react';
require('@solana/wallet-adapter-react-ui/styles.css');

declare global {
  interface Window {
    solana?: any;
  }
}

interface Web3ContextType {
  solanaIsConnected: boolean;
  solanaPublicKey: PublicKey | null;
  solanaConnector: SolanaConnector | null;
  connectSolana: () => Promise<void>;
  disconnectSolana: () => Promise<void>;
}

// Export the Web3Context
export const Web3Context = createContext<Web3ContextType>({
  solanaIsConnected: false,
  solanaPublicKey: null,
  solanaConnector: null,
  connectSolana: async () => {},
  disconnectSolana: async () => {},
});

export function useWeb3() {
  return useContext(Web3Context);
}

function BaseWeb3Provider({ children }: Web3ProviderProps) {
  const [solanaIsConnected, setSolanaIsConnected] = useState(false);
  const [solanaPublicKey, setSolanaPublicKey] = useState<PublicKey | null>(
    null
  );
  const [solanaConnector, setSolanaConnector] = useState<SolanaConnector | null>(
    null
  );

  const handleSolanaConnect = async () => {
    try {
      const solanaConnectorInstance = await connectSolana();
      const publicKey = solanaConnectorInstance.getPublicKey();
      setSolanaPublicKey(publicKey);
      setSolanaConnector(solanaConnectorInstance);
      setSolanaIsConnected(true);
    } catch (error) {
      console.error("Error connecting to Solana wallet:", error);
      setSolanaIsConnected(false);
    }
  };

  const handleSolanaDisconnect = useCallback(async () => {
    try {
      if (solanaConnector) {
        await solanaConnector.disconnect();
      }
      setSolanaPublicKey(null);
      setSolanaConnector(null);
      setSolanaIsConnected(false);
    } catch (error) {
      console.error("Error disconnecting Solana wallet:", error);
    }
  }, [solanaConnector]);

  useEffect(() => {
    const checkExistingConnection = async () => {
      if (window.solana?.isPhantom) {
        await handleSolanaConnect();
      }
    };

    checkExistingConnection();

    return () => {
      handleSolanaDisconnect();
    };
  }, [handleSolanaDisconnect]);

  const value = {
    solanaIsConnected,
    solanaPublicKey,
    solanaConnector,
    connectSolana: handleSolanaConnect,
    disconnectSolana: handleSolanaDisconnect,
  };

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
}

function getLibrary(provider: any) {
  const library = new providers.Web3Provider(provider);
  library.pollingInterval = 12000;
  return library;
}

export function Web3ProviderWrapper({ children }: { children: React.ReactNode }) {
  return (
    <Web3ContextProvider>
      {children}
    </Web3ContextProvider>
  );
}
