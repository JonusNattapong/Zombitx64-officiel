"use client";

import { Web3ReactProvider, Web3ReactHooks, initializeConnector } from '@web3-react/core';
import { MetaMask } from '@web3-react/metamask';
import type { Web3ProviderType, Web3ProviderProps } from '@/lib/web3/types';
import React, { ReactNode, useEffect, useState, createContext, useContext } from 'react';
import { SolanaConnector, connectSolana } from '@/lib/web3/connectors';
import { PublicKey } from '@solana/web3.js';

declare global {
  interface Window {
    solana?: any;
  }
}

const [metaMask, hooks] = initializeConnector<MetaMask>(
  (actions) => new MetaMask({ actions })
);

const Web3Context = createContext<Web3ProviderType>({
  isConnected: false,
  publicKey: null,
  connector: null,
  connect: async () => {},
  disconnect: async () => {},
});

export function useWeb3() {
  return useContext(Web3Context);
}

export function Web3Provider({ children }: Web3ProviderProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [publicKey, setPublicKey] = useState<PublicKey | null>(null);
  const [connector, setConnector] = useState<SolanaConnector | null>(null);

  const connect = async () => {
    try {
      const { publicKey: pk, connector: conn } = await connectSolana();
      setPublicKey(pk);
      setConnector(conn);
      setIsConnected(true);
    } catch (error) {
      console.error('Error connecting to wallet:', error);
      setIsConnected(false);
    }
  };

  const disconnect = async () => {
    try {
      if (connector) {
        await connector.disconnect();
      }
      setPublicKey(null);
      setConnector(null);
      setIsConnected(false);
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
    }
  };

  useEffect(() => {
    // ตรวจสอบการเชื่อมต่อที่มีอยู่เมื่อโหลดหน้า
    const checkExistingConnection = async () => {
      if (window.solana?.isPhantom) {
        await connect();
      }
    };

    checkExistingConnection();

    return () => {
      // Cleanup เมื่อ component unmount
      disconnect();
    };
  }, []);

  const value = {
    isConnected,
    publicKey,
    connector,
    connect,
    disconnect,
  };

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
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
